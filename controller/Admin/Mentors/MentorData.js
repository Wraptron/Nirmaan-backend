const { FetchMentorDataModel, MentorCountData, MentorDeleteData, UpdateMentorModel } = require("../../../model/AddMentorModel");
const EmailValid = require("../../../validation/EmailValid");
const PhoneNumberValid = require("../../../validation/PhoneNumberValid");

const FetchMentorData = async(req, res) => {
    try
    {
        const result = await FetchMentorDataModel();
        res.status(200).json(result);
    }
    catch(error)
    {
        res.send(error)
    }
}
const MentorCount = async(req, res) => {
    try 
    {
        const result = await MentorCountData();
        res.status(200).json(result);
    }
    catch(err)
    {
        res.send(err);
    }
}
const DeleteMentorData = async(req, res) => {
    const email_address = req.params.id;
    if(email_address)
    {
        try 
        {
            const result = await MentorDeleteData(email_address);
            res.status(200).json(result);
        }
        catch(err)
        {
            res.send(err);
        }
    }
    else
    {
        res.send("Params missing");
    }
}
const UpdateMentorData = async (req, res) => {
  const mentor_id = req.params.id;
  // Accept flat structure from frontend
  const {
    mentor_name,
    designation,
    about,
    email_address,
    contact_num,
    qualification,
    institution,
    year_of_passing_out,
    expertise,
    linkedin_id
  } = req.body;

  console.log('Update Mentor Request (flat):', {
    mentor_id,
    mentor_name,
    designation,
    about,
    email_address,
    contact_num,
    qualification,
    institution,
    year_of_passing_out,
    expertise,
    linkedin_id
  });

  if (!mentor_id) {
    return res.status(400).json({ error: "Mentor ID is required" });
  }

  try {
    // Validate email and phone if they are being updated
    if (email_address && !EmailValid(email_address)) {
      return res.status(401).json({ error: "Email is not valid" });
    }
    if (contact_num && !PhoneNumberValid(contact_num)) {
      return res.status(402).json({ error: "Phone number is not valid" });
    }

    // Map flat fields to model parameters
    const result = await UpdateMentorModel(
      mentor_id,
      mentor_name, // mentor_name
      undefined,   // mentor_logo (not provided in flat form)
      about,       // mentor_description
      undefined,   // years_of_experience (not provided in flat form)
      expertise,   // area_of_expertise
      designation, // current_designation
      institution, // institution
      qualification, // qualification
      year_of_passing_out, // year_of_passing_out
      undefined,   // startup_associated (not provided in flat form)
      contact_num, // contact_number
      email_address, // email_address
      linkedin_id   // linkedIn_ID
    );

    console.log('Update result:', result);
    res.status(200).json({ message: "Mentor updated successfully", data: result });
  } catch (err) {
    console.error("Detailed error in UpdateMentorData:", {
      error: err,
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack
    });
    
    if (err.code === "23505") {
      res.status(409).json({ error: "Email or contact number already exists" });
    } else {
      res.status(500).json({ 
        error: "Failed to update mentor",
        details: err.message,
        code: err.code
      });
    }
  }
};

module.exports = {
    FetchMentorData,
    MentorCount,
    DeleteMentorData,
    UpdateMentorData
};