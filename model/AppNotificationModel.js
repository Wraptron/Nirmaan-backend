const client = require("../utils/conn");

const toIntegerOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const insertAppNotifications = (rows) => {
  if (!rows.length) return Promise.resolve([]);

  const values = [];
  const placeholders = rows
    .map((row, rowIndex) => {
      const base = rowIndex * 11;
      values.push(
        row.type,
        row.event,
        row.title,
        row.body || null,
        row.recipient_role ?? null,
        toIntegerOrNull(row.recipient_startup_id),
        row.recipient_mentor_id != null ? String(row.recipient_mentor_id) : null,
        row.recipient_user_mail || null,
        row.source_table || null,
        row.source_id != null ? String(row.source_id) : null,
        JSON.stringify(row.metadata || {})
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}::jsonb)`;
    })
    .join(", ");

  return new Promise((resolve, reject) => {
    client.query(
      `INSERT INTO app_notifications (
        type, event, title, body, recipient_role, recipient_startup_id,
        recipient_mentor_id, recipient_user_mail, source_table, source_id, metadata
      ) VALUES ${placeholders}
      RETURNING *`,
      values,
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

const fetchAppNotificationsForUser = (user) => {
  const role = toIntegerOrNull(user?.role);
  const startupId = toIntegerOrNull(user?.startup_id);
  const mentorId =
    user?.mentor_id != null && user?.mentor_id !== ""
      ? String(user.mentor_id)
      : null;
  const userMail = user?.user_mail || null;

  return new Promise((resolve, reject) => {
    client.query(
      `SELECT *
       FROM app_notifications
       WHERE read_at IS NULL
         AND (
           ($1::int IS NOT NULL AND recipient_role = $1)
           OR ($2::int IS NOT NULL AND recipient_startup_id = $2)
           OR ($3::text IS NOT NULL AND recipient_mentor_id::text = $3)
           OR ($4::text IS NOT NULL AND recipient_user_mail = $4)
         )
       ORDER BY created_at DESC
       LIMIT 50`,
      [role, startupId, mentorId, userMail],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

const markNotificationsReadForUser = (user) => {
  const role = toIntegerOrNull(user?.role);
  const startupId = toIntegerOrNull(user?.startup_id);
  const mentorId =
    user?.mentor_id != null && user?.mentor_id !== ""
      ? String(user.mentor_id)
      : null;
  const userMail = user?.user_mail || null;

  return new Promise((resolve, reject) => {
    client.query(
      `UPDATE app_notifications
       SET read_at = CURRENT_TIMESTAMP
       WHERE read_at IS NULL
         AND (
           ($1::int IS NOT NULL AND recipient_role = $1)
           OR ($2::int IS NOT NULL AND recipient_startup_id = $2)
           OR ($3::text IS NOT NULL AND recipient_mentor_id::text = $3)
           OR ($4::text IS NOT NULL AND recipient_user_mail = $4)
         )
       RETURNING id`,
      [role, startupId, mentorId, userMail],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

const scheduleMeetingAndAcceptSession = (meetingParams, sessionRequestId) => {
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
  } = meetingParams;

  return new Promise((resolve, reject) => {
    client.query("BEGIN", async (beginErr) => {
      if (beginErr) return reject(beginErr);
      try {
        const meetingResult = await new Promise((res, rej) => {
          client.query(
            `INSERT INTO schedule_meetings (
              mentor_reference_id, start_up_name, founder_name, meeting_mode,
              meeting_link, meeting_location, participants, date, time,
              meeting_duration, meeting_agenda, startup_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
            RETURNING meet_id`,
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
            (err, result) => (err ? rej(err) : res(result))
          );
        });

        let sessionRow = null;
        if (sessionRequestId) {
          const upd = await new Promise((res, rej) => {
            client.query(
              `UPDATE mentor_session_requests
               SET status = 'accepted'
               WHERE id = $1 AND status = 'pending'
               RETURNING *`,
              [sessionRequestId],
              (err, result) => (err ? rej(err) : res(result))
            );
          });
          if (!upd.rows.length) {
            throw new Error(
              "Session request not found or already processed."
            );
          }
          sessionRow = upd.rows[0];
        }

        await new Promise((res, rej) => {
          client.query("COMMIT", (err) => (err ? rej(err) : res()));
        });
        resolve({ meetingResult, sessionRow });
      } catch (e) {
        await new Promise((res) => {
          client.query("ROLLBACK", () => res());
        });
        reject(e);
      }
    });
  });
};

module.exports = {
  insertAppNotifications,
  fetchAppNotificationsForUser,
  markNotificationsReadForUser,
  scheduleMeetingAndAcceptSession,
};
