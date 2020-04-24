const Sequelize = require('sequelize');
const initUserSchema = require('db/user');
const { db: configDb } = require('config');
const { username, password, database, dialect } = configDb;

const db = {};

const sequelize = new Sequelize({
  username,
  password,
  dialect,
  database,
});

const createDbIfNotExist = async () => {
  const sequelize = new Sequelize({
    username,
    password,
    dialect,
  });
  await sequelize.query(`CREATE DATABASE IF NOT EXISTS crud;`);
};

const initConnection = async () => {
  await createDbIfNotExist();
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    return sequelize;
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

const initSchemas = async sequelize => {
  db.User = await initUserSchema(sequelize);
};

const initDb = async () => {
  try {
    const sequelize = await initConnection();
    return initSchemas(sequelize);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  initDb,
  ...db,
};
