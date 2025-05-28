const client = require("../utils/conn");

// Add or update feedback (without mentor_id)
const AddFeedbackModel = (
  startup_id,
  rating,
  feedback_text,
  session_date,
  session_time
) => {
  return new Promise((resolve, reject) => {
    try {
      const checkQuery = `
        SELECT * FROM mentor_feedback 
        WHERE startup_id = $1 AND session_date = $2 AND session_time = $3
      `;

      client.query(
        checkQuery,
        [startup_id, session_date, session_time],
        (err, result) => {
          if (err) {
            console.error("Error checking existing feedback:", err);
            return reject({
              error: "Failed to check existing feedback",
              details: err.message,
            });
          }

          if (result.rows.length > 0) {
            // Update existing feedback
            const updateQuery = `
            UPDATE mentor_feedback 
            SET rating = $1, feedback_text = $2, updated_at = CURRENT_TIMESTAMP
            WHERE startup_id = $3 AND session_date = $4 AND session_time = $5
            RETURNING *
          `;

            client.query(
              updateQuery,
              [rating, feedback_text, startup_id, session_date, session_time],
              (err, result) => {
                if (err) {
                  console.error("Error updating feedback:", err);
                  return reject({
                    error: "Failed to update feedback",
                    details: err.message,
                  });
                }
                resolve(result.rows[0]);
              }
            );
          } else {
            // Insert new feedback
            const insertQuery = `
            INSERT INTO mentor_feedback (
              startup_id, rating, feedback_text, 
              session_date, session_time, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
          `;

            client.query(
              insertQuery,
              [startup_id, rating, feedback_text, session_date, session_time],
              (err, result) => {
                if (err) {
                  console.error("Error inserting feedback:", err);
                  return reject({
                    error: "Failed to insert feedback",
                    details: err.message,
                  });
                }
                resolve(result.rows[0]);
              }
            );
          }
        }
      );
    } catch (err) {
      console.error("Error in AddFeedbackModel:", err);
      reject({ error: "Failed to process feedback", details: err.message });
    }
  });
};

// Feedback fetch functions (unchanged unless mentor_id removal applies there too)
