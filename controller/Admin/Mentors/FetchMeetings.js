const { FetchMeetingsWithMentorDetailsModel } = require("../../../model/AddMentorModel");
const { FetchScheduleMeetings } = require("../../../model/ScheduleMeetingModel");

const FetchMeetings = async (req, res) => {
const mentor_reference_id = req.params.mentor_reference_id;
  // console.log("mentor_reference_id" ,mentor_reference_id)
  if (mentor_reference_id) {
    try {
      const result = await FetchScheduleMeetings(mentor_reference_id);
      res.status(200).json(result);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("Params missing");
  }
};
const FetchMeetingsDetailsWithMentor = async (req, res) => {
    try {
      const result = await FetchMeetingsWithMentorDetailsModel();
      res.status(200).json(result);
    } catch (err) {
      console.log(err)
      res.send(err);
    }
 
};



module.exports = {
  FetchMeetings,
  FetchMeetingsDetailsWithMentor
};
