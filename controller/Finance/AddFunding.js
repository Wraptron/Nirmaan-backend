const {
  AddFundingProjectModel,
  FetchFundingProjectModel,
} = require("../../model/Finance/AddFundingProjectModel");

const {
  AddFundingModel,
  FundingNotificationModel,
  FetchFundingModel,
  UpdateFundingDataModel,
  FetchFundingRecordModel,
  FetchFundingIndividualgDetailsModel,
  FetchFundingTotalNumbers,
  FetchStartupsDetailModel,
  GetStartupProjectBalanceModel,
  FetchFundingRequestsModel,
  UpdateFundingRequestStatusModel,
} = require("../../model/Finance/AddFuningModel");

const {
  uploadFundingDocumentToS3,
  getFundingDocumentPresignedUrl,
  deleteFundingDocumentFromS3,
  parseFundingDocumentKey,
} = require("../../helpers/upload");

const {
  canAccessFundingRecord,
  assertCanModifyFunding,
} = require("../../utils/requireRole");
const {
  notifyFundingUtilizationPending,
  notifyFundingUtilizationAcceptedByAdmin,
  notifyFundingUtilizationRejected,
} = require("../../utils/notificationFanout");

const STARTUP_ROLE = "5";
const FINANCE_STAFF_ROLES = new Set(["2", "3"]);

const resolveFundingDocument = async (req, existingDocument = null) => {
  if (req.file) {
    const startupId = req.body.startup_id;
    if (existingDocument) {
      await deleteFundingDocumentFromS3(existingDocument).catch(() => {});
    }
    return uploadFundingDocumentToS3(req.file, startupId);
  }

  return existingDocument || null;
};

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
  }

  try {
    assertCanModifyFunding(req.user, startup_id, funding_type);
  } catch (err) {
    return res.status(err.statusCode || 403).json({ message: err.message });
  }

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

    let documentKey = null;
    try {
      documentKey = await resolveFundingDocument(req);
    } catch (uploadErr) {
      return res
        .status(500)
        .json({ message: uploadErr.message || "Failed to upload document." });
    }

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

      const isStartupSubmission =
        String(req.user?.startup_id ?? "") !== "" &&
        String(req.user?.startup_id) === String(startup_id);
      const recordStatus = isStartupSubmission ? "pending" : "approved";

      const row = await AddFundingModel(
        startup_id,
        startup_name,
        project_name,
        funding_type,
        amount,
        purpose,
        funding_date,
        reference_number,
        documentKey,
        recordStatus
      );

      if (recordStatus === "pending") {
        await notifyFundingUtilizationPending(row);
        return res.status(201).json({
          message: "Funding utilization request submitted for review.",
          status: "pending",
          id: row.id,
          row,
        });
      }

      await AddFundingProjectModel(
        project_name,
        "Funding Utilized",
        amount,
        funding_date
      );

      return res.status(200).json(row);
    }

    if (
      funding_type === "Funding Disbursed" ||
      funding_type === "External Funding"
    ) {
      const row = await AddFundingModel(
        startup_id,
        startup_name,
        project_name,
        funding_type,
        amount,
        purpose,
        funding_date,
        reference_number,
        documentKey,
        "approved"
      );

      return res.status(200).json(row);
    }

    return res.status(400).send("Invalid funding type.");
  } catch (err) {
    return res.status(500).send(err.message || "Server error");
  }
};

const FetchFundingAmount = async (req, res) => {
  try {
    const allFundingData = await FetchFundingIndividualgDetailsModel();
    res.status(200).json(allFundingData);
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
    const result = await FetchFundingTotalNumbers();
    const startupData = {
      funding_disbursed: Number(result.disbursed) || 0,
      funding_utilized: Number(result.utilized) || 0,
      external_funding: Number(result.external) || 0,
    };
    res.status(200).json(startupData);
  } catch (err) {
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
      id,
      startup_id,
    } = req.body;

    if (!id) {
      return res.status(400).send("Funding ID is required for update.");
    }

    const oldFunding = await FetchFundingRecordModel(id);
    if (!oldFunding) {
      return res.status(404).send("Funding record not found.");
    }

    try {
      assertCanModifyFunding(req.user, startup_id, funding_type);
    } catch (err) {
      return res.status(err.statusCode || 403).json({ message: err.message });
    }

    if (String(oldFunding.startup_id) !== String(startup_id)) {
      return res.status(403).json({ message: "Invalid funding record." });
    }

    const fundingDetails = await FetchFundingIndividualgDetailsModel();
    const currentFunding = fundingDetails[startup_id] || {
      funding_disbursed: 0,
      funding_utilized: 0,
      balance: 0,
      external_funding: 0,
    };

    const old_type = oldFunding.funding_type;
    const old_amount = Number(oldFunding.amount);

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

    const adjusted_balance = adjusted_disbursed - adjusted_utilized;

    let documentKey;
    try {
      documentKey = await resolveFundingDocument(req, oldFunding.document);
    } catch (uploadErr) {
      return res
        .status(500)
        .json({ message: uploadErr.message || "Failed to upload document." });
    }

    if (funding_type === "Funding Utilized") {
      if (adjusted_disbursed <= 0) {
        return res
          .status(401)
          .json({ error: "Team hasn't received any disbursed funds yet." });
      }

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
        documentKey,
        id,
        startup_id
      );
      return res.status(200).send(result);
    }

    if (
      funding_type === "Funding Disbursed" ||
      funding_type === "External Funding"
    ) {
      const result = await UpdateFundingDataModel(
        startup_name,
        funding_type,
        amount,
        purpose,
        funding_date,
        reference_number,
        documentKey,
        id,
        startup_id
      );
      return res.status(200).send(result);
    }

    return res.status(400).send("Invalid funding type.");
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const GetFundingDocument = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Funding ID is required." });
    }

    const record = await FetchFundingRecordModel(id);
    if (!record) {
      return res.status(404).json({ message: "Funding record not found." });
    }

    if (!canAccessFundingRecord(req.user, record)) {
      return res.status(403).json({ message: "You do not have access to this document." });
    }

    if (!parseFundingDocumentKey(record.document)) {
      return res.status(404).json({ message: "No document available for this entry." });
    }

    const url = await getFundingDocumentPresignedUrl(record.document);
    if (!url) {
      return res.status(404).json({ message: "Document could not be retrieved." });
    }

    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve document." });
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

