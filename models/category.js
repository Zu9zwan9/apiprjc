const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: String,
    description: String,
    //parentId: String,
    thumbnail: String
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
