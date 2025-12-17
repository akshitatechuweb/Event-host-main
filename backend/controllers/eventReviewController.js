// src/controllers/eventReviewController.js
import Event from "../models/Event.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

// ----------------------------
// Create / Update Review
// ----------------------------
export const addOrUpdateReview = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be 1-5" });
    }

    // OPTIONAL: check if user booked & checked in (skip if relaxed)
    // const hasBooked = await Booking.exists({ eventId, userId, checkedIn: true });
    // if (!hasBooked) return res.status(403).json({ message: "You must attend event to review" });

    // Create or update review
    const updated = await Review.findOneAndUpdate(
      { eventId, userId },
      { rating, review },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Recalculate average rating & totalReviews
    const stats = await Review.aggregate([
      { $match: { eventId: updated.eventId } },
      { $group: {
          _id: "$eventId",
          avgRating: { $avg: "$rating" },
          total: { $sum: 1 }
      }}
    ]);

    if (stats.length > 0) {
      await Event.findByIdAndUpdate(eventId, {
        averageRating: stats[0].avgRating,
        totalReviews: stats[0].total
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review saved successfully",
      review: updated
    });

  } catch (err) {
    console.error("Review Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ----------------------------
// Get Reviews (paginated)
// ----------------------------
export const getReviews = async (req, res) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ eventId })
      .populate("userId", "name") // only name
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ eventId });

    return res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error("Get Reviews Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
