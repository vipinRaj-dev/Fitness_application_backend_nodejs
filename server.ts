import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";
import jwt from "jsonwebtoken";

import { Server, Socket } from "socket.io";

// import { io } from "./socket";

// importing the routes
import authRouter from "./Router/authRoute";
import userRouter from "./Router/userRouter";
import adminRouter from "./Router/adminRouter";
import trainerRoutes from "./Router/trainerRoutes";
import workoutRouter from "./Router/workoutRouter";
import chatRouter from "./Router/chatRoutes";

import { User } from "./models/UserModel";
import { Attendance } from "./models/AttendanceModel";
import { FoodLog } from "./models/FoodLogModel";
import foodRouter from "./Router/foodRouter";
import { Trainer } from "./models/TrainerModel";
import {
  findChatDoc,
  makeMsgSeen,
  markAllSeen,
  sendAndSaveMessage,
} from "./utils/chatHelpers";

const app: express.Application = express();

const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});
cors;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// app.use(express.json());
app.use((req, res, next) => {
  // console.log(req.path);
  if (req.path === "/user/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
dotenv.config();

let hostName: string | undefined = process.env.HOST_NAME;
let port: string | undefined = process.env.PORT;
let mongo_uri: string | undefined = process.env.MONGO_DB_LOCAL;

// Defining the routes

app.use("/auth", authRouter);

app.use("/admin", adminRouter);

app.use("/user", userRouter);

app.use("/trainer", trainerRoutes);

app.use("/food", foodRouter);

app.use("/workouts", workoutRouter);

app.use("/chat", chatRouter);

interface UserSocket {
  [key: string]: {
    userId: string;
    role: string;
  };
}

const users: UserSocket = {};

io.on("connection", (socket: Socket) => {
  socket.on("userConnection", (data) => {
    // console.log("user connected", data);
    // console.log("users", users);
    try {
      const setIsOnline = async () => {
        let decode: any = jwt.verify(
          data.userCookie,
          process.env.JWT_SECRET_KEY
        );

        users[socket.id] = { userId: decode.userId, role: data.role };
        socket.join(decode.userId);
        if (data.role === "trainer" && decode.userId) {
          const trainerData = await Trainer.findOneAndUpdate(
            { _id: decode.userId },
            { $set: { isOnline: true } },
            { new: true }
          );

          trainerData &&
            trainerData.clients.forEach((client) => {
              socket
                .to(client.toString())
                .emit("trainerOnline", { trainerId: decode.userId });
            });
        } else if (data.role === "user" && decode.userId) {
          const userDetails = await User.findOneAndUpdate(
            { _id: decode.userId },
            { $set: { isOnline: true } },
            { new: true }
          );

          userDetails &&
            userDetails.trainerId &&
            socket
              .to(userDetails.trainerId.toString())
              .emit("clientOnline", { clientId: decode.userId });
        }
      };

      setIsOnline();

      socket.on("sendMessage", async (message, callBack) => {
        // console.log("message recieved", message);
        const messageSaved = await sendAndSaveMessage(message);

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
      });

      socket.on("makeMsgSeen", async (data) => {
        const { senderId, receiverId } = data;
        const msgSeen = await makeMsgSeen(senderId, receiverId);

        console.log("msg seen", msgSeen);
        if (msgSeen.status === "success") {
          socket.to(senderId).emit("msgSeen", { senderId: senderId });
        }
      });

      socket.on("allSeen", async (data) => {
        // console.log("all seen data", data);
        const { trainerId, userId, from } = data;
        const chatDoc = await findChatDoc(trainerId, userId);
        markAllSeen(chatDoc, from === 'user' ? userId : trainerId);
        socket.to(from === 'user' ? trainerId : userId).emit("allSeen");

      });
    } catch (error) { 
      console.error("error in setting the user online", error);
    }
  });

  socket.on("disconnect", async () => {
    let recievedUser = users[socket.id];

    if (!recievedUser) return;

    if (recievedUser.role === "trainer") {
      const trainerData = await Trainer.findOneAndUpdate(
        { _id: recievedUser.userId },
        { $set: { isOnline: false } },
        { new: true }
      );

      trainerData &&
        trainerData.clients.forEach((client) => {
          socket
            .to(client.toString())
            .emit("trainerOffline", { trainerId: recievedUser.userId });
        });
    } else {
      const userDetails = await User.findOneAndUpdate(
        { _id: recievedUser.userId },
        { $set: { isOnline: false } },
        { new: true }
      );

      userDetails &&
        userDetails.trainerId &&
        socket
          .to(userDetails.trainerId.toString())
          .emit("clientOffline", { clientId: recievedUser.userId });
    }

    delete users[socket.id];
  });
});

async function markAttendance() {
  const users = await User.find({
    $or: [{ isPremiumUser: true }, { trialEndsAt: { $gte: new Date() } }],
  });

  for (const user of users) {
    // console.log("user that has the values corectly", user);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    // console.log("today", today , "tomorrow", tomorrow);
    const existingAttendance = await Attendance.findOne({
      userId: user._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (!existingAttendance) {
      // creating food logs for each food in the latestDiet
      const foodLogsIds = await Promise.all(
        user.latestDiet.map(async (food) => {
          const foodLogData = new FoodLog({
            date: new Date(),
            userId: user._id,
            foodId: food.foodId,
            status: false,
            timePeriod: food.timePeriod,
            time: food.time,
            quantity: food.quantity,
          });

          const foodLogId = await foodLogData.save();

          return foodLogId._id;
        })
      );

      const attendance = new Attendance({
        date: today,
        userId: user._id,
        isPresent: false,
        foodLogs: foodLogsIds,
      });

      const ans = await attendance.save();

      const userUpdation = await User.updateOne(
        { _id: user._id },
        { $set: { attendanceId: ans._id } }
      );
      console.log("attandance created to the user", userUpdation);
    }
  }
}

// cron.schedule('0 0 * * *', markAttendance, {
//   scheduled: true,
//   timezone: "Asia/Kolkata"
// });

if (hostName && port && mongo_uri) {
  mongoose
    .connect(mongo_uri)
    .then(() => {
      console.log("Database connected succesfully");
      markAttendance();
      // app.listen(Number(port), () => {
      //   console.log(`server is listening at http://${hostName}:${port}`);
      // });
      http.listen(port, () =>
        console.log(`socket io Listening on port ${port}`)
      );
    })
    .catch((error: any) => {
      console.log("cannot conncect to the database", error);
      process.exit(1);
    });
}
