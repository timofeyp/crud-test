const getTimeStamp = () => Math.round(new Date().getTime() / 1000);

module.exports = (expire, res) => {
  const timeStamp = getTimeStamp();
  if (timeStamp > expire) {
    return res.sendStatus(401).json({ error: true, message: 'Token expired' });
  }
};
