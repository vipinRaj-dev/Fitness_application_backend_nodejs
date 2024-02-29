import express from "express";
import { Trainer } from "../models/TrainerModel";
import { User } from "../models/UserModel";
import { Food } from "../models/ListOfFood";

export const allClients = async (
  req: express.Request,
  res: express.Response
) => {
  // try {
  let requstedUser: any = req.headers["user"];
  console.log(requstedUser);

  //   const allClients = await Trainer.findById(requstedUser.userId).populate(
  //     "clients"
  //   );
  //   // console.log(allClients.clients);
  //   res.status(200).json(allClients.clients);
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({
  //     msg: "server error",
  //   });
  // }
  const page = parseInt(req.query.page as string) - 1 || 0;
  const limit = parseInt(req.query.limit as string) || 3;
  const search = (req.query.search as string) || "";
  // let sort = (req.query.sort as string) || "weight";

  // console.log(page, limit, search);

  const query = search
    ? {
        $or: [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ],
      }
    : {};

 try {
  const totalClients = await Trainer.findById(requstedUser.userId).populate({
    path: 'clients',
    match: query, 
    options: { skip: page * limit, limit: limit } 
  });

  // console.log(totalClients);

  res.status(200).json({
    allClients: totalClients.clients,
    page: page + 1,
    limit,
    totalClients: totalClients.clients.length,
  });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: error.message });
}
};

export const SingleClient = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];
    const id = requstedUser.userId;
    const clientId = req.params.id;
    // const singleClient = await Trainer.findById(id).populate("clients");
    // // console.log(singleClient.clients);

    // const client = singleClient.clients.find(
    //   (client: any) => client._id == clientId
    // );
    // console.log(client);

    const client = await User.findById(clientId).populate(
      "latestFoodByTrainer.foodId"
    );
    // console.log(client.latestFoodByTrainer);
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const TrainerGetAllFood = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const clientId = req.params.id;
    const allFood = await Food.find();
    const user = await User.findById({ _id: clientId });
    const listOfFood = user?.latestFoodByTrainer;
    const foodIds = listOfFood.map((food) => food.foodId);
    res.status(200).json({ allFood: allFood, listOfFood: foodIds });
  } catch (error) {
    console.error("Error getting all food:", error);
    res.status(500).json({ msg: "Error getting all food", error });
  }
};

export const addFoodTrainer = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let requstedUser: any = req.headers["user"];
    const trainerId = requstedUser.userId;

    const clientId = req.params.id;
    const { foodId } = req.body;

    // console.log(foodId, clientId);

    const food = await Food.findById(foodId);
    // console.log(food._id);
    const foodToAdd = {
      date: new Date(),
      foodId: food._id,
    };

    const client = await User.findById(clientId);
    // console.log(client.latestFoodByTrainer);
    const ans = await User.updateOne(
      { _id: clientId },
      { $push: { latestFoodByTrainer: foodToAdd } }
    );

    console.log(ans);

    res.status(200).json({ msg: "food added", foodId: food._id });
  } catch (error) {
    // console.error(error);
    res.status(500).json({
      msg: "server error",
    });
  }
};

export const removeFoodTrainer = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const clientId = req.params.clientId;
    const foodId = req.params.foodId;
    // console.log(clientId, foodId);
    const client = await User.findById(clientId);
    const ans = await User.updateOne(
      { _id: clientId },
      { $pull: { latestFoodByTrainer: { foodId: foodId } } }
    );

    // console.log(ans);
    res.status(200).json({ msg: "food removed" });
  } catch (error) {
    console.error(error);
  }
};

export const setTime = async (req: express.Request, res: express.Response) => {
  try {
    const clientId = req.params.clientId;
    const listFoodId = req.params.listFoodId;

    const client = await User.findById(clientId);

    const AddTimeDetails = {
      time: req.body.time,
      timePeriod: req.body.timePeriod,
      quantity: req.body.quantity,
    };
    // console.log(AddTimeDetails);
    const clientFood = client.latestFoodByTrainer.find(
      (food: any) => food._id == listFoodId
    );
    if (clientFood) {
      clientFood.time = AddTimeDetails.time;
      clientFood.timePeriod = AddTimeDetails.timePeriod;
      clientFood.quantity = AddTimeDetails.quantity;

      await client.save();
    }

    res.status(200).json({ msg: "time set succesfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
  }
};
