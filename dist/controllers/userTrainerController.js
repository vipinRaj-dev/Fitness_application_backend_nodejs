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
exports.getSingleTrainer = exports.getAllTrainers = void 0;
const TrainerModel_1 = require("../models/TrainerModel");
const UserModel_1 = require("../models/UserModel");
const getAllTrainers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("get all trainers");
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 3;
        const search = req.query.search || "";
        const filter = req.query.filter || "";
        const query = search
            ? {
                $or: [
                    { name: new RegExp(search, "i") },
                    { specializedIn: new RegExp(search, "i") },
                ],
            }
            : filter
                ? {
                    avgRating: filter,
                }
                : {};
        const totalTrainers = yield TrainerModel_1.Trainer.countDocuments(query);
        const { userId } = req.headers["user"];
        const user = yield UserModel_1.User.findById(userId);
        const TrainerId = user === null || user === void 0 ? void 0 : user.trainerId;
        const allTrainers = yield TrainerModel_1.Trainer.find(Object.assign({ _id: { $ne: TrainerId } }, query))
            .skip(page * limit)
            .limit(limit)
            // .sort({ avgRating: -1 })
            .select("_id name email isBlocked profilePicture experience specializedIn price description avgRating");
        if (!allTrainers) {
            return res.status(400).json({
                msg: "no trainers found",
            });
        }
        res.status(200).json({
            msg: "all trainers",
            trainers: allTrainers,
            page: page + 1,
            limit,
            totalTrainers,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.getAllTrainers = getAllTrainers;
const getSingleTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const trainer = yield TrainerModel_1.Trainer.findById(id).select("_id name email isBlocked profilePicture experience specializedIn price description transformationClients certifications avgRating");
        if (!trainer) {
            return res.status(400).json({
                msg: "no trainer found",
            });
        }
        res.status(200).json({ msg: "trainer", trainer: trainer });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.getSingleTrainer = getSingleTrainer;
