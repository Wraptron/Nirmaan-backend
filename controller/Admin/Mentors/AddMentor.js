const md5 = require("md5");
const { AddMentorModel, updateMentorProfileModel } = require("../../../model/AddMentorModel");
const { ExpressValidator, check, checkExact } = require("express-validator");
const validator = require("validator");
const EmailValid = require("../../../validation/EmailValid");
const PhoneNumberValid = require("../../../validation/PhoneNumberValid");
const {AwsModel} = require('../../../model/AwsModel')
const AddMentor = async (req, res) => {
  const choose_logo = req.file;
  //const { description, professional, contact } = req.body;
  // const description = JSON.parse(req.body.description);
  // const professional = JSON.parse(req.body.professional);
  // const contact = JSON.parse(req.body.contact);
  
  let description, professional, contact;

  try {
    description = JSON.parse(req.body.description);
    professional = JSON.parse(req.body.professional);
    contact = JSON.parse(req.body.contact);
  } catch (err) {
    return res.status(400).json({ Error: "Invalid JSON format in request body" });
  }
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
  //console.log(choose_logo.path);
  // try
  // {
  //   const url = choose_logo ? choose_logo.filename : "";
  //   //console.log(url)
  //   console.log(typeof(url))
  //   // if(url)
  //   // {
  //   //   const data = AwsModel(url);
  //   //    console.log(data)
  //   // }
    
  // }
  // catch(err)
  // {
  //   console.log(err);
  // }
  if (!mentor_name || !contact_number || !email_address || !password) {
    return res.status(400).send("All fields are required");
  } else if (!EmailValid(email_address)) {
    return res.status(401).send("Email is not Valid");
  } else if (!PhoneNumberValid(contact_number)) {
    return res.status(402).send("Phone number is not valid");
  } else {
    try {
      const url = choose_logo ? await AwsModel(choose_logo) : ""
      const result = await AddMentorModel(
        mentor_name,
        url,
        // choose_logo,
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
      // console.log(url)
      res.status(200).send(result);
    } catch (err) {
      // res.send(err);
      console.log(err);
      if (err.code === "23505") {
        res.status(409).json({ Error: "Contact number already exists" });
      } else {
        //console.log(err);
        res.status(500).json({ Error: "Internal Server Error" });
      }
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
const updateMentorProfile = async(req, res) => {
      const {mentor_id} = req.params;
      const mentor_profile = req.file;
      //let mentor_photoo;
      try
      {
        const url = mentor_profile ? await AwsModel(mentor_profile) : "";
        const result = await updateMentorProfileModel(url, mentor_id)
        res.status(200).json(result);
      }
      catch(err)
      {
        res.status(400).json("Invalid Format");
      }

}   
module.exports = {AddMentor, updateMentorProfile};
