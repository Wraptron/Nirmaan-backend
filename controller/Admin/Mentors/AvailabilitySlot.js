const {
  saveMentorAvailability,
  fetchMentorAvailabilityByMentorId,
  groupAvailabilityByDate,
} = require("../../../model/MentorAvailabilityModel");

const saveAvailability = async (req, res) => {
  try {
    const { mentor_id, date, slots } = req.body;

    if (!mentor_id || !date) {
      return res.status(400).json({
        success: false,
        message: "mentor_id and date are required.",
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