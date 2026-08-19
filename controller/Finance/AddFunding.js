const{
  AddFundingProjectModel,
   GetTotalUtilizedForProject,
   FetchFundingProjectModel
}=require("../../model/Finance/AddFundingProjectModel")


const {
  AddFundingModel,
  FundingNotificationModel,
  FetchFundingModel,
  UpdateFundingDataModel,
  FetchFundingRecordModel,
  FetchFundingIndividualgDetailsModel,
  FetchFundingAmountByStartupIdModel,
  FetchFundingTotalNumbers,
  FetchStartupsDetailModel,
  GetStartupProjectBalanceModel,
} = require("../../model/Finance/AddFuningModel");
const {
  CACHE_KEYS,
  getOrSet,
  invalidateFundingCaches,
} = require("../../utils/queryCache");


const AddFunding = async (req, res) => {
  const {
    startup_id,
    startup_name,
    project_name,
    funding_type,
    amount,
    purpose,
    funding_date,
    reference_number,
    document,
    status,
  } = req.body;
  if (
    !startup_id ||
    !startup_name ||
    !funding_type ||
    !amount ||
    !purpose ||
    !funding_date
  ) {
    return res.status(400).send("Please fill all necessary fields");
  } else {
    try {
      if (!project_name || project_name.trim() === "") {
        return res.status(400).send("Please provide a valid project name.");
      }

      const projectBalances = await FetchFundingProjectModel();
      const projectKeyMap = {
        "Nirmaan Seed Funding": "nirmaan_seed_funding",
        "Shankar Endownment Fund": "shankar_endownment_fund",
        "Nirmaan External": "nirmaan_external",
        "AI for Healthcare": "ai_for_healthcare",
        UGFIR: "ugfir",
        PGFIR: "pgfir",
        "Nirmaan the Pre-Incubator": "nirmaan_the_pre_incubator",
        "Amex Program for Innovation & Entrepreneurship": "apie",
      };

      const dbKey = projectKeyMap[project_name];
      if (!dbKey) {
        return res.status(400).send("Invalid project name.");
      }

      // ✅ KEEPING this check AS IS (no change)
      if (funding_type === "Funding Disbursed") {
        const totalAvailable = Number(projectBalances[dbKey]) || 0;
        if (totalAvailable < Number(amount)) {
          return res
            .status(400)
            .send(
              `Not enough funds available for this project. Available: ${totalAvailable}`
            );
        }
      }

      /* ---------------- FUNDING UTILIZED ---------------- */
      if (funding_type === "Funding Utilized") {
        const projectFunding = await GetStartupProjectBalanceModel(
          startup_id,
          project_name
        );

        if (!projectFunding || Number(projectFunding.disbursed) <= 0) {
          return res.status(400).send("No funds disbursed for this project.");
        }

        const availableProjectBalance =
          Number(projectFunding.disbursed) -
          Number(projectFunding.utilized || 0);

        if (Number(amount) > availableProjectBalance) {
          return res
            .status(400)
            .send(
              `Insufficient funds for ${project_name}. Available: ${availableProjectBalance}`
            );
        }

        // 1️⃣ add funding utilization for startup
        const result = await AddFundingModel(
          startup_id,
          startup_name,
          project_name,
          funding_type,
          amount,
          purpose,
          funding_date,
          reference_number,
          document,
          status
        );

        // 2️⃣ NOW reduce project amount (ONLY HERE)
        await AddFundingProjectModel(
          project_name,
          "Funding Utilized",
          amount,
          funding_date
        );

        invalidateFundingCaches();
        return res.status(200).send(result);
      } else if (

      /* ---------------- FUNDING DISBURSED / EXTERNAL ---------------- */
        funding_type === "Funding Disbursed" ||
        funding_type === "External Funding"
      ) {
        const result = await AddFundingModel(
          startup_id,
          startup_name,
          project_name,
          funding_type,
          amount,
          purpose,
          funding_date,
          reference_number,
          document,
          status
        );

        invalidateFundingCaches();
        return res.status(200).send(result);
      } else {
        return res.status(400).send("Invalid funding type.");
      }
    } catch (err) {
      return res.status(500).send(err.message || "Server error");
    }
  }
};

