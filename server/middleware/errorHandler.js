import { ZodError } from 'zod';
import { config } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle Mongoose duplicate key error (code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value error: ${field} '${value}' already exists.`;
  }

  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map(e => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for parameter: ${err.path}`;
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Safe response
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.nodeEnv === 'development' && statusCode === 500 && { stack: err.stack }),
  };

  if (statusCode === 500 && config.nodeEnv !== 'test') {
    console.error(`[Server Error] ${req.method} ${req.url}:`, err.message);
  }

  res.status(statusCode).json(response);
};
