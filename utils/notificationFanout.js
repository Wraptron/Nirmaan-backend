const {
  insertAppNotifications,
  markAdminMentorshipSessionNotificationsRead,
  markAdminPendingFundingNotificationsRead,
} = require("../model/AppNotificationModel");

const ROLES = { ADMIN: 2, FINANCE: 3, STARTUP: 5, MENTOR: 6 };

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

const fundingMetadata = (row) => ({
  startup_id: row.startup_id,
  startup_name: row.startup_name,
  project_name: row.project_name,
  funding_type: row.funding_type,
  amount: row.amount,
  purpose: row.purpose,
  funding_date: row.funding_date,
  reference_number: row.reference_number,
  status: row.status,
});

const notifyFundingUtilizationPending = async (row) => {
  if (!row?.id) return;
  const amountLabel = Number(row.amount || 0).toLocaleString("en-IN");
  const body = `${row.startup_name || "A startup"} submitted utilization request of Rs. ${amountLabel} for ${row.project_name || "a project"}.`;
  try {
    await insertAppNotifications([
      {
        type: "funding",
        event: "pending",
        title: "New funding utilization request",
        body,
        recipient_role: ROLES.ADMIN,
        source_table: "update_funding",
        source_id: row.id,
        metadata: fundingMetadata({ ...row, status: "pending" }),
      },
    ]);
  } catch (err) {
    console.error("notifyFundingUtilizationPending:", err);
  }
};

const dismissAdminPendingFundingNotification = async (row) => {
  if (!row?.id) return;
  try {
    await markAdminPendingFundingNotificationsRead(row.id);
  } catch (err) {
    console.error("dismissAdminPendingFundingNotification:", err);
  }
};

const notifyFundingUtilizationAcceptedByAdmin = async (row) => {
  if (!row?.id) return;
  await dismissAdminPendingFundingNotification(row);
  const amountLabel = Number(row.amount || 0).toLocaleString("en-IN");
  const meta = fundingMetadata({ ...row, status: "approved" });
  try {
    await insertAppNotifications([
      {
        type: "funding",
        event: "accepted",
        title: "Funding utilization approved",
        body: `Admin approved utilization request of Rs. ${amountLabel} from ${row.startup_name || "a startup"} for ${row.project_name || "a project"}.`,
        recipient_role: ROLES.FINANCE,
        source_table: "update_funding",
        source_id: row.id,
        metadata: meta,
      },
    ]);
  } catch (err) {
    console.error("notifyFundingUtilizationAcceptedByAdmin:", err);
  }
};

const notifyFundingUtilizationRejected = async (row, rejectionReason = null) => {
  if (!row?.id) return;
  await dismissAdminPendingFundingNotification(row);
  const amountLabel = Number(row.amount || 0).toLocaleString("en-IN");
  const meta = fundingMetadata({
    ...row,
    status: "rejected",
    rejection_reason: rejectionReason || row.rejection_reason || null,
  });
  const rows = [];
  if (row.startup_id != null) {
    rows.push({
      type: "funding",
      event: "rejected",
      title: "Funding utilization declined",
      body: `Your utilization request of Rs. ${amountLabel} for ${row.project_name || "a project"} was declined.`,
      recipient_startup_id: row.startup_id,
      source_table: "update_funding",
      source_id: row.id,
      metadata: meta,
    });
  }
  if (!rows.length) return;
  try {
    await insertAppNotifications(rows);
  } catch (err) {
    console.error("notifyFundingUtilizationRejected:", err);
  }
};

module.exports = {
  notifyMentorshipSessionPending,
  notifyMentorshipSessionRejected,
  notifyMentorshipSessionAccepted,
  notifyFundingUtilizationPending,
  notifyFundingUtilizationAcceptedByAdmin,
  notifyFundingUtilizationRejected,
};
