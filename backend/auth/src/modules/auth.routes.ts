import { FastifyInstance } from "fastify";
import { oauth42Handler, oauth42CallbackHandler } from "./oauth.controller";
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  verifyTokenHandler,
  getMeHandler,
  verify2faHandler,
  resend2faHandler,
} from "./auth.controller";
import { validateBody } from "./auth.middleware";
import { authSchemas } from "./auth.schema";

export default async function authRoutes(fastify: FastifyInstance) {
  // auth routes
  fastify.post(
    "/register",
    { preHandler: validateBody(authSchemas.register) },
    registerHandler,
  );
  fastify.post(
    "/login",
    { preHandler: validateBody(authSchemas.login) },
    loginHandler,
  );
  // 2FA verification route
  fastify.post(
    "/verify-2fa",
    { preHandler: validateBody(authSchemas.verify2fa) },
    verify2faHandler,
  ); // 2FA resend route
  fastify.post(
    "/resend-2fa",
    { preHandler: validateBody(authSchemas.resend2fa) },
    resend2faHandler,
  );

  // protected routes
  fastify.post(
    "/logout",
    { preHandler: [fastify.authenticate] },
    logoutHandler,
  );
  fastify.get(
    "/verify",
    { preHandler: [fastify.authenticate] },
    verifyTokenHandler,
  );
  fastify.get("/me", { preHandler: [fastify.authenticate] }, getMeHandler);

  // oauth routes
  fastify.get("/oauth/42", oauth42Handler);
  fastify.get("/callback/42", oauth42CallbackHandler);
}
