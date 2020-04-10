const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch(e) {
    res.status(400).send(e);
  }
});

router.get('/tasks', auth, async (req, res ) => {
  try {
    const {completed, limit, skip, sortBy} = req.query;
    const match = {};
    const sort = {};

    if (completed) {
      match.completed = completed === 'true';
    }

    if (sortBy) {
      const parts = sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;

    }
    const tasks = await Task.find({owner: req.user._id, ...match})
      .limit(parseInt(limit) || 10)
      .skip(parseInt(skip))
      .sort(sort);

    res.send(tasks);
  } catch(e) {
    res.status(500).send(e);
  }
});

router.get('/tasks/:id', auth, async (req, res ) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({_id, owner: req.user._id});
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch(e) {
    res.status(500).send(e);
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['completed', 'description'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }
  try {
    const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach(update => task[update] = req.body[update]);
    await task.save();
    res.send(task);
  } catch(e) {
    res.status(400).send(e);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
    if (!deletedTask) {
      return res.status(404).send();
    }
    res.send(deletedTask);
  } catch(e) {
    res.status(500).send(e);
  }
});

module.exports = router;
