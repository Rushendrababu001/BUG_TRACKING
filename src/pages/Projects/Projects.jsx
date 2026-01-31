import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
// TopHeader intentionally removed for Projects page to hide welcome message
import Button from '../../Components/Button';
import { useAuth } from '../../hooks/useAuth';
import CreateBugDrawer from '../MyBugs/CreateBugDrawer';
import { subscribeToProjects, createProject, updateProject, deleteProject, searchProjects } from '../../services/projectService';
// removed firebase auth/profile imports added earlier

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  // Subscribe to projects on mount
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToProjects(user.uid, (data) => {
      setProjects(data);
      setFilteredProjects(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // (auth/profile listener removed) -- Projects page will not show welcome card

  // Filter projects on search
  useEffect(() => {
    const filtered = searchProjects(projects, searchQuery);
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status,
        owner: user.uid,
      });
      setFormData({ name: '', description: '', status: 'active' });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingProject) return;

    try {
      await updateProject(editingProject.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
      });
      setFormData({ name: '', description: '', status: 'active' });
      setEditingProject(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status || 'active'
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', status: 'active' });
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      inactive: 'bg-gray-100 text-gray-700 border-gray-200',
      archived: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || colors.active;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">

      <main className="flex-1 overflow-auto px-6 py-8 lg:px-10 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
            <p className="text-sm text-slate-500">Create and manage your projects.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => {
              setEditingProject(null);
              setFormData({ name: '', description: '', status: 'active' });
              setShowCreateModal(true);
            }} className="whitespace-nowrap">+ New Project</Button>
            <Button onClick={() => setOpenDrawer(true)} className="whitespace-nowrap">+ Create Bug</Button>
          </div>
        </header>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-56">
              <div className="text-slate-500">Loading projects...</div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-70">
                <rect x="8" y="20" width="144" height="88" rx="8" fill="#EEF2FF" />
                <rect x="22" y="36" width="40" height="8" rx="3" fill="#6366F1" />
                <rect x="22" y="52" width="96" height="6" rx="3" fill="#A5B4FC" />
                <rect x="22" y="66" width="76" height="6" rx="3" fill="#C7D2FE" />
              </svg>
              <p className="text-slate-500 mb-4">No projects yet. Create one to get started!</p>
              <Button onClick={() => setShowCreateModal(true)} className="whitespace-nowrap">+ Create First Project</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition p-6">
                  <div className="flex items-start justify-between">
                    <div className="pr-2">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">{project.name}</h3>
                      {project.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status || 'active'}
                      </span>
                      {project.bugCount > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">{project.bugCount} bugs</span>}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-slate-400">Updated: {project.updatedAt?.toDate ? project.updatedAt.toDate().toLocaleDateString() : ''}</div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleEditClick(project)} variant="ghost" size="sm" className="p-2" leftIcon={<FiEdit2 size={16} />} />
                      <Button onClick={() => handleDeleteProject(project.id)} variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-700" leftIcon={<FiTrash2 size={16} />} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </main>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <Button onClick={handleCloseModal} variant="ghost" size="sm" className="absolute right-3 top-3 p-2" leftIcon={<FiX />} />
            <div className="px-8 py-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">{editingProject ? 'Edit Project' : 'Create Project'}</h2>
              <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" required className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Enter project description" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">{editingProject ? 'Update Project' : 'Create Project'}</Button>
                  <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <CreateBugDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />
    </div>
  );
}
