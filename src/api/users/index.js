const UserModel = require("./schema");
const userRouter = require("express").Router();

userRouter.post("/register", async (req, res, next) => {
  try {
    const { _id } = await UserModel.create(req.body);
    res.send(_id);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/", async (req, res, next) => {
  const users = await UserModel.find();
  res.send(users);
});

module.exports = userRouter;
