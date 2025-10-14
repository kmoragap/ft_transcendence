import * as z from "zod";

// for usrs
const commonSchemas = {
  // email validation
  email: z
  .email("Invalid email format"),

  // username validation
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[\p{L}\p{N}_]+$/u,
      "Username can only contain letters, numbers, and underscores",
    ),

  // name validation
  firstname: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters")
    .regex(
      /^[\p{L}\p{N}_]+$/u,
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    ),

  // password validation
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/\p{Lu}/u, "Password must contain at least one uppercase letter")
    .regex(/\p{Lu}/u, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/^[\p{L}\p{N}_]+$/u, "Password can only contain letters, numbers, and underscores"),

  // cuid validation (for database ids)
  cuid: z.string().regex(/^c[a-z0-9]{24}$/, "Invalid ID format"),

  // boolean validation
  boolean: z.boolean(),
};

// auth schemas
export const authSchemas = {
  // registration schema
  register: z.object({
    username: commonSchemas.username,
    email: commonSchemas.email,
    firstname: commonSchemas.firstname,
    password: commonSchemas.password,
  }),

  // login schema
  login: z
    .object({
      username: commonSchemas.username.optional(),
      email: commonSchemas.email.optional(),
      identifier: z.string().optional(),
      password: commonSchemas.password,
    })
    .refine((data) => data.username || data.email || data.identifier, {
      error: "Must provide username, email, or identifier",
      path: ["identifier"],
    }),

  // 2fa verification schema
  verify2fa: z.object({
    email: commonSchemas.email,
    code: z
      .string()
      .length(6, "Verification code must be exactly 6 digits")
      .regex(/^\d{6}$/, "Verification code must contain only digits"),
  }),

  // resend 2FA schema
  resend2fa: z.object({
    email: commonSchemas.email,
  }),
};

export type RegisterRequest = z.infer<typeof authSchemas.register>;
export type LoginRequest = z.infer<typeof authSchemas.login>;
export type Verify2faRequest = z.infer<typeof authSchemas.verify2fa>;
export type Resend2faRequest = z.infer<typeof authSchemas.resend2fa>;
