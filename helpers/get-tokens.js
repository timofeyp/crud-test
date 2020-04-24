const jwt = require('jsonwebtoken');

const {
  jwt: { accessExpiresIn, refreshExpiresIn, tokenSecret },
} = require('config');

module.exports = payload => {
  const token = jwt.sign(payload, tokenSecret, {
    expiresIn: accessExpiresIn,
  });
  const refreshToken = jwt.sign(payload, tokenSecret, {
    expiresIn: refreshExpiresIn,
  });
  return { token, refreshToken };
};
