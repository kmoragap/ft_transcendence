import * as z from "zod";

export const gameSchemas = {
  // game creation schema
  create: z.object({
    data: z.object({
      status: z.enum(["IN_PROGRESS", "FINISHED", "CANCELLED"], {
        error: "Status must be IN_PROGRESS, FINISHED, or CANCELLED",
      }),
      player1Id: z.string().min(1, "Player 1 ID is required"),
      player1Name: z.string().min(1, "Player 1 name is required"),
      score1: z.number().int().min(0, "Score 1 must be a non-negative integer"),
      player2Id: z.string().min(1, "Player 2 ID is required"),
      player2Name: z.string().min(1, "Player 2 name is required"),
      score2: z.number().int().min(0, "Score 2 must be a non-negative integer"),
      maxScore: z.number().int().min(1, "Max score must be at least 1"),
      multiBall: z.boolean(),
      mode: z.string().min(1, "Game mode is required"),
      isTournament: z.boolean(),
      tournamentId: z.string().optional(),
      tournamentRound: z.number().int().min(1).optional(),
      tournamentMatch: z.number().int().min(1).optional(),
      winnerId: z.string().min(1, "Winner ID is required"),
    }),
  }),

  // torunament status update schema
  updateTournamentStatus: z.object({
    status: z.enum(["IN_PROGRESS", "FINISHED", "CANCELLED"], {
      error: "Status must be IN_PROGRESS, FINISHED, or CANCELLED",
    }),
  }),

  // games query schema
  getGames: z.object({
    take: z
      .string()
      .regex(/^\d+$/, "Take must be a positive number")
      .optional(),
  }),

  // leaderboard query schema
  getLeaderboard: z.object({
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a positive number")
      .optional(),
  }),

  // user games query schema
  getUserGames: z.object({
    userId: z.string().min(1, "User ID is required"),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a positive number")
      .optional(),
  }),

  // tournament ID parameter
  tournamentIdParam: z.object({
    id: z.string().min(1, "Tournament ID is required"),
  }),

  // game ID parameter
  gameIdParam: z.object({
    id: z.string().min(1, "Game ID is required"),
  }),

  // ELO calculation schema
  getElo: z.object({
    userId: z.string().min(1, "User ID is required"),
    opponentId: z.string().min(1, "Opponent ID is required"),
    isWinner: z.boolean(),
  }),
};

export type CreateGameRequest = z.infer<typeof gameSchemas.create>;
export type UpdateTournamentStatusRequest = z.infer<
  typeof gameSchemas.updateTournamentStatus
>;
export type GetGamesRequest = z.infer<typeof gameSchemas.getGames>;
export type GetLeaderboardRequest = z.infer<typeof gameSchemas.getLeaderboard>;
export type GetUserGamesRequest = z.infer<typeof gameSchemas.getUserGames>;
export type TournamentIdParamRequest = z.infer<
  typeof gameSchemas.tournamentIdParam
>;
export type GameIdParamRequest = z.infer<typeof gameSchemas.gameIdParam>;
export type GetEloRequest = z.infer<typeof gameSchemas.getElo>;
