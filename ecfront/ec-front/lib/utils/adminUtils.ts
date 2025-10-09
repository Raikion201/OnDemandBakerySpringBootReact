/**
 * Utility functions for admin role checking
 */

export const ADMIN_ROLES = ['ROLE_ADMIN', 'ROLE_STAFF', 'ROLE_OWNER'] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

/**
 * Check if a user has admin privileges
 * @param roles - Array of user roles
 * @returns true if user has admin role
 */
export const hasAdminRole = (roles: string[]): boolean => {
  return roles.some(role => ADMIN_ROLES.includes(role as AdminRole));
};

/**
 * Check if a user has specific admin role
 * @param roles - Array of user roles
 * @param requiredRole - Required admin role
 * @returns true if user has the specific role
 */
export const hasSpecificAdminRole = (roles: string[], requiredRole: AdminRole): boolean => {
  return roles.includes(requiredRole);
};

/**
 * Get the highest admin role from user roles
 * @param roles - Array of user roles
 * @returns highest admin role or null if no admin role
 */
export const getHighestAdminRole = (roles: string[]): AdminRole | null => {
  const adminRoles = roles.filter(role => ADMIN_ROLES.includes(role as AdminRole)) as AdminRole[];
  
  if (adminRoles.length === 0) return null;
  
  // Priority: OWNER > ADMIN > STAFF
  if (adminRoles.includes('ROLE_OWNER')) return 'ROLE_OWNER';
  if (adminRoles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
  if (adminRoles.includes('ROLE_STAFF')) return 'ROLE_STAFF';
  
  return null;
};
