const Sequelize = require('sequelize');

const initSchema = async sequelize => {
  const User = sequelize.define('user', {
    name: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  });
  try {
    await User.sync();
    console.log('Oh yeah! User table created successfully');
    return User;
  } catch (err) {
    console.error('BTW, did you enter wrong database credentials?', err);
  }
};

module.exports = initSchema;
