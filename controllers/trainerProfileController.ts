import express from "express";
const mongoose = require("mongoose");
import { Trainer, TrainerType } from "../models/TrainerModel";
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from "../imageUploadConfig/cloudinary";
import { TrainerPayment } from "../models/TrainerPaymentModel";
import { Chat } from "../models/ChatModel";

export const trainerProfile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
   let requstedUser: string | string[] | any = req.headers["user"];
    // console.log(requstedUser);
    let trainerData: TrainerType | null = await Trainer.findById(
      requstedUser.userId
    ).select(
      "_id name email mobileNumber isBlocked profilePicture publicId experience specializedIn price description certifications avgRating transformationClients"
    );

    const response = {
      msg: "trainer details",
      trainer: trainerData,
      transformationClientsCount: trainerData.transformationClients.length,
      certificationsCount: trainerData.certifications.length,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const trainerProfileImageUpdate = async (
  req: express.Request,
  res: express.Response
) => {
  try {
   let requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;

    const {
      name,
      mobileNumber,
      experience,
      specializedIn,
      description,
      price,
    } = req.body;

    const isTrainerExists = await Trainer.findById(id);
    if (!isTrainerExists) {
      return res.status(400).json({
        msg: "no trainer found",
      });
    }
    await Trainer.updateOne(
      { _id: id },
      {
        $set: {
          name,
          mobileNumber,
          experience,
          specializedIn,
          description,
          price,
        },
      }
    );
    let data;
    if (req.file) {
      const trainer = await Trainer.findById(id);

      if (trainer?.publicId) {
        let publicId = trainer.publicId;
        await removeFromCloudinary(publicId);
        await Trainer.updateOne(
          { _id: id },
          { $unset: { profilePicture: "", publicId: "" } }
        );
      } else {
        console.log("no public id found");
      }
      // console.log(req.file);

      try {
        data = await uploadToCloudinary(req.file.path, "trainer-Images");
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res.status(500).json({ msg: "Error uploading image", error });
      }

      if (!data || !data.url || !data.public_id) {
        console.error("Invalid response from Cloudinary:", data);
        return res
          .status(500)
          .json({ msg: "Invalid response from image upload" });
      }

      const profileUpdate = await Trainer.updateOne(
        { _id: id },
        { $set: { profilePicture: data.url, publicId: data.public_id } }
      );
      // console.log("profileUpdate", profileUpdate);
    }

    res.status(200).json({ msg: "profile updated", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const addCertificateAndClient = async (
  req: express.Request,
  res: express.Response
) => {
  try {
   let requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;

    // console.log(req.body.name, req.body.content, req.body);
    const { name, content, field } = req.body;

    const isTrainerExists = await Trainer.findById(id);
    if (!isTrainerExists) {
      return res.status(400).json({
        msg: "no trainer found",
      });
    }

    let data;
    // console.log(req.file);
    if (req.file) {
      try {
        data = await uploadToCloudinary(req.file.path, "trainer-Images");
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res.status(500).json({ msg: "Error uploading image", error });
      }

      if (!data || !data.url || !data.public_id) {
        console.error("Invalid response from Cloudinary:", data);
        return res
          .status(500)
          .json({ msg: "Invalid response from image upload" });
      }
      let updatedData;
      if (field === "certificate") {
        updatedData = await Trainer.updateOne(
          { _id: id },
          {
            $push: {
              certifications: {
                name,
                content,
                photoUrl: data.url,
                publicId: data.public_id,
              },
            },
          }
        );
      } else if (field === "client") {
        updatedData = await Trainer.updateOne(
          { _id: id },
          {
            $push: {
              transformationClients: {
                name,
                content,
                photoUrl: data.url,
                publicId: data.public_id,
              },
            },
          }
        );
      } else {
        console.log("no field found");
      }
      // console.log("updatedData", updatedData);
      res.status(200).json({ msg: "certificate addded" });
    } else {
      return res.status(400).json({ msg: "no file found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const deleteCertificateOrClient = async (
  req: express.Request,
  res: express.Response
) => {
  try {
   let requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;
    console.log(req.body);
    const { deleteId, field, publicId } = req.body;

    const trainerData = await Trainer.findById(id);

    if (!trainerData) {
      return res.status(400).json({
        msg: "no trainer found",
      });
    }

    if (publicId) {
      await removeFromCloudinary(publicId);

      if (field === "certificate") {
        await Trainer.updateOne(
          { _id: id },
          { $pull: { certifications: { _id: deleteId } } }
        );
        res.status(200).json({ msg: "certificate deleted" });
      } else if (field === "client") {
        await Trainer.updateOne(
          { _id: id },
          { $pull: { transformationClients: { _id: deleteId } } }
        );
        res.status(200).json({ msg: "client deleted" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const getReviews = async (
  req: express.Request,
  res: express.Response
) => {
  try {
   let requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;

    const page = parseInt(req.query.page as string) - 1 || 0;
    const limit = parseInt(req.query.limit as string) || 3;
    const rating = parseInt(req.query.rating as string) || 0;
    const trainerId = (req.query.trainerId as string) || id;

    let populateOptions = {
      path: "reviews",
      populate: {
        path: "userId",
        select: "name profileImage",
      },
      match: rating ? { rating } : {},
      options: { sort: { createdAt: -1 } },
    };

    const trainerData = await Trainer.findById(trainerId)
      .populate(populateOptions)
      .select("reviews");

    const responseData = trainerData.reviews.slice(
      page * limit,
      page * limit + limit
    );

    if (!trainerData) {
      return res.status(400).json({
        msg: "no trainer found",
      });
    }

    res.status(200).json({
      reviews: responseData,
      page: page + 1,
      limit,
      totalReviews: trainerData.reviews.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const getPayments = async (
  req: express.Request,
  res: express.Response
) => {
  try {
   let requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;

    const trainerData = await Trainer.findById(id).populate({
      path: "payments",
      populate: {
        path: "clientDetails",
        select: "name profileImage",
      },
      select: "amount transactionId clientDetails",
    });

    // console.log(id);
    const monthlyPayments = await TrainerPayment.aggregate([
      {
        $match: {
          trainersId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          createdAt: 1,
          amount: 1,
          trainersId: 1,
        },
      },

      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$amount" },
          latestDate: { $max: "$createdAt" },
        },
      },
      {
        $sort: { latestDate: 1 },
      },
    ]);

    const userCountPerMonth = await TrainerPayment.aggregate([
      {
        $match: {
          trainersId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          createdAt: 1,
          amount: 1,
          trainersId: 1,
          clientDetails: 1,
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          clientCount: { $sum: 1 },
          latestDate: { $max: "$createdAt" },
        },
      },
      {
        $sort: { latestDate: 1 },
      },
    ]);
    // console.log(userCountPerMonth);
    res.status(200).json({
      payments: trainerData.payments,
      monthlyPayments,
      userCountPerMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const getClients = async (
  req: express.Request,
  res: express.Response
) => {
  try {
   let requstedUser: string | string[] | any = req.headers["user"];
    const id = requstedUser.userId;

    const trainerClients = await Trainer.findById(id)
      .populate("clients", "_id name profileImage isOnline")
      .select("clients");

    // console.log("trainer", trainerClients);

    const pendingMessageCountPerUser = await Chat.aggregate([
      {
        $match: {
          trainerId: new mongoose.Types.ObjectId(id),
        },
      },
      { $unwind: "$message" },
      { 
        $match: { 
          "message.isSeen": false,
          "message.receiverId": new mongoose.Types.ObjectId(id)
        } 
      },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
        },
      },
    ]);

    // console.log("pendingMessageCountPerUser", pendingMessageCountPerUser);

    res.status(200).json({
      msg: "trainer clients",
      clients: trainerClients?.clients,
      trainerId: id,
      pendingMessageCountPerUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error", error });
  }
};
