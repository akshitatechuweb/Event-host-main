import axios from "axios";

export const sendSms = async (phone, otp) => {
  try {
    const API = process.env.RENFLAIR_API_KEY;

    const url = `https://sms.renflair.in/V1.php?API=${API}&PHONE=${phone}&OTP=${otp}`;

    console.log("📡 Sending SMS request to:", url);

    const response = await axios.get(url);

    console.log("📨 Renflair Response:", response.data);

    return response.data;
  } catch (error) {
    console.log("❌ SMS sending error:", error.message);
    return null;
  }
};
