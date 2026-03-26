export const RESPONSE_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: {
      code: 'LOGIN_SUCCESS',
      message: 'Login completed successfully.',
    },
    INVALID_CREDENTIALS: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    },
  },
  USER: {
    PROFILE: {
      FETCH_SUCCESS: {
        code: 'USER_PROFILE_FETCHED',
        message: 'User profile retrieved successfully.',
      },
    },
    CREATE: {
      SUCCESS: {
        code: 'USER_CREATE_SUCCESS',
        message: 'User created successfully',
      },
      FAIL: {
        USER_ALREADY_EXISTS: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User already exists.',
        },
      },
    },
  },
  ROLE: {
    FETCH_SUCCESS: {
      code: 'ROLES_FETCHED',
      message: 'Roles fetched successfully.',
    },
    CREATE: {
      code: 'ROLE_CREATED',
      message: 'Role Created Successfully',
    },
  },
} as const;

// PROFILE_FETCHED: {
//   code: 'USER_PROFILE_FETCHED',
//   message: 'User profile retrieved successfully.',
// },
