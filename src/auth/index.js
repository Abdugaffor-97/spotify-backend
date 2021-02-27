const jwt = require("jsonwebtoken");
const UserModel = require("../api/users/schema");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env

const generateToken = (payload, privateKey, time = "1 week") =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, privateKey, { expiresIn: time }, (err, token) => {
      if (err) reject(err);
      resolve(token);
    })
  );

const verifyToken = (token, privateKey) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, privateKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    })
  );

const getTokens = async (user) => {
  try {
    // create tokens
    const accessToken = await generateToken(
      { _id: user._id },
      ACCESS_TOKEN_SECRET,
      "30m"
    );

    const refreshToken = await generateToken(
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

const updateTokens = async (oldRefreshToken) => {
  try {
    const decoded = await verifyToken(oldRefreshToken, REFRESH_TOKEN_SECRET);

    // Check old refresh token is in db
    const user = await UserModel.findById(decoded._id);

    const currentRefreshToken = user.refreshTokens.find(
      (token) => token.token === oldRefreshToken
    );

    if (!currentRefreshToken) throw new Error("Refresh Token Not Exists");

    const newAccessToken = await generateToken(
      { _id: user._id },
      ACCESS_TOKEN_SECRET
    );
    const newRefreshToken = await generateToken(
      { _id: user._id },
      REFRESH_TOKEN_SECRET,
      "2 week"
    );

    const newRefreshTokensList = user.refreshTokens
      .filter((token) => token.token !== oldRefreshToken)
      .concat({ token: newRefreshToken });

    user.refreshTokens = [...newRefreshTokensList];

    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.log(error);
  }
};

module.exports = { verifyToken, getTokens, updateTokens };
