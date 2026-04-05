export const sendSuccess = <T>(res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({ message, data });
};

export const sendError = <T>(res, error = "Server Failed", statusCode = 500) => {
  res.status(statusCode).json({ error });
};

export const sendCreated = <T>(res, data, message = "Created successfully") => {
  sendSuccess(res, data, message, 201);
};

export const sendNotFound = <T>(res, error = "Object not Found") => {
  sendError(res, error, 404);
};

export const sendForbidden = <T>(res, error = "You are unauthorized to make this request.") => {
  sendError(res, error, 403);
};

export const sendUnauthorized = <T>(res, error = "Missing or invalid authentication token") => {
  sendError(res, error, 401);
};