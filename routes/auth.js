const express = require('express');
const jwt = require('jsonwebtoken');
const getTokens = require('helpers/get-tokens');
const { User } = require('models');
const { checkToken } = require('routes/middlewares');
const {
  jwt: { tokenSecret },
} = require('config');
const checkTimestamp = require('helpers/check-time-stamp');
const router = express.Router();

const tokenList = {};

router.post('/register', async (req, res) => {
  const { name, password } = req.body;
  const user = await User.create({ name, password });
  res.json({ user, msg: 'account created successfully' });
});

router.post('/refresh', (req, res) => {
  const { refreshToken: oldRefreshToken } = req.body;
  let userId;
  if (oldRefreshToken && oldRefreshToken in tokenList) {
    jwt.verify(oldRefreshToken, tokenSecret, function(err, decoded) {
      if (err) {
        return res
          .status(401)
          .json({ error: true, message: 'Unauthorized access.' });
      }
      checkTimestamp(decoded.exp, res);
      userId = decoded.id;
    });
    const payload = { id: userId };
    const { token, refreshToken } = getTokens(payload);
    const response = {
      token: token,
      refreshToken: refreshToken,
    };
    delete tokenList[oldRefreshToken];
    tokenList[refreshToken] = token;
    res.status(200).json(response);
  } else {
    res.status(404).send('Invalid request');
  }
});

router.post('/login', async (req, res) => {
  const { name, password } = req.body;
  if (name && password) {
    let user = await User.findOne({
      where: { name },
    });
    if (!user || user === null) {
      return res.status(401).json({ msg: 'No such user found', user });
    }
    if (user.password === password) {
      let payload = { id: user.id };
      const { token, refreshToken } = getTokens(payload);
      const response = {
        userId: user.id,
        token: token,
        refreshToken: refreshToken,
      };
      tokenList[refreshToken] = token;
      return res.status(200).json(response);
    } else {
      return res.status(401).json({ msg: 'Password is incorrect' });
    }
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  delete tokenList[refreshToken];
  return res.sendStatus(200).end();
});

router.get('/session', checkToken, (req, res) =>
  res.send({ userId: req.decoded.id }),
);

module.exports = router;
