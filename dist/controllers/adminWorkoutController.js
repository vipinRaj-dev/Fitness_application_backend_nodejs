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
exports.updateWorkout = exports.getSingleWorkout = exports.deleteWorkout = exports.getAllWorkout = exports.addWorkout = void 0;
const cloudinary_1 = require("../imageUploadConfig/cloudinary");
const ListOfWorkout_1 = require("../models/ListOfWorkout");
const addWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("req.file:", req.file);
        if (req.file && req.file.path) {
            // await removeFromCloudinary("workout-Videos/lknzdrwawdsncuea41tf")
            const video = (yield (0, cloudinary_1.uploadVideoToCloudinary)(req.file.path, "workout-Videos")) || { url: "", public_id: "" };
            const thumbnailUrl = video.url.replace("mp4", "jpg");
            // console.log("video:", video);
            const newWorkout = new ListOfWorkout_1.Workout({
                workoutName: req.body.workoutName,
                targetMuscle: req.body.targetMuscle,
                description: req.body.description,
                videoUrl: video.url,
                publicId: video.public_id,
                thumbnailUrl: thumbnailUrl,
            });
            const ans = yield newWorkout.save();
            res.status(200).json({ message: "Workout added successfully", ans });
        }
        else {
            res.status(400).json({ message: "Please upload a video" });
        }
    }
    catch (error) {
        console.error("Error uploading to Cloudinary:", error);
    }
});
exports.addWorkout = addWorkout;
const getAllWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 3;
        const search = req.query.search || "";
        const filter = req.query.filter || "";
        const query = Object.assign({}, (search
            ? {
                $or: [
                    { workoutName: new RegExp(search, "i") },
                    { targetMuscle: new RegExp(search, "i") },
                ],
            }
            : {}));
        const totalWorkoutCount = yield ListOfWorkout_1.Workout.countDocuments(query);
        const allWorkout = yield ListOfWorkout_1.Workout.find(query)
            .skip(page * limit)
            .limit(limit);
        res.status(200).json({
            allWorkout: allWorkout,
            page: page + 1,
            limit,
            totalWorkoutCount,
        });
    }
    catch (error) {
        console.error("Error getting all workout:", error);
        res.status(500).json({ msg: "Error getting all workout", error });
    }
});
exports.getAllWorkout = getAllWorkout;
const deleteWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workoutData = yield ListOfWorkout_1.Workout.findById(req.params.workoutId);
        if (workoutData === null || workoutData === void 0 ? void 0 : workoutData.publicId) {
            const publicId = workoutData.publicId;
            // console.log("publicId:", publicId);
            yield (0, cloudinary_1.removeVideoFromCloudinary)(publicId);
            yield workoutData.deleteOne();
        }
        else {
            console.log("no public id found");
        }
        res.status(200).json({ message: "Workout deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting workout:", error);
        res.status(500).json({ msg: "Error deleting workout", error });
    }
});
exports.deleteWorkout = deleteWorkout;
const getSingleWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workout = yield ListOfWorkout_1.Workout.findById(req.params.workoutId);
        // console.log("workout:", workout);
        res.status(200).json({ workoutData: workout });
    }
    catch (error) {
        console.error("Error getting single workout:", error);
        res.status(500).json({ msg: "Error getting single workout", error });
    }
});
exports.getSingleWorkout = getSingleWorkout;
const updateWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const workoutData = yield ListOfWorkout_1.Workout.findById(req.params.workoutId);
        if (!workoutData) {
            return res.status(404).json({ msg: "Workout not found" });
        }
        let data;
        if (((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) && (workoutData === null || workoutData === void 0 ? void 0 : workoutData.publicId)) {
            yield (0, cloudinary_1.removeVideoFromCloudinary)(workoutData.publicId);
            yield workoutData.updateOne({ _id: req.params.workoutId }, { $unset: { videoUrl: "", publicId: "", thumbnailUrl: "" } });
            data = yield (0, cloudinary_1.uploadVideoToCloudinary)(req.file.path, "workout-Videos");
        }
        // console.log("data:", data);
        const updatedWorkout = Object.assign({ workoutName: req.body.workoutName, targetMuscle: req.body.targetMuscle, description: req.body.description }, (data && {
            videoUrl: data.url,
            publicId: data.public_id,
            thumbnailUrl: data.url.replace("mp4", "jpg"),
        }));
        const savedWorkout = yield ListOfWorkout_1.Workout.findByIdAndUpdate(req.params.workoutId, updatedWorkout, {
            new: true,
        });
        res
            .status(200)
            .json({ message: "Workout updated successfully", savedWorkout });
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ msg: "Error updating workout", error });
    }
});
exports.updateWorkout = updateWorkout;
