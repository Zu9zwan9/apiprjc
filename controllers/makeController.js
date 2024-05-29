const asyncHandler = require("express-async-handler");
const { Brand, Model } = require("../models/make");

// Функція для додавання виробника і його моделей
exports.addBrandWithModels = asyncHandler(async (req, res) => {
    const { brandName, models } = req.body;

    try {
        const newBrand = new Brand({ name: brandName });
        const savedBrand = await newBrand.save();

        const modelDocuments = models.map(modelName => ({
            name: modelName,
            brand: savedBrand._id
        }));

            await Model.insertMany(modelDocuments);

        res.status(201).json({
            message: "Brand and models added successfully",
            brand: savedBrand,
            models: modelDocuments
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to add brand and models", error: error });
    }
});


exports.car_brand_list = asyncHandler(async (req, res, next) => {

    const carBrandList = await Brand.find();
    const carModelList = await Model.find();

    const resultList = carBrandList.map(brand => {
        return {
            "_id": brand._id,
            "name": brand.name,
            "modelList": carModelList
                .filter(model => model.brandId.toString() === brand._id.toString())
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