const FetchFundingAmount = async (req, res) => {
  try {
    const allFundingData = await FetchFundingIndividualgDetailsModel();
    res.status(200).json(allFundingData);
  } catch (err) {
    // console.error("Error in FetchFundingAmount:", err.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const FetchStartupFunding = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Invalid startup id" });
  }
  try {
    const result = await FetchFundingAmountByStartupIdModel(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateFundingNotif = async (req, res) => {
  try {
    const result = await FundingNotificationModel();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

const FetchFundingData = async (req, res) => {
  try {
    const result = await FetchFundingModel();
    res.status(200).json(result);
  } catch (error) {
    res.send(error);
  }
};

const FetchFundingDatainNumbers = async (req, res) => {
  try {
    const startupData = await getOrSet(CACHE_KEYS.FUNDING_TOTALS, async () => {
      const result = await FetchFundingTotalNumbers();
      return {
        funding_disbursed: Number(result.disbursed) || 0,
        funding_utilized: Number(result.utilized) || 0,
        external_funding: Number(result.external) || 0,
      };
    });
    res.status(200).json(startupData);
  } catch (err) {
    // console.error("Error in FetchFundingDatainNumbers:", err.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const UpdateFundingData = async (req, res) => {
  try {
    const {
      startup_name,
      funding_type,
      amount,
      purpose,
      funding_date,
      reference_number,
      document,
      status,
      id,
      startup_id,
    } = req.body;

    if (!id) {
      return res.status(400).send("Funding ID is required for update.");
    }

    const currentFunding = await FetchFundingAmountByStartupIdModel(startup_id);

    // Fetch the existing funding record to get old values
    const oldFunding = await FetchFundingRecordModel(id);
    if (!oldFunding) {
      return res.status(404).send("Funding record not found.");
    }
    const old_type = oldFunding.funding_type;
    const old_amount = Number(oldFunding.amount); // Ensure number

    // Compute adjusted totals by removing the old effect
    let adjusted_disbursed = currentFunding.funding_disbursed;
    let adjusted_utilized = currentFunding.funding_utilized;
    let adjusted_external = currentFunding.external_funding;

    if (old_type === "Funding Disbursed") {
      adjusted_disbursed -= old_amount;
    } else if (old_type === "Funding Utilized") {
      adjusted_utilized -= old_amount;
    } else if (old_type === "External Funding") {
      adjusted_external -= old_amount;
    }

    // Recompute adjusted balance
    const adjusted_balance = adjusted_disbursed - adjusted_utilized;

    // Now perform checks based on the new funding_type
    if (funding_type === "Funding Utilized") {
      // Check if there will be at least some disbursed funding
      if (adjusted_disbursed <= 0) {
        return res
          .status(401)
          .json({ error: "Team hasn't received any disbursed funds yet." });
      }

      // Check if enough balance for the new utilized amount
      // Note: Fixed the original check logic to amount > adjusted_balance
      if (Number(amount) > adjusted_balance) {
        return res
          .status(400)
          .json({ error: "Not enough funding available to utilize." });
      }

      const result = await UpdateFundingDataModel(
        startup_name,
        funding_type,
        amount,
        purpose,
        funding_date,
        reference_number,
        document,
        status,
        id,
        startup_id
      );
      invalidateFundingCaches();
      return res.status(200).send(result);
    } else if (
      funding_type === "Funding Disbursed" ||
      funding_type === "External Funding"
    ) {
      // Always allow Disbursed or External Funding
      const result = await UpdateFundingDataModel(
        startup_name,
        funding_type,
        amount,
        purpose,
        funding_date,
        reference_number,
        document,
        status,
        id,
        startup_id
      );
      invalidateFundingCaches();
      return res.status(200).send(result);
    } else {
      return res.status(400).send("Invalid funding type.");
    }
  } catch (err) {
    // console.log(err);
    return res.status(500).json({ error: err });
  }
};

const FetchStartupDataDetail = async (req, res) => {
  try {
    const result = await FetchStartupsDetailModel();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(result);
  }
};

module.exports = {
  AddFunding,
  updateFundingNotif,
  FetchFundingAmount,
  FetchStartupFunding,
  FetchFundingData,
  UpdateFundingData,
  FetchFundingDatainNumbers,
  FetchStartupDataDetail
};
