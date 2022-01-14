import PaymentService from "../service/paymentService";

class PaymentController {
  static async makePayment(req, res) {
    PaymentService.makePayment(req.body)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.json(err);
      });
  }

  static async getPaymentHistory(req,res) {
    PaymentService.getPaymentHistory(req)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json(err);
    });
  }
}

export default PaymentController;
