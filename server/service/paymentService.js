const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default class PaymentService {
  static async makePayment(payload) {
    try {
      const paymentData = {
        paymentMethodId: "src_1KHjqaAbPFgcoQtckXtTMG8U",
        customerId: "cus_KxfARLAQxyKYbE",
      };
      let amount = +payload?.amount*100;
      if (Number.isInteger(amount)) {
        amount = amount;
      } else {
        amount = Math.floor(amount);
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "INR",
        payment_method: paymentData.paymentMethodId,
        customer: paymentData.customerId,
        description: `Payment for app`,
        confirm: true,
      });
      return {
        status: paymentIntent.status,
        id: paymentIntent.id,
      };
    } catch (error) {
      throw error
    }
  }

  static async getPaymentHistory() {
    return new Promise(async (resolve, reject) => {
      const paymentIntents = await stripe.paymentIntents.list();
      if (paymentIntents && paymentIntents.data.length > 0) {
        resolve(paymentIntents?.data);
      } else {
        resolve([]);
      }
    });
  }

}
