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
exports.allClients = void 0;
const TrainerModel_1 = require("../models/TrainerModel");
const allClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    const requstedUser = req.headers["user"];
    // console.log(requstedUser);
    const page = parseInt(req.query.page) - 1 || 0;
    const limit = parseInt(req.query.limit) || 3;
    const search = req.query.search || "";
    const query = search
        ? {
            $or: [
                { name: new RegExp(search, "i") },
                { email: new RegExp(search, "i") },
            ],
        }
        : {};
    try {
        const totalClients = yield TrainerModel_1.Trainer.findById(requstedUser.userId).populate({
            path: "clients",
            match: query,
            options: { skip: page * limit, limit: limit },
        });
        // console.log(totalClients);
        res.status(200).json({
            allClients: totalClients.clients,
            page: page + 1,
            limit,
            totalClients: totalClients.clients.length,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.allClients = allClients;
