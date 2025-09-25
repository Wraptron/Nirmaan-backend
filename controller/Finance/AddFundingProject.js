const { AddFundingProjectModel, FetchFundingProjectModel } = require("../../model/Finance/AddFundingProjectModel");

const AddFundingProject = async (req, res) => {
  const { project_name, funding_type, amount, date } = req.body;
  try {
    const result = await AddFundingProjectModel (
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
    console.log(err)
    res.status(500).json({ error: "Failed to Add Project Funding" });
  }
};

const FetchFundingProject = async(req, res) => {
  try {
    const result = await FetchFundingProjectModel();
    const FundingProjectData = {
      NirmaanSeedFunding:Number(result.nirmaan_seed_funding)||0,
      ShankarEndownmentFund:Number(result.shankar_endownment_fund)||0,
      NirmaanExternal:Number(result.nirmaan_external)||0,
      AIforHealthcare:Number(result.ai_for_healthcare)||0,
      UGFIR: Number(result.ugfir)||0,
      PGFIR: Number(result.pgfir)||0,
      NirmaanthePre_Incubator:Number(result.nirmaan_the_pre_incubator)||0,
      AmexProgramforInnovationEntrepreneurship:Number(result.apie)||0
    };
    res.status(200).json(FundingProjectData);
  } catch (err) {
    console.error("Error in FetchFundingProject:", err.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports={
    AddFundingProject,
    FetchFundingProject
}