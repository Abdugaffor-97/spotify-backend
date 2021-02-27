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

    return { refreshToken, accessToken };
  } catch (error) {
    throw new Error();
  }
};

const updateTokens = async (oldRefreshToken) => {
  try {
    // const decoded = await verifyToken(oldRefreshToken, REFRESH_TOKEN_SECRET);

    const newAccessToken = await generateToken(
      { _id: user._id },
      ACCESS_TOKEN_SECRET
    );
    const newRefreshToken = await generateToken(
      { _id: user._id },
      REFRESH_TOKEN_SECRET,
      "2 week"
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.log(error);
  }
};

module.exports = { verifyToken, getTokens, updateTokens };
