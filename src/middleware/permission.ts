// import { roles } from "../utils/roles";
import express, { Request, Response, NextFunction } from "express";
import { AccessControl } from "accesscontrol";
const ac = new AccessControl();

const roles: any = (function () {
  ac.grant("user").readOwn("profile").updateOwn("profile");
  ac.grant("admin").readAny("profile").updateAny("profile").deleteAny("profile");

  return ac;
})();

export const grantAccess = function (action: string, resource: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      console.log(roles);
      const permission = roles.can(req.user.role)[action](resource);
      console.log(req.user.role);
      if (!permission.granted) {
        return res.status(401).json({
          error: "You don't have enough permission to perform this action",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
