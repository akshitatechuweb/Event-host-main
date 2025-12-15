import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Ensure there is no old unique index on bookings.qrCode that treats null as a value
    // and create the partial unique index defined by the Booking model.
    try {
      const db = mongoose.connection.db;
      const coll = db.collection("bookings");

      // If collection doesn't exist yet, skip index adjustments
      const collections = await db.listCollections({ name: "bookings" }).toArray();
      if (collections.length === 0) {
        console.log("No bookings collection yet; skipping index reconciliation");
        return;
      }

      const indexes = await coll.indexes();
      for (const idx of indexes) {
        if (idx.key && idx.key.qrCode === 1) {
          // Keep if already has the desired partial filter
          const hasDesiredPartial = idx.partialFilterExpression && idx.partialFilterExpression.qrCode && (
            idx.partialFilterExpression.qrCode.$ne === null || (
              idx.partialFilterExpression.qrCode.$exists === true && idx.partialFilterExpression.qrCode.$ne === null
            )
          );

          if (!hasDesiredPartial) {
            try {
              await coll.dropIndex(idx.name);
              console.log(`Dropped old index ${idx.name} on bookings.qrCode`);
            } catch (dropErr) {
              console.warn(`Failed to drop index ${idx.name}:`, dropErr.message);
            }
          }
        }
      }

      // Ensure the Booking model's partial unique index is created
      try {
        await import("../models/Booking.js");
        if (mongoose.modelNames().includes("Booking")) {
          await mongoose.model("Booking").createIndexes();
          console.log("Ensured Booking partial indexes are created");
        }
      } catch (idxErr) {
        console.warn("Could not create Booking indexes:", idxErr.message);
      }
    } catch (err) {
      console.warn("Booking index reconciliation skipped:", err.message);
    }
  } catch (error) {
    console.error("MongoDB Connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
