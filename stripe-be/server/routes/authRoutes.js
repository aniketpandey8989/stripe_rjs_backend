import Router from "express";
import AuthController from "../controller/authController";
import { isAuthenticated } from "../util/index";
const authRoutes = Router();

authRoutes.post("/login", AuthController.authLogin);
authRoutes.post(
  "/updatePassword",
  isAuthenticated,
  AuthController.updatePassword
);
authRoutes.post("/register", AuthController.authRegister);

export default authRoutes;
