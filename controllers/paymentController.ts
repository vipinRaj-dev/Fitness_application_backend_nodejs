import dotenv from "dotenv";
import { AdminPayment } from "../models/PaymentsModel";
import { User } from "../models/UserModel";
dotenv.config();
import Stripe from "stripe";
import { TrainerPayment } from "../models/trainerPaymentModel";
import { Trainer } from "../models/TrainerModel";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req: any, res: any) => {
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
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/failed",
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

let userId: string;
let metadata: any;
let transactionId: string;
let receiptUrl: string;
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_fecaf7dd03cff4bae38d6e153a36ed764714f82ea43044821c6e464f741209fd";

export const handleWebhook = async (request, response) => {
  const sig = request.headers["stripe-signature"];

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
      const paymentIntent = event.data.object;
      transactionId = paymentIntent.id;
      //   console.log("Transaction ID is", transactionId);
      break;
    case "checkout.session.completed":
      const session = event.data.object;
      userId = session.client_reference_id;
      metadata = session.metadata;
      console.log("Checkout Session completed!", metadata);
      //   console.log("userId is", userId);
      break;

    case "charge.succeeded":
      const charge = event.data.object;
      receiptUrl = charge.receipt_url;
      //   console.log("Receipt URL is", receiptUrl);
      break;
    default:
    //   console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  if (userId && transactionId && receiptUrl && !metadata.trainer_reference_id) {
    console.log(
      "userId",
      userId,
      "transactionId",
      transactionId,
      "receiptUrl",
      receiptUrl,
      "metadata",
      metadata
    );
    const updateAdminPayment = async () => {
      const paymentDocument = new AdminPayment({
        planSelected: metadata.selectedPlan,
        transactionId: transactionId,
        clientDetails: userId,
        amount: metadata.amountPaid,
        receiptUrl: receiptUrl,
      });
      await paymentDocument.save();

      //   console.log("paymentDocument", paymentDocument);

      const trialPeriod: number =
        metadata?.selectedPlan === "Monthly plan" ? 1 : 6;
      const calculatedDueDate = new Date();
      calculatedDueDate.setMonth(calculatedDueDate.getMonth() + trialPeriod);
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
      userId = "";
      metadata = "";
      transactionId = "";
      receiptUrl = "";
    };
    await updateAdminPayment();
  }
  if (
    userId &&
    transactionId &&
    receiptUrl &&
    metadata &&
    metadata.trainer_reference_id
  ) {
    console.log(
      "userId",
      userId,
      "transactionId",
      transactionId,
      "receiptUrl",
      receiptUrl,
      "metadata",
      metadata.trainer_reference_id
    );
    const updateTrainerPayment = async () => {
      const paymentDocument = new TrainerPayment({
        planSelected: metadata.selectedPlan,
        transactionId: transactionId,
        clientDetails: userId,
        trainersId: metadata.trainer_reference_id,
        amount: metadata.amountPaid,
        receiptUrl: receiptUrl,
      });
      await paymentDocument.save();

      console.log("paymentDocument", paymentDocument);

      let month = 1;
      const calculatedDueDate = new Date();
      calculatedDueDate.setMonth(calculatedDueDate.getMonth() + month);
      console.log("new date", new Date());
      console.log("calculatedDueDate", calculatedDueDate);
      console.log("payemntDocument._id", paymentDocument._id);
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

      userId = "";
      metadata = "";
      transactionId = "";
      receiptUrl = "";
    };
    await updateTrainerPayment();
  }

  response.send().end();
};
