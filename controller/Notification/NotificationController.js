const {
  fetchAppNotificationsForUser,
  markNotificationsReadForUser,
} = require("../../model/AppNotificationModel");

const getNotifications = async (req, res) => {
  try {
    const payload = await fetchAppNotificationsForUser(req.user, {
      limit: req.query.limit,
      beforeCreatedAt: req.query.before,
    });
    res.status(200).json(payload);
  } catch (err) {
    console.error("getNotifications:", err);
    res.status(500).json({ message: "Failed to load notifications." });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const marked = await markNotificationsReadForUser(req.user);
    res.status(200).json({ markedCount: marked.length });
  } catch (err) {
    console.error("markNotificationsRead:", err);
    res.status(500).json({ message: "Failed to update notifications." });
  }
};

module.exports = { getNotifications, markNotificationsRead };
