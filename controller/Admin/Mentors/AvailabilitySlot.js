const {
  saveMentorAvailability,
  fetchMentorAvailabilityByMentorId,
  groupAvailabilityByDate,
} = require("../../../model/MentorAvailabilityModel");
const { fetchBookedSlotsByMentorId } = require("../../../model/MentorSessionRequestModel");

const canManageMentorAvailability = (requester, mentorId) => {
  if (!requester || mentorId == null || mentorId === "") return false;
  const role = Number(requester.role);
  if (role === 2) return true;
  if (role === 6 && String(requester.mentor_id) === String(mentorId)) return true;
  return false;
};

const subtractBookedSlots = (availability, bookedByDate) => {
  const open = {};
  Object.entries(availability).forEach(([dateKey, slots]) => {
    const booked = new Set(bookedByDate[dateKey] || []);
    const remaining = slots.filter((slot) => !booked.has(slot));
    if (remaining.length > 0) {
      open[dateKey] = remaining;
    }
  });
  return open;
};

const saveAvailability = async (req, res) => {
  try {
    const { mentor_id, date, slots } = req.body;

    if (!mentor_id || !date) {
      return res.status(400).json({
        success: false,
        message: "mentor_id and date are required.",
      });
    }

    if (!canManageMentorAvailability(req.user, mentor_id)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only update your own availability.",
      });
    }

    const slotList = Array.isArray(slots) ? slots : [];

    await saveMentorAvailability(mentor_id, date, slotList);

    res.status(200).json({
      success: true,
      saved: slotList.length,
    });
  } catch (err) {
    console.error("saveAvailability:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save availability.",
    });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { mentor_id } = req.params;

    if (!mentor_id) {
      return res.status(400).json({
        success: false,
        message: "mentor_id is required.",
      });
    }

    const rows = await fetchMentorAvailabilityByMentorId(mentor_id);
    const availability = groupAvailabilityByDate(rows);

    const forBooking =
      req.query.forBooking === "true" || req.query.forBooking === "1";
    if (forBooking) {
      const bookedByDate = await fetchBookedSlotsByMentorId(mentor_id);
      res.status(200).json(subtractBookedSlots(availability, bookedByDate));
      return;
    }

    res.status(200).json(availability);
  } catch (err) {
    console.error("getAvailability:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch availability.",
    });
  }
};

module.exports = { saveAvailability, getAvailability };