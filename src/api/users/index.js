const UserModel = require("./schema");
const userRouter = require("express").Router();
const userAuthorization = require("../../auth/middleware");
const { getTokens } = require("../../auth");

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmailAndPassword(email, password);

    // Generate and save in to bd tokens
    if (!user) throw Error();

    const { accessToken, refreshToken } = await getTokens(user);

    // Send back tokens
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
    });

    res.status(200).send(user);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me", userAuthorization, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

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
