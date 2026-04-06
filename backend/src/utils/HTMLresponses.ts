import { Response } from "express";
 
export const sendSuccess = (res: Response, data: unknown, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({ message, data });
};
 
export const sendCreated = (res: Response, data: unknown, message = "Created successfully") => {
  sendSuccess(res, data, message, 201);
};
 
export const sendNoContent = (res: Response) => {
  res.status(204).send();
};
 
export const sendError = (res: Response, error = "Server Failed", statusCode = 500) => {
  res.status(statusCode).json({ error });
};
 
export const sendNotFound = (res: Response, error = "Object not found") => {
  sendError(res, error, 404);
};
 
export const sendForbidden = (res: Response, error = "You are unauthorized to make this request") => {
  sendError(res, error, 403);
};
 
export const sendUnauthorized = (res: Response, error = "Missing or invalid authentication token") => {
  sendError(res, error, 401);
};
 