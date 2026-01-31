import React, { useEffect, useState } from "react";
import { getAllUsers } from "../../services/userService";
import { USER_ROLES } from "../../constants";

export const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setLoading(false);
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700",
      user: "bg-blue-100 text-blue-700",
      team_lead: "bg-purple-100 text-purple-700",
      viewer: "bg-slate-100 text-slate-700",
    };
    return colors[role] || colors.user;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Members</h3>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading team members...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt={user.username} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-slate-900">{user.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-sm">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
