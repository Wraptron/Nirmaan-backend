const {AddStartupModel, StartupDataModel, FetchStartupsModel, UpdateStartupStatusModel, IndividualStarupModel, CreateTeamUser, TopStartupsSectors, StartupDeleteData} = require('../../../model/StartupModel');
const EmailValid = require('../../../validation/EmailValid');
const PhoneNumberValid = require('../../../validation/PhoneNumberValid');
const AddStartup = async(req, res) => {
    const {basic, official, founder, description} = req.body;

    const{startup_name, startup_program, startup_sector, startup_type, startup_industry, startup_tech, program, Community, cohort} = basic;

    const{official_contact_number, official_email_address, website_link, linkedin_id, mentor_associated, registration_number, password} = official;

    const{founder_name, founder_email, founder_number, founder_gender, founder_student_id, linkedInid} = founder;

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
            const result = await AddStartupModel(basic, official, founder, description, official_email_address);
            // if(result)
            // {
            //     try 
            //     {
            //         let response = await CreateTeamUser(founder_email, founder_number, official_email_address); 
            //         res.status(200).send(response);     
            //     }
            //     catch(err)
            //     {
            //         res.status(501).send(err)
            //     }
            // }
            res.status(200).send(result);
        }
        catch(err)
        {
                res.status(500).send(err);
        }
    }
}

const FetchStartupDatainNumbers = async (req, res) => {
  try {
    const result = await StartupDataModel();
    const startupData = {
      startup_total: result.TotalCountStartups.rows[0].startup_total,
      active_startups: result.ActiveStartups.rows[0].active,
      dropped_startups: result.DroppedStartups.rows[0].dropped_status,
      graduated_startups: result.GraduatedStartups.rows[0].graduated_status,
      Mentors: {
        Session_Total: parseInt(
          result.TotalMentoringSessions.rows[0].session_total
        ),
      },
    };
    res.status(200).json(startupData); // ✅ This was missing
  } catch (err) {
    res.status(500).json(err);
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
            project_timeline: {
                label: "In Progress", // or fetch from DB if available
            },
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