const auth = require('routes/auth');
const task = require('routes/task');
const { checkToken } = require('routes/middlewares');

module.exports = app => {
  app.use('/api/auth', auth);
  app.use('/api/task', checkToken, task);
};
