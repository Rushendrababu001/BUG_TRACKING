import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiUserPlus, FiTrash2 } from 'react-icons/fi';

import { getAllUsers } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';

const Team = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const members = await getAllUsers();
      setTeamMembers(members || []);
    } catch (err) {
      console.error('Error loading team members:', err);
      setError('Failed to load team members. You may not have permission to view this data.');
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="flex-1 overflow-auto px-6 py-8 lg:px-10 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Team</h1>
            <p className="text-sm text-slate-500">Manage team members and roles</p>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading team members...</p>
            </div>
          </div>
        )}

        {/* Team Members Table */}
        {!loading && teamMembers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.uid} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-medium text-slate-900">{member.username || 'Unknown'}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <FiMail className="w-4 h-4" />
                          {member.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {member.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {user?.uid !== member.uid && (
                          <button className="text-red-600 hover:text-red-700 p-2">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && teamMembers.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <FiUsers className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No team members found</h3>
            <p className="text-slate-600">Team members will appear here once they join.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Team;
