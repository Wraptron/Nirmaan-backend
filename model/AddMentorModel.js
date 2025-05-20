const client = require("../utils/conn"); // DB client (pg)
const md5 = require("md5");

// Add mentor
const AddMentorModel = (
  mentor_name,
  mentor_logo,
  mentor_description,
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
  return new Promise((resolve, reject) => {
    const mentorLogo= `/uploads/${mentor_logo || ""}`;
    const hashedId = md5(email_address);
    client.query(
      `INSERT INTO add_mentor (
        mentor_id, mentor_name, mentor_logo, mento_description,
        years_of_exp, area_of_expertise, designation, institution,
        qualification, year_of_passing_out, startup_assoc, contact_num,
        email_address, linkedIn_id, password, hashkey, user_role
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        hashedId,
        mentor_name,
        mentorLogo,
        mentor_description,
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
        if (err) reject({ STATUS: err });
        else resolve({ STATUS: result });
      }
    );
  });
};

// Fetch all mentors
const FetchMentorDataModel = () => {
  return new Promise((resolve, reject) => {
    client.query("SELECT * FROM add_mentor", (err, result) => {
      if (err) reject({ STATUS: err });
      else resolve({ STATUS: result });
    });
  });
};

// Count mentors
const MentorCountData = () => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT COUNT(email_address) AS count FROM add_mentor",
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

// DELETE mentor
const MentorDeleteData = (id) => {
  return new Promise((resolve, reject) => {
    // Start a transaction
    client.query('BEGIN', async (err) => {
      if (err) {
        return reject({ error: "Failed to start transaction: " + err.message });
      }

      try {
        // Delete related records first
        await client.query('DELETE FROM mentor_schedule WHERE mentor_mail = (SELECT email_address FROM add_mentor WHERE mentor_id = $1)', [id]);
        await client.query('DELETE FROM testimonials WHERE mentor_ref_id = $1', [id]);
        await client.query('DELETE FROM schedule_meetings WHERE mentor_reference_id = $1', [id]);
        
        // Finally delete the mentor
        const result = await client.query(
          "DELETE FROM add_mentor WHERE mentor_id = $1 RETURNING *",
          [id]
        );

        // Commit the transaction
        await client.query('COMMIT');
        resolve(result.rows[0]);
      } catch (err) {
        // Rollback in case of error
        await client.query('ROLLBACK');
        reject({ error: "Failed to delete mentor and related records: " + err.message });
      }
    });
  });
};

// Schedule a mentor meeting
const MentorScheduleModel = (
  select_startup,
  select_mentor,
  schedule_date,
  schedule_time,
  description
) => {
  return new Promise((resolve, reject) => {
    client.query(
      "INSERT INTO mentor_schedule (startup, mentor_mail, date, time, description) VALUES ($1, $2, $3, $4, $5)",
      [
        select_startup,
        select_mentor,
        schedule_date,
        schedule_time,
        description,
      ],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

module.exports = {
  AddMentorModel,
  FetchMentorDataModel,
  MentorCountData,
  MentorDeleteData,
  MentorScheduleModel,
};
