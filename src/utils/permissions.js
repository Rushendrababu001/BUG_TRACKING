// Simple RBAC helper utilities
export const canPerformAction = (user, bug, action) => {
  if (!user) return false;
  const role = user.role || (user.claims && user.claims.role) || 'user';
  // Admins can do anything
  if (role === 'admin') return true;

  // Managers have broad rights
  if (role === 'manager') {
    if (['view', 'comment', 'assign', 'edit'].includes(action)) return true;
  }

  // Clients have limited view-only rights
  if (role === 'client') {
    return action === 'view' || action === 'comment';
  }

  // Default: owner can edit their own bugs
  if (action === 'edit' || action === 'delete') {
    return bug && bug.createdBy === user.uid;
  }

  if (action === 'view' || action === 'comment') return true;

  return false;
};

export default canPerformAction;
