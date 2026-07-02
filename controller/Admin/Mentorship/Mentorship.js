const { MentorScheduleModel } = require("../../../model/AddMentorModel");
const { sendErrorResponse } = require("../../../utils/sendErrorResponse");

const ScheduleMentorMeeting = async(req, res) => {
    const {select_startup, select_mentor, schedule_date, schedule_time, description} = req.body;
    try
    {
      if(!select_startup || !select_mentor || !schedule_date || !schedule_time)
      {
        res.status(401).send('Fields Required');
      }
      else
      {
        const result = await MentorScheduleModel(select_startup, select_mentor, schedule_date, schedule_time, description)
        res.status(200).json(result)
      }
    }
    catch(err)
    {
        sendErrorResponse(res, 500, "Failed to schedule meeting", err);
    }
}
module.exports = {ScheduleMentorMeeting};
