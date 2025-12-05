import mongoose from "mongoose";
import { type } from "os";
import { title } from "process";

const eventSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
          index: "2dsphere",
        },
      },
    },

    startDateTime: {
      type: Date,
      required: true,
    },

    endDateTime: {
      type: Date,
      required: true,
    },

    capacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    rules: {
      type: [String],
      default: [],
    },

    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "video"],
          default: "image",
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "pending", "live", "canceled"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
