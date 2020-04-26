const express = require('express');
const router = express.Router();
const { Task, User } = require('models');

router.get('/', async (req, res) => {
  const tasks = await Task.findAll({
    include: [{ model: User, required: true }],
  });
  res.send(tasks);
});

router.post('/', async (req, res) => {
  const { title } = req.body;
  const { dataValues } = await Task.create(
    { title, UserId: req.decoded.id },
    {
      include: [User],
    },
  );
  const { dataValues: task } = await Task.findOne({
    where: { id: dataValues.id },
    include: [{ model: User, required: true }],
  });
  res.send(task);
});

router.put('/', async (req, res) => {
  const { id, title } = req.body;
  await Task.update({ title }, { where: { id } });
  res.sendStatus(200);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Task.destroy({
    where: {
      id,
    },
  });
  res.sendStatus(200);
});

module.exports = router;
