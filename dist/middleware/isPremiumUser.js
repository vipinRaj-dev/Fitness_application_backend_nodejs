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
exports.isPremiumUser = void 0;
const UserModel_1 = require("../models/UserModel");
const isPremiumUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requstedUser = req.headers["user"];
        const user = yield UserModel_1.User.findById(requstedUser.userId);
        if (user) {
            if (user.isPremiumUser && user.dueDate > new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))) {
                next();
            }
            else if (user.trialEndsAt > new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))) {
                next();
            }
            else {
                res
                    .status(402)
                    .json({ msg: "user is normal user", userType: "normal" });
            }
        }
    }
    catch (error) {
        console.error("error from the isPremiumUser : ", error);
    }
});
exports.isPremiumUser = isPremiumUser;
