import { Request, Response, NextFunction, response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../model/userModel";
import { IUser } from "../types/types";
import catchAsync from "../middleware/CatchAsync";
import sendEmail from "../utils/email";
import {
  generateEmailToken,
  generateToken,
  sendToken,
  createPasswordResetToken,
  hashedPassword,
} from "../utils/authParam";
import {
  validateChangePassword,
  validateResetPassword,
  validateUser,
  validateUserLogin,
} from "../utils/validations/authValidation";
import ResponseStatus from "../middleware/response";

const validatePassword = async (newPassword: string, existsPassword: string): Promise<boolean> => {
  return await bcrypt.compare(newPassword, existsPassword);
};

const responseStatus = new ResponseStatus();


//REGISTER
export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { error }: any = validateUser(req.body);
//   console.log(error)
//     if (error.message.includes('duplicate')) {
//         responseStatus.setError(401, 'There exists a user with the username or email. Please use another.');
//         return responseStatus.send(res); 
//     }
  if (error) {
    responseStatus.setError(401, "Invalid Credentials");
    return responseStatus.send(res);
  }

  const { firstName, lastName, email, password, isAdmin, confirmNewPassword, username } = req.body;
  if (password !== confirmNewPassword) {
    responseStatus.setError(401, "Passwords do not match");
    return responseStatus.send(res);
  }
  const hashedPass = hashedPassword(password);
  const hashedRepeatPassword = hashedPassword(confirmNewPassword);
  const newUser: IUser = await User.create({
    firstName,
    lastName,
    username,
    email,
    isAdmin,
    password: hashedPass,
    confirmNewPassword: hashedRepeatPassword,
  });
  const emailToken = generateEmailToken(newUser.email);

  if (process.env.NODE_ENV === "test") {
    return res.json({
      status: "success",
      newUser,
      emailToken,
    });
  } else {
    await sendEmail(
      newUser.email,
      "Email Verification",
      `<p>Hello ${newUser.username},</p><p>Thank you for creating account with us. Please click on this link to verify your email</p>
       Click
       <button><a href= http://localhost:3010/users/verify/${emailToken}>here</a></button> 
       to verify your email. Thanks`
    );

    responseStatus.setSuccess(201, "This is the sign up page", { emailToken });
    return responseStatus.send(res);
  }
});

export const confirmEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const emailToken: any = jwt.verify(
    req.params.token as string,
    process.env.JWT_EMAIL_KEY as string
  );
  if (!emailToken) {
    responseStatus.setError(401, "Invalid Token. Please sign up again");
    return responseStatus.send(res);
  }

  const user: any = await User.findOne({ email: emailToken.email }).select("-confirmNewPassword")
  if (!user) {
    responseStatus.setError(
      401,
      "We were unable to find a user for this verification. Please SignUp!"
    );
    return responseStatus.send(res);
  }
  user.isActive = true;
  await user.save();

  if (process.env.NODE_ENV === "test") {
    responseStatus.setSuccess(201, "This is to confirm email", { emailToken, user });
    return responseStatus.send(res);
  }
  return res.redirect("back");
});


//LOGIN

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { error } = validateUserLogin(req.body);
  if (error) {
    responseStatus.setError(401, "Invalid credentials");
    return responseStatus.send(res);
  }

  const { email, password } = req.body;
  if (!email || !password) {
    responseStatus.setError(401, "Please provide email and password");
    return responseStatus.send(res);
  }

  //check if user with the email exists
  const user: any | null = await User.findOne({ email: req.body.email }).select("+password");
  if (!user) {
    responseStatus.setError(401, "invalid login credentials");
    return responseStatus.send(res);
  }

  function errorToSend() {
    responseStatus.setError(401, "Please verify your email with the mail sent");
    return responseStatus.send(res);
  }
  //Check if password is correct
  const match = await validatePassword(req.body.password, user.password);
  console.log(user.password, req.body.password);
  if (!match) {
    responseStatus.setError(401, "invalid login credentials");
    return responseStatus.send(res);
  }
  return user.isActive ? generateToken(200, res, user) : errorToSend();
});

export const logout = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("token");
  responseStatus.setSuccess(200, "You just logged out", {});
  return responseStatus.send(res);
};

export const changePassword = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const user: any = await User.findById(req.user!._id).select("+password");

  if (!user) {
    responseStatus.setError(401, "Sorry, user does not exist");
    return responseStatus.send(res);
  }

  const { error } = validateChangePassword(req.body);
  if (error) {
    responseStatus.setError(401, `${error.message}`);
    return responseStatus.send(res);
  }

  const { newPassword, confirmNewPassword, previousPassword } = req.body;

  const isPreviousPasswordCorrect = await validatePassword(previousPassword, user.password);

  console.log(isPreviousPasswordCorrect);

  if (!isPreviousPasswordCorrect) {
    responseStatus.setError(401, "Incorrect credentials");
    return responseStatus.send(res);
  }

  user.password = newPassword;
  user.confirmNewPassword = confirmNewPassword;

  await user.save();

  sendToken(res, 200, user);
});

// forgot password
export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: any = await User.findOne({ email: req.body!.email });
    if (!user) {
      responseStatus.setError(401, "Incorrect credentials");
      return responseStatus.send(res);
    }

    const passwordExpires = Date.now() + 20 * 60 * 1000;

    const { resetToken, hashedToken } = createPasswordResetToken();

    await User.findByIdAndUpdate(
      user._id,
      {
        passwordExpires,
        passwordResetToken: hashedToken,
      },
      {
        runValidators: true,
        new: true,
      }
    );

    const url = `${req.protocol}://${req.get("host")}/resetPassword/${resetToken}`;

    try {
      if (process.env.NODE_ENV === "test") {
        return res.status(200).json({
          status: "success",
          message: "check your mail to reset your password",
          resetToken,
        });
      }
      await sendEmail(
        req.body!.email,
        "Reset Password",
        `Forgot your password?, follow this link ${url} to reset your password
      Kindly ignore this email if you did not request for a password reset`
      );
      responseStatus.setSuccess(200, "Check your email to reset your password", { resetToken });
      return responseStatus.send(res);
    } catch (e) {
      user.passwordExpires = undefined;
      user.passwordResetToken = undefined;

      await user.save({ validateBeforeSave: false });
      console.log(e);


      responseStatus.setError(
        500,
        "There was an error sending a password reset email, please try again"
      );
      return responseStatus.send(res);
    }
  }
);

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;

  const { error } = validateResetPassword(req.body);

  if (error) {
    responseStatus.setError(500, `${error.message}`);
    return responseStatus.send(res);
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user: any = await User.findOne({
    passwordResetToken: hashedToken,
    passwordExpires: { $gt: Date.now() },
  });

  if (!user) {

    responseStatus.setError(500, "Token expired or invalid");
    return responseStatus.send(res);
  }

  const { password, passwordConfirm } = req.body;

  user.password = password;
  user.confirmNewPassword = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordExpires = undefined;

  await user.save();

  sendToken(res, 200, user);
});
