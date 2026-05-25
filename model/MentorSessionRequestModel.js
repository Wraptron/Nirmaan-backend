const client = require("../utils/conn");

const toIntegerOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const fetchStartupNameById = (startupId) => {
  return new Promise((resolve, reject) => {
    const id = toIntegerOrNull(startupId);
    if (id === null) {
      resolve(null);
      return;
    }
    client.query(
      `SELECT basic::jsonb->>'startup_name' AS startup_name
       FROM test_startup
       WHERE user_id = $1
       LIMIT 1`,
      [id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0]?.startup_name || null);
        }
      }
    );
  });
};

const insertMentorSessionRequest = (payload) => {
  const {
    startup_id,
    startup_name,
    mentor_id,
    mentor_name,
    requested_date,
    requested_time,
    duration,
    session_mode,
    agenda,
    requested_by,
  } = payload;

  return new Promise((resolve, reject) => {
    client.query(
      `INSERT INTO mentor_session_requests (
        startup_id, startup_name, mentor_id, mentor_name,
        requested_date, requested_time, duration, session_mode,
        agenda, requested_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING id, status, created_at`,
      [
        toIntegerOrNull(startup_id),
        startup_name,
        mentor_id || null,
        mentor_name || null,
        requested_date,
        requested_time,
        duration,
        session_mode,
        agenda || "",
        requested_by || null,
      ],
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

const fetchPendingMentorSessionRequests = () => {
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT *
       FROM mentor_session_requests
       WHERE status = 'pending'
       ORDER BY created_at DESC`,
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

const fetchMentorSessionRequestUpdatesForMentor = (mentorId) => {
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT *
       FROM mentor_session_requests
       WHERE status IN ('accepted', 'rejected')
         AND mentor_id::text = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [String(mentorId)],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

const fetchMentorSessionRequestUpdatesForStartup = (startupId) => {
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT *
       FROM mentor_session_requests
       WHERE status IN ('accepted', 'rejected')
         AND startup_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [toIntegerOrNull(startupId)],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

const updateMentorSessionRequestStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    client.query(
      `UPDATE mentor_session_requests
       SET status = $2
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id, status],
      (err, result) => {
        if (err) {
          reject(err);
        } else if (!result.rows.length) {
          resolve(null);
        } else {
          resolve(result.rows[0]);
        }
      }
    );
  });
};

module.exports = {
  fetchStartupNameById,
  insertMentorSessionRequest,
  fetchPendingMentorSessionRequests,
  fetchMentorSessionRequestUpdatesForMentor,
  fetchMentorSessionRequestUpdatesForStartup,
  updateMentorSessionRequestStatus,
};
