const UserModel = require("../../models/userModel.js.js");
const userRouter = require("express").Router();
const userAuthorization = require("../../auth/middleware");
const { getTokens, updateTokens } = require("../../auth");
const passport = require("passport");

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmailAndPassword(email, password);
    if (!user) throw Error("User not found");
    // console.log(user);

    // Generate and save in to bd tokens
    const tokenPairs = await getTokens(user);

    // Send back tokens

    res.status(200).send(tokenPairs);
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

    const updatedTokens = await updateTokens(oldRefreshToken);

    res.send(updatedTokens);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/", async (req, res, next) => {
  const users = await UserModel.find();
  res.send(users);
});

userRouter.get(
  "/google-login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

userRouter.get(
  "/google-redirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      const tokenPairs = await getTokens(req.user);

      res.status(200).send(tokenPairs).redirect(process.env.FE_URL);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = userRouter;
