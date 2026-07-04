const md5 = require("md5");
const { AddMentorModel, CheckMentorUserByEmail, CreateMentorUser } = require("../../../model/AddMentorModel");
const { invalidateMentorCaches } = require("../../../utils/queryCache");
const { ExpressValidator, check, checkExact } = require("express-validator");
const validator = require("validator");
const EmailValid = require("../../../validation/EmailValid");
const PhoneNumberValid = require("../../../validation/PhoneNumberValid");
const { uploadToS3 } = require("../../../utils/s3Upload");
const generatePassword = require("../../../utils/GeneratePassword");
const sendMentorCredentials = require("../../../components/SendMentorCredentials");
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
    tag,
    representing_from,
  } = professional;
  const { contact_number, email_address, linkedIn_ID } = contact;

  let mentor_logo_url = null;

  if (req.files?.mentor_logo?.[0]) {
    mentor_logo_url = await uploadToS3(req.files.mentor_logo[0], "mentor_logo");
  }

  if (!mentor_name || !contact_number || !email_address) {
    return res.status(400).send("All fields are required");
  } else if (!EmailValid(email_address)) {
    return res.status(401).send("Email is not Valid");
  } else if (!PhoneNumberValid(contact_number)) {
    return res.status(402).send("Phone number is not valid");
  } else {
    try {
      const existingUser = await CheckMentorUserByEmail(email_address);
      if (existingUser) {
        return res.status(409).json({ Error: "Email already registered" });
      }

      const generatedPassword = generatePassword();

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
        generatedPassword,
        tag,
        representing_from
      );

      if (result?.status === "duplicate_skipped") {
        return res.status(409).json({ Error: "Email already registered" });
      }

      const mentorId = result?.STATUS?.rows?.[0]?.mentor_id || null;

      await CreateMentorUser(
        email_address,
        generatedPassword,
        mentor_name,
        contact_number,
        mentorId
      );

      await sendMentorCredentials(email_address, generatedPassword, mentor_name);

      invalidateMentorCaches();
      res.status(200).json({
        status: "Mentor created and credentials sent",
        result,
      });
    } catch (err) {
      if (
        err?.STATUS?.code === "23505" &&
        err?.STATUS?.constraint === "mentors_pkey"
      ) {
        return res.status(409).json({ Error: "Email already registered" });
      } else if (
        err?.code === "23505" &&
        err?.constraint === "user_data_user_mail_key"
      ) {
        return res.status(409).json({ Error: "Email is already registered" });
      } else if (err?.STATUS?.code === "22001" || err?.code === "22001") {
        return res
          .status(413)
          .json({ Error: "Description cannot exceed 200 words" });
      }
      console.log(err);
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
