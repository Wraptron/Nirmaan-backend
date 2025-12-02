const {
  AddStartupModel,
  StartupDataModel,
  FetchStartupsModel,
  UpdateStartupPersonalInfoModel,
  AddAwardModel,
  FetchAwardModel,
  UpdateAwardModel,
  DeleteAwardModal,
  UpdateStartupAboutModel,
  UpdateStartupStatusModel,
  IndividualStarupModel,
  CreateTeamUser,
  TopStartupsSectors,
  UpdateStartupFounderModel,
  StartupDeleteData,
  UpdateStartupMentorDetailsModel,
  AddFounderModel,
  FetchFounderModel,
  CheckUserByEmail,
} = require("../../../model/StartupModel");
const EmailValid = require("../../../validation/EmailValid");
const PhoneNumberValid = require("../../../validation/PhoneNumberValid");
const generatePassword = require("../../../utils/GeneratePassword");
const sendStartupCredentials = require("../../../components/SendStartupCredentials");
const { v4: uuidv4 } = require("uuid");
const md5 = require("md5");
const { uploadToS3 } = require("../../../utils/s3Upload");

// const AddStartup = async(req, res) => {
//     const {basic, official, founder, description} = req.body;

//     const{startup_name, startup_program, startup_sector, startup_type, startup_industry, startup_tech, program, community, cohort} = basic;

//     const{official_contact_number, official_email_address, website_link, linkedin_id, role_of_faculty, mentor_associated, registration_number, password} = official;

//     const{founder_name, founder_email, founder_number, founder_gender, founder_student_id, academic_background, linkedInid} = founder;

//     const{logo, startup_description} = description;

//     if(!startup_name || !official_email_address || !program || !description)
//     {
//         res.status(400).json("Please fill necessary fields");
//     }
//     else if(!EmailValid(official_email_address))
//     {
//         res.status(401).json("Email Not Valid")
//     }
//     else
//     {
//         try
//         {
//             // 1. Add startup
//             const result = await AddStartupModel(basic, official, founder, description, official_email_address);

//             // 2. Generate password
//             const password = generatePassword();

//             // 3. Create user in user_data
//             const userId = uuidv4();
//             await CreateTeamUser(official_email_address, password, founder_name, founder_number, founder_email, userId);

//             // 4. Send credentials email
//             await sendStartupCredentials(official_email_address, password);

//             res.status(200).json({status: "Startup created and credentials sent"});
//         }
//         catch(err)
//         {
//             console.error("Error in AddStartup:", err); // Add this line
//             res.status(500).json({ error: err.message || err });
//         }
//     }
// }

const AddStartup = async (req, res) => {
  try {
    const { basic, official, founder, description } = req.body;
  // Extract fields from basic section
    const {
      startup_name,
      startup_program,
      startup_sector,
      startup_type,
      startup_industry,
      startup_tech, // Note: frontend sends as startup_technology, but we transform it
      program,
      community, // Note: frontend sends as startup_Community, but we transform it
      cohort,
    } = basic;

    // Extract fields from official section
    const {
      official_contact_number,
      official_email_address,
      website_link,
      linkedin_id,
      role_of_faculty,
      mentor_associated,
      registration_number, // Note: frontend sends as cin_registration_number, but we transform it
      password,
      // Additional fields that might be needed
      dpiit_number,
      funding_stage,
      official_registered,
      pia_state,
      scheme,
    } = official;

    // Extract fields from founder section
    const {
      founder_name,
      founder_email,
      founder_number,
      founder_gender,
      founder_student_id,
      academic_background,
      linkedInid,
    } = founder;

    // Extract fields from description section
    const { logo, startup_description } = description;

    // Validation
    if (
      !startup_name ||
      !official_email_address ||
      !program ||
      !startup_description
    ) {
      return res.status(400).json({
        error: "Please fill necessary fields",
        missing_fields: {
          startup_name: !startup_name,
          official_email_address: !official_email_address,
          program: !program,
          startup_description: !startup_description,
        },
      });
    }

    if (!EmailValid(official_email_address)) {
      return res.status(401).json({ error: "Email Not Valid" });
    }
 const existingUser = await CheckUserByEmail(official_email_address);

if (existingUser) {
  return res.status(400).json({
    error: "Email is already registered",
  });
}
    // 1. Add startup
    const result = await AddStartupModel(
      basic,
      official,
      founder,
      description,
      official_email_address
    );


    // 2. Generate password
    const generatedPassword = generatePassword();

    // 3. Create user in user_data
    const startup_id = result.rows[0].user_id;
    const userId = uuidv4();
    await CreateTeamUser(
      official_email_address,
      generatedPassword,
      founder_name,
      founder_number,
      founder_email,
      startup_id
    );

    // 4. Send credentials email
    await sendStartupCredentials(official_email_address, generatedPassword);

    res.status(200).json({
      status: "Startup created and credentials sent",
      result: result,
    });
  } catch (err) {
    // console.error("Error in AddStartup:", err);
    res.status(500).json({
      error: err.message || err,
      details: "Server Error: Something went wrong. Please try again.",
    });
  }
};

