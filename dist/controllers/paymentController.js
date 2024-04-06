"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = exports.createCheckoutSession = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const PaymentsModel_1 = require("../models/PaymentsModel");
const UserModel_1 = require("../models/UserModel");
dotenv_1.default.config();
const stripe_1 = __importDefault(require("stripe"));
const TrainerPaymentModel_1 = require("../models/TrainerPaymentModel");
const TrainerModel_1 = require("../models/TrainerModel");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('inside the createCheckoutSession');
    const { amount, plan, trainerId } = req.body;
    const userId = req.headers["user"].userId;
    trainerId
        ? console.log(amount, plan, userId, trainerId)
        : console.log(amount, plan, userId);
    const session = yield stripe.checkout.sessions.create({
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
});
exports.createCheckoutSession = createCheckoutSession;
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_fecaf7dd03cff4bae38d6e153a36ed764714f82ea43044821c6e464f741209fd";
const handleWebhook = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('inside the handleWebhook');
    let userId;
    let transactionId;
    const sig = request.headers["stripe-signature"];
    let metadata;
    let event;
    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    }
    catch (err) {
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
        const updateAdminPayment = () => __awaiter(void 0, void 0, void 0, function* () {
            const paymentDocument = new PaymentsModel_1.AdminPayment({
                planSelected: metadata.selectedPlan,
                transactionId: transactionId,
                clientDetails: userId,
                amount: metadata.amountPaid,
            });
            yield paymentDocument.save();
            //   console.log("paymentDocument", paymentDocument);
            const numberOfMonths = (metadata === null || metadata === void 0 ? void 0 : metadata.selectedPlan) === "Monthly plan" ? 1 : 6;
            const calculatedDueDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            calculatedDueDate.setMonth(calculatedDueDate.getMonth() + numberOfMonths);
            //   console.log("new date", new Date());
            //   console.log("calculatedDueDate", calculatedDueDate);
            //   console.log("payemntDocument._id", paymentDocument._id);
            yield UserModel_1.User.updateOne({ _id: userId }, {
                $set: { isPremiumUser: true, dueDate: calculatedDueDate },
                $push: { subscriptionDetails: paymentDocument._id },
            });
            // userId = "";
            // metadata = "";
            // transactionId = "";
            // receiptUrl = "";
        });
        yield updateAdminPayment();
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
        const updateTrainerPayment = () => __awaiter(void 0, void 0, void 0, function* () {
            const paymentDocument = new TrainerPaymentModel_1.TrainerPayment({
                planSelected: metadata.selectedPlan,
                clientDetails: userId,
                trainersId: metadata.trainer_reference_id,
                amount: metadata.amountPaid,
                transactionId: transactionId,
            });
            yield paymentDocument.save();
            // console.log("paymentDocument", paymentDocument);
            const month = 1;
            const calculatedDueDate = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            calculatedDueDate.setMonth(calculatedDueDate.getMonth() + month);
            // console.log("new date", new Date());
            // console.log("calculatedDueDate", calculatedDueDate);
            // console.log("payemntDocument._id", paymentDocument._id);
            yield UserModel_1.User.updateOne({ _id: userId }, {
                $set: {
                    trainerPaymentDueDate: calculatedDueDate,
                    trainerId: metadata.trainer_reference_id,
                },
                $push: { trainerPaymentDetails: paymentDocument._id },
            });
            yield TrainerModel_1.Trainer.updateOne({ _id: metadata.trainer_reference_id }, {
                $push: { payments: paymentDocument._id, clients: userId },
            });
            // userId = "";
            // metadata = "";
        });
        yield updateTrainerPayment();
    }
    response.send().end();
});
exports.handleWebhook = handleWebhook;
