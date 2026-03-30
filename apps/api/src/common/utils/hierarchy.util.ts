import { AuthUser } from './types';

export const getMinHierarchy = (user: AuthUser): number => {
  if (user.isOwner) return -1; // Owner has the highest possible authority
  if (!user.roles || user.roles.length === 0) return Infinity;

  return Math.min(...user.roles.map((ur) => ur.role.hierarchy ?? Infinity));
};
export const canManageUser = (manager: AuthUser, target: AuthUser): boolean => {
  const managerMin = getMinHierarchy(manager);
  const targetMin = getMinHierarchy(target);
  return managerMin < targetMin;
};
export const canManageRole = (manager: AuthUser, roleHierarchy: number | null): boolean => {
  const managerMin = getMinHierarchy(manager);
  const targetHierarchy = roleHierarchy ?? Infinity;

  return managerMin < targetHierarchy;
};
