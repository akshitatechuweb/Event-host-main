import mongoose from "mongoose";

const connectDB = async () => {
  const useLocal = process.env.USE_LOCAL_DB === "true";
  const localUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/eventhost";
  let envUri = process.env.MONGO_URI;

  // Trim surrounding whitespace/quotes in case .env was malformed
  if (typeof envUri === "string") {
    envUri = envUri.trim().replace(/^"|"$|^'|'$/g, "");
  }

  let uri = useLocal ? localUri : envUri;

  // If uri looks invalid (missing mongodb:// or mongodb+srv://), try falling back to local
  const hasValidScheme = typeof uri === "string" && /^mongodb(\+srv)?:\/\//.test(uri);
  if (!hasValidScheme) {
    console.warn("MongoDB URI does not appear to be valid (missing 'mongodb://' or 'mongodb+srv://').");
    if (!useLocal && localUri) {
      console.warn("Falling back to local MongoDB URI. To force local DB, set USE_LOCAL_DB=true in .env.");
      uri = localUri;
    } else {
      console.error(
        "MongoDB Connection failed: no valid MongoDB URI found. Set MONGO_URI (Atlas) or set USE_LOCAL_DB=true and provide LOCAL_MONGO_URI (optional)."
      );
      process.exit(1);
    }
  }

  // Helpful mongoose connection event logging
  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err.message || err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("Mongoose disconnected from MongoDB");
  });

  if (uri && uri.startsWith("mongodb+srv://")) {
    console.log("Using Atlas MongoDB (SRV). If you want to run locally, set USE_LOCAL_DB=true in your .env to use a local MongoDB instance.");
  } else if (uri && uri.startsWith("mongodb://")) {
    console.log(`Using MongoDB at ${uri.startsWith("mongodb://127.0.0.1") ? "local" : "env-provided"} (prefix: ${uri.slice(0,30)}...)`);
  } else {
    console.log("Using MongoDB URI from environment");
  }

  const connectWithRetry = async (retries = 5, baseDelayMs = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 10000, // fail faster if unreachable
        });
        console.log("MongoDB Connected");
        return;
      } catch (err) {
        console.error(`MongoDB connect attempt ${attempt} failed:`, err.message || err);
        if (attempt < retries) {
          const wait = baseDelayMs * attempt;
          console.log(`Retrying in ${wait}ms...`);
          await new Promise((r) => setTimeout(r, wait));
        } else {
          throw err;
        }
      }
    }
  };

  try {
    await connectWithRetry();

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
    console.error("MongoDB Connection failed:", error);
    console.error("Common causes: incorrect URI, network/IP whitelist, firewall/VPN blocking outbound connections, or DNS/SRV resolution issues.");
    if (uri && uri.startsWith("mongodb+srv://")) {
      console.warn("Detected SRV connection string (mongodb+srv). Ensure your DNS resolves SRV records and your network allows outbound connections to Atlas hosts.");
    }
    process.exit(1);
  }
};

export default connectDB;
