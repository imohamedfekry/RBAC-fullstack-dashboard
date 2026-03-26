import { z } from 'zod';

const zodSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  DATABASE_URL: z.string().nonempty(),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().nonempty(),

  JWT_SECRET_ACCESS: z.string().default('your-super-secret-jwt-key-here'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_SECRET_REFRESH: z.string().default('your-super-secret-refresh-key-here'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

// Create a Joi-compatible validation function for NestJS
export const envValidationSchema = {
  validate: (env: any) => {
    try {
      const result = zodSchema.parse(env);
      return { error: null, value: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          error: {
            details: error.issues.map((err) => ({
              message: err.message,
              path: err.path.join('.'),
            })),
          },
          value: null,
        };
      }
      throw error;
    }
  },
};
