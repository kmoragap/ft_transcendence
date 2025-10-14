import * as z from "zod";

// for usrs
const commonSchemas = {
  // email validation
  /*
  - /^[^\s@]+@` - One or more non-whitespace, non-@ characters before @
  - `[^\s@]+@` - One or more non-whitespace, non-@ characters before the final dot
  - `\.[^\s@]+$/` - A dot followed by one or more non-whitespace, non-@ characters
  */
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
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
      /^[\p{L}\p{N}_' -]+$/u,
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    ),

  // password validation
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/\p{Lu}/u, "Password must contain at least one uppercase letter")
    .regex(/\p{Ll}/u, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[\p{S}\p{P}]/u,
      "Password must contain at least one special character",
    ),
  // cuid validation (for database ids)
  cuid: z.string().regex(/^c[a-z0-9]{24}$/, "Invalid ID format"),

  // boolean validation
  boolean: z.boolean(),
};

export const userSchemas = {
  // user creation schema
  create: z.object({
    username: commonSchemas.username,
    email: commonSchemas.email,
    firstname: commonSchemas.firstname,
    password: commonSchemas.password,
    avatarUrl: z.url("Invalid avatar URL").optional(),
    isOAuthUser: z.boolean().optional(),
  }),

  // user deletion schema
  delete: z
    .object({
      id: commonSchemas.cuid.optional(),
      email: commonSchemas.email.optional(),
    })
    .refine((data) => data.id || data.email, {
      error: "Must provide either user ID or email",
      path: ["id"],
    }),

  // profile update schema
  updateProfile: z.object({
    username: commonSchemas.username.optional(),
    firstname: commonSchemas.firstname.optional(),
    email: commonSchemas.email.optional(),
  }),

  // tggle 2FA schema
  toggle2fa: z.object({
    is2faEnabled: commonSchemas.boolean,
  }),

  // search query schema
  searchUsers: z.object({
    q: z
      .string()
      .min(2, "Search query must be at least 2 characters")
      .max(50, "Search query must be at most 50 characters")
      .regex(
        /^[\p{L}\p{N}_]+$/u,
        "Search query can only contain letters, numbers, and spaces",
      ),
  }),

  // get users by IDs schema
  getUsersByIds: z.object({
    userIds: z
      .array(commonSchemas.cuid)
      .min(1, "At least one user ID is required"),
  }),

  // params schemas
  emailParam: z.object({
    email: commonSchemas.email,
  }),

  usernameParam: z.object({
    username: commonSchemas.username,
  }),

  idParam: z.object({
    id: commonSchemas.cuid,
  }),
};

export type CreateUserRequest = z.infer<typeof userSchemas.create>;
export type DeleteUserRequest = z.infer<typeof userSchemas.delete>;
export type UpdateProfileRequest = z.infer<typeof userSchemas.updateProfile>;
export type Toggle2faRequest = z.infer<typeof userSchemas.toggle2fa>;
export type SearchUsersRequest = z.infer<typeof userSchemas.searchUsers>;
export type GetUsersByIdsRequest = z.infer<typeof userSchemas.getUsersByIds>;
export type EmailParamRequest = z.infer<typeof userSchemas.emailParam>;
export type UsernameParamRequest = z.infer<typeof userSchemas.usernameParam>;
export type IdParamRequest = z.infer<typeof userSchemas.idParam>;
