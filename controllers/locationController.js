const asyncHandler = require("express-async-handler");
const {Country, Location} = require("../models/location");


exports.addCountry = asyncHandler(async (req, res) => {
    const {name, code} = req.body;  // ensure that you are receiving 'code' as it's used to link locations
    try {
        const newCountry = new Country({name, code});
        const savedCountry = await newCountry.save();
        res.status(201).json(savedCountry);
    } catch (error) {
        res.status(400).json({message: "Error adding country", error: error.toString()});
    }
});

exports.addLocation = asyncHandler(async (req, res) => {
    const {name, countryCode} = req.body;
    try {
        const newLocation = new Location({name, countryCode});
        const savedLocation = await newLocation.save();
        res.status(201).json(savedLocation);
    } catch (error) {
        res.status(400).json({message: "Error adding location", error: error.toString()});
    }
});

exports.country_list = asyncHandler(async (req, res, next) => {

    const countryList = await Country.find();
    const locationList = await Location.find();

    const resultList = countryList.map(country => {
        return {
            "_id": country._id,
            "code": country.code,
            "name": country.name,
            "locationList": locationList
                .filter(location => location.countryCode === country.code)
                .map(location => {
                    return {
                        "_id": location._id,
                        "name": location.name,
                    }
                })
        }
    })

    res.json(resultList);
});
