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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const node_cron_1 = __importDefault(require("node-cron"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import { io } from "./socket";
// importing the routes
const authRoute_1 = __importDefault(require("./Router/authRoute"));
const userRoute_1 = __importDefault(require("./Router/userRoute"));
const adminRoute_1 = __importDefault(require("./Router/adminRoute"));
const trainerRoute_1 = __importDefault(require("./Router/trainerRoute"));
const workoutRoute_1 = __importDefault(require("./Router/workoutRoute"));
const chatRoute_1 = __importDefault(require("./Router/chatRoute"));
const UserModel_1 = require("./models/UserModel");
const AttendanceModel_1 = require("./models/AttendanceModel");
const FoodLogModel_1 = require("./models/FoodLogModel");
const foodRoute_1 = __importDefault(require("./Router/foodRoute"));
const TrainerModel_1 = require("./models/TrainerModel");
const chatHelpers_1 = require("./utils/chatHelpers");
const app = (0, express_1.default)();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: ["https://vipinvj.xyz", "http://localhost:3000"],
        credentials: true,
        exposedHeaders: ["set-cookie"],
    },
});
app.use((0, cors_1.default)({
    origin: ["https://vipinvj.xyz", "http://localhost:3000"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
}));
// app.use(express.json());
app.use((req, res, next) => {
    // console.log(req.path);
    if (req.path === "/user/webhook") {
        next();
    }
    else {
        express_1.default.json()(req, res, next);
    }
});
dotenv_1.default.config();
const hostName = "localhost";
const port = "4000";
const mongo_uri = process.env.MONGO_DB_URI;
// check working
app.get("/working", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Backed code working properly");
}));
// Defining the routes
app.use("/auth", authRoute_1.default);
app.use("/admin", adminRoute_1.default);
app.use("/user", userRoute_1.default);
app.use("/trainer", trainerRoute_1.default);
app.use("/food", foodRoute_1.default);
app.use("/workouts", workoutRoute_1.default);
app.use("/chat", chatRoute_1.default);
const users = {};
io.on("connection", (socket) => {
    console.log("socker connected succesfulluy in the backend side code");
    socket.on("userConnection", (data) => {
        // console.log("user connected", data);
        // console.log("users", users);
        try {
            const setIsOnline = () => __awaiter(void 0, void 0, void 0, function* () {
                const decode = jsonwebtoken_1.default.verify(data.userCookie, process.env.JWT_SECRET_KEY);
                users[socket.id] = { userId: decode.userId, role: data.role };
                socket.join(decode.userId);
                if (data.role === "trainer" && decode.userId) {
                    const trainerData = yield TrainerModel_1.Trainer.findOneAndUpdate({ _id: decode.userId }, { $set: { isOnline: true } }, { new: true });
                    trainerData &&
                        trainerData.clients.forEach((client) => {
                            socket
                                .to(client.toString())
                                .emit("trainerOnline", { trainerId: decode.userId });
                        });
                }
                else if (data.role === "user" && decode.userId) {
                    const userDetails = yield UserModel_1.User.findOneAndUpdate({ _id: decode.userId }, { $set: { isOnline: true } }, { new: true });
                    userDetails &&
                        userDetails.trainerId &&
                        socket
                            .to(userDetails.trainerId.toString())
                            .emit("clientOnline", { clientId: decode.userId });
                }
            });
            data.userCookie && setIsOnline();
            socket.on("sendMessage", (message, callBack) => __awaiter(void 0, void 0, void 0, function* () {
                // console.log("message recieved", message);
                const messageSaved = yield (0, chatHelpers_1.sendAndSaveMessage)(message);
                // console.log("message saved", messageSaved);
                if (messageSaved) {
                    // console.log("message sent to the user", messageSaved);
                    socket
                        .to(message.receiverId)
                        .emit("messageRecieved", messageSaved.chatMessage);
                    callBack({
                        status: "success from the server side",
                    });
                }
            }));
            socket.on("makeMsgSeen", (data) => __awaiter(void 0, void 0, void 0, function* () {
                const { senderId, receiverId } = data;
                const msgSeen = yield (0, chatHelpers_1.makeMsgSeen)(senderId, receiverId);
                console.log("msg seen", msgSeen);
                if ((msgSeen === null || msgSeen === void 0 ? void 0 : msgSeen.status) === "success") {
                    socket.to(senderId).emit("msgSeen", { senderId: senderId });
                }
            }));
            // socket.on('updateLiveMsg' , async (data) => {
            //   console.log("data in update live msg", data);
            //   const {recieverId} = data;
            //   socket.to(recieverId).emit('toReciever' , {msg : 'success by the server'});
            // })
            socket.on("allSeen", (data) => __awaiter(void 0, void 0, void 0, function* () {
                // console.log("all seen data", data);
                const { trainerId, userId, from } = data;
                const chatDoc = yield (0, chatHelpers_1.findChatDoc)(trainerId, userId);
                (0, chatHelpers_1.markAllSeen)(chatDoc, from === "user" ? userId : trainerId);
                socket.to(from === "user" ? trainerId : userId).emit("allSeen");
            }));
        }
        catch (error) {
            console.error("error in setting the user online", error);
        }
    });
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        const recievedUser = users[socket.id];
        if (!recievedUser)
            return;
        if (recievedUser.role === "trainer") {
            const trainerData = yield TrainerModel_1.Trainer.findOneAndUpdate({ _id: recievedUser.userId }, { $set: { isOnline: false } }, { new: true });
            trainerData &&
                trainerData.clients.forEach((client) => {
                    socket
                        .to(client.toString())
                        .emit("trainerOffline", { trainerId: recievedUser.userId });
                });
        }
        else {
            const userDetails = yield UserModel_1.User.findOneAndUpdate({ _id: recievedUser.userId }, { $set: { isOnline: false } }, { new: true });
            userDetails &&
                userDetails.trainerId &&
                socket
                    .to(userDetails.trainerId.toString())
                    .emit("clientOffline", { clientId: recievedUser.userId });
        }
        delete users[socket.id];
    }));
});
function markAttendance() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield UserModel_1.User.find({
            $or: [{ isPremiumUser: true }, { trialEndsAt: { $gte: new Date() } }],
        });
        for (const user of users) {
            // console.log("user that has the values corectly", user);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            // console.log("today", today , "tomorrow", tomorrow);
            const existingAttendance = yield AttendanceModel_1.Attendance.findOne({
                userId: user._id,
                date: {
                    $gte: today,
                    $lt: tomorrow,
                },
            });
            if (!existingAttendance) {
                // creating food logs for each food in the latestDiet
                const foodLogsIds = yield Promise.all(user.latestDiet.map((food) => __awaiter(this, void 0, void 0, function* () {
                    const foodLogData = new FoodLogModel_1.FoodLog({
                        date: new Date(),
                        userId: user._id,
                        foodId: food.foodId,
                        status: false,
                        timePeriod: food.timePeriod,
                        time: food.time,
                        quantity: food.quantity,
                    });
                    const foodLogId = yield foodLogData.save();
                    return foodLogId._id;
                })));
                const attendance = new AttendanceModel_1.Attendance({
                    date: today,
                    userId: user._id,
                    isPresent: false,
                    foodLogs: foodLogsIds,
                });
                const ans = yield attendance.save();
                const userUpdation = yield UserModel_1.User.updateOne({ _id: user._id }, { $set: { attendanceId: ans._id } });
                // console.log("attandance created to the user", userUpdation);
            }
            else {
                // console.log("attendance already marked for the user", user._id)
            }
        }
    });
}
node_cron_1.default.schedule("0 0 * * *", markAttendance, {
    scheduled: true,
    timezone: "Asia/Kolkata",
});
if (hostName && port && mongo_uri) {
    mongoose_1.default
        .connect(mongo_uri)
        .then(() => {
        console.log("Database connected succesfully");
        console.log('yes working properly');
        // markAttendance();
        // app.listen(Number(port), () => {
        //   console.log(`server is listening at http://${hostName}:${port}`);
        // });
        http.listen(port, () => console.log(`socket io Listening on port ${port}`));
    })
        .catch((error) => {
        console.log("cannot conncect to the database", error);
        process.exit(1);
    });
}
