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

    // Does pass type already exist?
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

    return res.json({
      success: true,
      message: "Pass added successfully",
      passes: event.passes
    });

  } catch (err) {
    console.error("Add Pass Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// UPDATE PASS
// ===============================
export const updatePass = async (req, res) => {
  try {
    const { eventId, passId } = req.params;
    const { price, totalQuantity, remainingQuantity } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const pass = event.passes.id(passId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found" });
    }

    if (price !== undefined) pass.price = price;
    if (totalQuantity !== undefined) pass.totalQuantity = totalQuantity;

    // Auto adjust remaining stock if needed
    if (remainingQuantity !== undefined) {
      pass.remainingQuantity = remainingQuantity;
    } else if (totalQuantity !== undefined) {
      // If quantity increased, adjust remaining as well
      const difference = totalQuantity - pass.totalQuantity;
      pass.remainingQuantity += difference;
    }

    await event.save();

    return res.json({
      success: true,
      message: "Pass updated successfully",
      pass
    });

  } catch (err) {
    console.error("Update Pass Error:", err);
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

    return res.json({
      success: true,
      message: "Pass deleted",
      passes: event.passes
    });

  } catch (err) {
    console.error("Delete Pass Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ===============================
// GET ALL PASSES FOR EVENT
// ===============================
export const getPasses = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    return res.json({
      success: true,
      passes: event.passes
    });

  } catch (err) {
    console.error("Get Passes Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
