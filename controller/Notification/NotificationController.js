const {
  fetchPendingMentorSessionRequests,
} = require("../../model/MentorSessionRequestModel");

const getNotifications = async (req, res) => {
  try {
    const result = await fetchPendingMentorSessionRequests();
    res.status(200).json({
      mentorSessionRequests: result.rows || [],
    });
  } catch (err) {
    console.error("getNotifications:", err);
    res.status(500).json({ message: "Failed to load notifications." });
  }
};

module.exports = { getNotifications };
