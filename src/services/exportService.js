import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

/**
 * Export/Import Service
 * Handles CSV and JSON export/import of bugs and data
 */

/**
 * Export bugs to CSV format
 * @param {array} bugs - Array of bug objects to export
 * @returns {string} CSV content
 */
export const bugsToCSV = (bugs) => {
  try {
    if (!bugs || bugs.length === 0) {
      return 'No bugs to export';
    }

    // CSV headers
    const headers = [
      'Bug ID',
      'Title',
      'Description',
      'Severity',
      'Status',
      'Assigned To',
      'Created By',
      'Created Date',
      'Updated Date',
      'Tags',
      'Component',
      'Due Date',
    ];

    // CSV rows
    const rows = bugs.map((bug) => [
      bug.bugId || '',
      `"${(bug.title || '').replace(/"/g, '""')}"`,
      `"${(bug.description || '').replace(/"/g, '""')}"`,
      bug.severity || '',
      bug.status || '',
      bug.assignedTo || '',
      bug.createdBy || '',
      bug.createdAt ? new Date(bug.createdAt.seconds * 1000).toISOString() : '',
      bug.updatedAt ? new Date(bug.updatedAt.seconds * 1000).toISOString() : '',
      bug.tags ? bug.tags.join(';') : '',
      bug.component || '',
      bug.dueDate || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return csvContent;
  } catch (error) {
    console.error('Error converting bugs to CSV:', error);
    throw error;
  }
};

/**
 * Export bugs to JSON format
 * @param {array} bugs - Array of bug objects
 * @returns {object} JSON object with bugs array
 */
export const bugsToJSON = (bugs) => {
  try {
    return {
      exportDate: new Date().toISOString(),
      bugCount: bugs.length,
      bugs: bugs.map((bug) => ({
        id: bug.id,
        bugId: bug.bugId,
        title: bug.title,
        description: bug.description,
        severity: bug.severity,
        status: bug.status,
        assignedTo: bug.assignedTo,
        createdBy: bug.createdBy,
        createdAt: bug.createdAt,
        updatedAt: bug.updatedAt,
        tags: bug.tags || [],
        component: bug.component,
        dueDate: bug.dueDate,
        watchers: bug.watchers || [],
      })),
    };
  } catch (error) {
    console.error('Error converting bugs to JSON:', error);
    throw error;
  }
};

/**
 * Download file in browser
 * @param {string} content - File content
 * @param {string} filename - File name to save as
 * @param {string} mimeType - MIME type (text/csv, application/json)
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  try {
    const element = document.createElement('a');
    element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Export bugs to CSV and download
 * @param {array} bugs - Bugs to export
 * @param {string} filename - Output filename (default: bugs_export.csv)
 */
export const exportBugsAsCSV = (bugs, filename = 'bugs_export.csv') => {
  try {
    const csv = bugsToCSV(bugs);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};

/**
 * Export bugs to JSON and download
 * @param {array} bugs - Bugs to export
 * @param {string} filename - Output filename (default: bugs_export.json)
 */
export const exportBugsAsJSON = (bugs, filename = 'bugs_export.json') => {
  try {
    const json = JSON.stringify(bugsToJSON(bugs), null, 2);
    downloadFile(json, filename, 'application/json;charset=utf-8;');
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw error;
  }
};

/**
 * Parse CSV content and return bugs array
 * @param {string} csvContent - CSV text content
 * @returns {array} Array of bug objects
 */
export const parseCSV = (csvContent) => {
  try {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.trim());
    const bugs = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // Simple CSV parsing (doesn't handle quoted commas perfectly)
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const bug = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'Bug ID':
            bug.bugId = value;
            break;
          case 'Title':
            bug.title = value;
            break;
          case 'Description':
            bug.description = value;
            break;
          case 'Severity':
            bug.severity = value;
            break;
          case 'Status':
            bug.status = value;
            break;
          case 'Assigned To':
            bug.assignedTo = value;
            break;
          case 'Tags':
            bug.tags = value ? value.split(';') : [];
            break;
          case 'Component':
            bug.component = value;
            break;
          case 'Due Date':
            bug.dueDate = value;
            break;
          default:
            break;
        }
      });

      if (bug.title) {
        bugs.push(bug);
      }
    }

    return bugs;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
};

/**
 * Parse JSON and return bugs array
 * @param {string} jsonContent - JSON text content
 * @returns {array} Array of bug objects
 */
export const parseJSON = (jsonContent) => {
  try {
    const data = JSON.parse(jsonContent);
    return Array.isArray(data) ? data : data.bugs || [];
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw error;
  }
};

/**
 * Validate imported bugs for required fields
 * @param {array} bugs - Bugs to validate
 * @returns {object} { valid: array, invalid: array }
 */
export const validateImportedBugs = (bugs) => {
  try {
    const valid = [];
    const invalid = [];

    bugs.forEach((bug, index) => {
      if (bug.title && bug.severity) {
        valid.push(bug);
      } else {
        invalid.push({
          index,
          bug,
          errors: [
            !bug.title ? 'Missing title' : '',
            !bug.severity ? 'Missing severity' : '',
          ].filter(Boolean),
        });
      }
    });

    return { valid, invalid };
  } catch (error) {
    console.error('Error validating bugs:', error);
    throw error;
  }
};

/**
 * Import bugs from file (upload handler)
 * @param {File} file - File object from input
 * @returns {Promise<array>} Parsed bugs array
 */
export const importBugsFromFile = async (file) => {
  try {
    const content = await file.text();
    const extension = file.name.split('.').pop().toLowerCase();

    let bugs = [];
    if (extension === 'csv') {
      bugs = parseCSV(content);
    } else if (extension === 'json') {
      bugs = parseJSON(content);
    } else {
      throw new Error('Unsupported file format. Use CSV or JSON.');
    }

    return validateImportedBugs(bugs);
  } catch (error) {
    console.error('Error importing bugs:', error);
    throw error;
  }
};

/**
 * Export audit log to CSV
 * @param {array} auditLogs - Activity logs to export
 * @returns {string} CSV content
 */
export const auditLogToCSV = (auditLogs) => {
  try {
    const headers = ['Timestamp', 'User', 'Action', 'Bug ID', 'Details'];
    const rows = auditLogs.map((log) => [
      log.createdAt ? new Date(log.createdAt.seconds * 1000).toISOString() : '',
      log.by || '',
      log.type || '',
      log.bugId || '',
      `"${(log.message || log.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    return csvContent;
  } catch (error) {
    console.error('Error converting audit log to CSV:', error);
    throw error;
  }
};

/**
 * Export audit log to CSV and download
 * @param {array} auditLogs - Activity logs to export
 * @param {string} filename - Output filename
 */
export const exportAuditLogAsCSV = (auditLogs, filename = 'audit_log_export.csv') => {
  try {
    const csv = auditLogToCSV(auditLogs);
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  } catch (error) {
    console.error('Error exporting audit log:', error);
    throw error;
  }
};

export default {
  bugsToCSV,
  bugsToJSON,
  downloadFile,
  exportBugsAsCSV,
  exportBugsAsJSON,
  parseCSV,
  parseJSON,
  validateImportedBugs,
  importBugsFromFile,
  auditLogToCSV,
  exportAuditLogAsCSV,
};
