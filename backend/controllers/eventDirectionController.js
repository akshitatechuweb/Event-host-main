import Event from "../models/Event.js";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getEventDirections = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userLat, userLng, mode = "driving" } = req.query;

    if (!userLat || !userLng) {
      return res.status(400).json({
        success: false,
        message: "User latitude and longitude are required",
      });
    }

    const event = await Event.findById(eventId).lean();
    if (!event || !event.location?.coordinates) {
      return res.status(404).json({
        success: false,
        message: "Event location not found",
      });
    }

    const [eventLng, eventLat] = event.location.coordinates;

    // Call Google Directions API
    const directionsRes = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${userLat},${userLng}`,
          destination: `${eventLat},${eventLng}`,
          mode,
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (!directionsRes.data.routes.length) {
      return res.status(404).json({
        success: false,
        message: "No route found",
      });
    }

    const route = directionsRes.data.routes[0].legs[0];

    return res.status(200).json({
      success: true,
      data: {
        eventId,
        eventName: event.eventName,
        distance: route.distance.text,
        duration: route.duration.text,
        startAddress: route.start_address,
        endAddress: route.end_address,
        steps: route.steps.map(step => ({
          instruction: step.html_instructions,
          distance: step.distance.text,
          duration: step.duration.text,
        })),
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${eventLat},${eventLng}&travelmode=${mode}`,
      },
    });

  } catch (err) {
    console.error("Get Directions Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch directions",
    });
  }
};
