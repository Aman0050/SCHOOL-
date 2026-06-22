export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(404, code, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details: any = null, code: string = 'VALIDATION_ERROR') {
    super(400, code, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', code: string = 'UNAUTHORIZED') {
    super(401, code, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', code: string = 'FORBIDDEN') {
    super(403, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code: string = 'CONFLICT') {
    super(409, code, message);
  }
}
