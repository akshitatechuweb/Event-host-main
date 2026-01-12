export function computeEventExtras(ev, req) {
  let imageUrl = ev.eventImage || null;
  try {
    if (imageUrl && imageUrl.startsWith("/")) {
      imageUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;
    }
  } catch (err) { }

  let bookingPercentage = null;
  if (
    ev.maxCapacity &&
    ev.maxCapacity > 0 &&
    typeof ev.currentBookings === "number"
  ) {
    bookingPercentage = Math.round((ev.currentBookings / ev.maxCapacity) * 100);
  }

  let status = "";
  try {
    const now = new Date();
    const eventDate = ev.eventDateTime
      ? new Date(ev.eventDateTime)
      : ev.date
        ? new Date(ev.date)
        : null;
    const createdAt = ev.createdAt ? new Date(ev.createdAt) : now;
    const hoursUntilEvent = eventDate
      ? (eventDate - now) / (1000 * 60 * 60)
      : null;
    const daysUntilEvent =
      hoursUntilEvent !== null ? hoursUntilEvent / 24 : null;
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

    if (bookingPercentage !== null && bookingPercentage >= 85) {
      status = "Almost Full";
    } else if (
      daysUntilEvent !== null &&
      daysUntilEvent <= 2 &&
      daysUntilEvent > 0
    ) {
      status = "Filling Fast";
    } else if (bookingPercentage !== null && bookingPercentage >= 50) {
      status = "High Demand";
    } else if (hoursSinceCreation <= 48) {
      status = "Just Started";
    }
  } catch (err) {
    // ignore
  }

  return { eventImage: imageUrl, bookingPercentage, status };
}
