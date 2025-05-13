const { MentorDeleteData } = require("../../../model/AddMentorModel");

const DeleteMentorData = async (req, res) => {
  const mentorId = req.params.id;
  try {
    const deleted = await MentorDeleteData(mentorId);
    if (deleted) {
      res.status(200).json({ message: "Mentor deleted successfully" });
    } else {
      res.status(404).json({ message: "Mentor not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete mentor: " + error.message });
  }
};

module.exports = { DeleteMentorData };
