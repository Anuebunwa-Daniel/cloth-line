const multer = require('multer');
const product = require('../models/product')
const Category = require('../models/category')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/product_images/' + slug); // Specify the directory where the file should be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Specify the filename of the file to be saved
  }
});

const uploadfile = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Only allow images to be uploaded
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

module.exports = uploadfile;