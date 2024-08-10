const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
  title: {
    type: String,
    requires: true,
  }, 
  description: {
    type: String,
    requires: true,
  }, 
  tag: {
    type: String,
    default: "General",
  },
  date: {
    type: Daye,
    requires: true,
  },
});

module.exports = mongoose.model('notes', NotesSchema);