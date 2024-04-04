"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const setWorkoutSet = new mongoose_1.Schema({
    date: { type: Date, required: true },
    workoutId: { type: mongoose_1.default.Types.ObjectId, required: true },
    workoutSet: {
        type: [
            {
                reps: Number,
                weight: Number,
            },
        ],
        required: true,
    },
});
const setFoodtime = new mongoose_1.Schema({
    date: { type: Date, required: true },
    foodId: { type: mongoose_1.default.Types.ObjectId, ref: "Food", required: true },
    timePeriod: {
        type: String,
        default: "morning",
    },
    time: { type: String, default: "00:00" },
    quantity: { type: Number, default: 0 },
});
const HealthIssuesSchema = new mongoose_1.Schema({
    BloodPressure: { type: Number, default: 0 },
    Diabetes: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 },
    HeartDisease: { type: Boolean, default: false },
    KidneyDisease: { type: Boolean, default: false },
    LiverDisease: { type: Boolean, default: false },
    Thyroid: { type: Boolean, default: false },
});
// schema design
const UserSchema = new mongoose_1.Schema({
    admissionNumber: Number,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNumber: Number,
    password: { type: String, required: true },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    role: { type: String, default: "user" },
    userBlocked: { type: Boolean, default: false },
    healthIssues: { type: HealthIssuesSchema, default: {} },
    isPremiumUser: { type: Boolean, default: false },
    trainerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Trainer" },
    dueDate: Date,
    trainerPaymentDueDate: Date,
    vegetarian: Boolean,
    publicId: String,
    profileImage: String,
    subscriptionDetails: {
        type: [mongoose_1.default.Types.ObjectId],
        ref: "AdminPayment",
    },
    trainerPaymentDetails: {
        type: [mongoose_1.default.Types.ObjectId],
        ref: "TrainerPayment",
    },
    // latestWorkout: [setWorkoutSet],
    latestDiet: [setFoodtime],
    trialEndsAt: Date,
    attendanceId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Attendance" },
    isOnline: { type: Boolean, default: false },
}, { timestamps: true });
exports.User = mongoose_1.default.model("User", UserSchema);
