const client = require("../utils/conn");

const deleteMentorAvailabilityForDate = (mentor_id, avail_date) => {
  return new Promise((resolve, reject) => {
    client.query(
      `DELETE FROM mentor_availability
       WHERE mentor_id = $1 AND avail_date = $2`,
      [mentor_id, avail_date],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

const insertMentorAvailabilitySlots = (mentor_id, avail_date, slots) => {
  if (!slots.length) {
    return Promise.resolve({ rowCount: 0 });
  }

  const values = [];
  const params = [];
  let paramIndex = 1;

  slots.forEach((time_slot) => {
    values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
    params.push(mentor_id, avail_date, time_slot);
    paramIndex += 3;
  });

  return new Promise((resolve, reject) => {
    client.query(
      `INSERT INTO mentor_availability (mentor_id, avail_date, time_slot)
       VALUES ${values.join(", ")}`,
      params,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

const saveMentorAvailability = async (mentor_id, avail_date, slots) => {
  await deleteMentorAvailabilityForDate(mentor_id, avail_date);
  if (slots.length > 0) {
    await insertMentorAvailabilitySlots(mentor_id, avail_date, slots);
  }
};

const formatDateKey = (avail_date) => {
  if (!avail_date) return "";
  if (typeof avail_date === "string") {
    return avail_date.slice(0, 10);
  }
  if (avail_date instanceof Date) {
    const y = avail_date.getFullYear();
    const m = String(avail_date.getMonth() + 1).padStart(2, "0");
    const d = String(avail_date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(avail_date).slice(0, 10);
};

const formatTimeSlot = (time_slot) => {
  const value = String(time_slot);
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const fetchMentorAvailabilityByMentorId = (mentor_id) => {
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT avail_date, time_slot
       FROM mentor_availability
       WHERE mentor_id = $1
       ORDER BY avail_date ASC, time_slot ASC`,
      [mentor_id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

const groupAvailabilityByDate = (rows) => {
  const grouped = {};
  rows.forEach((row) => {
    const dateKey = formatDateKey(row.avail_date);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(formatTimeSlot(row.time_slot));
  });
  return grouped;
};

const mentorSlotExists = (mentor_id, avail_date, time_slot) => {
  const normalized = formatTimeSlot(time_slot);
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT 1
       FROM mentor_availability
       WHERE mentor_id = $1
         AND avail_date = $2
         AND LEFT(time_slot::text, 5) = $3
       LIMIT 1`,
      [mentor_id, avail_date, normalized],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rowCount > 0);
      }
    );
  });
};

module.exports = {
  saveMentorAvailability,
  fetchMentorAvailabilityByMentorId,
  groupAvailabilityByDate,
  mentorSlotExists,
};
