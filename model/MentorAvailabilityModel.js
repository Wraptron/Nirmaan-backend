const client = require("../utils/conn");

const VALID_MODES = ["Online", "In-person"];

const normalizeMode = (mode) => {
  const value = String(mode || "").trim();
  if (value === "In-person" || value.toLowerCase() === "in-person") {
    return "In-person";
  }
  if (value === "Offline" || value.toLowerCase() === "offline") {
    return "In-person";
  }
  return "Online";
};

const normalizeSlotEntry = (entry) => {
  if (typeof entry === "string") {
    return { time_slot: formatTimeSlot(entry), mode: "Online" };
  }
  if (entry && typeof entry === "object") {
    const time =
      entry.time_slot ?? entry.time ?? entry.slot ?? entry.timeSlot ?? "";
    return {
      time_slot: formatTimeSlot(time),
      mode: normalizeMode(entry.mode ?? entry.session_mode),
    };
  }
  return { time_slot: "", mode: "Online" };
};

const slotEntryKey = (entry) =>
  `${normalizeSlotEntry(entry).time_slot}|${normalizeSlotEntry(entry).mode}`;

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
  const normalized = slots
    .map(normalizeSlotEntry)
    .filter((entry) => entry.time_slot);

  if (!normalized.length) {
    return Promise.resolve({ rowCount: 0 });
  }

  const values = [];
  const params = [];
  let paramIndex = 1;

  normalized.forEach((entry) => {
    values.push(
      `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`
    );
    params.push(mentor_id, avail_date, entry.time_slot, entry.mode);
    paramIndex += 4;
  });

  return new Promise((resolve, reject) => {
    client.query(
      `INSERT INTO mentor_availability (mentor_id, avail_date, time_slot, session_mode)
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
      `SELECT avail_date, time_slot, session_mode
       FROM mentor_availability
       WHERE mentor_id = $1
       ORDER BY avail_date ASC, time_slot ASC, session_mode ASC`,
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
    grouped[dateKey].push({
      time_slot: formatTimeSlot(row.time_slot),
      mode: normalizeMode(row.session_mode),
    });
  });
  return grouped;
};

const mentorSlotExists = (mentor_id, avail_date, time_slot, mode) => {
  const normalizedTime = formatTimeSlot(time_slot);
  const normalizedMode = normalizeMode(mode);
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT 1
       FROM mentor_availability
       WHERE mentor_id = $1
         AND avail_date = $2
         AND LEFT(time_slot::text, 5) = $3
         AND session_mode = $4
       LIMIT 1`,
      [mentor_id, avail_date, normalizedTime, normalizedMode],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rowCount > 0);
      }
    );
  });
};

module.exports = {
  VALID_MODES,
  normalizeMode,
  normalizeSlotEntry,
  slotEntryKey,
  saveMentorAvailability,
  fetchMentorAvailabilityByMentorId,
  groupAvailabilityByDate,
  mentorSlotExists,
};
