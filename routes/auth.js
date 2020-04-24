const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const tokenList = {};
const passportJWT = require('passport-jwt');
const { User } = require('models');
const {
  jwt: { accessExpiresIn, refreshExpiresIn, tokenSecret },
} = require('config');
const router = express.Router();

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'wowwow';
jwtOptions.jsonWebTokenOptions = {
  expiresIn: '2 days',
};
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
  const postData = req.body;
  // if refresh token exists
  if (postData.refreshToken && postData.refreshToken in tokenList) {
    const user = {
      email: postData.email,
      name: postData.name,
    };
    jwt.verify(postData.refreshToken, tokenSecret, function(err, decoded) {
      if (err) {
        return res
          .status(401)
          .json({ error: true, message: 'Unauthorized access.' });
      }
      req.decoded = decoded;
    });
    const token = jwt.sign(user, config.secret, {
      expiresIn: config.tokenLife,
    });
    const response = {
      token: token,
    };
    // update the token in the list
    tokenList[postData.refreshToken] = token;
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
      const token = jwt.sign(payload, tokenSecret, {
        expiresIn: accessExpiresIn,
      });
      const refreshToken = jwt.sign(payload, tokenSecret, {
        expiresIn: refreshExpiresIn,
      });
      const response = {
        status: 'Logged in',
        token: token,
        refreshToken: refreshToken,
      };
      tokenList[refreshToken] = token;
      res.status(200).json(response);
      return res.json({ msg: 'ok', token: token });
    } else {
      return res.status(401).json({ msg: 'Password is incorrect' });
    }
  }
});

module.exports = router;
