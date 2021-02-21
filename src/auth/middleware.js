const UserModel = require("../api/users/schema");

const userAuthorization = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    const decoded = await verifyAccessToken(token);
    const user = await UserModel.findById(decoded._id);

    if (!user) throw new Error("User not found");
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = userAuthorization;
