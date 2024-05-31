const {mongoose, Schema} = require("mongoose");

const CarBrandSchema = new Schema({
    code: String,
    name: String
});

const CarModelSchema = new Schema({
    name: String,
    brandCode: String
});

const Brand = mongoose.model('CarBrand', CarBrandSchema);
const Model = mongoose.model('CarModel', CarModelSchema);

module.exports = {Brand, Model};
