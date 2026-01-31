import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

/**
 * Email Notification Service
 * Sends emails via backend service (requires Firebase Cloud Functions)
 * Stores email queue in Firestore for processing
 */

/**
 * Send email notification to user
 * @param {string} userEmail - Recipient email address
 * @param {object} emailData - Email configuration
 *   { subject, body, bugId, type: 'notification'|'alert'|'report' }
 * @returns {Promise<string>} Email queue document ID
 */
export const sendEmailNotification = async (userEmail, emailData) => {
  try {
    if (!userEmail || !emailData.subject || !emailData.body) {
      throw new Error('Missing required email fields');
    }

    const emailQueue = {
      to: userEmail,
      subject: emailData.subject,
      body: emailData.body,
      bugId: emailData.bugId || null,
      type: emailData.type || 'notification',
      status: 'pending',
      createdAt: Timestamp.now(),
      sentAt: null,
      error: null,
    };

    const docRef = await addDoc(collection(db, 'email_queue'), emailQueue);
    return docRef.id;
  } catch (error) {
    console.error('Error queuing email:', error);
    throw error;
  }
};

/**
 * Send bulk emails (e.g., daily digest, team report)
 * @param {array} userEmails - Array of email addresses
 * @param {object} emailData - Email configuration
 * @returns {Promise<array>} Array of queue document IDs
 */
export const sendBulkEmails = async (userEmails, emailData) => {
  try {
    const ids = [];
    for (const email of userEmails) {
      const id = await sendEmailNotification(email, emailData);
      ids.push(id);
    }
    return ids;
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    throw error;
  }
};

/**
 * Get email queue status
 * @param {string} status - Filter by status: 'pending'|'sent'|'failed'
 * @returns {Promise<array>} Array of email queue documents
 */
export const getEmailQueueStatus = async (status = null) => {
  try {
    let q;
    if (status) {
      q = query(collection(db, 'email_queue'), where('status', '==', status));
    } else {
      q = query(collection(db, 'email_queue'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching email queue:', error);
    throw error;
  }
};

/**
 * Send bug notification email
 * @param {string} userEmail - Recipient email
 * @param {object} bug - Bug object
 * @param {string} action - Action type: 'created'|'updated'|'assigned'|'closed'
 * @returns {Promise<string>} Email queue ID
 */
export const sendBugNotificationEmail = async (userEmail, bug, action) => {
  try {
    const actionMessages = {
      created: `New bug #${bug.bugId} has been created`,
      updated: `Bug #${bug.bugId} has been updated`,
      assigned: `Bug #${bug.bugId} has been assigned to you`,
      closed: `Bug #${bug.bugId} has been closed`,
      reopened: `Bug #${bug.bugId} has been reopened`,
    };

    const subject = actionMessages[action] || `Bug #${bug.bugId} notification`;
    const body = `
      Bug: ${bug.title}
      Severity: ${bug.severity}
      Status: ${bug.status}
      
      ${bug.description}
      
      View bug: ${process.env.VITE_APP_URL || 'https://your-app.com'}/bug/${bug.id}
    `;

    return await sendEmailNotification(userEmail, {
      subject,
      body,
      bugId: bug.id,
      type: 'bug_notification',
    });
  } catch (error) {
    console.error('Error sending bug notification email:', error);
    throw error;
  }
};

/**
 * Send daily digest email
 * @param {string} userEmail - Recipient email
 * @param {array} bugs - Array of bugs assigned to user
 * @returns {Promise<string>} Email queue ID
 */
export const sendDailyDigestEmail = async (userEmail, bugs) => {
  try {
    const openBugs = bugs.filter((b) => b.status !== 'closed');
    const overdueBugs = bugs.filter((b) => b.dueDate && new Date(b.dueDate) < new Date());

    const subject = `Daily Digest - ${openBugs.length} bugs assigned to you`;
    const body = `
      You have ${openBugs.length} open bugs assigned.
      
      Open Bugs:
      ${openBugs.map((b) => `- [${b.severity}] ${b.bugId}: ${b.title}`).join('\n')}
      
      ${overdueBugs.length > 0 ? `\nOverdue: ${overdueBugs.length} bugs\n${overdueBugs.map((b) => `- ${b.bugId}: ${b.title}`).join('\n')}` : ''}
      
      View Dashboard: ${process.env.VITE_APP_URL || 'https://your-app.com'}/dashboard
    `;

    return await sendEmailNotification(userEmail, {
      subject,
      body,
      type: 'daily_digest',
    });
  } catch (error) {
    console.error('Error sending daily digest:', error);
    throw error;
  }
};

export default {
  sendEmailNotification,
  sendBulkEmails,
  getEmailQueueStatus,
  sendBugNotificationEmail,
  sendDailyDigestEmail,
};
