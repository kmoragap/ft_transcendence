import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";

export interface tournamentInfo {
  //tournament name?
  name: string;
  //array of players participating
  playersIds: string[];
}

export const createTournament = async (
  request: FastifyRequest<{ Body: { data: tournamentInfo } }>,
  reply: FastifyReply
) => {
  try {
    const { data } = request.body;
    const playersIds = data.playersIds || [];

    const tournament = await prisma.tournament.create({
      data: {
        name: data.name || "Test_Tournament",
        playersIds: JSON.stringify(playersIds),
      },
    });

    return reply.status(201).send(tournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    return reply.status(500).send({ error: "Failed to create tournament" });
  }
};

export const getTournament = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        games: {
          orderBy: [{ tournamentRound: "asc" }, { tournamentMatch: "asc" }],
        },
      },
    });

    if (!tournament) {
      return reply.status(404).send({ error: "Tournament not found" });
    }

    return reply.send({
      ...tournament,
      playersIds: JSON.parse(tournament.playersIds),
    });
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return reply.status(500).send({ error: "Failed to fetch tournament" });
  }
};
