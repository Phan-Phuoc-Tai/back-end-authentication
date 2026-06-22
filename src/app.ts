import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import authRoute from "./routes/auth.route";
import { ZodError } from "zod";
import { errorResponse } from "./utils/response";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/auth", authRoute);

app.use(
  (error: Error, request: Request, response: Response, next: NextFunction) => {
    let status: number = 400;
    //error validate
    if (error instanceof ZodError) {
      const zodError = Object.fromEntries(
        error.issues.map(({ path, message }) => {
          return [path[0], message];
        }),
      );
      errorResponse(response, zodError, status);
    }
    //error not found
    if (error.message.toLowerCase().includes("not found")) {
      status = 404;
    }
    //error unauthorized
    if (error.message.toLowerCase().includes("unauthorized")) {
      status = 401;
    }
    if (error.message.toLowerCase().includes("sent too quickly")) {
      status = 429;
    }
    errorResponse(response, error.message, status);
    next();
  },
);

app.listen(PORT, () => {
  console.log(`Server is running with port: ${PORT}`);
});
