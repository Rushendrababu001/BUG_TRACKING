import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

/**
 * Slack Integration Service
 * Posts bug notifications and alerts to Slack channels
 * Requires Slack webhook URL stored in Firestore config
 */

/**
 * Send message to Slack channel
 * @param {string} channelId - Slack channel ID or name
 * @param {object} message - Message object
 *   { text, blocks[], attachments[] } (Slack block format)
 * @returns {Promise<object>} Slack API response
 */
export const sendSlackMessage = async (channelId, message) => {
  try {
    // Get Slack webhook from Firestore config
    const configDoc = await getDocs(
      query(collection(db, 'integrations'), where('type', '==', 'slack'), where('active', '==', true))
    );

    if (configDoc.empty) {
      throw new Error('Slack integration not configured');
    }

    const slackConfig = configDoc.docs[0].data();
    const webhookUrl = slackConfig.webhookUrl;

    if (!webhookUrl) {
      throw new Error('Slack webhook URL not found');
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: channelId,
        ...message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Slack message:', error);
    throw error;
  }
};

/**
 * Post bug notification to Slack
 * @param {string} channelId - Slack channel ID
 * @param {object} bug - Bug object
 * @param {string} action - Action: 'created'|'updated'|'assigned'|'closed'
 * @returns {Promise<object>} Slack response
 */
export const postBugNotificationToSlack = async (channelId, bug, action) => {
  try {
    const colors = {
      critical: '#e11d48',
      high: '#f97316',
      medium: '#eab308',
      low: '#22c55e',
    };

    const actionEmojis = {
      created: '🆕',
      updated: '✏️',
      assigned: '👤',
      closed: '✅',
      reopened: '🔄',
    };

    const color = colors[bug.severity?.toLowerCase()] || '#6366f1';
    const emoji = actionEmojis[action] || '🐛';

    const message = {
      text: `${emoji} Bug ${action}: #${bug.bugId}`,
      attachments: [
        {
          color,
          title: bug.title,
          title_link: `${process.env.VITE_APP_URL || 'https://your-app.com'}/bug/${bug.id}`,
          fields: [
            {
              title: 'Bug ID',
              value: bug.bugId,
              short: true,
            },
            {
              title: 'Severity',
              value: bug.severity || 'Not set',
              short: true,
            },
            {
              title: 'Status',
              value: bug.status || 'open',
              short: true,
            },
            {
              title: 'Assigned To',
              value: bug.assignedTo || 'Unassigned',
              short: true,
            },
            {
              title: 'Description',
              value: bug.description?.substring(0, 200) || 'No description',
              short: false,
            },
          ],
          footer: 'Bug Tracker',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    return await sendSlackMessage(channelId, message);
  } catch (error) {
    console.error('Error posting bug to Slack:', error);
    throw error;
  }
};

/**
 * Post SLA violation alert to Slack
 * @param {string} channelId - Slack channel ID
 * @param {array} violatedBugs - Array of SLA-violated bugs
 * @returns {Promise<object>} Slack response
 */
export const postSLAViolationAlert = async (channelId, violatedBugs) => {
  try {
    const message = {
      text: '🚨 SLA Violation Alert',
      attachments: [
        {
          color: '#e11d48',
          title: `${violatedBugs.length} bugs have violated SLA thresholds`,
          fields: violatedBugs.slice(0, 5).map((bug) => ({
            title: `#${bug.bugId} - ${bug.title}`,
            value: `Severity: ${bug.severity} | Status: ${bug.status}`,
            short: false,
          })),
          footer: 'Bug Tracker - SLA Monitor',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    return await sendSlackMessage(channelId, message);
  } catch (error) {
    console.error('Error posting SLA alert:', error);
    throw error;
  }
};

/**
 * Post daily standup report to Slack
 * @param {string} channelId - Slack channel ID
 * @param {object} stats - Daily statistics
 * @returns {Promise<object>} Slack response
 */
export const postDailyStandupReport = async (channelId, stats) => {
  try {
    const message = {
      text: '📊 Daily Standup Report',
      attachments: [
        {
          color: '#6366f1',
          title: `Bugs Created: ${stats.created} | Updated: ${stats.updated} | Closed: ${stats.closed}`,
          fields: [
            {
              title: 'Open Bugs',
              value: stats.openBugs || '0',
              short: true,
            },
            {
              title: 'In Progress',
              value: stats.inProgress || '0',
              short: true,
            },
            {
              title: 'High Priority',
              value: stats.highPriority || '0',
              short: true,
            },
            {
              title: 'SLA Violations',
              value: stats.slaViolations || '0',
              short: true,
            },
          ],
          footer: 'Bug Tracker - Daily Report',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    return await sendSlackMessage(channelId, message);
  } catch (error) {
    console.error('Error posting daily report:', error);
    throw error;
  }
};

/**
 * Configure Slack integration
 * @param {string} webhookUrl - Slack incoming webhook URL
 * @param {string} channelId - Default channel ID
 * @returns {Promise<string>} Integration document ID
 */
export const configureSlackIntegration = async (webhookUrl, channelId) => {
  try {
    const integration = {
      type: 'slack',
      webhookUrl,
      defaultChannel: channelId,
      active: true,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'integrations'), integration);
    return docRef.id;
  } catch (error) {
    console.error('Error configuring Slack:', error);
    throw error;
  }
};

/**
 * Get Slack integration status
 * @returns {Promise<object|null>} Slack integration config or null if not configured
 */
export const getSlackIntegrationStatus = async () => {
  try {
    const q = query(collection(db, 'integrations'), where('type', '==', 'slack'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  } catch (error) {
    console.error('Error fetching Slack status:', error);
    throw error;
  }
};

/**
 * Disable Slack integration
 * @returns {Promise<void>}
 */
export const disableSlackIntegration = async () => {
  try {
    const q = query(collection(db, 'integrations'), where('type', '==', 'slack'));
    const snapshot = await getDocs(q);

    for (const doc of snapshot.docs) {
      await updateDoc(doc.ref, { active: false });
    }
  } catch (error) {
    console.error('Error disabling Slack:', error);
    throw error;
  }
};

export default {
  sendSlackMessage,
  postBugNotificationToSlack,
  postSLAViolationAlert,
  postDailyStandupReport,
  configureSlackIntegration,
  getSlackIntegrationStatus,
  disableSlackIntegration,
};
