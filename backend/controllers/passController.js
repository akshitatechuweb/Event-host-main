import Event from "../models/Event.js";

// ===============================
// CREATE / ADD PASS (for custom pass creation)
// ===============================
export const addPass = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type, price, totalQuantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const exists = event.passes.find(p => p.type === type);
    if (exists) {
      return res.status(400).json({ success: false, message: "Pass type already exists" });
    }

    event.passes.push({
      type,
      price,
      totalQuantity,
      remainingQuantity: totalQuantity
    });

    await event.save();

    res.json({ success: true, message: "Pass added", passes: event.passes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// UPDATE PASS
// ===============================
export const updatePass = async (req, res) => {
  try {
    const { eventId, passId } = req.params;
    const { price, totalQuantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const pass = event.passes.id(passId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found" });
    }

    if (price !== undefined) pass.price = price;

    if (totalQuantity !== undefined) {
      const diff = totalQuantity - pass.totalQuantity;
      pass.totalQuantity = totalQuantity;
      pass.remainingQuantity += diff;

      if (pass.remainingQuantity < 0) {
        pass.remainingQuantity = 0;
      }
    }

    await event.save();

    res.json({ success: true, message: "Pass updated", pass });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// DELETE PASS
// ===============================
export const deletePass = async (req, res) => {
  try {
    const { eventId, passId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    event.passes = event.passes.filter(p => p._id.toString() !== passId);
    await event.save();

    res.json({ success: true, message: "Pass deleted", passes: event.passes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ===============================
// GET ALL PASSES FOR EVENT
// ===============================
export const getPasses = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).select("passes");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, passes: event.passes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
