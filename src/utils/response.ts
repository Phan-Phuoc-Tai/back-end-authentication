import { Response } from "express";

const errorResponse = (
  response: Response,
  message: string | Record<string, string>,
  status: number,
) => {
  response.status(status).json({
    success: false,
    message: message,
    data: null,
  });
};

const successResponse = (
  response: Response,
  message: string,
  data: unknown,
  status: number,
) => {
  response.status(status).json({
    success: true,
    message: message,
    data: data,
  });
};

export { errorResponse, successResponse };
