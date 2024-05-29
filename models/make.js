const {mongoose, Schema} = require("mongoose");

const CarBrandSchema = new Schema({
    name: String
});

const CarModelSchema = new Schema({
    name: String,
    brandId: {
        type: Schema.Types.ObjectId,
        ref: "CarBrand"
    }
});

const Brand = mongoose.model('CarBrand', CarBrandSchema);
const Model = mongoose.model('CarModel', CarModelSchema);

module.exports = { Brand, Model };
