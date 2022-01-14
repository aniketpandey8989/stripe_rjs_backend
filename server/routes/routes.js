import Router from "express";
import authRoutes from "./authRoutes";
import paymentRoutes from "./paymentRoutes";
const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/payment", paymentRoutes);

export default routes;
