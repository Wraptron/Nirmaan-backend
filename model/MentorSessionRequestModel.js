const client = require("../utils/conn");

const normalizeStartupId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  return value;
};

const formatDateKey = (value) => {
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

const formatTimeSlot = (time_slot) => {
  const value = String(time_slot);
  return value.length >= 5 ? value.slice(0, 5) : value;
};


const fetchStartupNameById = (startupId) => {
  return new Promise((resolve, reject) => {
    const id = startupId;
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
        startup_id,
        startup_name,
        mentor_id,
        mentor_name,
        requested_date,
        requested_time,
        duration,
        session_mode,
        agenda || "",
        requested_by,
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
      [normalizeStartupId(startupId)],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

const fetchMentorSessionRequestsByStartupId = (startupId) => {
  return new Promise((resolve, reject) => {
    const id = normalizeStartupId(startupId);
    if (id === null) {
      resolve([]);
      return;
    }
    client.query(
      `SELECT *
       FROM mentor_session_requests
       WHERE startup_id::text = $1::text
       ORDER BY created_at DESC`,
      [String(id)],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

/** Slots held by pending or accepted session requests (rejected frees the slot). */
const fetchBookedSlotsByMentorId = (mentorId) => {
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT requested_date, requested_time, session_mode
       FROM mentor_session_requests
       WHERE mentor_id::text = $1
         AND status IN ('pending', 'accepted')
       ORDER BY requested_date ASC, requested_time ASC`,
      [String(mentorId)],
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        const grouped = {};
        result.rows.forEach((row) => {
          const dateKey = formatDateKey(row.requested_date);
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push({
            time_slot: formatTimeSlot(row.requested_time),
            mode: normalizeSessionMode(row.session_mode),
          });
        });
        resolve(grouped);
      }
    );
  });
};

const normalizeSessionMode = (mode) => {
  const value = String(mode || "").trim();
  if (value === "In-person" || value.toLowerCase() === "in-person") {
    return "In-person";
  }
  if (value === "Offline" || value.toLowerCase() === "offline") {
    return "In-person";
  }
  return "Online";
};

const mentorSlotIsTaken = (mentorId, requestedDate, requestedTime, mode) => {
  const normalized = formatTimeSlot(requestedTime);
  const normalizedMode = normalizeSessionMode(mode);
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT 1
       FROM mentor_session_requests
       WHERE mentor_id::text = $1
         AND requested_date = $2
         AND LEFT(requested_time::text, 5) = $3
         AND session_mode = $4
         AND status IN ('pending', 'accepted')
       LIMIT 1`,
      [String(mentorId), requestedDate, normalized, normalizedMode],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rowCount > 0);
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
  fetchMentorSessionRequestsByStartupId,
  fetchBookedSlotsByMentorId,
  mentorSlotIsTaken,
  updateMentorSessionRequestStatus,
};
