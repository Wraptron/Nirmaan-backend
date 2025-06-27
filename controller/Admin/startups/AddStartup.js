const {AddStartupModel, StartupDataModel, FetchStartupsModel, UpdateStartupStatusModel, IndividualStarupModel, CreateTeamUser, TopStartupsSectors, StartupDeleteData} = require('../../../model/StartupModel');
const EmailValid = require('../../../validation/EmailValid');
const PhoneNumberValid = require('../../../validation/PhoneNumberValid');
const generatePassword = require('../../../utils/GeneratePassword');
const sendStartupCredentials = require('../../../components/SendStartupCredentials');
const { v4: uuidv4 } = require('uuid');
const md5 = require('md5');

const AddStartup = async(req, res) => {
    const {basic, official, founder, description} = req.body;

    const{startup_name, startup_program, startup_sector, startup_type, startup_industry, startup_tech, program, community, cohort} = basic;

    const{official_contact_number, official_email_address, website_link, linkedin_id, role_of_faculty, mentor_associated, registration_number, password} = official;

    const{founder_name, founder_email, founder_number, founder_gender, founder_student_id, academic_background, linkedInid} = founder;

    const{logo_image, startup_description} = description;

    if(!startup_name || !official_email_address || !program || !description)
    {
        res.status(400).json("Please fill necessary fields");
    }
    else if(!EmailValid(official_email_address))
    {
        res.status(401).json("Email Not Valid")
    }
    else
    {
        try
        {
            // 1. Add startup
            const result = await AddStartupModel(basic, official, founder, description, official_email_address);

            // 2. Generate password
            const password = generatePassword();

            // 3. Create user in user_data
            const userId = uuidv4();
            await CreateTeamUser(official_email_address, password, founder_name, founder_number, founder_email, userId);

            // 4. Send credentials email
            await sendStartupCredentials(official_email_address, password);

            res.status(200).json({status: "Startup created and credentials sent"});
        }
        catch(err)
        {
            console.error("Error in AddStartup:", err); // Add this line
            res.status(500).json({ error: err.message || err });
        }
    }
}

const FetchStartupDatainNumbers = async (req, res) => {
  try {
    const result = await StartupDataModel();
      const startupData = {
      startup_total: result?.TotalCountStartups?.rows?.[0]?.startup_total || 0,
      active_startups: result?.ActiveStartups?.rows?.[0]?.active || 0,
      dropped_startups: result?.DroppedStartups?.rows?.[0]?.dropped_status || 0,
      graduated_startups: result?.GraduatedStartups?.rows?.[0]?.program_count || 0,
      akshar: result?. AksharStartups?.rows?.[0]?.program_count || 0,
      pratham: result?. PrathamStartups?.rows?.[0]?.program_count || 0,
      Mentors: {
        Session_Total: parseInt(
          result?.TotalMentoringSessions?.rows?.[0]?.session_total || 0
        ),
      },
    };

    res.status(200).json(startupData);
  } catch (err) {
    console.error("Error in FetchStartupDatainNumbers:", err.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
};
const FetchStartupData = async(req,res) => {
    try 
    {
        const result = await FetchStartupsModel();
        res.status(200).json(result);
    }
    catch(err)
    {
        res.status(500).json(result);
  }
}

const UpdateStatus = async(req, res) => {
    const {startup_status, official_email_address} = req.query;
    try
    {
        const result = await UpdateStartupStatusModel(startup_status, official_email_address);
        res.status(200).json(result);
    }
    catch(err)
    {
        res.status(500).json(err);
    }
}


const IndividualStartups = async(req, res) => {
    const {id} = req.params
    try
    {
        const result = await IndividualStarupModel(id);
        const IndStartupData = {
            generalData : result.GeneralData.rows,
            FundingDistributes: result.FundingDistributes.rows
        }
        res.status(200).json(IndStartupData);
    }
    catch(err)
    {
        res.status(500).json(err.message);
    }
};

const TopStartupsSectorsCont = async(req, res) => {
    try 
    {
        const {id} = req.query
        const result = await TopStartupsSectors(id);
        res.send(result);
    }
    catch(err)
    {
        res.status(500).json(err)
    }
}

const TeamDocuments = async(req, res) => {
    try
    {
        res.send("Hello")
        
    }
    catch(err)
    {
        res.status(500).json(err)
    }
}

const DeleteStartupData = async (req, res) => {
    const email = req.params.email;
    console.log("Deleting startup with email:", email);

    if (email) {
        try {
            const result = await StartupDeleteData(email);
            res.status(200).json(result);
        } catch (err) {
            console.error("Delete error:", err);
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
            image: result.GeneralData.rows[0]?.logo_image || "", // adjust as per your DB
            name: result.GeneralData.rows[0]?.startup_name || "",
            status: result.GeneralData.rows[0]?.startup_status || "",
            official_email_address: result.GeneralData.rows[0]?.official_email_address || "",
            phone: result.GeneralData.rows[0]?.official_contact_number || "",
            community: result.GeneralData.rows[0]?.community || "",
            about: result.GeneralData.rows[0]?.startup_description || "",
            startup_type: result.GeneralData.rows[0]?.startup_type || "",
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
            current_funding_state: result.GeneralData.rows[0]?.current_funding_state || "",
            officially_registered_as: result.GeneralData.rows[0]?.officially_registered_as || "",
            pia: result.GeneralData.rows[0]?.pia || "",
        };

        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {AddStartup, FetchStartupDatainNumbers, FetchStartupData, UpdateStatus, IndividualStartups, TopStartupsSectorsCont, TeamDocuments,DeleteStartupData, FetchStartupProfile};