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
exports.isAdmin = void 0;
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("yes admin verified");
    try {
        const requstedUser = req.headers["user"];
        if (requstedUser.role !== "admin") {
            return res.status(401).json({ msg: "Not authorized" });
        }
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Access denied" });
    }
});
exports.isAdmin = isAdmin;
