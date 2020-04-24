const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get(
  '/get',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    res.send('YEP');
  },
);

module.exports = router;
