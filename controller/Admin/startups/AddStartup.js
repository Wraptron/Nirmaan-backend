const {AddStartupModel, StartupDataModel, FetchStartupsModel, UpdateStartupStatusModel, IndividualStarupModel, CreateTeamUser, TopStartupsSectors} = require('../../../model/StartupModel');
const EmailValid = require('../../../validation/EmailValid');
const PhoneNumberValid = require('../../../validation/PhoneNumberValid');
const AddStartup = async(req, res) => {
    const {basic, official, founder, description} = req.body;

    const{startup_name, startup_program, startup_type, startup_industry, startup_tech, program, cohort} = basic;

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

const FetchStartupDatainNumbers = async(req, res) => {
    try
    {
        const result = await StartupDataModel();
        //res.send(result);
        const startupData = {
            startup_total: result.TotalCountStartups.rows[0].startup_total,
            active_startups: result.ActiveStartups.rows[0].active,
            dropped_startups: result.DroppedStartups.rows[0].dropped_status,
            graduated_startups: result.GraduatedStartups.rows[0].graduated_status,
            manufacturing_sector_startups: result.Manufacturing.rows[0].startup_manufacturing,
            services_sector_startups: result.Services.rows[0].startup_services,
            Edtech_sector_startups: result.Edtech.rows[0].startup_edtech,
            Agriculture_sector_startups: result.Agriculture.rows[0].startup_agriculture,
            Hardware_sector_startups: result.Hardware.rows[0].startup_hardware,
            Energy_sector_startups: result.Energy.rows[0].startup_energy,
            Ecommerce_sector_startups: result.Ecommerce.rows[0].startup_ecommerce,
            Social_sector_startups: result.Social.rows[0].startup_social,
            Software_sector_startups: result.SoftwareData.rows[0].startup_software,
            Mentors:{
                Session_Total: parseInt(result.TotalMentoringSessions.rows[0].session_total)
            },
            Funding_Distrubuted_data: {
                Pratham: {
                    Energy_pratham: parseInt(result.EnergyPratham.rows[0].energy_program_count),
                    Manufacturing_Pratham: parseInt(result.ManufacturingPratham.rows[0].manufacturing_program_count),
                    Hardware_Pratham: parseInt(result.HardwarePratham.rows[0].hardware_program_count),
                    Software_Pratham: parseInt(result.SoftwareDataPratham.rows[0].software_program_count),
                    Edtech_Pratham : parseInt(result.EdtechPratham.rows[0].edtech_program_count),
                    Services_Pratham: parseInt(result.ServicesPratham.rows[0].services_program_count),
                    Agriculture_Pratham: parseInt(result.AgriculturePratham.rows[0].agriculture_program_count),
                    Ecommerce_Pratham: parseInt(result.EcommercePratham.rows[0].ecommerce_program_count),
                    Social_Pratham: parseInt(result.SocialPratham.rows[0].social_program_count),
                
                    // Energy_pratham_count: parseInt(result.EnergyPratham.rows[0].energy_program_count),
                    // Manufacturing_Pratham_count: parseInt(result.ManufacturingPratham.rows[0].manufacturing_program_count),
                    // Hardware_Pratham_count: parseInt(result.HardwarePratham.rows[0].hardware_program_count),
                    // Software_Pratham_count: parseInt(result.SoftwareDataPratham.rows[0].software_program_count),
                    // Edtech_Pratham_count : parseInt(result.EdtechPratham.rows[0].edtech_program_count),
                    // Services_Pratham_count: parseInt(result.ServicesPratham.rows[0].services_program_count),
                    // Agriculture_Pratham_count: parseInt(result.AgriculturePratham.rows[0].agriculture_program_count),
                    // Ecommerce_Pratham_count: parseInt(result.EcommercePratham.rows[0].ecommerce_program_count),
                    // Social_Pratham_count: parseInt(result.SocialPratham.rows[0].social_program_count),
                    Total_funding_pratham: parseInt(result?.TotalPrathamTeamFundsDistributed?.rows[0]?.amount_total || 0),
                    Pratham_Fund_utilized: parseInt(result?.PrathamFundUtilized?.rows[0]?.pratham_fund_utilized || 0),
                    Funds: {
                        Manufacturing_Sector_Pratham_Funds: parseInt(result?.PrathamManufacturingTotalFunds?.rows[0]?.manufacturing_pratham_funds || 0),
                        Energy_Sector_Pratham_Funds: parseInt(result?.PrathamEnergyTotalFunds?.rows[0]?.energy_pratham_funds || 0),
                        Hardware_Sector_Pratham_Funds: parseInt(result?.PrathamHardwareTotalFunds?.rows[0]?.hardware_pratham_funds || 0),
                        Software_Sector_Pratham_Funds: parseInt(result?.PrathamSoftwareTotalFunds?.rows[0]?.software_pratham_funds || 0),
                        Edtech_Sector_Pratham_Funds: parseInt(result?.PrathamEdtechTotalFunds?.rows[0]?.edtech_pratham_funds || 0),
                        Services_Sector_Pratham_Funds: parseInt(result?.PrathamServicesTotalFunds?.rows[0]?.services_pratham_funds || 0),
                        Agriculture_Sector_Pratham_Funds: parseInt(result?.PrathamAgricultureTotalFunds?.rows[0]?.agriculture_pratham_funds || 0),
                        Ecommerce_Sector_Pratham_Funds: parseInt(result?.PrathamEcommerceTotalFunds?.rows[0]?.ecommerce_pratham_funds || 0),
                        Social_Sector_Pratham_Funds: parseInt(result?.PrathamSocialTotalFunds?.rows[0]?.social_pratham_funds || 0),
                     }
                },
                Akshar: {
                    Energy_Akshar: parseInt(result.EnergyAkshar.rows[0].energy_program_count_akshar),
                    Manufacturing_Akshar: parseInt(result.ManufacturingAkshar.rows[0].manufacturing_program_count_akshar),
                    Hardware_Akshar: parseInt(result.HardwareAkshar.rows[0].hardware_program_count_akshar),
                    Software_Akshar: parseInt(result.SoftwareDataAkshar.rows[0].software_program_count_akshar),
                    Edtech_Akshar : parseInt(result.EdtechAkshar.rows[0].edtech_program_count_akshar),
                    Services_Akshar: parseInt(result.ServicesAkshar.rows[0].services_program_count_akshar),
                    Agriculture_Akshar: parseInt(result.AgricultureAkshar.rows[0].agriculture_program_count_akshar),
                    Ecommerce_Akshar: parseInt(result.EcommerceAkshar.rows[0].ecommerce_program_count_akshar),
                    Social_Akshar: parseInt(result.SocialAkshar.rows[0].social_program_count_akshar),
                    Total_funding_Akshar: parseInt(result?.TotalAksharTeamFundsDistributed?.rows[0]?.amount_total),
                    Akshar_Fund_utilized: parseInt(result?.AksharFundUtilized?.rows[0]?.akshar_fund_utilized || 0),
                    Funds: {
                       Manufacturing_Sector_Akshar_Funds: parseInt(result?.AksharManufacturingTotalFunds?.rows[0]?.manufacturing_akshar_funds || 0),
                       Energy_Sector_Akshar_Funds: parseInt(result?.AksharEnergyTotalFunds?.rows[0]?.energy_akshar_funds || 0),
                       Hardware_Sector_Akshar_Funds: parseInt(result?.AksharHardwareTotalFunds?.rows[0]?.hardware_akshar_funds || 0),
                       Software_Sector_Akshar_Funds: parseInt(result?.AksharSoftwareTotalFunds?.rows[0]?.software_akshar_funds || 0),
                       Edtech_Sector_Akshar_Funds: parseInt(result?.AksharEdtechTotalFunds?.rows[0]?.edtech_akshar_funds || 0),
                       Services_Sector_Akshar_Funds: parseInt(result?.AksharServicesTotalFunds?.rows[0]?.services_akshar_funds || 0),
                       Agriculture_Sector_Akshar_Funds: parseInt(result?.AksharAgricultureTotalFunds?.rows[0]?.agriculture_akshar_funds || 0),
                       Ecommerce_Sector_Akshar_Funds: parseInt(result?.AksharEcommerceTotalFunds?.rows[0]?.ecommerce_akshar_funds || 0),
                       Social_Sector_Akshar_Funds: parseInt(result?.AksharSocialTotalFunds?.rows[0]?.social_akshar_funds || 0),
                    }
                },
                Total_funding_across_sector : {
                    Energy_startup_funds: 0,
                    Manufacturing_startup_funds: 0,
                    Hardware_startup_funds: 0,
                    Software_startup_funds: 0,
                    Edtech_startup_funds: 0,
                    Services_startup_funds: 0,
                    Agriculture_startup_funds: 0,
                    Ecommerce_startup_funds: 0,
                    Social_startup_funds: 0
                },
                Total_teams_count_by_program: {
                    Total_Pratham_count: parseInt(result.PrathamTeamsCount.rows[0].pratham_teams),
                    Total_Akshar_count: parseInt(result.AksharTeamsCount.rows[0].akshar_teams)
                },
                Total_funding_used: {
                   Total_funding_distributed: parseInt(result.UpdatedFunds.rows[0].funds_distributed),
                   Total_funds_utilized: parseInt(result.UpdateFundsUtilized.rows[0].funds_utilized),
                   Total_funding_remaining: 0
                }
            },
            MenWomenRatio : {
                MenCount: parseInt(result?.MenWomen?.rows[0].male_count),
                WomenCount: parseInt(result?.Women?.rows[0].female_count)
            },
            TotalMentorship : {
                Manufacturing: parseInt(result?.ManufacturingMentorScheduleCount?.rows[0]?.startup_name),
                Energy: parseInt(result?.EnergyMentorScheduleCount?.rows[0]?.startup_name),
                Hardware: parseInt(result?.HardwareMentorScheduleCount?.rows[0]?.startup_name),
                Software: parseInt(result?.SoftwareMentorScheduleCount?.rows[0]?.startup_name),
                Edtech: parseInt(result?.EdtechMentorScheduleCount?.rows[0]?.startup_name),
                Service: parseInt(result?.ServiceMentorScheduleCount?.rows[0]?.startup_name),
                Agriculture: parseInt(result?.AgricultureMentorScheduleCount?.rows[0]?.startup_name),
                Ecommerce: parseInt(result?.EcommerceMentorScheduleCount?.rows[0]?.startup_name),
                Social: parseInt(result?.SocialMentorScheduleCount?.rows[0]?.startup_name)
            }
        }
        //sectorwise total funding utilized
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Energy_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Energy_Akshar + startupData.Funding_Distrubuted_data.Pratham.Energy_pratham;
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Manufacturing_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Manufacturing_Akshar + startupData.Funding_Distrubuted_data.Pratham.Manufacturing_Pratham;
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Hardware_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Hardware_Akshar + startupData.Funding_Distrubuted_data.Pratham.Hardware_Pratham
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Software_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Software_Akshar + startupData.Funding_Distrubuted_data.Pratham.Software_Pratham;
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Edtech_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Edtech_Akshar + startupData.Funding_Distrubuted_data.Pratham.Edtech_Pratham;
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Services_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Services_Akshar + startupData.Funding_Distrubuted_data.Pratham.Services_Pratham;
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Agriculture_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Agriculture_Akshar + startupData.Funding_Distrubuted_data.Pratham.Agriculture_Pratham
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Ecommerce_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Ecommerce_Akshar + startupData.Funding_Distrubuted_data.Pratham.Ecommerce_Pratham;
        // startupData.Funding_Distrubuted_data.Total_funding_across_sector.Social_startup_funds = startupData.Funding_Distrubuted_data.Akshar.Social_Akshar + startupData.Funding_Distrubuted_data.Pratham.Social_Pratham;


        //total akshar funding data,
        // startupData.Funding_Distrubuted_data.Akshar.Total_funding_Akshar = 
        //     startupData.Funding_Distrubuted_data.Akshar.Energy_Akshar +
        //     startupData.Funding_Distrubuted_data.Akshar.Manufacturing_Akshar +
        //     startupData.Funding_Distrubuted_data.Akshar.Hardware_Akshar +
        //     startupData.Funding_Distrubuted_data.Akshar.Software_Akshar +
        //     startupData.Funding_Distrubuted_data.Akshar.Edtech_Akshar +
        //     startupData.Funding_Distrubuted_data.Akshar.Services_Akshar +
        //     startupData.Funding_Distrubuted_data.Akshar.Agriculture_Akshar +
        //     startupData.Funding_Distrubuted_data.Akshar.Ecommerce_Akshar +
        //     startupData.Funding_Distrubuted_data.Akshar.Social_Akshar;
        //total pratham funds
        // startupData.Funding_Distrubuted_data.Pratham.Total_funding_pratham = 
        //     startupData.Funding_Distrubuted_data.Pratham.Energy_pratham +
        //     startupData.Funding_Distrubuted_data.Pratham.Manufacturing_Pratham +
        //     startupData.Funding_Distrubuted_data.Pratham.Hardware_Pratham +
        //     startupData.Funding_Distrubuted_data.Pratham.Software_Pratham +
        //     startupData.Funding_Distrubuted_data.Pratham.Edtech_Pratham +
        //     startupData.Funding_Distrubuted_data.Pratham.Services_Pratham +
        //     startupData.Funding_Distrubuted_data.Pratham.Agriculture_Pratham +
        //     startupData.Funding_Distrubuted_data.Pratham.Ecommerce_Pratham +
        //     startupData.Funding_Distrubuted_data.Pratham.Social_Pratham;


             //Funds Remaining Calculation 
        startupData.Funding_Distrubuted_data.Total_funding_used.Total_funding_remaining = 
            startupData.Funding_Distrubuted_data.Total_funding_used.Total_funding_distributed -
            startupData.Funding_Distrubuted_data.Total_funding_used.Total_funds_utilized
        res.status(200).json(startupData);
    }
    catch(err)
    {
        console.log(err);
    }
}
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
}

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
module.exports = {AddStartup, FetchStartupDatainNumbers, FetchStartupData, UpdateStatus, IndividualStartups, TopStartupsSectorsCont};