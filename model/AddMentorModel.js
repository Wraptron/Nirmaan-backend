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
  linkedIn_ID
) => {
  const mentorId = uuidv4();
  return new Promise(async(resolve, reject) => {
   const check = await client.query(
     "SELECT 1 FROM mentors WHERE email_address = $1",
     [email_address] // the email you want to insert
   );

   if (check.rows.length > 0) {
     // Duplicate email found — skip inserting
     return resolve({
       status: "duplicate_skipped",
     });
   }

    client.query(
      "INSERT INTO mentors(mentor_id, mentor_name,mentor_logo,mento_description, years_of_exp, area_of_expertise, designation, institution, qualification, year_of_passing_out, startup_assoc, contact_num, email_address, linkedIn_id, hashkey, user_role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
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
  mentor_logo,
  mentor_id
) => {
  return new Promise((resolve, reject) => {
    client.query(
      "UPDATE mentors SET mentor_name=$1,mento_description=$2, years_of_exp=$3, area_of_expertise=$4,designation=$5,institution=$6,qualification=$7,year_of_passing_out=$8,startup_assoc=$9,contact_num=$10,email_address=$11, linkedIn_id=$12, mentor_logo=$13 where mentor_id=$14",
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
        mentor_logo,
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
    client.query("SELECT * FROM mentors", (err, result) => {
      if (err) {
        reject({ STATUS: err });
      } else {
        resolve({ STATUS: result });
      }
    });
  });
};

const FetchMentorNameByIdModel = (mentor_id) => {
  return new Promise((resolve, reject) => {
    if (!mentor_id) {
      resolve(null);
      return;
    }
    client.query(
      "SELECT mentor_name FROM mentors WHERE mentor_id = $1 LIMIT 1",
      [mentor_id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0]?.mentor_name || null);
        }
      }
    );
  });
};
const MentorCountData = () => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT COUNT(email_address) AS count FROM mentors",
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
      `DELETE FROM mentors WHERE mentor_id=$1`,
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
      "SELECT * FROM schedule_meetings WHERE mentor_reference_id = $1",
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

const FetchMeetingsByStartupIdModel = (startup_id) => {
  return new Promise((resolve, reject) => {
    if (startup_id == null || startup_id === "") {
      resolve([]);
      return;
    }
    client.query(
      `SELECT sm.*, md.mentor_name
       FROM schedule_meetings sm
       LEFT JOIN mentors md ON sm.mentor_reference_id::text = md.mentor_id::text
       WHERE sm.startup_id::text = $1::text
       ORDER BY sm.date DESC, sm.time DESC`,
      [String(startup_id)],
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

// Fetch meetings WITH mentor name & image
const FetchMeetingsWithMentorDetailsModel = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        sm.meet_id,
        sm.start_up_name,
        sm.date,
        sm.time,
        sm.meeting_duration,
        sm.startup_id,
        md.mentor_id,
        md.mentor_name,
        md.mentor_logo
      FROM schedule_meetings sm
      JOIN mentors md
        ON sm.mentor_reference_id = md.mentor_id
      ORDER BY sm.date DESC
    `;

    client.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  });
};

const MEETING_CANCEL_NOTICE_MS = 24 * 60 * 60 * 1000;

const formatMeetingDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value).slice(0, 10);
};

const getMeetingStartTimestamp = (date, time) => {
  const dateKey = formatMeetingDateKey(date);
  if (!dateKey) return NaN;
  const timePart = String(time || "00:00:00");
  const [hours = 0, minutes = 0, seconds = 0] = timePart
    .split(":")
    .map((part) => Number(part));
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return NaN;
  return new Date(year, month - 1, day, hours, minutes, seconds || 0).getTime();
};

const isMeetingCancellationTooLate = (date, time) => {
  const startMs = getMeetingStartTimestamp(date, time);
  if (!Number.isFinite(startMs)) return true;
  return startMs - Date.now() < MEETING_CANCEL_NOTICE_MS;
};

const DeleteMeetingModal = (id) => {
  return new Promise((resolve, reject) => {
    client.query(
      "DELETE from schedule_meetings where meet_id=$1",
      [id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
};

const cancelScheduledMeetingByMentorModel = async ({
  meetingId,
  mentorId,
  reason,
  cancelledBy,
}) => {
  const db = await client.connect();
  try {
    await db.query("BEGIN");

    const existingMeeting = await db.query(
      `SELECT *
       FROM schedule_meetings
       WHERE meet_id = $1
         AND mentor_reference_id::text = $2::text
         AND COALESCE(status, 'scheduled') = 'scheduled'
       LIMIT 1`,
      [meetingId, String(mentorId)]
    );

    if (!existingMeeting.rows.length) {
      throw new Error("Meeting not found or already cancelled.");
    }

    const scheduledMeeting = existingMeeting.rows[0];
    if (
      isMeetingCancellationTooLate(
        scheduledMeeting.date,
        scheduledMeeting.time
      )
    ) {
      throw new Error("CANCELLATION_TOO_LATE");
    }

    const meetingResult = await db.query(
      `UPDATE schedule_meetings
       SET status = 'cancelled',
           cancellation_reason = $3,
           cancelled_at = NOW(),
           cancelled_by = $4
       WHERE meet_id = $1
         AND mentor_reference_id::text = $2::text
         AND COALESCE(status, 'scheduled') = 'scheduled'
       RETURNING *`,
      [meetingId, String(mentorId), reason, cancelledBy || null]
    );

    if (!meetingResult.rows.length) {
      throw new Error("Meeting not found or already cancelled.");
    }

    const meeting = meetingResult.rows[0];
    let sessionRow = null;

    if (meeting.session_request_id) {
      const byId = await db.query(
        `UPDATE mentor_session_requests
         SET status = 'cancelled'
         WHERE id = $1
           AND status = 'accepted'
         RETURNING *`,
        [meeting.session_request_id]
      );
      sessionRow = byId.rows[0] || null;
    }

    if (!sessionRow) {
      const fallback = await db.query(
        `UPDATE mentor_session_requests
         SET status = 'cancelled'
         WHERE mentor_id::text = $1::text
           AND startup_id::text = $2::text
           AND requested_date = $3
           AND LEFT(requested_time::text, 5) = LEFT($4::text, 5)
           AND status = 'accepted'
         RETURNING *`,
        [
          String(mentorId),
          meeting.startup_id != null ? String(meeting.startup_id) : "",
          meeting.date,
          meeting.time,
        ]
      );
      sessionRow = fallback.rows[0] || null;
    }

    await db.query("COMMIT");
    return { meeting, sessionRow };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
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
      "SELECT * FROM meeting_feedback WHERE mentor_id::text = $1::text AND startup_id::text = $2::text",
      [String(mentor_id), String(startup_id)],
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
  FetchMentorNameByIdModel,
  MentorCountData,
  MentorDeleteData,
  MentorScheduleModel,
  FetchMeetingsModel,
  FetchMeetingsByStartupIdModel,
  FetchMeetingsWithMentorDetailsModel,
  TestimonialModel,
  FetchTestimonialModel,
  UpdateTestimonialModel,
  DeleteTestimonialModel,
  MeetingFeedbackModel,
  UpdateFeedbackModel,
  FetchMeetingFeedbackModel,
  DeleteMeetingModal,
  cancelScheduledMeetingByMentorModel,
};
