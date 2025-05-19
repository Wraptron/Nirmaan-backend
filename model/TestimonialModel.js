const client = require("../utils/conn");

const TestimonialModel =(
    mentor_ref_id,
    name,
    role,
    description,
)=>{
    return new Promise((resolve,reject)=>{
        client.query (
            `INSERT INTO testimonials (
            mentor_ref_id,
            name,
            role,
            description

            )
            VALUES ($1,$2,$3,$4)`,
            [
                mentor_ref_id,
                name,
                role,
                description
            ],
            (err, result) => {
        if (err) {
          console.log("SQL INSERT ERROR:", err);
          reject({ STATUS: err });
        } else {
          resolve({ STATUS: result });
        }
    }
        )
    })
}
const FetchTestimonials = (mentor_ref_id) => {
    // console.log("mentor_reference_id:", mentor_ref_id); // Debug log
  return new Promise((resolve, reject) => {
    client.query(
      'SELECT * FROM testimonials WHERE mentor_ref_id = $1',
      [mentor_ref_id],
      (err, result) => {
        if (err) {
          console.log("SQL SELECT ERROR:", err);
          reject({ STATUS: err });
        } else {
          resolve({ STATUS: result });
        }
      }
    );
  });
};
module.exports={
    TestimonialModel,
    FetchTestimonials
}