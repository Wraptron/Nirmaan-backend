const { TestimonialModel } = require("../../../model/TestimonialModel");

const Testimonial = async (req, res) => {
  // Destructure values from the request body
  const {
     mentor_ref_id,
     name,
     role,
     description
  } = req.body;

  // Log the request body (for debugging)
//   console.log('Request Body:', req.body);

  try {
    // Check if any required field is missing
    if (
      !mentor_ref_id ||
      !name ||
      !role ||
      !description
    ) {
      return res.status(400).send("All required fields must be provided");
    }

    const result = await TestimonialModel(
       mentor_ref_id,
       name,
       role,
       description,
    );

    res.status(200).send(result);
  } catch (err) {
    console.log(err);

    if (err.code === "23505") {
      // Handle duplicate key error
      res.status(409).send("Conflict: Meeting already exists");
    } else {
      res.status(500).json({ Error: "Internal Server Error" });
    }
  }
};

module.exports = Testimonial;