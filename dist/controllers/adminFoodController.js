"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFood = exports.updateFood = exports.getSingleFood = exports.getAllFood = exports.addFood = void 0;
const cloudinary_1 = require("../imageUploadConfig/cloudinary");
const ListOfFood_1 = require("../models/ListOfFood");
const addFood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("addFood");
    // console.log(req.body);
    // console.log(req.file);
    if (!req.file) {
        return res.status(400).json({ msg: "Please upload an image" });
    }
    const { foodname, quantity, foodtype, unit, fat, carbohydrate, calories, description, ingredients, protein, } = req.body;
    try {
        const data = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path, "food-Images");
        // console.log("data:", data);
        if (data && data.url && data.public_id) {
            //   console.log("data.url:", data.url);
            //   console.log("data.public_id:", data.public_id);
            //   console.log("ingredients:", ingredients.split(","));
            const newFood = new ListOfFood_1.Food({
                foodname,
                description,
                quantity,
                unit,
                nutrition: {
                    calories,
                    protein,
                    carbs: carbohydrate,
                    fat,
                },
                ingredients: ingredients
                    .split(",")
                    .map((ingredient) => ingredient.trim()),
                photoUrl: data.url,
                publicId: data.public_id,
                foodtype,
            });
            const savedFood = yield newFood.save();
            // console.log("savedFood:", savedFood);
            res.status(200).json({ message: "Food added successfully" });
        }
        else {
            res.status(401).json({ msg: "Image not updated" });
        }
    }
    catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res.status(500).json({ msg: "Error uploading image", error });
    }
});
exports.addFood = addFood;
const getAllFood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 3;
        const search = req.query.search || "";
        const filter = req.query.filter || "";
        const query = Object.assign(Object.assign({}, (search
            ? {
                $or: [
                    { foodname: new RegExp(search, "i") },
                    { ingredients: new RegExp(search, "i") },
                ],
            }
            : {})), (filter ? { foodtype: filter } : {}));
        const totalFoodCount = yield ListOfFood_1.Food.countDocuments(query);
        const allFood = yield ListOfFood_1.Food.find(query)
            .skip(page * limit)
            .limit(limit);
        res.status(200).json({
            allFood: allFood,
            page: page + 1,
            limit,
            totalFoodCount,
        });
    }
    catch (error) {
        console.error("Error getting all food:", error);
        res.status(500).json({ msg: "Error getting all food", error });
    }
});
exports.getAllFood = getAllFood;
const getSingleFood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const food = yield ListOfFood_1.Food.findById(req.params.id);
        res.status(200).json(food);
    }
    catch (error) {
        console.error("Error getting single food:", error);
        res.status(500).json({ msg: "Error getting single food", error });
    }
});
exports.getSingleFood = getSingleFood;
const updateFood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { foodname, quantity, foodtype, unit, fat, carbohydrate, calories, description, ingredients, protein, } = req.body;
    try {
        const foodData = yield ListOfFood_1.Food.findById(req.params.id);
        if (!foodData) {
            return res.status(404).json({ msg: "Food not found" });
        }
        let data;
        if (((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) && (foodData === null || foodData === void 0 ? void 0 : foodData.publicId)) {
            yield (0, cloudinary_1.removeFromCloudinary)(foodData.publicId);
            yield foodData.updateOne({ _id: req.params.id }, { $unset: { photoUrl: "", publicId: "" } });
            data = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path, "food-Images");
        }
        const updatedFood = Object.assign({ foodname,
            description,
            quantity,
            unit, nutrition: {
                calories,
                protein,
                carbs: carbohydrate,
                fat,
            }, ingredients: ingredients
                .split(",")
                .map((ingredient) => ingredient.trim()), foodtype }, (data && { photoUrl: data.url, publicId: data.public_id }));
        const savedFood = yield ListOfFood_1.Food.findByIdAndUpdate(req.params.id, updatedFood, {
            new: true,
        });
        res.status(200).json({ message: "Food updated successfully", savedFood });
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ msg: "Error updating food", error });
    }
});
exports.updateFood = updateFood;
const deleteFood = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foodData = yield ListOfFood_1.Food.findById(req.params.id);
        if (foodData === null || foodData === void 0 ? void 0 : foodData.publicId) {
            const publicId = foodData.publicId;
            yield (0, cloudinary_1.removeFromCloudinary)(publicId);
            yield foodData.deleteOne();
        }
        else {
            console.log("no public id found");
        }
        res.status(200).json({ message: "Food deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting food:", error);
        res.status(500).json({ msg: "Error deleting food", error });
    }
});
exports.deleteFood = deleteFood;
