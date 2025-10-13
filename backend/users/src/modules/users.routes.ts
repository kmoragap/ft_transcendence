import { FastifyInstance } from "fastify";
import {
  authenticateToken,
  validateBody,
  validateParams,
  validateQuery,
} from "../modules/users.middleware";
import {
  createUserHandler,
  deleteUserHandler,
  getUsersHandler,
  searchUsersHandler,
  getUserByEmailHandler,
  getUserByUsernameHandler,
  uploadAvatarHandler,
  updateMyProfileHandler,
  getUsersByIds,
  toggle2faHandler,
} from "../modules/users.controller";
import {
  sendFriendRequestHandler,
  getFriendRequestsHandler,
  respondToFriendRequestHandler,
  getFriendsHandler,
  deleteFriendHandler,
  getAllFriendshipsHandler,
} from "./friends.controller";
import {
  updateOnlineStatusHandler,
  updateOnlineStatusByIdHandler,
  updateUserStatsHandler,
  updateUserHistoryHandler,
  getUserStatsHandler,
  getMatchHistoryHandler,
} from "./stats.controller";
import { userIdParamsSchema, updateStatsBodySchema } from "./stats.schema";
import { userSchemas } from "./users.schemas";
export default async function userRoutes(fastify: FastifyInstance) {
  // profile routes (register first to avoid conflicts)
  fastify.put(
    "/me",
    {
      preHandler: [authenticateToken, validateBody(userSchemas.updateProfile)],
    },
    updateMyProfileHandler,
  );
  fastify.post(
    "/me/avatar",
    { preHandler: [authenticateToken] },
    uploadAvatarHandler,
  );
  fastify.put(
    "/me/online-status",
    { preHandler: [authenticateToken] },
    updateOnlineStatusHandler,
  );
  fastify.put(
    "/me/2fa",
    { preHandler: [authenticateToken, validateBody(userSchemas.toggle2fa)] },
    toggle2faHandler,
  );
  // internal service route for auth service
  fastify.put("/:userId/online-status", updateOnlineStatusByIdHandler);

  // public routes
  fastify.post(
    "/",
    { preHandler: validateBody(userSchemas.create) },
    createUserHandler,
  );
  fastify.get("/by-email/:email", getUserByEmailHandler); // for the auth service
  fastify.get("/by-username/:username", getUserByUsernameHandler); // for the auth service

  // protected routes
  fastify.get("/", { preHandler: [authenticateToken] }, getUsersHandler);
  fastify.get(
    "/search",
    { preHandler: [authenticateToken, validateQuery(userSchemas.searchUsers)] },
    searchUsersHandler,
  );
  fastify.delete(
    "/",
    { preHandler: validateBody(userSchemas.delete) },
    deleteUserHandler,
  );
  // --- Friend Request Routes ---
  fastify.post(
    "/friends/requests",
    { preHandler: [authenticateToken] },
    sendFriendRequestHandler,
  );
  fastify.get(
    "/friends/requests/pending",
    { preHandler: [authenticateToken] },
    getFriendRequestsHandler,
  );
  fastify.put(
    "/friends/requests/:friendshipId",
    { preHandler: [authenticateToken] },
    respondToFriendRequestHandler,
  );
  fastify.get(
    "/friends",
    { preHandler: [authenticateToken] },
    getFriendsHandler,
  );
  fastify.get(
    "/friendships",
    { preHandler: [authenticateToken] },
    getAllFriendshipsHandler,
  );
  fastify.delete(
    "/friends/:friendshipId",
    { preHandler: [authenticateToken] },
    deleteFriendHandler,
  );

  // pong routes
  fastify.get(
    "/:id/stats",
    {
      //preHandler: [authenticateToken],
      schema: {
        params: userIdParamsSchema,
      },
    },
    getUserStatsHandler,
  );

  fastify.put(
    "/:id/match_history",
    {
      schema: {
        params: userIdParamsSchema,
        body: updateStatsBodySchema,
      },
    },
    updateUserHistoryHandler,
  );

  fastify.put(
    "/:id/stats",
    {
      schema: {
        params: userIdParamsSchema,
        body: updateStatsBodySchema,
      },
    },
    updateUserStatsHandler,
  );
  fastify.get(
    "/:id/matches",
    {
      preHandler: [authenticateToken],
      schema: {
        params: userIdParamsSchema,
      },
    },
    getMatchHistoryHandler,
  );

  fastify.post("/users/batch", getUsersByIds);
}
