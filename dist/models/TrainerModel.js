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
exports.Trainer = void 0;
const mongoose_1 = __importStar(require("mongoose"));
//  Trainer schema with the above intefaces
const trainerSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    mobileNumber: { type: Number, default: 0 },
    age: { type: Number, default: 0 },
    role: { type: String, default: "trainer" },
    isBlocked: { type: Boolean, default: false },
    profilePicture: String,
    publicId: String,
    experience: { type: Number, default: 0 },
    specializedIn: String,
    price: { type: Number, default: 0 },
    description: String,
    clients: [{ type: mongoose_1.default.Types.ObjectId, ref: "User" }],
    certifications: {
        type: [
            {
                name: String,
                content: String,
                photoUrl: String,
                publicId: String,
            },
        ],
        default: [],
    },
    transformationClients: {
        type: [
            {
                name: String,
                content: String,
                photoUrl: String,
                publicId: String,
            },
        ],
        default: [],
    },
    reviews: [{ type: mongoose_1.default.Types.ObjectId, ref: "Review", default: [] }],
    avgRating: { type: Number, default: 0 },
    payments: { type: [mongoose_1.default.Types.ObjectId], ref: "TrainerPayment" },
    isOnline: { type: Boolean, default: false },
}, { timestamps: true });
exports.Trainer = mongoose_1.default.model("Trainer", trainerSchema);
