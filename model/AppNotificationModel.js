const client = require("../utils/conn");

const toIntegerOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const toIdStringOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
};

const clampLimit = (value, fallback = 20) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), 50);
};

const buildRecipientParams = (user) => ({
  role: toIntegerOrNull(user?.role),
  startupId: toIdStringOrNull(user?.startup_id),
  mentorId: toIdStringOrNull(user?.mentor_id),
  userMail: user?.user_mail || null,
});

const audienceFilterSql = (tableAlias = "") => {
  const prefix = tableAlias ? `${tableAlias}.` : "";
  return `(
    ($1::int = 2 AND ${prefix}recipient_role = 2)
    OR (
      $1::int = 5
      AND (
        ${prefix}recipient_startup_id::text = $2
        OR (
          $4::text IS NOT NULL
          AND ${prefix}recipient_user_mail = $4
          AND (${prefix}recipient_role IS NULL OR ${prefix}recipient_role = 5)
        )
      )
    )
    OR (
      $1::int = 6
      AND (
        ${prefix}recipient_mentor_id::text = $3
        OR (
          $4::text IS NOT NULL
          AND ${prefix}recipient_user_mail = $4
          AND (${prefix}recipient_role IS NULL OR ${prefix}recipient_role = 6)
        )
      )
    )
    OR (
      $1::int IS NOT NULL
      AND $1::int NOT IN (2, 5, 6)
      AND (
        ${prefix}recipient_role = $1
        OR ${prefix}recipient_startup_id::text = $2
        OR ${prefix}recipient_mentor_id::text = $3
        OR ($4::text IS NOT NULL AND ${prefix}recipient_user_mail = $4)
      )
    )
  )`;
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
        toIdStringOrNull(row.recipient_startup_id),
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

const fetchAppNotificationsForUser = (user, options = {}) => {
  const { role, startupId, mentorId, userMail } = buildRecipientParams(user);
  const limit = clampLimit(options.limit, 20);
  const beforeCreatedAt = options.beforeCreatedAt || null;
  const pageLimit = limit + 1;

  return new Promise((resolve, reject) => {
    client.query(
      `SELECT n.*
       FROM app_notifications n
       LEFT JOIN mentor_session_requests msr
         ON n.source_table = 'mentor_session_requests'
         AND n.source_id::text = msr.id::text
       WHERE ${audienceFilterSql("n")}
         AND ($5::timestamptz IS NULL OR n.created_at < $5::timestamptz)
         AND NOT (
           n.recipient_role = 2
           AND n.type = 'mentorship'
           AND n.event = 'pending'
           AND msr.id IS NOT NULL
           AND msr.status <> 'pending'
         )
       ORDER BY n.created_at DESC
       LIMIT $6`,
      [role, startupId, mentorId, userMail, beforeCreatedAt, pageLimit],
      (listErr, listResult) => {
        if (listErr) {
          reject(listErr);
          return;
        }

        client.query(
          `SELECT COUNT(*)::int AS unread_count
           FROM app_notifications n
           LEFT JOIN mentor_session_requests msr
             ON n.source_table = 'mentor_session_requests'
             AND n.source_id::text = msr.id::text
           WHERE n.read_at IS NULL
             AND ${audienceFilterSql("n")}
             AND NOT (
               n.recipient_role = 2
               AND n.type = 'mentorship'
               AND n.event = 'pending'
               AND msr.id IS NOT NULL
               AND msr.status <> 'pending'
             )`,
          [role, startupId, mentorId, userMail],
          (countErr, countResult) => {
            if (countErr) {
              reject(countErr);
              return;
            }

            const rows = Array.isArray(listResult.rows) ? listResult.rows : [];
            const hasMore = rows.length > limit;
            const notifications = hasMore ? rows.slice(0, limit) : rows;
            const last = notifications[notifications.length - 1];

            resolve({
              notifications,
              unreadCount: countResult.rows?.[0]?.unread_count || 0,
              pagination: {
                limit,
                hasMore,
                nextCursor: hasMore && last ? last.created_at : null,
              },
            });
          }
        );
      }
    );
  });
};

/** Clear admin inbox items for a processed mentor session request. */
const markAdminMentorshipSessionNotificationsRead = (sessionRequestId) => {
  const sourceId = toIdStringOrNull(sessionRequestId);
  if (!sourceId) return Promise.resolve([]);

  return new Promise((resolve, reject) => {
    client.query(
      `UPDATE app_notifications
       SET read_at = CURRENT_TIMESTAMP
       WHERE read_at IS NULL
         AND recipient_role = 2
         AND source_table = 'mentor_session_requests'
         AND source_id::text = $1
       RETURNING id`,
      [sourceId],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows);
      }
    );
  });
};

const markNotificationsReadForUser = (user) => {
  const { role, startupId, mentorId, userMail } = buildRecipientParams(user);

  return new Promise((resolve, reject) => {
    client.query(
      `UPDATE app_notifications
       SET read_at = CURRENT_TIMESTAMP
       WHERE read_at IS NULL
         AND ${audienceFilterSql("")}
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
  markAdminMentorshipSessionNotificationsRead,
  markNotificationsReadForUser,
  scheduleMeetingAndAcceptSession,
};
