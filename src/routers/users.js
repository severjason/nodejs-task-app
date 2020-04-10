const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const multer = require('multer');

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  if (!isValidOperation) {
    return res.status(400).send({error: 'Invalid updates!'})
  }
  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.send(req.user);
  } catch(e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({user, token});
  } catch(e) {
    res.status(400).send(e);
  }
});

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/users/me', auth, async (req, res ) => {
  res.send(req.user);
});

const upload = multer({
  dest: 'avatars',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/gm)) {
      return cb(new Error('Only images allowed (jpg, jpeg, png)!'))
    }
    cb(null, true);
  }
});

router.post('/users/me/avatar', [auth, upload.single('avatar')], async (req, res) => {
  try {
    res.send();
  } catch(e) {
    res.status(500).send(e);
  }
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
});


router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.send();
  } catch(e) {
    res.status(500).send(e);
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch(e) {
    res.status(500).send(e);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch(e) {
    res.status(500).send(e);
  }
});

module.exports = router;
