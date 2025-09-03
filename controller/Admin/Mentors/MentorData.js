const {
  FetchMentorDataModel,
  MentorCountData,
  MentorDeleteData,
  TestimonialModel,
  FetchTestimonialModel,
  UpdateTestimonialModel,
  DeleteTestimonialModel,
  UpdateMentorModel,
} = require("../../../model/AddMentorModel");

const UpdateMentor=async(req,res)=>{
  try{
    const {
       mentor_name,mentor_description, years_of_experience, expertise, designation, institution, qualification, year_of_passing_out, startup_associated, contact_num, email_address, linkedin_iD,mentor_id
    }=req.body

    const result=await UpdateMentorModel(
       mentor_name,mentor_description, years_of_experience, expertise, designation, institution, qualification, year_of_passing_out, startup_associated, contact_num, email_address, linkedin_iD,mentor_id
    )
  
    res.status(200).json({
      message: "Mentor updated successfully",
      result,
    });
  } catch (err) {
    console.error("Error in UpdateMentor:", err);
    res.status(500).json({ error: "Failed to update Mentor details" });
  }

  }

const FetchMentorData = async (req, res) => {
  try {
    const result = await FetchMentorDataModel();
    res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};
const MentorCount = async (req, res) => {
  try {
    const result = await MentorCountData();
    res.status(200).json(result);
  } catch (err) {
    res.send(err);
  }
};
const DeleteMentorData = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  if (id) {
    try {
      const result = await MentorDeleteData(id);
      res.status(200).json(result);
    } catch (err) {
      res.send(err);
    }
  } else {
    res.send("Params missing");
  }
};

const Testimonial = async (req, res) => {
    try {
    const {mentor_ref_id, name, role, description } = req.body;
    const result = await TestimonialModel(mentor_ref_id,name, role, description);
   res.status(200).json({
      message: "Testimonial Updated successfully",
      result,
    });
  } catch (err) {
       console.error("Error inTestimonial :", err);
    res.status(500).json({ error: "Failed to update Testimonial details" });
  }
};

const FetchTestimonial = async (req, res) => {
  try {
    const result = await FetchTestimonialModel();
    res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};

const UpdateTestimonial = async (req, res) => {
  try {
    console.log(req.body)
    const {
     name,role, description,id
    } = req.body;

    const result = await UpdateTestimonialModel(
     name,role, description,id
    );

    res.status(200).json({
      message: "Testimonial  successfully",
      result,
    });
  } catch (err) {
    console.error("Error in UpdateTestimonial:", err);
    res.status(500).json({ error: "Failed to update Testimonial details" });
  }
};

const DeleteTestimonial=async (req,res)=>{
  const id=req.params.id
  if(id){
    try{
      const result=await DeleteTestimonialModel(id)
      res.status(200).send(result)
    }
    catch(err){
      console.log(err)
      res.status(500).send(err)
    }
  }else{
    res.status(400).send("id params missing")
  }
}
module.exports = {
  UpdateMentor,
  FetchMentorData,
  MentorCount,
  DeleteMentorData,
  Testimonial,
  FetchTestimonial,
  UpdateTestimonial,
  DeleteTestimonial
};
