const { mentorSlotExists } = require("../../../model/MentorAvailabilityModel");
const {
  fetchStartupNameById,
  insertMentorSessionRequest,
  mentorSlotIsTaken,
  updateMentorSessionRequestStatus,
} = require("../../../model/MentorSessionRequestModel");
const {
  notifyMentorshipSessionPending,
  notifyMentorshipSessionRejected,
} = require("../../../utils/notificationFanout");



const createMentorSessionRequest = async (req, res) => {
  try {
    const { mentor_id, mentor_name, date, time, duration, mode, agenda } =
      req.body;

    // Auth
    const startupId = req.user?.startup_id
    if (startupId === null) {
      return res.status(403).json({
        message: "Startup identity required. Log in as a startup account.",
      });
    }

    // Fetch startup name
    const startup_name = await fetchStartupNameById(startupId);
    if (!startup_name?.trim()) {
      return res.status(400).json({ message: "Startup profile not found." });
    }

    // Validation
    if (!date || !time || !duration || !mode) {
      return res.status(400).json({
        message: "Date, time, duration, and mode are required.",
      });
    }

    // Slot check
    if (mentor_id) {
      const slotAvailable = await mentorSlotExists(mentor_id, date, time);
      if (!slotAvailable) {
        return res.status(400).json({
          message:
            "Selected date and time are not in this mentor's published availability.",
        });
      }

      const slotTaken = await mentorSlotIsTaken(mentor_id, date, time);
      if (slotTaken) {
        return res.status(409).json({
          message:
            "This time slot is no longer available. Another startup has already requested it.",
        });
      }
    }

    // Insert
    const row = await insertMentorSessionRequest({
      startup_id: startupId,
      startup_name,
      mentor_id: mentor_id || null,
      mentor_name: mentor_name || null,
      requested_date: date,
      requested_time: time,
      duration: Number(duration),
      session_mode: mode,
      agenda: agenda || "",
      requested_by: req.user?.user_mail || null,
    });

    // Notify
    const fullRow = {
      id: row.id,
      startup_id: startupId,
      startup_name,
      mentor_id: mentor_id || null,
      mentor_name: mentor_name || null,
      requested_date: date,
      requested_time: time,
      duration: Number(duration),
      session_mode: mode,
      agenda: agenda || "",
      status: row.status,
      created_at: row.created_at,
    };
    await notifyMentorshipSessionPending(fullRow);

    res.status(201).json({
      requestId: String(row.id),
      status: row.status,
    });
  } catch (err) {
    console.error("createMentorSessionRequest:", err);
    res.status(500).json({ message: "Failed to submit mentor request." });
  }
};

const updateMentorSessionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted or rejected.",
      });
    }

    if (String(req.user?.role) !== "2") {
      return res.status(403).json({ message: "Admin access required." });
    }

    const row = await updateMentorSessionRequestStatus(id, status);
    if (!row) {
      return res.status(404).json({
        message: "Request not found or already processed.",
      });
    }

    if (status === "rejected") {
      await notifyMentorshipSessionRejected(row);
    }

    res.status(200).json({ request: row });
  } catch (err) {
    console.error("updateMentorSessionRequest:", err);
    res.status(500).json({ message: "Failed to update mentor request." });
  }
};

module.exports = { createMentorSessionRequest, updateMentorSessionRequest };
