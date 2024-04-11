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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserName = exports.applyReason = exports.trainerOnlineStatus = exports.setRating = exports.getDay = exports.addFoodLog = exports.userProfileImageUpdate = exports.userProfile = exports.getGraphDataUser = exports.userHomePage = exports.setAttendance = void 0;
const UserModel_1 = require("../models/UserModel");
const AttendanceModel_1 = require("../models/AttendanceModel");
const cloudinary_1 = require("../imageUploadConfig/cloudinary");
const FoodLogModel_1 = require("../models/FoodLogModel");
const ReviewModel_1 = require("../models/ReviewModel");
const TrainerModel_1 = require("../models/TrainerModel");
const mongoose_1 = __importDefault(require("mongoose"));
const ChatModel_1 = require("../models/ChatModel");
const setAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requstedUser = req.headers["user"];
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    today.setHours(0, 0, 0, 0);
    const attandanceData = yield AttendanceModel_1.Attendance.findOne({
        userId: requstedUser.userId,
        date: today,
    });
    if (attandanceData) {
        console.log("attendance already marked for the user", requstedUser.userId);
        res.status(200).json("attendance data available");
    }
    else {
        const user = yield UserModel_1.User.findById(requstedUser.userId);
        const foodLogsIds = user === null || user === void 0 ? void 0 : user.latestDiet.map((food) => __awaiter(void 0, void 0, void 0, function* () {
            const foodLogData = new FoodLogModel_1.FoodLog({
                date: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })),
                userId: user === null || user === void 0 ? void 0 : user._id,
                foodId: food.foodId,
                status: false,
                timePeriod: food.timePeriod,
                time: food.time,
                quantity: food.quantity,
            });
            const foodLogId = yield foodLogData.save();
            return foodLogId._id;
        }));
        const attendanceCreating = new AttendanceModel_1.Attendance({
            date: today,
            userId: user === null || user === void 0 ? void 0 : user._id,
            isPresent: false,
            foodLogs: foodLogsIds,
        });
        const ans = yield attendanceCreating.save();
        const userUpdation = yield UserModel_1.User.updateOne({ _id: user === null || user === void 0 ? void 0 : user._id }, { $set: { attendanceId: ans._id } });
        console.log("attandance created to the user", user === null || user === void 0 ? void 0 : user._id);
        res.status(200).json("attendance data created");
    }
});
exports.setAttendance = setAttendance;
const userHomePage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const requstedUser = req.headers["user"];
    const userDetails = yield UserModel_1.User.findById(requstedUser.userId).populate({
        path: "attendanceId",
        populate: {
            path: "foodLogs",
            populate: {
                path: "foodId",
            },
        },
    });
    const hasTrainer = (userDetails === null || userDetails === void 0 ? void 0 : userDetails.trainerId)
        ? userDetails.trainerPaymentDueDate >
            new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
            ? true
            : false
        : false;
    const eatedFoodDocIds = (_a = userDetails.attendanceId) === null || _a === void 0 ? void 0 : _a.foodLogs.filter((food) => food.status === true).map((food) => food._id);
    // console.log("userDetails", userDetails.attendanceId.foodLogs);
    // console.log("eatedFood", eatedFoodDocIds);
    //getting the yesterday status
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime());
    yesterday.setDate(yesterday.getDate() - 1);
    // console.log("today", today);
    // console.log("yesterday", yesterday);
    const yesterdayAttendanceReasonAndId = yield AttendanceModel_1.Attendance.findOne({
        userId: requstedUser.userId,
        date: yesterday,
    }).select("_id notCompleteReason");
    // console.log("yesterdayAttendanceReasonAndId", yesterdayAttendanceReasonAndId);
    let allTasksCompleted = true;
    if ((yesterdayAttendanceReasonAndId === null || yesterdayAttendanceReasonAndId === void 0 ? void 0 : yesterdayAttendanceReasonAndId.notCompleteReason) === "") {
        const yesterdayAttendance = yield AttendanceModel_1.Attendance.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(requstedUser.userId),
                    date: yesterday,
                },
            },
            {
                $lookup: {
                    from: "foodlogs",
                    localField: "foodLogs",
                    foreignField: "_id",
                    as: "foodLogs",
                },
            },
            {
                $lookup: {
                    from: "workoutlogs",
                    localField: "workOutLogs",
                    foreignField: "_id",
                    as: "workOutLogs",
                },
            },
            { $unwind: "$workOutLogs" },
            { $unwind: "$workOutLogs.workOuts" },
            { $unwind: "$workOutLogs.workOuts.workoutSet" },
            {
                $group: {
                    _id: "$_id",
                    allFoodStatusTrue: {
                        $first: { $allElementsTrue: "$foodLogs.status" },
                    },
                    minCompletedReps: {
                        $min: "$workOutLogs.workOuts.workoutSet.completedReps",
                    },
                },
            },
            {
                $addFields: {
                    allWorkoutsCompleted: {
                        $gt: ["$minCompletedReps", 0],
                    },
                },
            },
        ]);
        if (yesterdayAttendance[0]) {
            allTasksCompleted =
                yesterdayAttendance[0].allFoodStatusTrue &&
                    yesterdayAttendance[0].allWorkoutsCompleted;
        }
        else {
            allTasksCompleted = false;
        }
        // console.log("yesterdayAttendance", yesterdayAttendance);
    }
    res.status(200).json({
        msg: "userHomePage",
        dietFood: (_b = userDetails === null || userDetails === void 0 ? void 0 : userDetails.attendanceId) === null || _b === void 0 ? void 0 : _b.foodLogs,
        addedFoodDocIds: eatedFoodDocIds,
        hasTrainer,
        attendanceDocId: (_c = userDetails === null || userDetails === void 0 ? void 0 : userDetails.attendanceId) === null || _c === void 0 ? void 0 : _c._id,
        allTasksCompleted,
        yesterdayAttendanceId: yesterdayAttendanceReasonAndId === null || yesterdayAttendanceReasonAndId === void 0 ? void 0 : yesterdayAttendanceReasonAndId._id,
    });
});
exports.userHomePage = userHomePage;
const getGraphDataUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("getGraphDataUser");
        // i want the users attandance details aggregated by the 7 days like this
        // how can i aggragate the data to get the above result
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        const attendancePerDay = yield AttendanceModel_1.Attendance.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(id),
                    isPresent: true,
                },
            },
            {
                $project: {
                    dayOfWeek: {
                        $add: [
                            { $mod: [{ $subtract: [{ $dayOfWeek: "$date" }, 1] }, 7] },
                            1,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: "$dayOfWeek",
                    NoOfDays: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    day: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 1] }, then: "Mon" },
                                { case: { $eq: ["$_id", 2] }, then: "Tue" },
                                { case: { $eq: ["$_id", 3] }, then: "Wed" },
                                { case: { $eq: ["$_id", 4] }, then: "Thu" },
                                { case: { $eq: ["$_id", 5] }, then: "Fri" },
                                { case: { $eq: ["$_id", 6] }, then: "Sat" },
                                { case: { $eq: ["$_id", 7] }, then: "Sun" },
                            ],
                            default: "Unknown",
                        },
                    },
                    NoOfDays: 1,
                },
            },
        ]);
        // console.log("attendancePerDay", attendancePerDay);
        const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const foodStatusData = yield FoodLogModel_1.FoodLog.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(id),
                    date: {
                        $gte: today,
                        $lt: tomorrow,
                    },
                },
            },
            {
                $group: {
                    _id: "$timePeriod",
                    totalFood: { $sum: 1 },
                    completedCount: {
                        $sum: {
                            $cond: [{ $eq: ["$status", true] }, 1, 0],
                        },
                    },
                },
            },
        ]);
        // console.log("foodStatusData", foodStatusData);
        res
            .status(200)
            .json({ msg: "attendancePerDay", attendancePerDay, foodStatusData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "server error", error });
    }
});
exports.getGraphDataUser = getGraphDataUser;
const userProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        // console.log(requstedUser);
        const userData = yield UserModel_1.User.findById(requstedUser.userId)
            .select("_id name email mobileNumber weight height userBlocked profileImage publicId healthIssues createdAt trainerId trainerPaymentDueDate")
            .populate("trainerId", "name profilePicture");
        // console.log("userData", userData);
        if (!userData) {
            return res.status(400).json({
                msg: "no user data",
            });
        }
        // console.log(userData);
        res.status(200).json({ msg: "user details", user: userData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "server error",
        });
    }
});
exports.userProfile = userProfile;
const userProfileImageUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        let imageData;
        // console.log('req.file' , req.file)
        if (req.file) {
            const user = yield UserModel_1.User.findById(id);
            if (user === null || user === void 0 ? void 0 : user.publicId) {
                const publicId = user.publicId;
                yield (0, cloudinary_1.removeFromCloudinary)(publicId);
                yield UserModel_1.User.updateOne({ _id: id }, { $unset: { profileImage: "", publicId: "" } });
            }
            else {
                console.log("no public id found");
            }
            // console.log(req.file);
            try {
                imageData = yield (0, cloudinary_1.uploadToCloudinary)(req.file.path, "user-Images");
                // console.log('image updted successfully ========================' , imageData)
            }
            catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).json({ msg: "Error uploading image", error });
            }
            if (!imageData || !imageData.url || !imageData.public_id) {
                console.error("Invalid response from Cloudinary:", imageData);
                return res
                    .status(500)
                    .json({ msg: "Invalid response from image upload" });
            }
            const profileUpdate = yield UserModel_1.User.updateOne({ _id: id }, { $set: { profileImage: imageData.url, publicId: imageData.public_id } });
            // console.log("profileUpdate", profileUpdate);
        }
        // console.log("req.body user : " , req.body);
        // user detal update
        const updateData = req.body;
        delete updateData.profileImage;
        delete updateData.publicId;
        // console.log("updateData", updateData);
        const healthIssues = {
            BloodPressure: updateData.BloodPressure,
            Diabetes: updateData.Diabetes,
            cholesterol: updateData.cholesterol,
            HeartDisease: updateData.HeartDisease,
            KidneyDisease: updateData.KidneyDisease,
            LiverDisease: updateData.LiverDisease,
            Thyroid: updateData.Thyroid,
            Others: updateData.Others,
        };
        try {
            const existingUser = yield UserModel_1.User.findOne({ email: updateData.email });
            if (existingUser && String(existingUser._id) !== id) {
                return res.status(400).json({ msg: "Email already in use" });
            }
            const updatedUser = yield UserModel_1.User.findByIdAndUpdate(id, {
                name: updateData.name,
                email: updateData.email,
                mobileNumber: updateData.mobileNumber,
                weight: updateData.weight,
                height: updateData.height,
                healthIssues: healthIssues,
                userBlocked: updateData.userBlocked,
            }, { new: true });
            // console.log("updatedUser", updatedUser);
        }
        catch (error) {
            console.log("error", error.message, error.stack);
        }
        res.status(200).json({ msg: "updated successfully", imageData: imageData });
    }
    catch (error) {
        res.status(500).json({ msg: "server error", error });
        console.log("error", error.message, error.stack);
    }
});
exports.userProfileImageUpdate = userProfileImageUpdate;
const addFoodLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { time, foodDocId, attendanceId } = req.body;
        // Get the current time in 'Asia/Kolkata' timezone
        const currentTimeString = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
        });
        const currentTime = new Date(currentTimeString);
        // Get the food time in 'Asia/Kolkata' timezone
        const [hours, minutes] = time.split(":").map(Number);
        const foodTime = new Date(currentTimeString); // Start with the current time
        foodTime.setHours(hours); // Set the hours
        foodTime.setMinutes(minutes); // Set the minutes
        foodTime.setSeconds(0); // Set the seconds to 0
        // Calculate the food time 1 hour before
        const foodTime1HoursBefore = new Date(foodTime.getTime() - 1000 * 60 * 60);
        if (foodTime1HoursBefore > currentTime) {
            return res.status(401).json({ msg: "time not reached yet" });
        }
        const foodLogData = yield FoodLogModel_1.FoodLog.findById(foodDocId);
        if (foodTime > currentTime) {
            if (foodLogData) {
                foodLogData.status = true;
                yield foodLogData.save();
                yield AttendanceModel_1.Attendance.findByIdAndUpdate(attendanceId, { isPresent: true });
                res.status(200).json({ msg: "food log added successfully" });
            }
        }
        else {
            console.log("time passed");
            res.status(400).json({ msg: "time passed" });
        }
    }
    catch (error) {
        console.error(error);
    }
});
exports.addFoodLog = addFoodLog;
const getDay = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requstedUser = req.headers["user"];
    const id = requstedUser.userId;
    // const userDate = new Date(req.params.date); // assuming date is passed as a parameter in the request
    // console.log("userDate with new date only================", userDate);
    const requestedDate = new Date(new Date(req.params.date).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
    }));
    console.log("date of requestedDate", requestedDate);
    // const startOfUserDate = new Date(userDate.setHours(0, 0, 0, 0));
    // const endOfTheDay = new Date(userDate.setHours(23, 59, 59, 999));
    // console.log("startOfUserDate", startOfUserDate);
    // console.log("endOfTheDay", endOfTheDay);
    const attandanceData = yield AttendanceModel_1.Attendance.findOne({
        userId: id,
        date: requestedDate,
    })
        .populate({
        path: "foodLogs",
        populate: {
            path: "foodId",
        },
    })
        .populate({
        path: "workOutLogs",
        populate: {
            path: "workOuts.workoutId",
        },
    });
    console.log("attandanceData", attandanceData);
    res.status(200).json({ msg: "attandanceData", attandanceData });
});
exports.getDay = getDay;
const setRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rating, trainerId, content } = req.body;
        const requstedUser = req.headers["user"];
        const id = requstedUser.userId;
        const newReview = new ReviewModel_1.Review({
            userId: id,
            trainerId,
            rating,
            content,
        });
        const review = yield newReview.save();
        const averageReview = yield ReviewModel_1.Review.aggregate([
            {
                $group: {
                    _id: "$trainerId",
                    avgRating: { $avg: "$rating" },
                },
            },
        ]);
        const avgReviewRating = Math.round(averageReview[0].avgRating);
        const updateInTrainer = yield TrainerModel_1.Trainer.findByIdAndUpdate(trainerId, {
            $push: { reviews: review._id },
            avgRating: avgReviewRating,
        });
        // console.log("updateInTrainer", updateInTrainer);
        updateInTrainer && res.status(200).json({ msg: "review added" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "server error", error });
    }
});
exports.setRating = setRating;
const trainerOnlineStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const { trainerId, userId } = req.params;
        const trainer = yield TrainerModel_1.Trainer.findById(trainerId);
        if (!trainer) {
            return res.status(400).json({ msg: "no trainer found" });
        }
        const onlineStatus = trainer.isOnline;
        const pendingMessages = yield ChatModel_1.Chat.aggregate([
            {
                $match: {
                    userId: new mongoose_1.default.Types.ObjectId(userId),
                },
            },
            {
                $unwind: "$message",
            },
            {
                $match: {
                    "message.isSeen": false,
                    "message.receiverId": new mongoose_1.default.Types.ObjectId(userId),
                },
            },
            {
                $count: "pendingMessagesCount",
            },
        ]);
        // console.log("pendingMessages", pendingMessages);
        const pendingMessageCount = ((_d = pendingMessages[0]) === null || _d === void 0 ? void 0 : _d.pendingMessagesCount) || 0;
        res.status(200).json({
            msg: "onlineStatus",
            onlineStatus,
            pendingMessageCount,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "server error", error });
    }
});
exports.trainerOnlineStatus = trainerOnlineStatus;
const applyReason = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reason, yesterdayAttendanceId, agree } = req.body;
        const reasonToAdd = agree ? reason : "Reason not Added";
        const ans = yield AttendanceModel_1.Attendance.findOneAndUpdate({ _id: yesterdayAttendanceId }, { notCompleteReason: reasonToAdd });
        // console.log("ans", ans);
        res.status(200).json({ msg: "reason applied successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "server error", error });
    }
});
exports.applyReason = applyReason;
const getUserName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestedUser = req.headers["user"];
        // console.log("requestedUser", requestedUser);
        res.status(200).json({ msg: "user email", email: requestedUser.email });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "server error", error });
    }
});
exports.getUserName = getUserName;
