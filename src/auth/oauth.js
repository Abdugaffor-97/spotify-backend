const { request } = require("express");
const { TokenExpiredError } = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const UserModel = require("../models/userModel.js.js");
const { getTokens } = require("./index.js");
const userAuthorization = require("./middleware");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BE_URL } = process.env;

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: BE_URL + "/api/users/google-redirect",
    },
    async (request, accessToken, refreshToken, profile, next) => {
      try {
        let user = await UserModel.findOne({ google_id: profile.id });

        if (!user) {
          user = await UserModel.create({
            username: profile.name.givenName,
            email: profile.emails[0].value,
          });
        }

        user.update({ google_id: profile.id });
        next(null, user);
      } catch (error) {
        next(error);
      }
    }
  )
);

passport.serializeUser(function (user, next) {
  next(null, user);
});
