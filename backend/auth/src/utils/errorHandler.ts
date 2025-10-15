export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ConflictError extends AuthError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export function handleAuthError(error: any, reply: any) {
  if (error instanceof AuthError) {
    return reply.code(error.statusCode).send({
      error: error.message,
      code: error.code
    });
  }

  console.error('Unexpected auth error:', error);
  return reply.code(500).send({ error: 'Internal server error' });
} 