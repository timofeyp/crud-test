const express = require('express');
const jwt = require('jsonwebtoken');
const getTokens = require('helpers/get-tokens');
const passport = require('passport');
const tokenList = {};
const passportJWT = require('passport-jwt');
const { User } = require('models');
const {
  jwt: { tokenSecret },
} = require('config');
const router = express.Router();

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'wowwow';
let strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
  console.log('payload received', jwt_payload);
  let user = User.findOne({
    where: { id: jwt_payload.id },
  });
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});
passport.use(strategy);

router.post('/register', async (req, res) => {
  const { name, password } = req.body;
  const user = await User.create({ name, password });
  res.json({ user, msg: 'account created successfully' });
});

router.post('/refresh', (req, res) => {
  // refresh the damn token
  const { refreshToken: oldRefreshToken } = req.body;
  let userId;
  if (oldRefreshToken && oldRefreshToken in tokenList) {
    jwt.verify(oldRefreshToken, tokenSecret, function(err, decoded) {
      if (err) {
        return res
          .status(401)
          .json({ error: true, message: 'Unauthorized access.' });
      }
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

module.exports = router;
