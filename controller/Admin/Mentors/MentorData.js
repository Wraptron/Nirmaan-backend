const {
  FetchMentorDataModel,
  MentorCountData,
  MentorDeleteData,
  TestimonialModel,
  FetchTestimonialModel,
  UpdateTestimonialModel,
  DeleteTestimonialModel,
  UpdateMentorModel,
  MentorScheduleModel,
  FetchMeetingsModel,
  MeetingFeedbackModel,
  FetchMeetingFeedbackModel,
  UpdateFeedbackModel,
  FetchMeetingsWithMentorDetailsModel,
  DeleteMeetingModal,
  cancelScheduledMeetingByMentorModel,
} = require("../../../model/AddMentorModel");
const {
  CACHE_KEYS,
  getOrSet,
  invalidateMentorCaches,
} = require("../../../utils/queryCache");
const { uploadToS3 } = require("../../../utils/s3Upload");

const UpdateMentor = async (req, res) => {
  try {
    let mentor_logo_url = null;

    // If new image uploaded → upload to S3
    if (req.files?.mentor_logo?.[0]) {
      mentor_logo_url = await uploadToS3(
        req.files.mentor_logo[0],
        "mentor_logo"
      );
    }
    const {
      mentor_name,
      mentor_description,
      years_of_experience,
      expertise,
      designation,
      institution,
      qualification,
      year_of_passing_out,
      startup_associated,
      contact_num,
      email_address,
      linkedin_iD,
      mentor_id,
    } = req.body;

    const result = await UpdateMentorModel(
      mentor_name,
      mentor_description,
      years_of_experience,
      expertise,
      designation,
      institution,
      qualification,
      year_of_passing_out,
      startup_associated,
      contact_num,
      email_address,
      linkedin_iD,
      mentor_logo_url,
      mentor_id
    );

    res.status(200).json({
      message: "Mentor updated successfully",
      result,
    });
  } catch (err) {
   if (
        err.code === "23505" &&
        err.constraint === "mentors_pkey"
      ) {
        return res.status(409).json({ Error: "Email already registered" });
      }else if (
        err.code === "22001") {
        return res
          .status(413)
          .json({ Error: "Description cannot exceed 200 words" });
        }
        return res.status(500).json({ Error: "Failed to update Mentor details" });

  }
};

const FetchMentorData = async (req, res) => {
  try {
    const rawLimit = req.query.limit;
    const rawOffset = req.query.offset;

    if (rawLimit !== undefined) {
      const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 25, 1), 100);
      const offset = Math.max(parseInt(rawOffset, 10) || 0, 0);
      const result = await FetchMentorDataModel({ limit, offset });
      res.status(200).json(result);
      return;
    }

    const result = await getOrSet(CACHE_KEYS.MENTOR_LIST, () =>
      FetchMentorDataModel()
    );
    res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};
const MentorCount = async (req, res) => {
  try {
    const result = await getOrSet(CACHE_KEYS.MENTOR_COUNT, () =>
      MentorCountData()
    );
    res.status(200).json(result);
  } catch (err) {
    res.send(err);
  }
};
const DeleteMentorData = async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const result = await MentorDeleteData(id);
      invalidateMentorCaches();
      res.status(200).json(result);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("Params missing");
  }
};

const { scheduleMeetingAndAcceptSession } = require("../../../model/AppNotificationModel");
const {
  notifyMentorshipSessionAccepted,
  notifyMentorshipSessionCancelled,
} = require("../../../utils/notificationFanout");

const Meetings = async (req, res) => {
  try {
    const {
      mentor_reference_id,
      startup_name,
      founder_name,
      meeting_mode,
      meeting_link,
      meeting_location,
      participants,
      date,
      time,
      meeting_duration,
      meeting_agenda,
      startup_id,
      sessionRequestId,
    } = req.body;
    if (!startup_name || !founder_name || !meeting_mode || !date || !time) {
      return res.status(400).json({
        error: "Please fill necessary fields",
      });
    }

    const { meetingResult, sessionRow } = await scheduleMeetingAndAcceptSession(
      {
        mentor_reference_id,
        startup_name,
        founder_name,
        meeting_mode,
        meeting_link,
        meeting_location,
        participants,
        date,
        time,
        meeting_duration,
        meeting_agenda,
        startup_id,
      },
      sessionRequestId || null
    );

    if (sessionRow) {
      await notifyMentorshipSessionAccepted(sessionRow, date, time);
    }

    res.status(201).json({
      message: "Meeting scheduled successfully",
      result: meetingResult,
    });
  } catch (err) {
    console.error("Error in Meetings", err);
    res.status(500).send(err);
  }
};

