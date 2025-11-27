const md5 = require("md5");
const { AddMentorModel } = require("../../../model/AddMentorModel");
const { ExpressValidator, check, checkExact } = require("express-validator");
const validator = require("validator");
const EmailValid = require("../../../validation/EmailValid");
const PhoneNumberValid = require("../../../validation/PhoneNumberValid");
const { uploadToS3 } = require("../../../utils/s3Upload");
const AddMentor = async (req, res) => {
  const description = JSON.parse(req.body.description);
  const professional = JSON.parse(req.body.professional);
  const contact = JSON.parse(req.body.contact);
  const { mentor_name, mentor_description } = description;
  const {
    years_of_experience,
    area_of_expertise,
    current_designation,
    institution,
    qualification,
    year_of_passing_out,
    startup_associated,
  } = professional;
  const { contact_number, email_address, linkedIn_ID, password } = contact;

  let mentor_logo_url = null;

  if (req.files?.mentor_logo?.[0]) {
    mentor_logo_url = await uploadToS3(req.files.mentor_logo[0], "mentor_logo");
  }

  if (!mentor_name || !contact_number || !email_address || !password) {
    return res.status(400).send("All fields are required");
  } else if (!EmailValid(email_address)) {
    return res.status(401).send("Email is not Valid");
  } else if (!PhoneNumberValid(contact_number)) {
    return res.status(402).send("Phone number is not valid");
  } else {
    try {
      const result = await AddMentorModel(
        mentor_name,
        mentor_logo_url,
        mentor_description,
        years_of_experience,
        area_of_expertise,
        current_designation,
        institution,
        qualification,
        year_of_passing_out,
        startup_associated,
        contact_number,
        email_address,
        linkedIn_ID,
        password
      );
      res.status(200).send(result);
    } catch (err) {
      if (
        err.STATUS.code === "23505" &&
        err.STATUS.constraint === "add_mentor_pkey"
      ) {
        return res.status(409).json({ Error: "Email already registered" });
      }else if (
        err.STATUS.code === "22001") {
        return res
          .status(413)
          .json({ Error: "Description cannot exceed 200 words" });
        }
      return res.status(500).json({ Error: "Failed to Add Mentor" });
    }
  }
};

const randomString = (length) => {
  var chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".split("");
  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }
  var str = "";
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};
const updateMentorProfile = async (req, res) => {
  const { mentor_id } = req.params;
  const mentor_profile = req.file;
  //let mentor_photoo;
  try {
    const url = mentor_profile ? await AwsModel(mentor_profile) : "";
    const result = await updateMentorProfileModel(url, mentor_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json("Invalid Format");
  }
};
module.exports = { AddMentor, updateMentorProfile };
