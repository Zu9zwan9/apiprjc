const asyncHandler = require("express-async-handler");
const { Country, Location } = require("../models/location");

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
