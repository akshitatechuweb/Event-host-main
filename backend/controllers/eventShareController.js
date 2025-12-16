import Event from "../models/Event.js";

export const shareEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?._id || null;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Increment share count
    event.shareCount += 1;

    // Track user share (if logged in)
    if (userId) {
      event.sharedBy.push({ user: userId });
    }

    await event.save();

    // Shareable URL
    const shareUrl = `${req.protocol}://${req.get("host")}/events/${event._id}`;

    return res.status(200).json({
      success: true,
      message: "Event shared successfully",
      data: {
        eventId: event._id,
        eventName: event.eventName,
        shareUrl,
        totalShares: event.shareCount,
      },
    });

  } catch (err) {
    console.error("Share Event Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to share event",
    });
  }
};
