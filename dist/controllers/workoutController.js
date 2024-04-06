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
exports.updateCompletedReps = exports.getWorkoutsUser = exports.deleteWorkout = exports.addNewSet = exports.deleteWorkoutSet = exports.editSet = exports.getTrainerWorkouts = exports.setWorkout = exports.getWorkouts = void 0;
const ListOfWorkout_1 = require("../models/ListOfWorkout");
const UserModel_1 = require("../models/UserModel");
const WorkoutLogModel_1 = require("../models/WorkoutLogModel");
const AttendanceModel_1 = require("../models/AttendanceModel");
const getWorkouts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("getWorkouts");
    try {
        const page = parseInt(req.query.page) - 1 || 0;
        const limit = parseInt(req.query.limit) || 3;
        const search = req.query.search || "";
        const filter = req.query.filter || "";
        const query = Object.assign(Object.assign({}, (search
            ? {
                $or: [
                    { workoutName: new RegExp(search, "i") },
                    { targetMuscle: new RegExp(search, "i") },
                ],
            }
            : {})), (filter ? { targetMuscle: filter } : {}));
        const totalWorkoutCount = yield ListOfWorkout_1.Workout.countDocuments(query);
        const allWorkouts = yield ListOfWorkout_1.Workout.find(query)
            .skip(page * limit)
            .limit(limit);
        // console.log(allWorkouts);
        res.status(200).json({ allWorkouts, totalWorkoutCount });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getWorkouts = getWorkouts;
const setWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workoutId, clientId, workoutSet } = req.body;
        // console.log(workoutId, clientId, workoutSet);
        const userDetails = yield UserModel_1.User.findById(clientId);
        const attendanceDoc = yield AttendanceModel_1.Attendance.findOne({
            _id: userDetails === null || userDetails === void 0 ? void 0 : userDetails.attendanceId,
        });
        if (attendanceDoc) {
            if (attendanceDoc.workOutLogs) {
                const workoutLog = yield WorkoutLogModel_1.WorkoutLog.findById(attendanceDoc.workOutLogs);
                if (workoutLog) {
                    workoutLog.workOuts.push({
                        workoutId,
                        workoutSet,
                    });
                    yield workoutLog.save();
                }
            }
            else {
                const workoutLog = new WorkoutLogModel_1.WorkoutLog({
                    userId: clientId,
                    date: new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })),
                    workOuts: [
                        {
                            workoutId,
                            workoutSet,
                        },
                    ],
                });
                const saved = yield workoutLog.save();
                attendanceDoc.workOutLogs = saved._id;
                yield attendanceDoc.save();
            }
            res.status(200).json({ message: "Workout Set Successfully" });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.setWorkout = setWorkout;
