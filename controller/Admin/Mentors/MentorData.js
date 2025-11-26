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
} = require("../../../model/AddMentorModel");

const UpdateMentor = async (req, res) => {
  try {
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
      mentor_id
    );

    res.status(200).json({
      message: "Mentor updated successfully",
      result,
    });
  } catch (err) {
    console.error("Error in UpdateMentor:", err);
    res.status(500).json({ error: "Failed to update Mentor details" });
  }
};

const FetchMentorData = async (req, res) => {
  try {
    const result = await FetchMentorDataModel();
    res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};
const MentorCount = async (req, res) => {
  try {
    const result = await MentorCountData();
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
      res.status(200).json(result);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("Params missing");
  }
};

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
    } = req.body;
    if (!startup_name || !founder_name || !meeting_mode || !date || !time) {
      return res.status(400).json({
        error: "Please fill necessary fields",
      });
    }

    const result = await MentorScheduleModel(
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
      startup_id
    );
    res.status(201).json({ message: "Meeting scheduled successfully", result });
  } catch (err) {
    console.error("Backend Error (meeting):", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

const FetchMeetings = async (req, res) => {
  const { mentor_id } = req.params;
  try {
    const result = await FetchMeetingsModel(mentor_id);
    res.status(200).send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
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
    console.error("Error inTestimonial :", err);
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
    console.log(req.body);
    const { name, role, description, id } = req.body;

    const result = await UpdateTestimonialModel(name, role, description, id);

    res.status(200).json({
      message: "Testimonial  successfully",
      result,
    });
  } catch (err) {
    console.error("Error in UpdateTestimonial:", err);
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
      console.log(err);
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
    console.error("Error in Feedback :", err);
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
    console.error("Backend Error (feedback update):", err);
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
    console.log(err);
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
  MeetingFeedback,
  UpdateFeedback,
  FetchMeetingFeedback,
};
