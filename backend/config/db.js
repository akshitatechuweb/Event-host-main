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

      // If there are any existing qrCode indexes, drop them to avoid conflicts
      for (const idx of indexes) {
        if (idx.key && idx.key.qrCode === 1) {
          try {
            await coll.dropIndex(idx.name);
            console.log(`Dropped existing index ${idx.name} on bookings.qrCode`);
          } catch (dropErr) {
            console.warn(`Failed to drop index ${idx.name}:`, dropErr.message);
          }
        }
      }

      // Clean up documents that have `qrCode: null` so the sparse index won't include them
      try {
        const result = await coll.updateMany({ qrCode: null }, { $unset: { qrCode: "" } });
        if (result.modifiedCount > 0) {
          console.log(`Unset qrCode on ${result.modifiedCount} bookings (null -> absent) to prepare for sparse index`);
        }
      } catch (uErr) {
        console.warn("Failed to unset null qrCode values:", uErr.message);
      }

      // Ensure the Booking model's sparse unique index is created (defined in schema)
      try {
        await import("../models/Booking.js");
        if (mongoose.modelNames().includes("Booking")) {
          await mongoose.model("Booking").createIndexes();
          console.log("Ensured Booking sparse unique index is created");
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
