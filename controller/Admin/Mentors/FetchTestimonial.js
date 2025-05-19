
const { FetchTestimonials } = require("../../../model/TestimonialModel");

const FetchTestimonial = async (req, res) => {
const mentor_ref_id = req.params.mentor_ref_id;
//   console.log("mentor_reference_id" ,mentor_ref_id)
  if (mentor_ref_id) {
    try {
      const result = await FetchTestimonials(mentor_ref_id);
      res.status(200).json(result);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("Params missing");
  }
};

module.exports = {
  FetchTestimonial,
};
