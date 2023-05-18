const mongoose = require('mongoose')

//Gallery schema
const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  id:{
    type: String
  },
  images: [{
    url:{
      type: String
   },
    public_id: {
      type: String
    
    }

  }]
});

const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;