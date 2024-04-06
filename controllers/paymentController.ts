import dotenv from "dotenv";
import { AdminPayment } from "../models/PaymentsModel";
import { User } from "../models/UserModel";
dotenv.config();
import Stripe from "stripe";
import { TrainerPayment } from "../models/TrainerPaymentModel";
import { Trainer } from "../models/TrainerModel";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  console.log('inside the createCheckoutSession');
  
  const { amount, plan, trainerId } = req.body;
  const userId = req.headers["user"].userId;
  trainerId
    ? console.log(amount, plan, userId, trainerId)
    : console.log(amount, plan, userId);
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
    success_url: "https://vipinvj.xyz/success",
    cancel_url: "https://vipinvj.xyz/failed",
    client_reference_id: userId,
    // trainer_reference_id: trainerId,
    metadata: {
      selectedPlan: plan,
      amountPaid: amount,
      trainer_reference_id: trainerId,
    },
  });

  res.json({ id: session.id });
};

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_fecaf7dd03cff4bae38d6e153a36ed764714f82ea43044821c6e464f741209fd";

export const handleWebhook = async (request, response) => {
  console.log('inside the handleWebhook');

  let userId: string;
  let transactionId: string;
  const sig = request.headers["stripe-signature"];

  let metadata;
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.log("webhook error", err);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      // const paymentIntent = event.data.object;

      break;
    case "checkout.session.completed":
      const session = event.data.object;
      userId = session.client_reference_id;
      metadata = session.metadata;
      transactionId = session.payment_intent;
      // console.log("Checkout Session completed!", metadata);

      break;

    case "charge.succeeded":
      // const charge = event.data.object;

      break;
    default:
    // console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  if (userId && !metadata.trainer_reference_id) {
    // console.log(
    //   "userId",
    //   userId,
    //   "transactionId",
    //   transactionId,
    //   "receiptUrl",
    //   receiptUrl,
    //   "metadata",
    //   metadata
    // );
    const updateAdminPayment = async () => {
      const paymentDocument = new AdminPayment({
        planSelected: metadata.selectedPlan,
        transactionId: transactionId,
        clientDetails: userId,
        amount: metadata.amountPaid,
      });
      await paymentDocument.save();

      //   console.log("paymentDocument", paymentDocument);

      const numberOfMonths: number =
        metadata?.selectedPlan === "Monthly plan" ? 1 : 6;
      const calculatedDueDate =  new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      calculatedDueDate.setMonth(calculatedDueDate.getMonth() + numberOfMonths);
      //   console.log("new date", new Date());
      //   console.log("calculatedDueDate", calculatedDueDate);
      //   console.log("payemntDocument._id", paymentDocument._id);
      await User.updateOne(
        { _id: userId },
        {
          $set: { isPremiumUser: true, dueDate: calculatedDueDate },
          $push: { subscriptionDetails: paymentDocument._id },
        }
      );
      // userId = "";
      // metadata = "";
      // transactionId = "";
      // receiptUrl = "";
    };
    await updateAdminPayment();
  }
  if (userId && metadata && metadata.trainer_reference_id) {
    // console.log(
    //   "userId",
    //   userId,
    //   "transactionId",
    //   transactionId,
    //   "receiptUrl",
    //   receiptUrl,
    //   "metadata",
    //   metadata.trainer_reference_id
    // );
    const updateTrainerPayment = async () => {
      const paymentDocument = new TrainerPayment({
        planSelected: metadata.selectedPlan,
        clientDetails: userId,
        trainersId: metadata.trainer_reference_id,
        amount: metadata.amountPaid,
        transactionId: transactionId,
      });
      await paymentDocument.save();

      // console.log("paymentDocument", paymentDocument);

      const month = 1;
      const calculatedDueDate =  new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      calculatedDueDate.setMonth(calculatedDueDate.getMonth() + month);
      // console.log("new date", new Date());
      // console.log("calculatedDueDate", calculatedDueDate);
      // console.log("payemntDocument._id", paymentDocument._id);
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            trainerPaymentDueDate: calculatedDueDate,
            trainerId: metadata.trainer_reference_id,
          },
          $push: { trainerPaymentDetails: paymentDocument._id },
        }
      );

      await Trainer.updateOne(
        { _id: metadata.trainer_reference_id },

        {
          $push: { payments: paymentDocument._id, clients: userId },
        }
      );

      // userId = "";
      // metadata = "";
    };
    await updateTrainerPayment();
  }

  response.send().end();
};
