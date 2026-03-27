export enum Permission {
  USER_CREATE = 1 << 0, // 1
  USER_DELETE = 1 << 1, // 2
  USER_READ   = 1 << 2, // 4
  USER_MANAGE = 1 << 3, // 8

  ROLES_CREATE = 1 << 4, // 16
  ROLES_DELETE = 1 << 5, // 32
  ROLES_READ   = 1 << 6, // 64
  ROLES_UPDATE = 1 << 7, // 128
  ROLES_MANAGE = 1 << 8, // 256
}