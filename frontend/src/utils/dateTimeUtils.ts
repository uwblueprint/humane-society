/**
 * Converts an ISO time string to a formatted time string (e.g., "10:33 AM")
 * @param isoString - ISO format time string (e.g., "2025-11-18T10:33:00-05:00")
 * @returns Formatted time string (e.g., "10:33 AM") or the original string if it's not a valid ISO time
 */
const formatTimeFromISO = (isoString: string | null): string => {
  if (!isoString) {
    return "";
  }

  // Check if it's a special status string
  if (isoString === "Occupied" || isoString === "One or more days ago") {
    return isoString;
  }

  try {
    const date = new Date(isoString);

    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return isoString;
    }

    // Format to "10:33 AM" format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    // If parsing fails, return original string
    return isoString;
  }
};

export default formatTimeFromISO;
