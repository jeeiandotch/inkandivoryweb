export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = "You must be logged in to do that.") {
    return new ApiError(401, message);
  }
  static forbidden(message = "You don't have permission to do that.") {
    return new ApiError(403, message);
  }
  static notFound(message = "That couldn't be found.") {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
}
