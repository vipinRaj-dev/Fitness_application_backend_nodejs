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
exports.getClients = exports.getPayments = exports.getReviews = exports.deleteCertificateOrClient = exports.addCertificateAndClient = exports.trainerProfileImageUpdate = exports.trainerProfile = void 0;
const mongoose = require("mongoose");
const TrainerModel_1 = require("../models/TrainerModel");
const cloudinary_1 = require("../imageUploadConfig/cloudinary");
const TrainerPaymentModel_1 = require("../models/TrainerPaymentModel");
const ChatModel_1 = require("../models/ChatModel");
const trainerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        // console.log(requstedUser);
        const trainerData = yield TrainerModel_1.Trainer.findById(requstedUser.userId).select("_id name email mobileNumber isBlocked profilePicture publicId experience specializedIn price description certifications avgRating transformationClients");
        const response = {
            msg: "trainer details",
            trainer: trainerData,
            transformationClientsCount: trainerData.transformationClients.length,
            certificationsCount: trainerData.certifications.length,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.trainerProfile = trainerProfile;
const trainerProfileImageUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        const { name, mobileNumber, experience, specializedIn, description, price, } = req.body;
        const isTrainerExists = yield TrainerModel_1.Trainer.findById(id);
        if (!isTrainerExists) {
            return res.status(400).json({
                msg: "no trainer found",
            });
        }
        yield TrainerModel_1.Trainer.updateOne({ _id: id }, {
            $set: {
                name,
                mobileNumber,
                experience,
                specializedIn,
                description,
                price,
            },
        });
        let data;
        if (req.file) {
            const trainer = yield TrainerModel_1.Trainer.findById(id);
            if (trainer === null || trainer === void 0 ? void 0 : trainer.publicId) {
                const publicId = trainer.publicId;
                yield (0, cloudinary_1.removeFromCloudinary)(publicId);
                yield TrainerModel_1.Trainer.updateOne({ _id: id }, { $unset: { profilePicture: "", publicId: "" } });
            }
            else {
                console.log("no public id found");
            }
            // console.log(req.file);
            try {
                data = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path, "trainer-Images");
            }
            catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).json({ msg: "Error uploading image", error });
            }
            if (!data || !data.url || !data.public_id) {
                console.error("Invalid response from Cloudinary:", data);
                return res
                    .status(500)
                    .json({ msg: "Invalid response from image upload" });
            }
            const profileUpdate = yield TrainerModel_1.Trainer.updateOne({ _id: id }, { $set: { profilePicture: data.url, publicId: data.public_id } });
            // console.log("profileUpdate", profileUpdate);
        }
        res.status(200).json({ msg: "profile updated", data });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.trainerProfileImageUpdate = trainerProfileImageUpdate;
const addCertificateAndClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        // console.log(req.body.name, req.body.content, req.body);
        const { name, content, field } = req.body;
        const isTrainerExists = yield TrainerModel_1.Trainer.findById(id);
        if (!isTrainerExists) {
            return res.status(400).json({
                msg: "no trainer found",
            });
        }
        let data;
        // console.log(req.file);
        if (req.file) {
            try {
                data = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path, "trainer-Images");
            }
            catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).json({ msg: "Error uploading image", error });
            }
            if (!data || !data.url || !data.public_id) {
                console.error("Invalid response from Cloudinary:", data);
                return res
                    .status(500)
                    .json({ msg: "Invalid response from image upload" });
            }
            let updatedData;
            if (field === "certificate") {
                updatedData = yield TrainerModel_1.Trainer.updateOne({ _id: id }, {
                    $push: {
                        certifications: {
                            name,
                            content,
                            photoUrl: data.url,
                            publicId: data.public_id,
                        },
                    },
                });
            }
            else if (field === "client") {
                updatedData = yield TrainerModel_1.Trainer.updateOne({ _id: id }, {
                    $push: {
                        transformationClients: {
                            name,
                            content,
                            photoUrl: data.url,
                            publicId: data.public_id,
                        },
                    },
                });
            }
            else {
                console.log("no field found");
            }
            // console.log("updatedData", updatedData);
            res.status(200).json({ msg: "certificate addded" });
        }
        else {
            return res.status(400).json({ msg: "no file found" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.addCertificateAndClient = addCertificateAndClient;
const deleteCertificateOrClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        // console.log(req.body);
        const { deleteId, field, publicId } = req.body;
        const trainerData = yield TrainerModel_1.Trainer.findById(id);
        if (!trainerData) {
            return res.status(400).json({
                msg: "no trainer found",
            });
        }
        if (publicId) {
            yield (0, cloudinary_1.removeFromCloudinary)(publicId);
            if (field === "certificate") {
                yield TrainerModel_1.Trainer.updateOne({ _id: id }, { $pull: { certifications: { _id: deleteId } } });
                res.status(200).json({ msg: "certificate deleted" });
            }
            else if (field === "client") {
                yield TrainerModel_1.Trainer.updateOne({ _id: id }, { $pull: { transformationClients: { _id: deleteId } } });
                res.status(200).json({ msg: "client deleted" });
            }
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.deleteCertificateOrClient = deleteCertificateOrClient;
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 3;
        const rating = parseInt(req.query.rating) || 0;
        const trainerId = req.query.trainerId || id;
        const populateOptions = {
            path: "reviews",
            populate: {
                path: "userId",
                select: "name profileImage",
            },
            match: rating ? { rating } : {},
            options: { sort: { createdAt: -1 } },
        };
        const trainerData = yield TrainerModel_1.Trainer.findById(trainerId)
            .populate(populateOptions)
            .select("reviews");
        const responseData = trainerData.reviews.slice(page * limit, page * limit + limit);
        if (!trainerData) {
            return res.status(400).json({
                msg: "no trainer found",
            });
        }
        res.status(200).json({
            reviews: responseData,
            page: page + 1,
            limit,
            totalReviews: trainerData.reviews.length,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.getReviews = getReviews;
const getPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        const trainerData = yield TrainerModel_1.Trainer.findById(id).populate({
            path: "payments",
            populate: {
                path: "clientDetails",
                select: "name profileImage",
            },
            select: "amount transactionId clientDetails",
        });
        // console.log(id);
        const monthlyPayments = yield TrainerPaymentModel_1.TrainerPayment.aggregate([
            {
                $match: {
                    trainersId: new mongoose.Types.ObjectId(id),
                },
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    createdAt: 1,
                    amount: 1,
                    trainersId: 1,
                },
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalAmount: { $sum: "$amount" },
                    latestDate: { $max: "$createdAt" },
                },
            },
            {
                $sort: { latestDate: 1 },
            },
        ]);
        const userCountPerMonth = yield TrainerPaymentModel_1.TrainerPayment.aggregate([
            {
                $match: {
                    trainersId: new mongoose.Types.ObjectId(id),
                },
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    createdAt: 1,
                    amount: 1,
                    trainersId: 1,
                    clientDetails: 1,
                },
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    clientCount: { $sum: 1 },
                    latestDate: { $max: "$createdAt" },
                },
            },
            {
                $sort: { latestDate: 1 },
            },
        ]);
        // console.log(userCountPerMonth);
        res.status(200).json({
            payments: trainerData.payments,
            monthlyPayments,
            userCountPerMonth,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.getPayments = getPayments;
const getClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        const trainerClients = yield TrainerModel_1.Trainer.findById(id)
            .populate("clients", "_id name profileImage isOnline")
            .select("clients");
        // console.log("trainer", trainerClients);
        const pendingMessageCountPerUser = yield ChatModel_1.Chat.aggregate([
            {
                $match: {
                    trainerId: new mongoose.Types.ObjectId(id),
                },
            },
            { $unwind: "$message" },
            {
                $match: {
                    "message.isSeen": false,
                    "message.receiverId": new mongoose.Types.ObjectId(id)
                }
            },
            {
                $group: {
                    _id: "$userId",
                    count: { $sum: 1 },
                },
            },
        ]);
        // console.log("pendingMessageCountPerUser", pendingMessageCountPerUser);
        res.status(200).json({
            msg: "trainer clients",
            clients: trainerClients === null || trainerClients === void 0 ? void 0 : trainerClients.clients,
            trainerId: id,
            pendingMessageCountPerUser,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "server error", error });
    }
});
exports.getClients = getClients;
