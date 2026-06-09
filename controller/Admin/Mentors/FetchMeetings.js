const { FetchMeetingsWithMentorDetailsModel } = require("../../../model/AddMentorModel");
const { FetchScheduleMeetings } = require("../../../model/ScheduleMeetingModel");
const { sendErrorResponse } = require("../../../utils/sendErrorResponse");

const FetchMeetings = async (req, res) => {
const mentor_reference_id = req.params.mentor_reference_id;
  if (mentor_reference_id) {
    try {
      const result = await FetchScheduleMeetings(mentor_reference_id);
      res.status(200).json(result);
    } catch (err) {
      sendErrorResponse(res, 500, 'Internal Server Error', err);
    }
  } else {
    res.status(400).json({ error: "Params missing" });
  }
};

module.exports = {
  FetchMeetings,
};
