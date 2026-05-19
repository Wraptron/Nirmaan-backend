const { FetchMentorNameByIdModel } = require("../../../model/AddMentorModel");
const {
  fetchStartupNameById,
  insertMentorSessionRequest,
} = require("../../../model/MentorSessionRequestModel");

const createMentorSessionRequest = async (req, res) => {
  try {
    const {
      mentorId,
      mentorName,
      date,
      time,
      duration,
      mode,
      agenda,
    } = req.body;

    if (!date || !time || !duration || !mode) {
      return res.status(400).json({ message: "Date, time, duration, and mode are required." });
    }

    const startupId = req.user?.startup_id || null;
    let startupName = await fetchStartupNameById(startupId);
    if (!startupName) {
      startupName = req.body.startupName || "Unknown startup";
    }

    let resolvedMentorName = mentorName || null;
    if (mentorId && !resolvedMentorName) {
      resolvedMentorName = await FetchMentorNameByIdModel(mentorId);
    }

    const row = await insertMentorSessionRequest({
      startup_id: startupId,
      startup_name: startupName,
      mentor_id: mentorId || null,
      mentor_name: resolvedMentorName,
      requested_date: date,
      requested_time: time,
      duration: Number(duration),
      session_mode: mode,
      agenda: agenda || "",
      requested_by: req.user?.user_mail || null,
    });

    res.status(201).json({
      requestId: String(row.id),
      status: row.status,
    });
  } catch (err) {
    console.error("createMentorSessionRequest:", err);
    res.status(500).json({ message: "Failed to submit mentor request." });
  }
};

module.exports = { createMentorSessionRequest };
