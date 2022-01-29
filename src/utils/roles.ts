import { AccessControl } from "accesscontrol";
const ac = new AccessControl();

export const roles = (function () {
  ac.grant("user").readOwn("profile").updateOwn("profile");

  ac.grant("admin").extend("basic").readAny("profile").updateAny("profile").deleteAny("profile");

  return ac;
})();
