class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message, 403);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export { CustomError, BadRequestError, NotFoundError, UnauthorizedError };
