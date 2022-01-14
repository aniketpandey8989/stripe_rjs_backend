import Router from "express";
import { isAuthenticated } from "../util/index";
import PaymentController from "../controller/paymentController";

const paymentRoutes = Router();

paymentRoutes.post("/makePayment", PaymentController.makePayment);
paymentRoutes.get(
  "/getPaymentHistory",
  isAuthenticated,
  PaymentController.getPaymentHistory
);

export default paymentRoutes;
