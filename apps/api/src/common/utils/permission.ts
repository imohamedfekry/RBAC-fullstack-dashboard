export const permissions = {
  // // // // // // // // USER PERMISSIONS // // // // // // // //
  USER_MANAGE: {
    name: 'إدارة المستخدمين',
    description: 'صلاحية كاملة لادارة المستخدمين (انشاء و قرائة و حذف وتعديل)',
    key: 'USER_MANAGE',
  },
  USER_CREATE: {
    name: 'إنشاء مستخدم',
    description: 'تسمح بإنشاء مستخدمين جدد داخل النظام',
    key: 'USER_CREATE',
  },
  USER_DELETE: {
    name: 'حذف مستخدم',
    description: 'تسمح بحذف المستخدمين من النظام',
    key: 'USER_DELETE',
  },
  USER_READ: {
    name: 'عرض المستخدمين',
    description: 'تسمح بعرض قائمة المستخدمين وبياناتهم',
    key: 'USER_READ',
  },
  // // // // // // // // ROLES PERMISSIONS // // // // // // // //
  ROLES_MANAGE: {
    name: 'إدارة الصلاحيات',
    description: 'صلاحية كاملة لإدارة الأدوار (إنشاء، عرض، تعديل، حذف)',
    key: 'ROLES_MANAGE',
  },
  ROLES_CREATE: {
    name: 'إنشاء دور',
    description: 'تسمح بإنشاء أدوار جديدة داخل النظام',
    key: 'ROLES_CREATE',
  },
  ROLES_DELETE: {
    name: 'حذف دور',
    description: 'تسمح بحذف الأدوار من النظام',
    key: 'ROLES_DELETE',
  },
  ROLES_READ: {
    name: 'عرض الأدوار',
    description: 'تسمح بعرض قائمة الأدوار وبياناتها',
    key: 'ROLES_READ',
  },
  ROLES_UPDATE: {
    name: 'تعديل دور',
    description: 'تسمح بتعديل بيانات الأدوار',
    key: 'ROLES_UPDATE',
  },
};