const FetchStartupDatainNumbers = async (req, res) => {
  try {
    const result = await StartupDataModel();
    const startupData = {
      startup_total: result?.TotalCountStartups?.rows?.[0]?.startup_total || 0,
      active_startups: result?.ActiveStartups?.rows?.[0]?.active || 0,
      dropped_startups: result?.DroppedStartups?.rows?.[0]?.program_count || 0,
      graduated_startups:
        result?.GraduatedStartups?.rows?.[0]?.program_count || 0,
      akshar: result?.AksharStartups?.rows?.[0]?.program_count || 0,
      pratham: result?.PrathamStartups?.rows?.[0]?.program_count || 0,
      IITMIC: result?.IITMIC?.rows?.[0]?.program_count || 0,
      PIA: result?.PIA?.rows?.[0]?.program_count || 0,
      Mentors: {
        Session_Total: parseInt(
          result?.TotalMentoringSessions?.rows?.[0]?.session_total || 0
        ),
      },
    };

    res.status(200).json(startupData);
  } catch (err) {
    console.error("Error in FetchStartupDatainNumbers:", err.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const FetchStartupData = async (req, res) => {
  try {
    const result = await FetchStartupsModel();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

const UpdateStatus = async (req, res) => {
  const { startup_status, official_email_address } = req.query;
  try {
    const result = await UpdateStartupStatusModel(
      startup_status,
      official_email_address
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

const IndividualStartups = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await IndividualStarupModel(id);
    const IndStartupData = {
      generalData: result.GeneralData.rows,
      FundingDistributes: result.FundingDistributes.rows,
    };
    res.status(200).json(IndStartupData);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

const TopStartupsSectorsCont = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await TopStartupsSectors(id);
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

const TeamDocuments = async (req, res) => {
  try {
    res.send("Hello");
  } catch (err) {
    res.status(500).json(err);
  }
};

const DeleteStartupData = async (req, res) => {
  const id = req.params.id;
  // console.log("Deleting startup with email:", id);

  if (id) {
    try {
      const result = await StartupDeleteData(id);
      res.status(200).json(result);
    } catch (err) {
      // console.error("Delete error:", err);
      res.status(500).send(err);
    }
  } else {
    res.status(400).send("Params missing");
  }
};

const FetchStartupProfile = async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    // You need to implement this model function to fetch by email
    const result = await IndividualStarupModel(email);

    // Map your DB result to the frontend structure
    const profile = {
      image: result.GeneralData.rows[0]?.logo || "", // adjust as per your DB
      name: result.GeneralData.rows[0]?.startup_name || "",
      status: result.GeneralData.rows[0]?.startup_status || "",
      official_email_address:
        result.GeneralData.rows[0]?.official_email_address || "",
      contact_number: result.GeneralData.rows[0]?.official_contact_number || "",
      community: result.GeneralData.rows[0]?.community || "",
      about: result.GeneralData.rows[0]?.startup_description || "",
      startup_type: result.GeneralData.rows[0]?.startup_type || "",
      startup_domain: result.GeneralData.rows[0]?.startup_domain || "",
      sector: result.GeneralData.rows[0]?.startup_sector || "",
      program: result.GeneralData.rows[0]?.startup_program || "",
      awards: [], // Fill this if you have awards data
      mentors: result.GeneralData.rows[0]?.mentor_associated || "",
      faculty: result.GeneralData.rows[0]?.faculty || "",
      cohort: result.GeneralData.rows[0]?.cohort || "",
      cin: result.GeneralData.rows[0]?.registration_number || "",
      industry: result.GeneralData.rows[0]?.startup_industry || "",
      technology: result.GeneralData.rows[0]?.startup_tech || "",
      year_of_graduation: result.GeneralData.rows[0]?.year_of_graduation || "",
      graduated_to: result.GeneralData.rows[0]?.graduated_to || "",
      dpiit_number: result.GeneralData.rows[0]?.dpiit_number || "",
      current_funding_state:
        result.GeneralData.rows[0]?.current_funding_state || "",
      officially_registered_as:
        result.GeneralData.rows[0]?.officially_registered_as || "",
      pia: result.GeneralData.rows[0]?.pia || "",
    };

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const UpdateStartupDetails = async (req, res) => {
  try {
    const requester = req.user;

    const {
      startup_name,
      startup_status,
      official_contact_number,
      email_address,
      linkedin,
      website_link,
      startup_id,
    } = req.body;

    // ---------- IMAGE UPLOADS ----------
    let profile_image_url = null;
    let background_image_url = null;

    if (req.files?.profile_image?.[0]) {
      profile_image_url = await uploadToS3(
        req.files.profile_image[0],
        "profile_images"
      );
    }

    if (req.files?.background_image?.[0]) {
      background_image_url = await uploadToS3(
        req.files.background_image[0],
        "background_images"
      );
    }

    // ---------- STRUCTURE BASIC + OFFICIAL ----------
    const basic = {
      startup_name: startup_name || "",
      profile_image: profile_image_url || null,
      background_image: background_image_url || null,
    };

    const official = {
      official_contact_number: official_contact_number || "",
      linkedin_id: linkedin || "",
      website_link: website_link || "",
      email_address: email_address || "",
    };

    // ---------- DB UPDATE ----------
    const result = await UpdateStartupPersonalInfoModel(
      { basic, official, startup_status, startup_id },
      requester
    );
    // Handle unauthorized
    if (result?.code === 401) {
      return res.status(401).json(result);
    }

    return res.status(200).json({
      message: "Startup details updated successfully",
      result,
      uploaded_images: { profile_image_url, background_image_url },
    });

  } catch (err) {
    console.error("Update failed:", err);
    return res.status(500).json({ error: "Failed to update startup details" });
  }
};
// const UpdateStartupDetails = async (req, res) => {
//   try {
//     const requester = req.user;
//     const {
//       startup_name,
//       startup_status,
//       official_contact_number,
//       email_address,
//       linkedin,
//       website_link,
//       startup_id,
//     } = req.body;

//     // ========= IMAGE UPLOADS ===========
//     let profile_image_url = null;
//     let background_image_url = null;

//     if (req.files && req.files.profile_image) {
//       profile_image_url = await uploadToS3(
//         req.files.profile_image[0],
//         "profile_images"
//       );
//     }

//     if (req.files && req.files.background_image) {
//       background_image_url = await uploadToS3(
//         req.files.background_image[0],
//         "background_images"
//       );
//     }

//     // ========= BASIC + OFFICIAL ==========
//     const basic = {
//       startup_name,
//       profile_image: profile_image_url || null,
//       background_image: background_image_url || null,
//     };

//     const official = {
//       official_contact_number: official_contact_number || "",
//       linkedin_id: linkedin || "",
//       website_link: website_link || "",
//       email_address: email_address,
//     };

//     // ========= DATABASE UPDATE ==========
//     const result = await UpdateStartupPersonalInfoModel({
//       basic,
//       official,
//       startup_status,
//       startup_id,
//     });

//     res.status(200).json({
//       message: "Startup details updated successfully",
//       result,
//       uploaded_images: {
//         profile_image_url,
//         background_image_url,
//       },
//     });
//   } catch (err) {
//     console.error("Update failed:", err);
//     res.status(500).json({ error: "Failed to update startup details" });
//   }
// }
//working fine version
// const UpdateStartupDetails = async (req, res) => {
//   try {
//     const {
//       startup_name,
//       startup_status,
//       official_contact_number,
//       email_address,
//       linkedin,
//       website_link,
//       startup_id,
//     } = req.body;

//     const basic = {
//       startup_name,
//     };
//     const official = {
//       official_contact_number: official_contact_number || "",
//       linkedin_id: linkedin || "",
//       website_link: website_link || "",
//       email_address: email_address,
//     };
//     const result = await UpdateStartupPersonalInfoModel({
//       basic,
//       official,
//       startup_status,
//       startup_id,
//     });
//     // console.log("req.body:", req.body);
//     res.status(200).json({
//       message: "Startup details updated successfully",
//       result,
//     });
//   } catch (err) {
//     // console.error("Update failed:", err);
//     res.status(500).json({ error: "Failed to update startup details" });
//   }
// };

// const UpdateStartupAbout = async (req, res) => {
//   try {
//     const {
//       sector,
//       program,
//       startup_type,
//       email_address
//     } = req.body;

//     if (!email_address) {
//       return res.status(400).json({ error: "Missing email_address" });
//     }

//     const basic = {
//       startup_type,
//       startup_sector: sector || "",
//       program
//     };

//     const result = await UpdateStartupAboutModel({ basic, email_address });

//     res.status(200).json({
//       message: "Startup details updated successfully",
//       result
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update startup details" });
//   }
// };

// const UpdateStartupMentorDetailsModel = async (req, res) => {
//   try {
//     const {
//     startup_yog,
//     graduated_to,
//     startup_cohort,
//     startup_industry,
//     startup_technology,
//     scheme,
//     pia_state,
//     dpiit_number,
//     role_of_faculty,
//     mentor_associated,
//     official_registered,
//     cin_registration_number,
//     official_email_address
//     } = req.body;

//     if (!email_address) {
//       return res.status(400).json({ error: "Missing email_address" });
//     }

//     const basic = {
//     startup_yog,
//     graduated_to,
//     startup_cohort,
//     startup_industry,
//     startup_technology,
//     scheme,
//     pia_state,
//     dpiit_number,
//     role_of_faculty,
//     mentor_associated,
//     official_registered,
//     cin_registration_number,
//     official_email_address
//     };

//     const result = await UpdateStartupMentorDetailsModel({ basic, official });

//     res.status(200).json({
//       message: "Startup details updated successfully",
//       result
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update startup details" });
//   }
// };

const UpdateStartupAbout = async (req, res) => {
  try {
    const {
      sector,
      program,
      startup_type,
      startup_domain,
      about,
      startup_status,
      email_address,
    } = req.body;

    if (!email_address) {
      return res.status(400).json({ error: "Missing email_address" });
    }

    const basic = {
      startup_type,
      startup_domain,
      startup_sector: sector || "",
      program,
    };
    const description = {
      startup_description: about || "",
    };

    const result = await UpdateStartupAboutModel({
      basic,
      email_address,
      description,
      startup_status,
    });
    console.log(req.body);
    res.status(200).json({
      message: "Startup details updated successfully",
      result,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update startup details" });
  }
};

const UpdateStartupMentorDetails = async (req, res) => {
  try {
    const {
      mentors,
      role_of_faculty,
      cin_registration_number,
      year_of_graduation,
      funding_stage,
      industry,
      graduated_to,
      officially_registered,
      cohort,
      technology,
      dpiit_number,
      pia,
      email_address,
    } = req.body;

    if (!email_address || email_address.trim() === "") {
      return res
        .status(400)
        .json({ error: "Email address is required for update" });
    }

    const basic = {
      startup_yog: year_of_graduation || "",
      graduated_to: graduated_to || "",
      startup_cohort: cohort || "",
      startup_industry: industry || "",
      startup_technology: technology || "",
    };

    const official = {
      scheme: "Default Scheme",
      pia_state: pia || "",
      dpiit_number: dpiit_number || "",
      role_of_faculty,
      funding_stage: funding_stage || "",
      mentor_associated: mentors || "",
      official_registered: officially_registered || "",
      cin_registration_number: cin_registration_number || "",
      official_email_address: email_address,
    };

    const result = await UpdateStartupMentorDetailsModel({ basic, official });
    res
      .status(200)
      .json({ message: "Startup details updated successfully", result });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Failed to update startup details" });
  }
};


const AddAward = async (req, res) => {

  try {
    const document_url = req.file ? req.file.path : null;
    const {
      award_name,
      award_org,
      prize_money,
      awarded_date,
      description,
      official_email_address,
      startup_id,
    } = req.body;

    const result = await AddAwardModel(
      official_email_address,
      award_name,
      award_org,
      prize_money,
      awarded_date,
      document_url,
      description,
      startup_id
    );

    res.status(201).json({ message: "Award added successfully", result });
  } catch (err) {
    console.error("Backend Error (addAward):", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

const FetchAwardData = async (req, res) => {
  try {
    const result = await FetchAwardModel();
    res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};

const UpdateAward = async (req, res) => {
  try {
    const {
      award_name,
      award_org,
      prize_money,
      awarded_date,
      document_url,
      description,
      id,
    } = req.body;

    const result = await UpdateAwardModel(
      award_name,
      award_org,
      prize_money,
      awarded_date,
      document_url,
      description,
      id
    );

    res.status(200).json({
      message: "Award updated successfully",
      result,
    });
  } catch (err) {
    console.error("Error in UpdateAward:", err);
    res.status(500).json({ error: "Failed to update award details" });
  }
};
const DeleteAward = async (req, res) => {
  const id = req.params.id;

  if (id) {
    try {
      const result = await DeleteAwardModal(id);
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(400).send("params missing");
  }
};


const AddFounder = async (req, res) => {
  try {
    // console.log('Founder payload:', req.body);
    const {
      founder_name,
      founder_designation,
      founder_email,
      founder_number,
      startup_id,
    } = req.body;

    const founder = {
      founder_name,
      founder_designation,
      founder_email,
      founder_number,
    };

    const result = await AddFounderModel(startup_id, founder);

    res
      .status(201)
      .json({ message: "Founder added successfully", data: result });
  } catch (err) {
    // console.error('Error in AddFounder controller:', err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

const FetchFounder = async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const allFounderData = await FetchFounderModel(userId);
    res.status(200).json(allFounderData);
  } catch (err) {
    // console.error("Error in FetchFundingAmount:", err.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const UpdateStartupFounder = async (req, res) => {
  try {
    const {
      founder_name,
      founder_email,
      founder_number,
      founder_designation,
      founder_id,
    } = req.body;

    if (!founder_email) {
      return res.status(400).json({ error: "Missing founder email" });
    }

    const founder = {
      founder_name,
      founder_email,
      founder_number,
      founder_designation,
      founder_id,
    };
    const result = await UpdateStartupFounderModel({ founder });
    res.status(200).json({
      message: "Startup details updated successfully",
      result,
    });
  } catch (err) {
    // console.error("Backend Error:", err); 
    res.status(500).json({ error: "Failed to update startup details" });
  }
};

module.exports = {
  AddStartup,
  UpdateStartupMentorDetails,
  FetchAwardData,
  AddAward,
  UpdateAward,
  DeleteAward,
  UpdateStartupFounder,
  UpdateStartupAbout,
  UpdateStartupDetails,
  FetchStartupDatainNumbers,
  FetchStartupData,
  UpdateStatus,
  IndividualStartups,
  TopStartupsSectorsCont,
  TeamDocuments,
  DeleteStartupData,
  FetchStartupProfile,
  AddFounder,
  FetchFounder,
};
