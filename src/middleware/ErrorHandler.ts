class ErrorHandler extends Error {
    statusCode: number;
    status: string;
    isOperational: true;
    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
}
export default ErrorHandler;