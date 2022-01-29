import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User from "../model/userModel";
import CatchAsync from "../middleware/CatchAsync";
import ResponseStatus from "../middleware/response";
import { userInfo } from "os";

const responseStatus = new ResponseStatus();

export const getAllUsers = CatchAsync(async (req: any, res: Response) => {
  const query = req.query.new;
  console.log(req.user);
  if (req.user.isAdmin) {
    const data = query ? await User.find({}).sort({ _id: -1 }).limit(10) : await User.find({});
    responseStatus.setSuccess(200, "Successful", data);
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "You must be an admin to access this route");
  return responseStatus.send(res);
});

export const getSelfProfile = CatchAsync(async (req: any, res: Response) => {
  const user = await User.findOne({ _id: req.user.id });
  if (!user) {
    responseStatus.setError(400, "User does not exist");
    return responseStatus.send(res);
  }
  responseStatus.setSuccess(200, "Successful", { data: user });
  return responseStatus.send(res);
});

export const adminGetOneUser = CatchAsync(async (req: any, res: Response) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    responseStatus.setError(400, "User does not exist");
    return responseStatus.send(res);
  }
  if (req.user.isAdmin) {
    responseStatus.setSuccess(200, "Successful", { data: user });
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Only an admin can get full profile of users");
  return responseStatus.send(res);
});

export const userGetUser = CatchAsync(async (req: any, res: Response) => {
  if (!req.params || !req.params.id) {
    responseStatus.setError(400, "Please provide an ID");
    return responseStatus.send(res);
  }
  const user = await User.findOne({ _id: req.params.id }).select("-password -confirmNewPassword");
  if (!user) {
    responseStatus.setError(400, "User does not exist");
    return responseStatus.send(res);
  }
  if (!user.isActive) {
    responseStatus.setSuccess(200, "Account has been temporarily suspended", {});
    return responseStatus.send(res);
  }
  if (!req.user.isAdmin) {
    responseStatus.setSuccess(200, "Successful", { data: user });
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Check as an admin");
  return responseStatus.send(res);
});

export const updateOneUser = CatchAsync(async (req: Request, res: Response): Promise<Response> => {
  const userId = new mongoose.Types.ObjectId(req.params.id);
  console.log(req.params.id);
  const newUserInfo = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");
  console.log(newUserInfo);
  if (!newUserInfo) {
    responseStatus.setError(404, "Not Found");
    return responseStatus.send(res);
  }
  responseStatus.setSuccess(200, "Successfully Updated", newUserInfo);
  return responseStatus.send(res);
});

export async function suspendUser(req: any, res: Response) {
  try {
    if (!req.params || !req.params.id) {
      responseStatus.setError(400, "Please provide an ID");
      return responseStatus.send(res);
    }
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const data = await User.findById(userId);

    if (!data) {
      responseStatus.setError(404, "Not Found");
      return responseStatus.send(res);
    }
    if (req.user.isAdmin && data.isActive) {
      const suspendedUser = await User.findByIdAndUpdate(
        userId,
        {
          isActive: false,
        },
        { new: true, runValidators: true }
      );
      if (!suspendedUser) {
        responseStatus.setError(500, "failed to update");
        return responseStatus.send(res);
      }
      responseStatus.setSuccess(
        200,
        "This user has been suspended. Please contact our customer services",
        {}
      );
      return responseStatus.send(res);
    }
    responseStatus.setError(
      500,
      "Only admin can suspend user  || Account has been temporarily suspended already"
    );
    return responseStatus.send(res);
  } catch (error) {
    responseStatus.setError(500, "failed to update an error occurred");
    return responseStatus.send(res);
  }
}

export async function reactivateUser(req: any, res: Response) {
  try {
    if (!req.params || !req.params.id) {
      responseStatus.setError(400, "Please provide an ID");
      return responseStatus.send(res);
    }
    const userId = new mongoose.Types.ObjectId(req.params.id);
    const data = await User.findById(userId);

    if (!data) {
      responseStatus.setError(404, "Not Found");
      return responseStatus.send(res);
    }
    if (req.user.isAdmin && !data.isActive) {
      const reactivateUser = await User.findByIdAndUpdate(
        userId,
        {
          isActive: true,
        },
        { new: true }
      );
      if (!reactivateUser) {
        responseStatus.setError(500, "failed to update");
        return responseStatus.send(res);
      }
      responseStatus.setSuccess(
        200,
        "Cheers! Your account has been reactivated. Please go through our terms and conditions of use again for adherence. Thanks",
        { reactivateUser }
      );
      return responseStatus.send(res);
    }
    responseStatus.setError(500, "Only admin can reactivate user || Account is active already");
    return responseStatus.send(res);
  } catch (error) {
    responseStatus.setError(500, "failed to update an error occurred");
    return responseStatus.send(res);
  }
}

export const blockUser = CatchAsync(async (req: any, res: Response) => {
  if (req.user.isAdmin) {
    const user = await User.findByIdAndRemove({ _id: req.params.id });
    if (!user) {
      responseStatus.setError(400, "User does not exist");
      return responseStatus.send(res);
    }
    responseStatus.setSuccess(200, "Sorry, this account has been permanently blocked", {});
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Only Admin can delete account");
  return responseStatus.send(res);
});

export const getStats = CatchAsync(async (req: any, res: Response, next: NextFunction) => {
  if (req.user.isAdmin) {
    const today = new Date();
    const lastYear: any = today.setFullYear(today.getFullYear() - 1);
    const monthArray = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const data = await User.aggregate([
      {
        $project: {
          month: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    responseStatus.setSuccess(200, "Total stats", { data });
    return responseStatus.send(res);
  }
  responseStatus.setError(400, "Only Admin can view stats");
  return responseStatus.send(res);
});
