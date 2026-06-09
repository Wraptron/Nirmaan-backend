const { sendErrorResponse } = require("../../../utils/sendErrorResponse");

const WorkRequestController = async (req, res) => {
  try {
    const { data } = req.body;
    res.status(200).json({ data });
  } catch (error) {
    sendErrorResponse(res, 500, "Internal Server Error", error);
  }
};

module.exports = WorkRequestController;
