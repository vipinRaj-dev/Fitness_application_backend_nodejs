import express from "express";

import { Trainer, TrainerType } from "../models/TrainerModel";
import {
  removeFromCloudinary,
  uploadToCloudinary,
} from "../imageUploadConfig/cloudinary";

export const trainerProfile = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];
    // console.log(requstedUser);
    let trainerData: TrainerType | null = await Trainer.findById(
      requstedUser.userId
    ).select(
      "_id name email mobileNumber isBlocked profilePicture publicId experience specializedIn price description certifications transformationClients"
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

// export const profileUpdate = async (
//   req: express.Request,
//   res: express.Response
// ) => {
//   try {
//     let requstedUser: any = req.headers["user"];
//     const id = requstedUser.userId;

//     const {
//       name,
//       mobileNumber,
//       experience,
//       specializedIn,
//       description,
//       price,
//     } = req.body;

//     const isTrainerExists = await Trainer.findById(id);
//     if (!isTrainerExists) {
//       return res.status(400).json({
//         msg: "no trainer found",
//       });
//     }
//     await Trainer.updateOne(
//       { _id: id },
//       {
//         $set: {
//           name,
//           mobileNumber,
//           experience,
//           specializedIn,
//           description,
//           price,
//         },
//       }
//     );

//     res.status(200).json({ msg: "profile updated" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       msg: "server error",
//     });
//   }
// };

export const trainerProfileImageUpdate = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];
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
    let requstedUser: any = req.headers["user"];
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
    let requstedUser: any = req.headers["user"];
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
