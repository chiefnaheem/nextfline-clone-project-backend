import CatchAsync from "./CatchAsync";
import mongoose from "mongoose";
import ErrorHandler from "./ErrorHandler";
import jwt from "jsonwebtoken";
import express, { Request, Response, NextFunction } from "express";
import User from "../model/userModel";
import ResponseStatus from "./response";
const responseStatus = new ResponseStatus()

const protectRoute = CatchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      let token: string | undefined;
  
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
  
      if (!token) {
        responseStatus.setError(401, "Please log in to access this route");
        return responseStatus.send(res);
      }
  
      const decodedToken: any = jwt.verify(
        token as string,
        process.env.JWT_SECRET_KEY as string
      );
  
      if (!decodedToken) {
        responseStatus.setError(401, "Sorry, user no longer exist");
        return responseStatus.send(res);
      }
      console.log(decodedToken)
      const user = await User.findById(decodedToken.id);
    //   console.log(user)
      if (!user) {
        responseStatus.setError(401, "Sorry, user does not exist");
        return responseStatus.send(res);
      }
  
      req.user = user;
  
      next();
    }
);

export default protectRoute;