const FetchMeetings = async (req, res) => {
  const { mentor_id } = req.params;
  try {
    const result = await FetchMeetingsModel(mentor_id);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err);
  }
};

const FetchMeetingsDetailsWithMentor = async (req, res) => {
  try {
    const result = await FetchMeetingsWithMentorDetailsModel();
    res.status(200).json(result);
  } catch (err) {
    res.send(err);
  }
};

const DeleteMeetings = async (req, res) => {
  const id = req.params.id;

  if (id) {
    try {
      const result = await DeleteMeetingModal(id);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(400).send("params missing");
  }
};

const CancelMentorMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || "").trim();
    const mentorId = req.user?.mentor_id;
    const cancelledBy = req.user?.user_mail || null;

    if (!id) {
      return res.status(400).json({ message: "Meeting id is required." });
    }
    if (!mentorId) {
      return res.status(403).json({ message: "Mentor account required." });
    }
    if (reason.length < 5 || reason.length > 500) {
      return res.status(400).json({
        message: "Cancellation reason must be between 5 and 500 characters.",
      });
    }

    const { meeting, sessionRow } = await cancelScheduledMeetingByMentorModel({
      meetingId: id,
      mentorId,
      reason,
      cancelledBy,
    });

    await notifyMentorshipSessionCancelled({ meeting, sessionRow, reason });

    return res.status(200).json({
      message: "Meeting cancelled successfully.",
      meeting,
    });
  } catch (err) {
    if (err.message === "Meeting not found or already cancelled.") {
      return res.status(409).json({ message: err.message });
    }
    if (err.message === "CANCELLATION_TOO_LATE") {
      return res.status(400).json({
        message:
          "Cancellation is not allowed within 24 hours of the session start time.",
      });
    }
    console.error("CancelMentorMeeting:", err);
    return res.status(500).json({ message: "Failed to cancel meeting." });
  }
};


const Testimonial = async (req, res) => {
  try {
    const { mentor_ref_id, name, role, description } = req.body;
    const result = await TestimonialModel(
      mentor_ref_id,
      name,
      role,
      description
    );
    res.status(200).json({
      message: "Testimonial Updated successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update Testimonial details" });
  }
};

const FetchTestimonial = async (req, res) => {
  try {
    const result = await FetchTestimonialModel();
    res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};

const UpdateTestimonial = async (req, res) => {
  try {
    const { name, role, description, id } = req.body;

    const result = await UpdateTestimonialModel(name, role, description, id);

    res.status(200).json({
      message: "Testimonial  successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update Testimonial details" });
  }
};

const DeleteTestimonial = async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const result = await DeleteTestimonialModel(id);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(400).send("id params missing");
  }
};

const MeetingFeedback = async (req, res) => {
  try {
    const { meet_id, mentor_id, startup_id, feedback_text } = req.body;

    const result = await MeetingFeedbackModel(
      meet_id,
      mentor_id,
      startup_id,
      feedback_text
    );
    res.status(200).json({
      message: "Feedback Saved successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to save Feedback" });
  }
};
const UpdateFeedback = async (req, res) => {
  try {
    const {feedback_text,feedback_id} =
      req.body;

    const result = await UpdateFeedbackModel(
      feedback_text,
      feedback_id
    );
    res.status(200).json({ message: "Feedback Updated successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};
const FetchMeetingFeedback = async (req, res) => {
  const { mentor_id } = req.params;
  const { startup_id } = req.params;
  try {
    const result = await FetchMeetingFeedbackModel(mentor_id, startup_id);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).send(err);
  }
};

module.exports = {
  UpdateMentor,
  FetchMentorData,
  MentorCount,
  DeleteMentorData,
  Testimonial,
  FetchTestimonial,
  UpdateTestimonial,
  DeleteTestimonial,
  Meetings,
  FetchMeetings,
  FetchMeetingsDetailsWithMentor,
  DeleteMeetings,
  CancelMentorMeeting,
  MeetingFeedback,
  UpdateFeedback,
  FetchMeetingFeedback,
};
