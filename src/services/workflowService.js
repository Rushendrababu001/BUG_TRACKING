import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { addActivityLog } from "./commentService";
import { sendUserNotification } from "./notificationService";

// Evaluate simple workflows stored in Firestore collection `workflows`.
// Each workflow document should have the shape:
// { event: 'create'|'update'|'status_changed', conditions: [{ field: 'severity', op: '==', value: 'Critical' }], actions: [{ type: 'assign', userId: 'uid' }, { type: 'notify', userId: 'uid', message: '...' }] }
export const evaluateWorkflows = async (bug, eventName) => {
  try {
    const wfRef = collection(db, "workflows");
    const snap = await getDocs(wfRef);
    const workflows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const results = [];
    for (const wf of workflows) {
      if (wf.event !== eventName) continue;
      const conditions = wf.conditions || [];
      let match = true;
      for (const c of conditions) {
        const fieldVal = c.field.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), bug);
        // currently only supports equality
        if (c.op === '==' || !c.op) {
          if (String(fieldVal) !== String(c.value)) {
            match = false;
            break;
          }
        } else if (c.op === 'in') {
          if (!Array.isArray(c.value) || !c.value.includes(fieldVal)) {
            match = false;
            break;
          }
        } else {
          // unknown operator - skip
          match = false;
          break;
        }
      }

      if (!match) continue;

      // execute actions
      const actions = wf.actions || [];
      for (const action of actions) {
        if (action.type === 'assign' && action.userId) {
          // assign bug to user
          const bugRef = doc(db, 'bugs', bug.id);
          await updateDoc(bugRef, { assignedTo: action.userId });
          await addActivityLog(bug.id, { type: 'assignment', message: `Assigned to ${action.userId}`, by: 'system' });
          results.push({ workflow: wf.id, action: 'assign', userId: action.userId });
        }

        if (action.type === 'add_tag' && action.tag) {
          const bugRef = doc(db, 'bugs', bug.id);
          // naive tag add: assumes tags is an array field
          await updateDoc(bugRef, { tags: Array.isArray(bug.tags) ? [...bug.tags, action.tag] : [action.tag] });
          await addActivityLog(bug.id, { type: 'tag', message: `Tag added: ${action.tag}`, by: 'system' });
          results.push({ workflow: wf.id, action: 'add_tag', tag: action.tag });
        }

        if (action.type === 'notify' && action.userId) {
          await sendUserNotification(action.userId, {
            title: action.title || `Workflow: ${wf.name || wf.id}`,
            body: action.message || `An automated workflow ran for bug ${bug.id}`,
            bugId: bug.id,
          });
          results.push({ workflow: wf.id, action: 'notify', userId: action.userId });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error evaluating workflows:', error);
    return [];
  }
};
