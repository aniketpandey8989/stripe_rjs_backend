import AuthService from "../service/authService";
import { getUserDetails } from "../util";

class AuthController {
  static async authLogin(req, res) {
    let payload = req.body;
    try {
      const authData = await AuthService.authLoginCheck(payload);
      res.json(authData);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  static async authRegister(req, res) {
    let payload = req.body;
    try {
      const authData = await AuthService.authRegister(payload);
      res.json(authData);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  static async updatePassword(req, res) {
    let payload = req.body;
    const userDetails = await getUserDetails(req, res);
    try {
      const authData = await AuthService.updatePassword(payload,userDetails);
      res.json(authData);
    } catch (err) {
      res.status(500).json(err);
    }
  }

}
export default AuthController;
