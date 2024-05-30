const asyncHandler = require("express-async-handler");
const { Brand, Model } = require("../models/make");

exports.car_brand_list = asyncHandler(async (req, res, next) => {

    const carBrandList = await Brand.find();
    const carModelList = await Model.find();

    const resultList = carBrandList.map(brand => {
        return {
            "_id": brand._id,
            "code": brand.code,
            "name": brand.name,
            "modelList": carModelList
                .filter(model => model.brandCode === brand.code)
                .map(model => {
                    return {
                        "_id": model._id,
                        "name": model.name,
                    }
                })
        }
    })

    res.json(resultList);
});
