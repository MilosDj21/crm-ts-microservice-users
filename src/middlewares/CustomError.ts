class CustomError extends Error {
  statusCode: number;
  desc: string;
  constructor(message: string, statusCode: number = 500, desc: string) {
    super(message);
    this.statusCode = statusCode;
    this.desc = desc.length > 0 ? desc : message;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

class BadRequestError extends CustomError {
  /**
   * Creates Bad Request Error
   * @param message - this is sent back to client
   * @param desc - this is used for logging
   */
  constructor(message: string, desc: string = "") {
    super(message, 400, desc);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

class NotFoundError extends CustomError {
  constructor(message: string, desc: string = "") {
    super(message, 404, desc);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

class UnauthorizedError extends CustomError {
  constructor(message: string, desc: string = "") {
    super(message, 403, desc);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export { CustomError, BadRequestError, NotFoundError, UnauthorizedError };
