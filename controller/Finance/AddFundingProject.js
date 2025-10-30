const {
  AddFundingProjectModel,
  FetchFundingProjectModel,
  FetchFundingProjectsModel,
  UpdateFundingProjectDataModel,
  GetTotalUtilizedForProject,
} = require("../../model/Finance/AddFundingProjectModel");

const AddFundingProject = async (req, res) => {
  const { project_name, funding_type, amount, date } = req.body;
  try {
    const result = await AddFundingProjectModel(
      project_name,
      funding_type,
      amount,
      date
    );
    res.status(200).json({
      message: "Project Funding Added Successfully",
      result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to Add Project Funding" });
  }
};
const FetchFundingProject = async (req, res) => {
  try {
    const result = await FetchFundingProjectModel();

    // Map JS project keys to DB keys (columns)
    const projectKeyMap = {
      NirmaanSeedFunding: "nirmaan_seed_funding",
      ShankarEndownmentFund: "shankar_endownment_fund",
      NirmaanExternal: "nirmaan_external",
      AIforHealthcare: "ai_for_healthcare",
      UGFIR: "ugfir",
      PGFIR: "pgfir",
      NirmaanthePre_Incubator: "nirmaan_the_pre_incubator",
      AmexProgramforInnovationEntrepreneurship: "apie",
    };

    // Map JS keys to actual DB project names (used in funding_projects table)
    const projectNameDBMap = {
      NirmaanSeedFunding: "Nirmaan Seed Funding",
      ShankarEndownmentFund: "Shankar Endownment Fund",
      NirmaanExternal: "Nirmaan External",
      AIforHealthcare: "AI for Healthcare",
      UGFIR: "UGFIR",
      PGFIR: "PGFIR",
      NirmaanthePre_Incubator: "Nirmaan the Pre-Incubator",
      AmexProgramforInnovationEntrepreneurship:
        "Amex Program for Innovation & Entrepreneurship",
    };

    const FundingProjectData = {};

    // Loop through each project and calculate remaining balance
    for (const [projectName, dbKey] of Object.entries(projectKeyMap)) {
      const totalAllocated = Number(result[dbKey]) || 0;

      const dbProjectName = projectNameDBMap[projectName];

      // Get total utilized
      const totalUtilized = await GetTotalUtilizedForProject(dbProjectName);

      // Remaining balance = allocated - utilized
      FundingProjectData[projectName] = Math.max(totalAllocated - totalUtilized, 0);

    }

    // Return remaining balances
    res.status(200).json(FundingProjectData);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const FetchFundingProjectData = async (req, res) => {
  try {
    const result = await FetchFundingProjectsModel();
    res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};

const UpdateFundingProjectData = async (req, res) => {
  try {
    const { project_name, funding_type, amount, date, project_id } = req.body;

    const result = await UpdateFundingProjectDataModel(
      project_name,
      funding_type,
      amount,
      date,
      project_id
    );
    res.status(200).json({ message: "Funding Updated successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

module.exports = {
  AddFundingProject,
  FetchFundingProject,
  FetchFundingProjectData,
  UpdateFundingProjectData,
};
