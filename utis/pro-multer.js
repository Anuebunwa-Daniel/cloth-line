const multer = require('multer')
const path = require('path');

module.exports = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/public/product_images/<%= newproduct._id %>/gallery')
    },
    fileFilter: (req, file, cb) => {
      let ext = path.extname(file.originalname);
      if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
        cb(new Error("Unsupported file type!"), false);
        return;
      }
      cb(null, true);
    },
  })
});






  // storage: multer.diskStorage({}),
  // fileFilter: (req, file, cb) => {
  //   let ext = path.extname(file.originalname);
  //   if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
  //     cb(new Error("Unsupported file type!"), false);
  //     return;
  //   }
  //   cb(null, true);
  // },