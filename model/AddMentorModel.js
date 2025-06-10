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

// Update mentor profile
const UpdateMentorModel = (
  mentor_id,
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
  linkedIn_ID
) => {
  return new Promise((resolve, reject) => {
    console.log('UpdateMentorModel received params:', {
      mentor_id,
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
      linkedIn_ID
    });

    // First verify the mentor exists
    client.query('SELECT mentor_id FROM add_mentor WHERE mentor_id = $1', [mentor_id], (err, result) => {
      if (err) {
        console.error('Error checking mentor existence:', err);
        return reject({ error: "Database error while checking mentor", details: err.message });
      }
      
      if (result.rows.length === 0) {
        return reject({ error: "Mentor not found with ID: " + mentor_id });
      }

      const mentorLogo = mentor_logo ? `/uploads/${mentor_logo}` : undefined;
      
      // Build the update query dynamically based on provided fields
      let updateFields = [];
      let values = [];
      let paramCount = 1;

      if (mentor_name) {
        updateFields.push(`mentor_name = $${paramCount}`);
        values.push(mentor_name);
        paramCount++;
      }
      if (mentorLogo) {
        updateFields.push(`mentor_logo = $${paramCount}`);
        values.push(mentorLogo);
        paramCount++;
      }
      if (mentor_description) {
        updateFields.push(`mento_description = $${paramCount}`);
        values.push(mentor_description);
        paramCount++;
      }
      if (years_of_experience) {
        updateFields.push(`years_of_exp = $${paramCount}`);
        values.push(years_of_experience);
        paramCount++;
      }
      if (area_of_expertise) {
        updateFields.push(`area_of_expertise = $${paramCount}`);
        values.push(area_of_expertise);
        paramCount++;
      }
      if (current_designation) {
        updateFields.push(`designation = $${paramCount}`);
        values.push(current_designation);
        paramCount++;
      }
      if (institution) {
        updateFields.push(`institution = $${paramCount}`);
        values.push(institution);
        paramCount++;
      }
      if (qualification) {
        updateFields.push(`qualification = $${paramCount}`);
        values.push(qualification);
        paramCount++;
      }
      if (year_of_passing_out) {
        updateFields.push(`year_of_passing_out = $${paramCount}`);
        values.push(year_of_passing_out);
        paramCount++;
      }
      if (startup_associated) {
        updateFields.push(`startup_assoc = $${paramCount}`);
        values.push(startup_associated);
        paramCount++;
      }
      if (contact_number) {
        updateFields.push(`contact_num = $${paramCount}`);
        values.push(contact_number);
        paramCount++;
      }
      if (email_address) {
        updateFields.push(`email_address = $${paramCount}`);
        values.push(email_address);
        paramCount++;
      }
      if (linkedIn_ID) {
        updateFields.push(`linkedIn_id = $${paramCount}`);
        values.push(linkedIn_ID);
        paramCount++;
      }

      // Add mentor_id as the last parameter
      values.push(mentor_id);

      if (updateFields.length === 0) {
        return reject({ error: "No fields to update" });
      }

      const query = `
        UPDATE add_mentor 
        SET ${updateFields.join(', ')}
        WHERE mentor_id = $${paramCount}
        RETURNING *
      `;

      console.log('Executing update query:', {
        query,
        values,
        paramCount
      });

      client.query(query, values, (err, result) => {
        if (err) {
          console.error('Error executing update query:', {
            error: err,
            message: err.message,
            code: err.code,
            detail: err.detail
          });
          reject({ 
            error: "Failed to update mentor",
            details: err.message,
            code: err.code
          });
        } else {
          if (result.rows.length === 0) {
            reject({ error: "Mentor not found after update attempt" });
          } else {
            console.log('Update successful:', result.rows[0]);
            resolve(result.rows[0]);
          }
        }
      });
    });
  });
};
//update mentor profile
const updateMentorProfileModel = (mentor_logo, mentor_id) => {
  return new Promise((resolve, reject) => {
        client.query(`UPDATE add_mentor SET mentor_logo=$1 WHERE mentor_id=$2`,[mentor_logo, mentor_id], (err, result) => {
              if(err)
              {
                  reject(err)
              }
              else
              {
                  resolve(result)
              }
        })
  })
}
module.exports = {
  AddMentorModel,
  FetchMentorDataModel,
  MentorCountData,
  MentorDeleteData,
  MentorScheduleModel,
  UpdateMentorModel,
  updateMentorProfileModel
};
