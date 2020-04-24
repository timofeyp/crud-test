const auth = require('routes/auth');
const task = require('routes/task');

module.exports = app => {
  app.use('/api/auth', auth);
  app.use('/api/task', task);
};
