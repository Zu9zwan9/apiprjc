const {mongoose, Schema} = require("mongoose");

const CountrySchema = new Schema({
    name: String,
    code: String
});

const LocationSchema = new Schema({
    name: String,
    countryCode: String
});

const Country = mongoose.model('Country', CountrySchema);
const Location = mongoose.model('Location', LocationSchema);

module.exports = { Country, Location };
