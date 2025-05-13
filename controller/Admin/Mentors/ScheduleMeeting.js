const { ScheduleMeetingModel } = require("../../../model/ScheduleMeetingModel");

const ScheduleMeeting = async (req, res) => {
  // Destructure values from the request body
  const {
    mentor_reference_id,
    start_up_name,
    founder_name,
    meeting_mode,
    meeting_link,
    meeting_location,
    participants,
    date,
    time,
    meeting_duration,
    meeting_agenda,
  } = req.body;

  // Log the request body (for debugging)
  console.log('Request Body:', req.body);

  try {
    // Check if any required field is missing
    if (
      !mentor_reference_id ||
      !start_up_name ||
      !founder_name ||
      !meeting_mode ||
      !date ||
      !time ||
      !meeting_duration
    ) {
      return res.status(400).send("All required fields must be provided");
    }

    const result = await ScheduleMeetingModel(
      mentor_reference_id,
      start_up_name,
      founder_name,
      meeting_mode,
      meeting_link,
      meeting_location,
      participants,
      date,
      time,
      meeting_duration,
      meeting_agenda
    );

    res.status(200).send(result);
  } catch (err) {
    console.log(err);

    if (err.code === "23505") {
      // Handle duplicate key error
      res.status(409).send("Conflict: Meeting already exists");
    } else {
      res.status(500).json({ Error: "Internal Server Error" });
    }
  }
};

module.exports = ScheduleMeeting;
