import express from "express";
import { User } from "../models/UserModel";
import dotenv from "dotenv";
dotenv.config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

import { tokenVerify } from "../middleware/tokenVerify";
import {
  attendance,
  userProfile,
  userProfileImageUpdate,
} from "../controllers/userProfileController";

import upload from "../middleware/upload";

const userRouter: express.Router = express.Router();

userRouter.get("/profile", tokenVerify, userProfile);

userRouter.put(
  "/profileUpdate",
  tokenVerify,
  upload.single("image"),
  userProfileImageUpdate
);

userRouter.post(
  "/create-checkout-session",
  tokenVerify,
  async (req: any, res: any) => {
    const { amount, plan } = req.body;
    const userId = req.headers["user"].userId;
    console.log(amount, plan, userId);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: plan,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/failed",
      client_reference_id: userId,
    });

    res.json({ id: session.id });
  }
);

let userId: string;
let transactionId: string;
let receiptUrl: string;
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_fecaf7dd03cff4bae38d6e153a36ed764714f82ea43044821c6e464f741209fd";

userRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      // console.log('webhook worked',event);
    } catch (err) {
      console.log("webhook error", err);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        transactionId = paymentIntent.id;
        // console.log('PaymentIntent was successful!', paymentIntent);
        // console.log("Transaction ID is", transactionId);
        break;
      case "checkout.session.completed":
        const session = event.data.object;
        userId = session.client_reference_id;
        // console.log("Checkout Session completed!", session);
        // console.log("userId is", userId);
        break;

      case "charge.succeeded":
        const charge = event.data.object;
        receiptUrl = charge.receipt_url;
        // console.log('Charge succeeded!' , charge);
        // console.log("Receipt URL is", receiptUrl);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    if (userId && transactionId && receiptUrl) {
      console.log(
        "userId",
        userId,
        "transactionId",
        transactionId,
        "receiptUrl",
        receiptUrl
      );
    }
    response.send().end();
  }
);

userRouter.get("/attandance", attendance);
export default userRouter;
