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
exports.getGraphDataAdmin = exports.getAdminPayments = exports.trainerProfileEdit = exports.getTrainer = exports.blockTrainer = exports.getAllTrainers = exports.createTrainer = exports.blockUser = exports.userProfileEdit = exports.getUser = exports.createUser = exports.getAllUsers = exports.adminProfileEdit = exports.dashboard = void 0;
const AdminModel_1 = require("../models/AdminModel");
const UserModel_1 = require("../models/UserModel");
const TrainerModel_1 = require("../models/TrainerModel");
const password_1 = require("../utils/password");
const PaymentsModel_1 = require("../models/PaymentsModel");
const ListOfFood_1 = require("../models/ListOfFood");
// USER CONTROLLERS
const dashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminData = yield AdminModel_1.Admin.findOne({}).select("role email fullName _id");
        // console.log(adminData);
        const userCount = yield UserModel_1.User.countDocuments();
        const trainerCount = yield TrainerModel_1.Trainer.countDocuments();
        if (!adminData) {
            return res.status(404).json({
                msg: "no user data",
            });
        }
        res.status(200).json({
            msg: "Admin dashboard",
            adminDetails: adminData,
            userCount,
            trainerCount,
        });
    }
    catch (error) {
        console.error(error);
    }
});
exports.dashboard = dashboard;
const adminProfileEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const updateData = req.body;
        // console.log(updateData  , id);
        // await db.collection('resources').updateOne({ _id: id }, { $set: updateData });
        res.json({ message: "Resource updated", data: updateData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.adminProfileEdit = adminProfileEdit;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 3;
    const search = req.query.search || "";
    // let sort = (req.query.sort as string) || "weight";
    // console.log(page, limit, search);
    const query = search
        ? {
            $or: [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") },
            ],
        }
        : {};
    try {
        const totalUsers = yield UserModel_1.User.countDocuments(query);
        // console.log(totalUsers);
        const users = yield UserModel_1.User.find(query)
            // .sort({ sort: -1 })
            .skip(page * limit)
            .limit(limit);
        res.status(200).json({
            users,
            page: page + 1,
            limit,
            totalUsers,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getAllUsers = getAllUsers;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const isUserExist = yield UserModel_1.User.findOne({ email: userData.email });
        if (isUserExist) {
            return res.status(400).json({ message: "User already exist" });
        }
        const hashedPassword = yield (0, password_1.hashPassword)(userData.password);
        const user = new UserModel_1.User(Object.assign(Object.assign({}, userData), { password: hashedPassword }));
        yield user.save();
        res.status(201).json({ message: "User created", user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.createUser = createUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const user = yield UserModel_1.User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getUser = getUser;
const userProfileEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const updateData = req.body;
        // console.log(updateData);
        let isUserExist = yield TrainerModel_1.Trainer.findOne({ email: updateData.email });
        if (!isUserExist) {
            isUserExist = yield UserModel_1.User.findOne({ email: updateData.email });
        }
        if (isUserExist) {
            return res.status(404).json({ message: "Email already exists" });
        }
        const isUserUpdated = yield UserModel_1.User.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!isUserUpdated) {
            return res.status(404).json({ message: "User not found" });
        }
        else {
            res.status(200).json({ message: "User updated", user: isUserUpdated });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.userProfileEdit = userProfileEdit;
// export const deleteUser = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     const id = req.params.id;
//     const isUserExist = await User.findById(id);
//     res.json({ message: "Resource deleted" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const userDetails = yield UserModel_1.User.findById(id);
        if (!userDetails) {
            return res.status(404).json({ message: "User not found" });
        }
        else {
            // console.log(userDetails);
            userDetails.userBlocked = !userDetails.userBlocked;
            yield userDetails.save();
            res.status(200).json({ message: "User blocked", user: userDetails });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.blockUser = blockUser;
// TRAINER CONTROLLERS
const createTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const trainerData = req.body;
        // console.log(trainerData);
        const isTrainerExist = yield UserModel_1.User.findOne({ email: trainerData.email });
        if (isTrainerExist) {
            return res.status(400).json({ message: "User already exist" });
        }
        const hashedPassword = yield (0, password_1.hashPassword)(trainerData.password);
        const user = new TrainerModel_1.Trainer(Object.assign(Object.assign({}, trainerData), { password: hashedPassword }));
        yield user.save();
        res.status(201).json({ message: "Trainer created", user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.createTrainer = createTrainer;
const getAllTrainers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 3;
    const search = req.query.search || "";
    // let sort = (req.query.sort as string) || "weight";
    // console.log(page, limit, search);
    const query = search
        ? {
            $or: [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") },
            ],
        }
        : {};
    try {
        const totalTrainers = yield TrainerModel_1.Trainer.countDocuments(query);
        // console.log(totalTrainers);
        const trainer = yield TrainerModel_1.Trainer.find(query)
            // .sort({ sort: -1 })
            .skip(page * limit)
            .limit(limit);
        res.status(200).json({
            trainer,
            page: page + 1,
            limit,
            totalTrainers,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getAllTrainers = getAllTrainers;
const blockTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const trainerDetails = yield TrainerModel_1.Trainer.findById(id);
        if (!trainerDetails) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        else {
            // console.log(trainerDetails);
            trainerDetails.isBlocked = !trainerDetails.isBlocked;
            yield trainerDetails.save();
            res
                .status(200)
                .json({ message: "User blocked", trainer: trainerDetails });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.blockTrainer = blockTrainer;
const getTrainer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const trainer = yield TrainerModel_1.Trainer.findById(id);
        if (!trainer) {
            return res.status(404).json({ message: "trainer not found" });
        }
        res.status(200).json({ trainer });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getTrainer = getTrainer;
const trainerProfileEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const updateData = req.body;
        let isUserExist;
        isUserExist = yield UserModel_1.User.findOne({ email: updateData.email });
        if (isUserExist) {
            return res.status(404).json({ message: "Email already exists" });
        }
        const isTrainerUpdated = yield TrainerModel_1.Trainer.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        if (!isTrainerUpdated) {
            return res.status(404).json({ message: "Trainer not found" });
        }
        else {
            res
                .status(200)
                .json({ message: "Trainer updated", user: isTrainerUpdated });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.trainerProfileEdit = trainerProfileEdit;
// payment controllers
const getAdminPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield PaymentsModel_1.AdminPayment.find().populate({
            path: "clientDetails",
            select: "name email isPremium dueDate profileImage",
        });
        // console.log("payments", payments);
        res.status(200).json({ payments });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getAdminPayments = getAdminPayments;
//Graph controllers
const getGraphDataAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("graph data");
        let totalRevenue, premiumUsers, trialUsers, trialExpired, totalTrainers;
        totalRevenue = yield PaymentsModel_1.AdminPayment.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                },
            },
        ]);
        premiumUsers = yield UserModel_1.User.countDocuments({ isPremiumUser: true });
        trialUsers = yield UserModel_1.User.countDocuments({
            trialEndsAt: { $gte: new Date() },
            isPremiumUser: false,
        });
        trialExpired = yield UserModel_1.User.countDocuments({
            trialEndsAt: { $lt: new Date() },
            isPremiumUser: false,
        });
        totalTrainers = yield TrainerModel_1.Trainer.countDocuments();
        const userCountPerMonth = yield UserModel_1.User.aggregate([
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        const monthlyPayments = yield PaymentsModel_1.AdminPayment.aggregate([
            {
                $project: {
                    month: { $month: "$createdAt" },
                    createdAt: 1,
                    amount: 1,
                },
            },
            {
                $group: {
                    _id: "$month",
                    totalAmount: { $sum: "$amount" },
                    latestDate: { $max: "$createdAt" },
                },
            },
            {
                $sort: { latestDate: 1 },
            },
        ]);
        const foodCountWithFoodtype = yield ListOfFood_1.Food.aggregate([
            {
                $group: {
                    _id: "$foodtype",
                    count: { $sum: 1 },
                },
            },
        ]);
        const trainerWiseClientCount = yield TrainerModel_1.Trainer.aggregate([
            {
                $project: {
                    name: 1,
                    clientCount: { $size: "$clients" },
                    _id: 0,
                },
            },
        ]);
        res.status(200).json({
            totalRevenue: totalRevenue[0].totalRevenue,
            premiumUsers,
            trialUsers,
            trialExpired,
            totalTrainers,
            userCountPerMonth,
            monthlyPayments,
            foodCountWithFoodtype,
            trainerWiseClientCount,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.getGraphDataAdmin = getGraphDataAdmin;
