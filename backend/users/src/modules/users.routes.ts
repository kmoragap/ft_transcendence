import { FastifyInstance } from "fastify";
import { authenticateToken } from "../modules/users.middleware";
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
  getUserStatsHandler,
  getMatchHistoryHandler,
} from "./stats.controller";
import { userIdParamsSchema, updateStatsBodySchema } from "./stats.schema";

export default async function userRoutes(fastify: FastifyInstance) {
  // profile routes (register first to avoid conflicts)
  fastify.put(
    "/me",
    { preHandler: [authenticateToken] },
    updateMyProfileHandler
  );
  fastify.post(
    "/me/avatar",
    { preHandler: [authenticateToken] },
    uploadAvatarHandler
  );
  fastify.put(
    "/me/online-status",
    { preHandler: [authenticateToken] },
    updateOnlineStatusHandler
  );

  // internal service route for auth service
  fastify.put("/:userId/online-status", updateOnlineStatusByIdHandler);

  // public routes
  fastify.post("/", createUserHandler); // user registartion
  fastify.get("/by-email/:email", getUserByEmailHandler); // for the auth service
  fastify.get("/by-username/:username", getUserByUsernameHandler); // for the auth service

  // protected routes
  fastify.get("/", { preHandler: [authenticateToken] }, getUsersHandler);
  fastify.get(
    "/search",
    { preHandler: [authenticateToken] },
    searchUsersHandler
  );
  fastify.delete("/", { preHandler: [authenticateToken] }, deleteUserHandler);

  // --- Friend Request Routes ---
  fastify.post(
    "/friends/requests",
    { preHandler: [authenticateToken] },
    sendFriendRequestHandler
  );
  fastify.get(
    "/friends/requests/pending",
    { preHandler: [authenticateToken] },
    getFriendRequestsHandler
  );
  fastify.put(
    "/friends/requests/:friendshipId",
    { preHandler: [authenticateToken] },
    respondToFriendRequestHandler
  );
  fastify.get(
    "/friends",
    { preHandler: [authenticateToken] },
    getFriendsHandler
  );
  fastify.get(
    "/friendships",
    { preHandler: [authenticateToken] },
    getAllFriendshipsHandler
  );
  fastify.delete(
    "/friends/:friendshipId",
    { preHandler: [authenticateToken] },
    deleteFriendHandler
  );

  // pong routes
  fastify.get(
    "/:id/stats",
    {
      preHandler: [authenticateToken],
      schema: {
        params: userIdParamsSchema,
      },
    },
    getUserStatsHandler
  );

  fastify.put(
    "/:id/stats",
    {
      schema: {
        params: userIdParamsSchema,
        body: updateStatsBodySchema,
      },
    },
    updateUserStatsHandler
  );
  fastify.get(
    "/:id/matches",
    {
      preHandler: [authenticateToken],
      schema: {
        params: userIdParamsSchema,
      },
    },
    getMatchHistoryHandler
  );

  fastify.post("/users/batch", getUsersByIds);
}
