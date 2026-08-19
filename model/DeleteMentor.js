const { MentorDeleteData } = require("./AddMentorModel");

const DeleteMentorData = async (req, res) => {
  const mentorId = req.params.id;
  try {
    const result = await MentorDeleteData(mentorId);
    res.status(200).json(result);
  } catch (error) {
    if (error.code === "MENTOR_NOT_FOUND") {
      res.status(404).json({ message: "Mentor not found" });
      return;
    }
    res
      .status(500)
      .json({ error: "Failed to delete mentor: " + error.message });
  }
};

module.exports = { DeleteMentorData };
