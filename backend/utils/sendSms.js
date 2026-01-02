import axios from "axios";

export const sendSms = async (phone, otp) => {
  const isProd = process.env.NODE_ENV === "production";

  /**
   * ─────────────────────────────
   * DEV MODE → DO NOT SEND SMS
   * ─────────────────────────────
   */
  if (!isProd) {
    console.log(`📴 [DEV MODE] SMS skipped`);
    console.log(`🔢 OTP for ${phone}: ${otp}`);
    return { success: true, skipped: true };
  }

  /**
   * ─────────────────────────────
   * PROD MODE → REAL SMS
   * ─────────────────────────────
   */
  try {
    const {
      SERVERMSG_BASE_URL,
      SERVERMSG_USERID,
      SERVERMSG_PASSWORD,
      SERVERMSG_SENDERID,
      SERVERMSG_ENTITYID,
      SERVERMSG_TEMPLATEID,
    } = process.env;

    // Hard fail only in production
    if (
      !SERVERMSG_BASE_URL ||
      !SERVERMSG_USERID ||
      !SERVERMSG_PASSWORD ||
      !SERVERMSG_SENDERID ||
      !SERVERMSG_ENTITYID ||
      !SERVERMSG_TEMPLATEID
    ) {
      throw new Error("ServerMSG credentials missing in production");
    }

    // ⚠️ MUST match your approved DLT template exactly
    const message = `Your OTP is ${otp}. It is valid for 5 minutes. - ${SERVERMSG_SENDERID}`;

    const params = new URLSearchParams({
      UserID: SERVERMSG_USERID,
      Password: SERVERMSG_PASSWORD,
      SenderID: SERVERMSG_SENDERID,
      Phno: phone,
      Msg: message,
      EntityID: SERVERMSG_ENTITYID,
      TemplateID: SERVERMSG_TEMPLATEID,
    });

    const url = `${SERVERMSG_BASE_URL}?${params.toString()}`;

    console.log("📡 Sending SMS (password masked)");

    const response = await axios.get(url, {
      timeout: 15000,
    });

    console.log("📨 SMS gateway response:", response.data);

    /**
     * SUCCESS DETECTION (robust)
     */
    if (typeof response.data === "object") {
      if (String(response.data.Status).toUpperCase() === "OK") {
        return { success: true, data: response.data };
      }
    }

    if (typeof response.data === "string") {
      const txt = response.data.toLowerCase();
      if (
        txt.startsWith("1") ||
        txt.includes("sent") ||
        txt.includes("success")
      ) {
        return { success: true, data: response.data };
      }
    }

    return { success: false, data: response.data };
  } catch (error) {
    console.error("❌ SMS sending failed");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }

    return null;
  }
};
