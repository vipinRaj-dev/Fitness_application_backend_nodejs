import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";



// importing the routes
import authRouter from "./Router/authRoute";
import userRouter from "./Router/userRouter";

const app: express.Application = express();

//cors
app.use(cors());

app.use(express.json());

dotenv.config();

let hostName: string | undefined = process.env.HOST_NAME;
let port: string | undefined = process.env.PORT;
let mongo_uri: string | undefined = process.env.MONGO_DB_LOCAL;

// Defining the routes

app.use("/auth", authRouter);
app.use("/user", userRouter);

if (hostName && port && mongo_uri) {
  mongoose
    .connect(mongo_uri)
    .then(() => {
      console.log("Database connected succesfully");
      app.listen(Number(port), () => {
        console.log(`server is listening at http://${hostName}:${port}`);
      });
    })
    .catch((error: any) => {
      console.log("cannot conncect to the database", error);
      process.exit(1);
    });
}
