const express = require('express');
require('./db/mongoose');
const usersRouter = require('./routers/users');
const tasksRouter = require('./routers/tasks');

const app = express();

const PORT = process.env.PORT || 3000;

const multer = require('multer');
const upload = multer({
  dest: 'images',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(doc|docx)$/gm)) {
      return cb(new Error('Please upload a word document'))
    }
    cb(null, true);
  }
});

app.post('/upload', upload.single('upload'), (req, res ) => {
  res.send();
});


app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter);

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
