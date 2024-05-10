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
exports.uploadVideoToCloudinary = exports.removeVideoFromCloudinary = exports.removeFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// console.log(process.env.CLOUD_NAME);
// console.log(process.env.API_KEY);
// console.log(process.env.API_SECRET);
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
const uploadToCloudinary = (path, folder) => __awaiter(void 0, void 0, void 0, function* () {
    return cloudinary_1.v2.uploader
        .upload(path, { folder, secure: true })
        .then((data) => {
        return { url: data.secure_url, public_id: data.public_id };
    })
        .catch((error) => {
        console.log(error);
    });
});
exports.uploadToCloudinary = uploadToCloudinary;
const removeFromCloudinary = (public_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield cloudinary_1.v2.uploader.destroy(public_id, (error, result) => {
        if (error) {
            console.log(error);
        }
        console.log(result);
    });
});
exports.removeFromCloudinary = removeFromCloudinary;
const uploadVideoToCloudinary = (path, folder) => __awaiter(void 0, void 0, void 0, function* () {
    return cloudinary_1.v2.uploader
        .upload(path, { resource_type: "video", folder, secure: true })
        .then((data) => {
        return { url: data.secure_url, public_id: data.public_id };
    })
        .catch((error) => {
        console.log("error while uplaoding video to cloudinary", error);
    });
});
exports.uploadVideoToCloudinary = uploadVideoToCloudinary;
const removeVideoFromCloudinary = (public_id) => __awaiter(void 0, void 0, void 0, function* () {
    yield cloudinary_1.v2.uploader.destroy(public_id, { resource_type: "video" }, (error, result) => {
        if (error) {
            console.log(error);
        }
        console.log(result);
    });
});
exports.removeVideoFromCloudinary = removeVideoFromCloudinary;
