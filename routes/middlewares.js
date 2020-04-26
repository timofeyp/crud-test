const jwt = require('jsonwebtoken');
const {
  jwt: { tokenSecret },
} = require('config');
const checkTimestamp = require('helpers/check-time-stamp');

const checkToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers['authorization'];
  if (token) {
    jwt.verify(token, tokenSecret, function(err, decoded) {
      if (err) {
        return res
          .sendStatus(401)
          .json({ error: true, message: 'Unauthorized access.' });
      }
      checkTimestamp(decoded.exp, res);
      req.decoded = decoded;
      next();
    });
  } else {
    return res.sendStatus(403).send({
      error: true,
      message: 'No token provided.',
    });
  }
};

module.exports = { checkToken };
