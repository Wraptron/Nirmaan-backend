
const { FetchTestimonials } = require("../../../model/TestimonialModel");
const { sendErrorResponse } = require("../../../utils/sendErrorResponse");

const FetchTestimonial = async (req, res) => {
const mentor_ref_id = req.params.mentor_ref_id;
  if (mentor_ref_id) {
    try {
      const result = await FetchTestimonials(mentor_ref_id);
      res.status(200).json(result);
    } catch (err) {
      sendErrorResponse(res, 500, 'Internal Server Error', err);
    }
  } else {
    res.status(400).json({ error: "Params missing" });
  }
};

module.exports = {
  FetchTestimonial,
};
