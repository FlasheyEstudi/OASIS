export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new AppError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message: string = 'No autorizado') {
    return new AppError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message: string = 'Acceso prohibido') {
    return new AppError(403, 'FORBIDDEN', message);
  }

  static notFound(message: string = 'Recurso no encontrado') {
    return new AppError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string) {
    return new AppError(409, 'CONFLICT', message);
  }

  static tooManyRequests(message: string = 'Demasiadas solicitudes') {
    return new AppError(429, 'TOO_MANY_REQUESTS', message);
  }

  static internal(message: string = 'Error interno del servidor') {
    return new AppError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
