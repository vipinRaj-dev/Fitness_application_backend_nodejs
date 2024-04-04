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
exports.IsUserBlocked = void 0;
const UserModel_1 = require("../models/UserModel");
const IsUserBlocked = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const requstedUser = req.headers["user"];
    if (requstedUser.role === "user") {
        const isUserBlocked = yield UserModel_1.User.findById(requstedUser.userId).select("userBlocked");
        console.log("isuser blocked ", isUserBlocked.userBlocked);
        if (isUserBlocked.userBlocked) {
            console.log("user blocked");
            return res.status(403).json({ msg: "user is blocked" });
        }
        else {
            console.log("user is not blocked");
            next();
        }
    }
});
exports.IsUserBlocked = IsUserBlocked;
