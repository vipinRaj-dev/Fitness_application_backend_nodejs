import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// importing the routes
import authRouter from "./Router/authRoute";
import userRouter from "./Router/userRouter";
import adminRouter from "./Router/adminRouter";
import trainerRoutes from "./Router/trainerRoutes";
import { User } from "./models/UserModel";
import { Attendance } from "./models/AttendanceModel";
const app: express.Application = express();

//cors
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

async function markAttendance() {
  const users = await User.find({
    $or: [{ isPremiumUser: true }, { trialEndsAt: { $gte: new Date() } }],
  });

  for (const user of users) {
    // console.log("user that has the values corectly", user);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const existingAttendance = await Attendance.findOne({
      userId: user._id,
      date: today,
    });

    if (!existingAttendance) {
      const attendance = new Attendance({
        date: today,
        userId: user._id,
        isPresent: false,
        foodLogs: [],
      });

      const ans = await attendance.save();
      console.log("attandance created to the user", ans);
    }
  }
}

if (hostName && port && mongo_uri) {
  mongoose
    .connect(mongo_uri)
    .then(() => {
      console.log("Database connected succesfully");
      // markAttendance();
      app.listen(Number(port), () => {
        console.log(`server is listening at http://${hostName}:${port}`);
      });
    })
    .catch((error: any) => {
      console.log("cannot conncect to the database", error);
      process.exit(1);
    });
}
