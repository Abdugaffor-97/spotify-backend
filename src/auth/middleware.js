const { verifyToken } = require(".");
const UserModel = require("../models/userModel.js.js");
const { ACCESS_TOKEN_SECRET } = process.env;

const userAuthorization = async (req, res, next) => {
  try {
    const AccessToken = req.header("Authorization").replace("Bearer ", "");

    const decoded = await verifyToken(AccessToken, ACCESS_TOKEN_SECRET);
    const user = await UserModel.findById(decoded._id);

    if (!user) throw new Error("User not found");
    req.user = user;
    req.token = AccessToken;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = userAuthorization;
