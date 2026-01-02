import axios from "axios";

export const sendSms = async (phone, otp) => {
  try {
    const {
      SERVERMSG_BASE_URL,
      SERVERMSG_USERID,
      SERVERMSG_PASSWORD,
      SERVERMSG_SENDERID,
      SERVERMSG_ENTITYID,
      SERVERMSG_TEMPLATEID,
    } = process.env;

    if (
      !SERVERMSG_BASE_URL ||
      !SERVERMSG_USERID ||
      !SERVERMSG_PASSWORD ||
      !SERVERMSG_SENDERID ||
      !SERVERMSG_ENTITYID ||
      !SERVERMSG_TEMPLATEID
    ) {
      console.error("❌ ServerMSG credentials missing");
      return null;
    }

    // ⚠️ Message MUST match DLT template exactly
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

    console.log(
      "📡 ServerMSG URL:",
      url.replace(SERVERMSG_PASSWORD, "****")
    );

    const response = await axios.get(url, { timeout: 15000 });

    console.log("📨 ServerMSG response:", response.data);

    // ✅ JSON success
    if (
      typeof response.data === "object" &&
      response.data.Status?.toUpperCase() === "OK"
    ) {
      return { success: true, data: response.data };
    }

    // ✅ String success fallback
    if (typeof response.data === "string") {
      const txt = response.data.toLowerCase();
      if (txt.startsWith("1") || txt.includes("sent") || txt.includes("success")) {
        return { success: true, data: response.data };
      }
    }

    return { success: false, data: response.data };
  } catch (error) {
    console.error("❌ SMS sending FAILED:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return null;
  }
};
