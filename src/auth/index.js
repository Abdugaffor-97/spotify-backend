const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const generateToken = (payload, secret, time) => {
  new Promise((resolve, reject) =>
    jwt.sign(payload, secret, { expiresIn: time }, (err, token) => {
      if (err) reject(err);
      resolve(token);
    })
  );
};

const verifyToken = (token, secret) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    })
  );

const getTokens = async (user) => {
  try {
    // create tokens
    const accessToken = generateToken(
      { _id: user._id },
      ACCESS_TOKEN_SECRET,
      "30m"
    );
    const refreshToken = generateToken(
      { _id: user._id },
      REFRESH_TOKEN_SECRET,
      "1 week"
    );

    // Save new refresh token to db
    user.refreshTokens = user.refreshTokens.concat({ token: refreshToken });
    await user.save();

    return { refreshToken, accessToken };
  } catch (error) {
    throw new Error();
  }
};

module.exports = { verifyToken, getTokens };
