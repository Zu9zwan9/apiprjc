const mongoose = require('mongoose');

const CarBrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    modelList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model'
    }]
});

const ModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarBrand'
    }
});

const CarBrand = mongoose.model('CarBrand', CarBrandSchema);
const Model = mongoose.model('Model', ModelSchema);

module.exports = { CarBrand, Model };