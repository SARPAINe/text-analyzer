import { Request, Response, NextFunction } from "express";
import { logError } from "../utils/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logError(`Error: ${err.message} - ${req.method} ${req.url} - ${req.ip}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
