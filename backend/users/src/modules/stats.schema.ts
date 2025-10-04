import { Type, Static } from "@sinclair/typebox";

// schema for the url params -> user id
export const userIdParamsSchema = Type.Object({
  id: Type.String({ format: "cuid" }), // we check that the id has cuid format
});
export type UserIdParams = Static<typeof userIdParamsSchema>;

// body schema req for update stats
export const updateStatsBodySchema = Type.Object({
  gameId: Type.String(),
  isWinner: Type.Boolean(),
  userScore: Type.Integer({ minimum: 0 }),
  opponentName: Type.Optional(Type.String()), //optional for ai/guest games
  opponentScore: Type.Optional(Type.Integer({ minimum: 0 })),
  opponentId: Type.Optional(Type.String()), //optional for ai/guest games
});
export type UpdateStatsBody = Static<typeof updateStatsBodySchema>;
