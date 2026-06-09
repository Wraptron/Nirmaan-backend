const {
  insertAppNotifications,
  markAdminMentorshipSessionNotificationsRead,
} = require("../model/AppNotificationModel");

const ROLES = { ADMIN: 2, STARTUP: 5, MENTOR: 6 };

const sessionMetadata = (row) => ({
  startup_name: row.startup_name,
  startup_id: row.startup_id,
  mentor_name: row.mentor_name,
  mentor_id: row.mentor_id,
  requested_date: row.requested_date,
  requested_time: row.requested_time,
  duration: row.duration,
  session_mode: row.session_mode,
  agenda: row.agenda,
  requested_by: row.requested_by,
  status: row.status,
});

const notifyMentorshipSessionPending = async (row) => {
  try {
    await insertAppNotifications([
      {
        type: "mentorship",
        event: "pending",
        title: "New mentor session request",
        body: `${row.startup_name || "A startup"} requested a session${
          row.mentor_name ? ` with ${row.mentor_name}` : ""
        }.`,
        recipient_role: ROLES.ADMIN,
        source_table: "mentor_session_requests",
        source_id: row.id,
        metadata: sessionMetadata({ ...row, status: "pending" }),
      },
    ]);
  } catch (err) {
    console.error("notifyMentorshipSessionPending:", err);
  }
};

const dismissAdminPendingSessionNotification = async (row) => {
  if (!row?.id) return;
  try {
    await markAdminMentorshipSessionNotificationsRead(row.id);
  } catch (err) {
    console.error("dismissAdminPendingSessionNotification:", err);
  }
};

const notifyMentorshipSessionRejected = async (row) => {
  await dismissAdminPendingSessionNotification(row);
  const meta = sessionMetadata({ ...row, status: "rejected" });
  const rows = [];
  if (row.mentor_id) {
    rows.push({
      type: "mentorship",
      event: "rejected",
      title: "Session request declined",
      body: `Request from ${row.startup_name || "startup"} was declined.`,
      recipient_mentor_id: row.mentor_id,
      source_table: "mentor_session_requests",
      source_id: row.id,
      metadata: meta,
    });
  }
  if (row.startup_id != null) {
    rows.push({
      type: "mentorship",
      event: "rejected",
      title: "Session request declined",
      body: `Your request with ${row.mentor_name || "mentor"} was declined.`,
      recipient_startup_id: row.startup_id,
      source_table: "mentor_session_requests",
      source_id: row.id,
      metadata: meta,
    });
  }
  try {
    await insertAppNotifications(rows);
  } catch (err) {
    console.error("notifyMentorshipSessionRejected:", err);
  }
};

const notifyMentorshipSessionAccepted = async (row, meetingDate, meetingTime) => {
  await dismissAdminPendingSessionNotification(row);
  const meta = sessionMetadata({
    ...row,
    status: "accepted",
    requested_date: meetingDate || row.requested_date,
    requested_time: meetingTime || row.requested_time,
  });
  const rows = [];
  if (row.mentor_id) {
    rows.push({
      type: "mentorship",
      event: "accepted",
      title: "Meeting scheduled",
      body: `Meeting with ${row.startup_name || "startup"} is confirmed.`,
      recipient_mentor_id: row.mentor_id,
      source_table: "mentor_session_requests",
      source_id: row.id,
      metadata: meta,
    });
  }
  if (row.startup_id != null) {
    rows.push({
      type: "mentorship",
      event: "accepted",
      title: "Session confirmed",
      body: `Your session with ${row.mentor_name || "mentor"} is confirmed.`,
      recipient_startup_id: row.startup_id,
      source_table: "mentor_session_requests",
      source_id: row.id,
      metadata: meta,
    });
  }
  try {
    await insertAppNotifications(rows);
  } catch (err) {
    console.error("notifyMentorshipSessionAccepted:", err);
  }
};

const notifyMentorshipSessionCancelled = async ({
  meeting,
  sessionRow,
  reason,
}) => {
  const startupName =
    sessionRow?.startup_name || meeting?.start_up_name || "startup";
  const mentorName = sessionRow?.mentor_name || "mentor";
  const meta = {
    ...sessionMetadata({
      ...(sessionRow || {}),
      status: "cancelled",
      requested_date: meeting?.date || sessionRow?.requested_date,
      requested_time: meeting?.time || sessionRow?.requested_time,
    }),
    meet_id: meeting?.meet_id,
    cancellation_reason: reason,
    cancelled_at: meeting?.cancelled_at || null,
  };

  const rows = [];

  if (sessionRow?.mentor_id || meeting?.mentor_reference_id) {
    rows.push({
      type: "mentorship",
      event: "cancelled",
      title: "Session cancelled",
      body: `You cancelled your session with ${startupName}.`,
      recipient_mentor_id: sessionRow?.mentor_id || meeting?.mentor_reference_id,
      source_table: "schedule_meetings",
      source_id: meeting?.meet_id,
      metadata: meta,
    });
  }

  if (sessionRow?.startup_id != null || meeting?.startup_id != null) {
    rows.push({
      type: "mentorship",
      event: "cancelled",
      title: "Session cancelled by mentor",
      body: `Your session with ${mentorName} was cancelled.`,
      recipient_startup_id:
        sessionRow?.startup_id != null ? sessionRow.startup_id : meeting.startup_id,
      source_table: "schedule_meetings",
      source_id: meeting?.meet_id,
      metadata: meta,
    });
  }

  if (!rows.length) return;
  try {
    await insertAppNotifications(rows);
  } catch (err) {
    console.error("notifyMentorshipSessionCancelled:", err);
  }
};

module.exports = {
  notifyMentorshipSessionPending,
  notifyMentorshipSessionRejected,
  notifyMentorshipSessionAccepted,
  notifyMentorshipSessionCancelled,
};
