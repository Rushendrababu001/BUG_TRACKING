import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';

import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { getAllUsers } from '../../services/userService';

const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    event: 'create',
    conditions: [],
    actions: [],
    enabled: true,
  });

  // Load workflows and users
  useEffect(() => {
    loadWorkflows();
    loadUsers();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, 'workflows'));
      const workflowsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkflows(workflowsList);
    } catch (error) {
      console.error('Error loading workflows:', error);
      if (error.code === 'permission-denied') {
        setError('You do not have permission to view workflows. Contact your administrator.');
      } else {
        setError('Failed to load workflows. Please try again later.');
      }
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersList = await getAllUsers();
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { field: 'severity', operator: '==', value: '' }],
    });
  };

  const handleAddAction = () => {
    setFormData({
      ...formData,
      actions: [...formData.actions, { type: 'assign', value: '' }],
    });
  };

  const handleUpdateCondition = (index, field, value) => {
    const updated = [...formData.conditions];
    updated[index][field] = value;
    setFormData({ ...formData, conditions: updated });
  };

  const handleUpdateAction = (index, field, value) => {
    const updated = [...formData.actions];
    updated[index][field] = value;
    setFormData({ ...formData, actions: updated });
  };

  const handleRemoveCondition = (index) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  const handleRemoveAction = (index) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index),
    });
  };

  const handleSaveWorkflow = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.conditions.length === 0 || formData.actions.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const workflow = {
        name: formData.name,
        event: formData.event,
        conditions: formData.conditions,
        actions: formData.actions,
        enabled: formData.enabled,
        createdAt: Timestamp.now(),
      };

      if (editingId) {
        // Update existing workflow
        await updateDoc(doc(db, 'workflows', editingId), workflow);
        setEditingId(null);
      } else {
        // Create new workflow
        await addDoc(collection(db, 'workflows'), workflow);
      }

      // Reset form
      setFormData({
        name: '',
        event: 'create',
        conditions: [],
        actions: [],
        enabled: true,
      });
      setShowForm(false);

      // Reload workflows
      await loadWorkflows();
      alert('Workflow saved successfully');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow');
    }
  };

  const handleDeleteWorkflow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await deleteDoc(doc(db, 'workflows', id));
      await loadWorkflows();
      alert('Workflow deleted');
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const handleEditWorkflow = (workflow) => {
    setFormData({
      name: workflow.name,
      event: workflow.event,
      conditions: workflow.conditions || [],
      actions: workflow.actions || [],
      enabled: workflow.enabled,
    });
    setEditingId(workflow.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      event: 'create',
      conditions: [],
      actions: [],
      enabled: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Workflow Builder</h1>
              <p className="text-slate-600 mt-1">Create automated workflows for your bugs</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <FiPlus />
                New Workflow
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading workflows...</p>
              </div>
            </div>
          )}

          {!loading && showForm && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                {editingId ? 'Edit Workflow' : 'Create New Workflow'}
              </h2>

              <form onSubmit={handleSaveWorkflow} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Workflow Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Auto-assign critical bugs"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Event */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Trigger Event *</label>
                  <select
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="create">When bug is created</option>
                    <option value="update">When bug is updated</option>
                    <option value="status_changed">When status changes</option>
                  </select>
                </div>

                {/* Conditions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-slate-700">Conditions *</label>
                    <button
                      type="button"
                      onClick={handleAddCondition}
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Condition
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.conditions.length === 0 ? (
                      <p className="text-slate-600 text-sm italic">No conditions added yet</p>
                    ) : (
                      formData.conditions.map((condition, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <select
                              value={condition.field}
                              onChange={(e) =>
                                handleUpdateCondition(index, 'field', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="severity">Severity</option>
                              <option value="status">Status</option>
                              <option value="assignedTo">Assigned To</option>
                              <option value="component">Component</option>
                            </select>
                          </div>

                          <div className="flex-1">
                            <select
                              value={condition.operator}
                              onChange={(e) =>
                                handleUpdateCondition(index, 'operator', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="==">Equals</option>
                              <option value="!=">Not Equals</option>
                              <option value="in">Contains</option>
                            </select>
                          </div>

                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Value"
                              value={condition.value}
                              onChange={(e) =>
                                handleUpdateCondition(index, 'value', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCondition(index)}
                            className="p-2 text-slate-400 hover:text-rose-600 transition"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-slate-700">Actions *</label>
                    <button
                      type="button"
                      onClick={handleAddAction}
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Action
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.actions.length === 0 ? (
                      <p className="text-slate-600 text-sm italic">No actions added yet</p>
                    ) : (
                      formData.actions.map((action, index) => (
                        <div key={index} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <select
                              value={action.type}
                              onChange={(e) =>
                                handleUpdateAction(index, 'type', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="assign">Assign To</option>
                              <option value="add_tag">Add Tag</option>
                              <option value="notify">Send Notification</option>
                              <option value="set_status">Set Status</option>
                            </select>
                          </div>

                          <div className="flex-1">
                            {action.type === 'assign' ? (
                              <select
                                value={action.value}
                                onChange={(e) =>
                                  handleUpdateAction(index, 'value', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">Select user...</option>
                                {users.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.email}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                placeholder="Value"
                                value={action.value}
                                onChange={(e) =>
                                  handleUpdateAction(index, 'value', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveAction(index)}
                            className="p-2 text-slate-400 hover:text-rose-600 transition"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Enabled */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium text-slate-700">
                    Enable this workflow
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    <FiSave />
                    {editingId ? 'Update Workflow' : 'Create Workflow'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium"
                  >
                    <FiX />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workflows List */}
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="text-slate-500">Loading workflows...</div>
              </div>
            ) : workflows.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                <p className="text-slate-600 mb-4">No workflows created yet</p>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <FiPlus />
                    Create Your First Workflow
                  </button>
                )}
              </div>
            ) : (
              workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{workflow.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Trigger: <span className="font-medium">{workflow.event}</span> | Status:{' '}
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            workflow.enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {workflow.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditWorkflow(workflow)}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="px-3 py-1 text-sm bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">If:</h4>
                    <div className="space-y-1">
                      {workflow.conditions?.map((cond, i) => (
                        <p key={i} className="text-sm text-slate-600">
                          • {cond.field} {cond.operator} {cond.value}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Then:</h4>
                    <div className="space-y-1">
                      {workflow.actions?.map((action, i) => (
                        <p key={i} className="text-sm text-slate-600">
                          • {action.type}: {action.value}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