const listFundingRequests = async (req, res) => {
  try {
    const role = String(req.user?.role ?? "");
    const filters = {};
    if (req.query.status) filters.status = String(req.query.status).trim();
    if (req.query.funding_type) filters.funding_type = req.query.funding_type;
    if (req.query.startup_id) filters.startup_id = req.query.startup_id;

    if (role === STARTUP_ROLE) {
      filters.startup_id = req.user.startup_id;
    } else if (!FINANCE_STAFF_ROLES.has(role)) {
      return res.status(403).json({ message: "You do not have access to funding requests." });
    }

    const result = await FetchFundingRequestsModel(filters);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load funding requests." });
  }
};

const getFundingRequestById = async (req, res) => {
  try {
    const record = await FetchFundingRecordModel(req.params.id);
    if (!record) {
      return res.status(404).json({ message: "Funding request not found." });
    }
    if (!canAccessFundingRecord(req.user, record)) {
      return res.status(403).json({ message: "You do not have access to this funding request." });
    }
    return res.status(200).json(record);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load funding request." });
  }
};

const approveFundingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await FetchFundingRecordModel(id);

    if (!existing) {
      return res.status(404).json({ message: "Funding request not found." });
    }
    if (existing.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be approved." });
    }
    if (existing.funding_type !== "Funding Utilized") {
      return res.status(400).json({ message: "Only funding utilization requests support approval." });
    }

    const projectFunding = await GetStartupProjectBalanceModel(
      existing.startup_id,
      existing.project_name
    );
    if (!projectFunding || Number(projectFunding.disbursed) <= 0) {
      return res.status(400).json({ message: "No funds disbursed for this project." });
    }

    const available =
      Number(projectFunding.disbursed) - Number(projectFunding.utilized || 0);
    if (Number(existing.amount) > available) {
      return res.status(400).json({
        message: `Insufficient funds for ${existing.project_name}. Available: ${available}`,
      });
    }

    const updated = await UpdateFundingRequestStatusModel(
      id,
      "approved",
      req.user?.user_mail
    );
    if (!updated) {
      return res.status(409).json({ message: "Request was already processed or not found." });
    }

    await AddFundingProjectModel(
      updated.project_name,
      "Funding Utilized",
      updated.amount,
      updated.funding_date
    );

    await notifyFundingUtilizationAcceptedByAdmin(updated);

    return res.status(200).json({
      message: "Funding utilization request approved.",
      status: "approved",
      row: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to approve funding request." });
  }
};

const rejectFundingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason: rejectionReason } = req.body || {};
    const existing = await FetchFundingRecordModel(id);

    if (!existing) {
      return res.status(404).json({ message: "Funding request not found." });
    }
    if (existing.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be rejected." });
    }

    const updated = await UpdateFundingRequestStatusModel(
      id,
      "rejected",
      req.user?.user_mail,
      rejectionReason || null
    );
    if (!updated) {
      return res.status(409).json({ message: "Request was already processed or not found." });
    }

    await notifyFundingUtilizationRejected(updated, rejectionReason || null);

    return res.status(200).json({
      message: "Funding utilization request rejected.",
      status: "rejected",
      row: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to reject funding request." });
  }
};

module.exports = {
  AddFunding,
  updateFundingNotif,
  FetchFundingAmount,
  FetchFundingData,
  UpdateFundingData,
  GetFundingDocument,
  FetchFundingDatainNumbers,
  FetchStartupDataDetail,
  listFundingRequests,
  getFundingRequestById,
  approveFundingRequest,
  rejectFundingRequest,
};