const getTrainerWorkouts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const startDate = date.setHours(0, 0, 0, 0);
        const endDate = date.setHours(23, 59, 59, 999);
        const workOutLogData = yield WorkoutLogModel_1.WorkoutLog.findOne({
            userId,
            date: { $gte: startDate, $lt: endDate },
        }).populate("workOuts.workoutId");
        if (workOutLogData) {
            // console.log(workOutLogData);
            res.status(200).json({
                workOutData: workOutLogData.workOuts,
                documentId: workOutLogData._id,
            });
        }
        else {
            res.status(404).json({ message: "No Workouts Found" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getTrainerWorkouts = getTrainerWorkouts;
const editSet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, workoutSetId, eachWorkoutSetId, reps, weight } = req.body;
        // console.log(eachWorkoutSetId, workoutSetId, documentId, reps, weight);
        const workoutLog = yield WorkoutLogModel_1.WorkoutLog.findOne({ _id: documentId });
        // console.log(workoutLog);
        const workoutfound = workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.workOuts.find((workout) => {
            return workout._id == workoutSetId;
        });
        // console.log(workoutfound);
        const foundSet = workoutfound === null || workoutfound === void 0 ? void 0 : workoutfound.workoutSet.find((set) => {
            return set._id == eachWorkoutSetId;
        });
        // console.log(foundSet);
        if (foundSet) {
            foundSet.reps = reps;
            foundSet.weight = weight;
            yield (workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.save());
            res.status(200).json({ message: "Workout Set Successfully" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.editSet = editSet;
const deleteWorkoutSet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, workoutSetId, eachWorkoutSetId } = req.params;
        // console.log(documentId, workoutSetId, eachWorkoutSetId);
        const workoutLog = yield WorkoutLogModel_1.WorkoutLog.findOne({ _id: documentId });
        // console.log(workoutLog);
        const workoutfound = workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.workOuts.find((workout) => {
            return workout._id.toString() == workoutSetId;
        });
        // console.log(workoutfound);
        const foundSet = workoutfound === null || workoutfound === void 0 ? void 0 : workoutfound.workoutSet.find((set) => {
            return set._id.toString() == eachWorkoutSetId;
        });
        // console.log(foundSet);
        if (foundSet) {
            workoutfound === null || workoutfound === void 0 ? void 0 : workoutfound.workoutSet.pull({ _id: foundSet._id });
            yield (workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.save());
            res.status(200).json({ message: "Workout Set Successfully" });
        }
        else {
            res.status(404).json({ message: "Workout Set not found" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.deleteWorkoutSet = deleteWorkoutSet;
const addNewSet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, workoutSetId, reps, weight } = req.body;
        const workoutLog = yield WorkoutLogModel_1.WorkoutLog.findOne({ _id: documentId });
        const workoutfound = workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.workOuts.find((workout) => {
            return workout._id == workoutSetId;
        });
        if (workoutfound) {
            workoutfound.workoutSet.push({ reps, weight, completedReps: 0 });
            yield (workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.save());
            res.status(200).json({ message: "Workout Add Set Successfully" });
        }
        else {
            res.status(404).json({ message: "Workout Set not found" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.addNewSet = addNewSet;
const deleteWorkout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, workoutSetId } = req.params;
        // console.log("deleteWorkout", documentId, workoutSetId);
        const workoutLog = yield WorkoutLogModel_1.WorkoutLog.findOne({ _id: documentId });
        const workoutfound = workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.workOuts.find((workout) => {
            return workout._id.toString() == workoutSetId;
        });
        if (workoutfound) {
            workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.workOuts.pull({ _id: workoutfound._id });
            yield (workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.save());
            res.status(200).json({ message: "Workout Set deleted Successfully" });
        }
        else {
            res.status(404).json({ message: "Workout Set not found" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.deleteWorkout = deleteWorkout;
// user with trainer related controllers
const getWorkoutsUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.headers["user"];
        // console.log(userId);
        const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const startDate = date.setHours(0, 0, 0, 0);
        const endDate = date.setHours(23, 59, 59, 999);
        const workOutLogData = yield WorkoutLogModel_1.WorkoutLog.findOne({
            userId,
            date: { $gte: startDate, $lt: endDate },
        }).populate("workOuts.workoutId");
        if (workOutLogData) {
            // console.log(workOutLogData);
            res.status(200).json({
                workOutData: workOutLogData.workOuts,
                documentId: workOutLogData._id,
            });
        }
        else {
            res.status(404).json({ message: "No Workouts Found" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getWorkoutsUser = getWorkoutsUser;
const updateCompletedReps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, workoutSetId, eachWorkoutSetId, completedReps } = req.body;
        const workoutLog = yield WorkoutLogModel_1.WorkoutLog.findOne({ _id: documentId });
        const workoutfound = workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.workOuts.find((workout) => {
            return workout._id == workoutSetId;
        });
        const foundSet = workoutfound === null || workoutfound === void 0 ? void 0 : workoutfound.workoutSet.find((set) => {
            return set._id == eachWorkoutSetId;
        });
        if (foundSet) {
            foundSet.completedReps = completedReps;
            yield (workoutLog === null || workoutLog === void 0 ? void 0 : workoutLog.save());
            res.status(200).json({ message: "Workout Set Successfully" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateCompletedReps = updateCompletedReps;
