import express from "express";

import { UserType, User } from "../models/UserModel";
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from "../imageUploadConfig/cloudinary";

export const userProfile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];

    // console.log(requstedUser);

    let userData: UserType | null = await User.findById(
      requstedUser.userId
    ).select(
      "_id name email mobileNumber weight height userBlocked profileImage publicId"
    );

    if (!userData) {
      return res.status(400).json({
        msg: "no user data",
      });
    }
    // console.log(userData);

    res.status(200).json({ msg: "user details", user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};
export const userProfileImageUpdate = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];
    const id = requstedUser.userId;

    if (req.file) {
      const user = await User.findById(id);

      if (user?.publicId) {
        let publicId = user.publicId;
        await removeFromCloudinary(publicId);
        await User.updateOne(
          { _id: id },
          { $unset: { profileImage: "", publicId: "" } }
        );
      } else {
        console.log("no public id found");
      }

      const data = await uploadToCloudinary(req.file.path, "user-Images");

      const profileUpdate = await User.updateOne(
        { _id: id },
        { $set: { profileImage: data.url, publicId: data.public_id } }
      );
    }

    // user detal update
    const updateData = req.body;
    delete updateData.profileImage;
    delete updateData.publicId;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({ msg: "updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "server error", error });
  }
};
