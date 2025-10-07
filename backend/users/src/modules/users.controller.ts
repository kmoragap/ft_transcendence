import { FastifyReply, FastifyRequest } from "fastify";
import * as bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export function isValidCuid(id: string): boolean {
  return /^c[a-z0-9]{24}$/.test(id);
}

export async function createUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username, email, firstname, password, avatarUrl } = request.body as {
    username: string;
    email: string;
    firstname: string;
    password: string;
    avatarUrl?: string;
  };

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        firstname,
        password: hashedPassword,
        avatarUrl: avatarUrl || "/assets/img/avatar.jpg",
      },
    });
    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      avatarUrl: user.avatarUrl,
    };
  } catch (error: any) {
    console.log("Error creating the user: ", error);

    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      if (field === "email") {
        return reply.code(409).send({ error: "Email already exists" });
      } else if (field === "username") {
        return reply.code(409).send({ error: "Username already exists" });
      }
      return reply.code(409).send({ error: "User already exists" });
    }

    return reply
      .code(500)
      .send({ error: "Failed to create user. Please try again." });
  }
}

export async function deleteUserHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id, email } = request.body as { id?: string; email?: string };

  if (!id && !email) {
    reply.code(400).send({ error: "User id or email must be provided" });
    return;
  }

  // Validate ID format if provided
  if (id && !isValidCuid(id)) {
    reply.code(400).send({ error: "Invalid user ID format" });
    return;
  }

  try {
    const where = id ? { id } : { email };
    const deletedUser = await prisma.user.delete({ where });

    reply.send({
      message: "User deleted successfully",
      user: {
        id: deletedUser.id,
        username: deletedUser.username,
        email: deletedUser.email,
      },
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      reply.code(404).send({ error: "User not found" });
    } else {
      console.error("Error deleting user:", error);
      reply
        .code(500)
        .send({ error: "Failed to delete user. Please try again." });
    }
  }
}

export async function getUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      firstname: true,
      avatarUrl: true,
      gamesPlayed: true,
      wins: true,
      losses: true,
      elo: true,
    },
  });
  return users;
}

export async function searchUsersHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { q } = request.query as { q: string };

  if (!q || q.length < 2) {
    return reply.send([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [{ username: { contains: q } }, { firstname: { contains: q } }],
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        avatarUrl: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
        elo: true,
      },
    });

    return reply.send(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return reply.code(500).send({ error: "Failed to search users" });
  }
}

export async function getUserByEmailHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email } = request.params as { email: string };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      password: user.password,
    };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return reply.code(500).send({ error: "Failed to fetch user" });
  }
}

export async function getUserByUsernameHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username } = request.params as { username: string };

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }
    return {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      email: user.email,
      avatarUrl: user.avatarUrl,
      password: user.password,
    };
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return reply.code(500).send({ error: "Failed to fetch user" });
  }
}

export const getUsersByIds = async (
  request: FastifyRequest<{ Body: { userIds: string[] } }>,
  reply: FastifyReply
) => {
  try {
    const { userIds } = request.body;

    // Validate all IDs
    const invalidIds = userIds.filter(id => !isValidCuid(id));
    if (invalidIds.length > 0) {
      return reply
        .status(400)
        .send({ error: "Invalid user ID format in request" });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return reply.send(users);
  } catch (error) {
    return reply.status(500).send({ error: "Failed to get users" });
  }
};

export async function updateMyProfileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username, firstname, email } = request.body as {
    username?: string;
    firstname?: string;
    email?: string;
  };

  const userId = request.user?.id;
  if (!userId) return reply.code(401).send({ error: "Unauthorized" });

  try {
    // Check if username or email already exists (if they're being changed)
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId },
        },
      });
      if (existingUser) {
        return reply.code(409).send({ error: "Username already exists" });
      }
    }

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });
      if (existingUser) {
        return reply.code(409).send({ error: "Email already exists" });
      }
    }

    // Update user profile
    const updateData: any = {};
    if (username) updateData.username = username;
    if (firstname) updateData.firstname = firstname;
    if (email) updateData.email = email;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        firstname: true,
        email: true,
        avatarUrl: true,
      },
    });

    return reply.send({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return reply.code(500).send({ error: "Failed to update profile" });
  }
}

export async function uploadAvatarHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // file comes from @fastify/multipart (make sure it's registered before routes)
  const file = await request.file({ limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB
  if (!file) return reply.code(400).send({ error: "No file uploaded" });

  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  const ct = (file.mimetype || "").toLowerCase();
  if (!allowed.has(ct))
    return reply.code(415).send({ error: "Unsupported file type" });

  // auth: get current user id from token/middleware
  const userId = request.user?.id;
  if (!userId) return reply.code(401).send({ error: "Unauthorized" });

  // read the upload stream to buffer
  const chunks: Buffer[] = [];
  for await (const chunk of file.file) chunks.push(chunk as Buffer);
  const input = Buffer.concat(chunks);

  const avatarsDir = path.resolve(process.cwd(), "uploads", "avatars");
  await fs.mkdir(avatarsDir, { recursive: true });

  const filename = `${randomUUID()}.webp`;
  const outPath = path.join(avatarsDir, filename);

  await sharp(input, { failOn: "none" })
    .rotate()
    .resize(256, 256, { fit: "cover" })
    .webp({ quality: 85 })
    .toFile(outPath);

  const where = { id: userId };

  const current = await prisma.user.findUnique({
    where,
    select: { avatarUrl: true },
  });
  if (current?.avatarUrl?.startsWith("/uploads/avatars/")) {
    const oldPath = path.resolve(
      process.cwd(),
      current.avatarUrl.replace("/uploads/", "uploads/")
    );
    fs.unlink(oldPath).catch(() => {});
  }

  const publicUrl = `/uploads/avatars/${filename}`;

  await prisma.user.update({
    where,
    data: { avatarUrl: publicUrl },
  });

  return reply.send({ avatarUrl: publicUrl });
}

export async function toggle2faHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { is2faEnabled } = request.body as {
    is2faEnabled: boolean;
  };

  if (typeof is2faEnabled !== "boolean") {
    return reply.code(400).send({ error: "is2faEnabled must be a boolean" });
  }
  const userId = request.user?.id;
  if (!userId) return reply.code(401).send({ error: "Unauthorized" });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { is2faEnabled },
      select: {
        id: true,
        username: true,
        firstname: true,
        email: true,
        avatarUrl: true,
        is2faEnabled: true,
      },
    });

    return reply.send({
      message: `Two-factor authentication ${is2faEnabled ? 'enabled' : 'disabled'} successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error toggling 2FA:", error);
    return reply.code(500).send({ error: "Failed to toggle 2FA" });
  }
}
