const UserModel = require("./schema");
const userRouter = require("express").Router();
const userAuthorization = require("../../auth/middleware");
const { getTokens, updateTokens } = require("../../auth");

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByEmailAndPassword(email, password);
    if (!user) throw Error();

    // Generate and save in to bd tokens
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

userRouter.put("/me", userAuthorization, async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/me", userAuthorization, async (req, res, next) => {
  try {
    await req.user.deleteOne(res.send("Deleted"));
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

userRouter.get("/refreshToken", async (req, res, next) => {
  try {
    console.log(req.cookies);

    const oldRefreshToken = req.cookies.refreshToken;

    // Verify the refToken

    const { accessToken, refreshToken } = await updateTokens(oldRefreshToken);

    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/", async (req, res, next) => {
  const users = await UserModel.find();
  res.send(users);
});

module.exports = userRouter;
