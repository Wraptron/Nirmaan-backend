const { resolveContent } = require("nodemailer/lib/shared");
const client = require("../utils/conn");
const { v4: uuidv4 } = require("uuid");
const AddMentorModel = (
  mentor_name,
  mentor_logo,
  mento_description,
  years_of_experience,
  area_of_expertise,
  current_designation,
  institution,
  qualification,
  year_of_passing_out,
  startup_associated,
  contact_number,
  email_address,
  linkedIn_ID,
  password
) => {
  const mentorId = uuidv4();
  return new Promise((resolve, reject) => {
    client.query(
      "INSERT INTO add_mentor(mentor_id, mentor_name,mentor_logo,mento_description, years_of_exp, area_of_expertise, designation, institution, qualification, year_of_passing_out, startup_assoc, contact_num, email_address, linkedIn_id, password, hashkey, user_role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,$17)",
      [
        mentorId,
        mentor_name,
        mentor_logo,
        mento_description,
        years_of_experience,
        area_of_expertise,
        current_designation,
        institution,
        qualification,
        year_of_passing_out,
        startup_associated,
        contact_number,
        email_address,
        linkedIn_ID,
        password,
        "1",
        "1",
      ],
      (err, result) => {
        if (err) {
          reject({ STATUS: err });
        } else {
          resolve({ STATUS: result });
        }
      }
    );
  });
};
const UpdateMentorModel = async (
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
) => {
  return new Promise((resolve, reject) => {
    client.query(
      "UPDATE add_mentor SET mentor_name=$1,mento_description=$2, years_of_exp=$3, area_of_expertise=$4,designation=$5,institution=$6,qualification=$7,year_of_passing_out=$8,startup_assoc=$9,contact_num=$10,email_address=$11, linkedIn_id=$12 where mentor_id=$13",
      [
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
      ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
const FetchMentorDataModel = () => {
  return new Promise((resolve, reject) => {
    client.query("SELECT * FROM add_mentor", (err, result) => {
      if (err) {
        reject({ STATUS: err });
      } else {
        resolve({ STATUS: result });
      }
    });
  });
};
const MentorCountData = () => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT COUNT(email_address) AS count FROM add_mentor",
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const MentorDeleteData = (id) => {
  return new Promise((resolve, reject) => {
    client.query(
      `DELETE FROM add_mentor WHERE mentor_id=$1`,
      [id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const MentorScheduleModel = (
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
) => {
  return new Promise((resolve, reject) => {
    if (meeting_mode === "virtual" && !meeting_link) {
      return reject(new Error("Meeting link is required for virtual meetings"));
    }
    if (meeting_mode === "offline" && !meeting_location) {
      return reject(
        new Error("Meeting location is required for offline meetings")
      );
    }
    client.query(
      "INSERT INTO schedule_meetings (mentor_reference_id,start_up_name,founder_name,meeting_mode,meeting_link,meeting_location,participants,date,time,meeting_duration,meeting_agenda,startup_id) VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9,$10,$11,$12)",
      [
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
      ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const FetchMeetingsModel = (mentor_id) => {
  return new Promise((resolve, reject) => {
    client.query(
      "select * from  schedule_meetings WHERE trim(mentor_reference_id) = trim($1)",
      [mentor_id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      }
    );
  });
};
const TestimonialModel = (mentor_ref_id, name, role, description) => {
  return new Promise((resolve, reject) => {
    client.query(
      "INSERT INTO testimonials (mentor_ref_id,name,role, description) VALUES ($1, $2, $3,$4)",
      [mentor_ref_id, name, role, description],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};
const FetchTestimonialModel = (mentor_id) => {
  return new Promise((resolve, reject) => {
    client.query("SELECT * FROM testimonials", (err, result) => {
      if (err) {
        reject({ STATUS: err });
      } else {
        resolve({ STATUS: result });
      }
    });
  });
};

const UpdateTestimonialModel = async (name, role, description, id) => {
  return new Promise((resolve, reject) => {
    client.query(
      `UPDATE testimonials 
       SET name=$1,role=$2,description=$3
       WHERE testimonial_id =$4`,
      [name, role, description, id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0]);
        }
      }
    );
  });
};

const DeleteTestimonialModel = (id) => {
  return new Promise((resolve, reject) => {
    client.query(
      "DELETE from testimonials where testimonial_id=$1",
      [id],
      (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const MeetingFeedbackModel = (
  meet_id,
  mentor_id,
  startup_id,
  feedback_text
) => {
  return new Promise((resolve, reject) => {
    if (meet_id == null || startup_id == null || !mentor_id || !feedback_text) {
      return reject(
        new Error("One or more required fields are undefined or null")
      );
    }
    client.query(
      "INSERT INTO meeting_feedback (meet_id,mentor_id,startup_id,feedback_text) VALUES ($1,$2,$3,$4)",
      [meet_id, mentor_id, startup_id, feedback_text],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const UpdateFeedbackModel = async (
  feedback_text,
  feedback_id
) => {
  return new Promise((resolve, reject) => {
    client.query(
      "UPDATE meeting_feedback SET feedback_text =$1 where feedback_id=$2",
      [feedback_text,feedback_id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const FetchMeetingFeedbackModel = (mentor_id, startup_id) => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT * from meeting_feedback where mentor_id = $1 AND startup_id = $2",
      [mentor_id, startup_id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

module.exports = {
  AddMentorModel,
  UpdateMentorModel,
  FetchMentorDataModel,
  MentorCountData,
  MentorDeleteData,
  MentorScheduleModel,
  FetchMeetingsModel,
  TestimonialModel,
  FetchTestimonialModel,
  UpdateTestimonialModel,
  DeleteTestimonialModel,
  MeetingFeedbackModel,
  UpdateFeedbackModel,
  FetchMeetingFeedbackModel,
};
