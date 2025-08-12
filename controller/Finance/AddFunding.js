const {
  AddFundingModel,
  DataViewModel,
  FundingNotificationModel,
  FetchFundingDetailsModel,
  FetchFundingModel,
} = require("../../model/Finance/AddFuningModel");
const AddFunding = async (req, res) => {
  console.log(req.body);
  const {
    startup_id,
    startup_name,
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
    !funding_date ||
    !reference_number
  ) {
    return res
      .status(400)
      .json({ message: "Please fill all necessary fields" });
  } else {
    try {
      const result1 = await DataViewModel(startup_id);
      // console.log("DataViewModel Result: ", result1);
      if (funding_type === "Funding Utilized") {
        // Allow Utilized only if Disbursed exists
        if (result1.rowCount > 0) {
          const result = await AddFundingModel(
            startup_id,
            startup_name,
            funding_type,
            amount,
            purpose,
            funding_date,
            reference_number,
            document,
            status,
            
          );
          return res.status(200).send(result);
        } else {
          return res
            .status(401)
            .send("Team hasn't received any disbursed funds yet.");
        }
      } else if (
        funding_type === "Funding Disbursed" ||
        funding_type === "External Funding"
      ) {
        // Always allow Disbursed or External Funding
        const result = await AddFundingModel(
          startup_id,
          startup_name,
          funding_type,
          amount,
          purpose,
          funding_date,
          reference_number,
          document,
          status,
          
        );
        return res.status(200).send(result);
      } else {
        return res.status(400).send("Invalid funding type.");
      }
    } catch (err) {
      console.log("Error in AddFunding:", err.stack || err);
      return res.status(500).json({ error: err });
    }
  }
};

const FetchFundingAmount = async (req, res) => {
  try {
    const allFundingData = await FetchFundingDetailsModel();
    res.status(200).json(allFundingData);
  } catch (err) {
    console.error("Error in FetchFundingAmount:", err.stack || err);
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

module.exports = {
  AddFunding,
  updateFundingNotif,
  FetchFundingAmount,
  FetchFundingData,
};
