const mongoose = require('mongoose');

const CarModelSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id: Number,
    name: String
});

const CarBrandSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    id: Number,
    name: String,
    modelList: [CarModelSchema]
});

const CarBrand = mongoose.model('CarBrand', CarBrandSchema);
module.exports = CarBrand;
