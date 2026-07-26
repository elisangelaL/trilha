export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Não autenticado") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Sem permissão para esta ação") {
    return new ApiError(403, message);
  }

  static notFound(message = "Recurso não encontrado") {
    return new ApiError(404, message);
  }

  static internal(message = "Erro interno do servidor", details?: unknown) {
    return new ApiError(500, message, details);
  }
}
