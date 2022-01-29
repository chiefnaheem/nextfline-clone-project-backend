import jwt from "jsonwebtoken";
import { IUser } from "../types/types";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const generateEmailToken = (email: string) => {
  const emailToken = jwt.sign({ email }, process.env.JWT_EMAIL_KEY as string, {
    expiresIn: process.env.JWT_EMAIL_EXPIRES_IN,
  });
  return emailToken;
};

export const generateToken = async (statusCode: any, res: any, user: any) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + `${process.env.JWT_EXPIRES_IN}`),
  };
  res.status(statusCode).cookie("token", token, options).json({ success: true, token, data: user });
};

const generatedToken = (user: IUser): string => {
  const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET_KEY as string, {
    expiresIn: "1d",
  });

  return token;
};

export const sendToken = (res: any, statusCode: number, user: IUser) => {

  const token = generatedToken(user);

  const expires = new Date(Date.now() + 40 * 24 * 60 * 1000);

  const options: any = {
    expires,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.cookie("jwt", token, options);
  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    user,
    token: {
      token,
      expires,
    },
  });
};

export const createPasswordResetToken = () => {
  const resetToken: any = crypto.randomBytes(32).toString("hex");

  const hashedToken: any = crypto.createHash("sha256").update(resetToken).digest("hex");

  return { resetToken, hashedToken };
};

export const hashedPassword = (password: string): string => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(12));
};
