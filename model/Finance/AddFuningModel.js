const client = require("../../utils/conn");

const AddFundingModel = async (
  startup_id,
  startup_name,
  project_name,
  funding_type,
  amount,
  purpose,
  funding_date,
  reference_number,
  document,
  status = "approved"
) => {
  return new Promise((resolve, reject) => {
    client.query(
      `INSERT INTO update_funding(
        startup_id, startup_name, project_name, funding_type, amount,
        purpose, funding_date, reference_number, document, status, submitted_at
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
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
      ],
      (err, result) => {
        if (err) {
          reject({ err });
        } else {
          resolve(result.rows[0]);
        }
      }
    );
  });
};

const FundingNotificationModel = async () => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT * FROM update_funding ORDER BY funding_date DESC ",
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const FetchFundingIndividualgDetailsModel = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT startup_id,
        SUM(CASE WHEN funding_type = 'Funding Disbursed' THEN amount ELSE 0 END) AS funding_disbursed,
        SUM(
          CASE
            WHEN funding_type = 'Funding Utilized' AND status = 'approved'
            THEN amount ELSE 0
          END
        ) AS funding_utilized,
        SUM(CASE WHEN funding_type = 'Funding Disbursed' THEN amount ELSE 0 END) -
        SUM(
          CASE
            WHEN funding_type = 'Funding Utilized' AND status = 'approved'
            THEN amount ELSE 0
          END
        ) AS balance,
        SUM(CASE WHEN funding_type = 'External Funding' THEN amount ELSE 0 END) AS external_funding
      FROM update_funding
      GROUP BY startup_id
    `;

    client.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const formattedData = {};
        result.rows.forEach((row) => {
          formattedData[row.startup_id] = {
            funding_disbursed: parseFloat(row.funding_disbursed) || 0,
            funding_utilized: parseFloat(row.funding_utilized) || 0,
            balance: parseFloat(row.balance) || 0,
            external_funding: parseFloat(row.external_funding) || 0,
          };
        });
        resolve(formattedData);
      }
    });
  });
};

const FetchFundingModel = () => {
  return new Promise((resolve, reject) => {
    client.query("select * from update_funding", (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const FetchFundingRecordModel = async (id) => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT * FROM update_funding WHERE id = $1",
      [id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0] || null);
        }
      }
    );
  });
};

const UpdateFundingDataModel = async (
  startup_name,
  funding_type,
  amount,
  purpose,
  funding_date,
  reference_number,
  document,
  id,
  startup_id
) => {
  return new Promise((resolve, reject) => {
    client.query(
      `UPDATE update_funding 
   SET startup_name=$1, funding_type=$2, amount=$3, purpose=$4, 
       funding_date=$5, reference_number=$6, document=$7 
   WHERE id=$8 AND startup_id=$9`,
      [
        startup_name,
        funding_type,
        amount,
        purpose,
        funding_date,
        reference_number,
        document,
        id,
        startup_id,
      ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const FetchFundingTotalNumbers = async () => {
  try {
    const queries = [
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS disbursed FROM update_funding WHERE funding_type = 'Funding Disbursed'"
      ),
      client.query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS utilized
         FROM update_funding
         WHERE funding_type = 'Funding Utilized' AND status = 'approved'`
      ),
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS external FROM update_funding WHERE funding_type = 'External Funding'"
      ),
    ];

    const [disbursedResult, utilizedResult, externalResult] =
      await Promise.all(queries);

    return {
      disbursed: disbursedResult.rows[0].disbursed,
      utilized: utilizedResult.rows[0].utilized,
      external: externalResult.rows[0].external,
    };
  } catch (err) {
    throw err;
  }
};

const FetchStartupsDetailModel = async () => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT user_id AS startup_id,basic::jsonb->>'startup_name' AS startup_name, startup_status AS startup_status, basic::jsonb->>'startup_type' AS startup_type,basic::jsonb->>'startup_cohort' AS startup_cohort,basic::jsonb->>'program' AS program, official::jsonb->>'official_email_address' AS email_address FROM test_startup;",
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const GetStartupProjectBalanceModel = async (startup_id, project_name) => {
  return new Promise((resolve, reject) => {
    client.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN funding_type = 'Funding Disbursed' THEN amount ELSE 0 END),0) AS disbursed,
        COALESCE(SUM(
          CASE
            WHEN funding_type = 'Funding Utilized' AND status IN ('approved', 'pending')
            THEN amount ELSE 0
          END
        ),0) AS utilized,
        COALESCE(SUM(CASE WHEN funding_type = 'Funding Disbursed' THEN amount ELSE 0 END),0) -
        COALESCE(SUM(
          CASE
            WHEN funding_type = 'Funding Utilized' AND status IN ('approved', 'pending')
            THEN amount ELSE 0
          END
        ),0) AS balance
      FROM update_funding
      WHERE startup_id = $1 AND project_name = $2
      `,
      [startup_id, project_name],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0]);
      }
    );
  });
};

const FetchFundingRequestsModel = async (filters = {}) => {
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (filters.status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(filters.status);
    paramIndex += 1;
  }

  if (filters.funding_type) {
    conditions.push(`funding_type = $${paramIndex}`);
    values.push(filters.funding_type);
    paramIndex += 1;
  }

  if (filters.startup_id != null && filters.startup_id !== "") {
    conditions.push(`startup_id::text = $${paramIndex}`);
    values.push(String(filters.startup_id));
    paramIndex += 1;
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  return new Promise((resolve, reject) => {
    client.query(
      `SELECT *
       FROM update_funding
       ${whereClause}
       ORDER BY COALESCE(submitted_at, NOW()) DESC, id DESC`,
      values,
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

const UpdateFundingRequestStatusModel = async (
  id,
  status,
  reviewerMail,
  rejectionReason = null
) => {
  return new Promise((resolve, reject) => {
    client.query(
      `UPDATE update_funding
       SET status = $1,
           reviewed_at = CURRENT_TIMESTAMP,
           reviewed_by_mail = $2,
           rejection_reason = $3
       WHERE id = $4 AND status = 'pending'
       RETURNING *`,
      [status, reviewerMail || null, rejectionReason, id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result.rows[0] || null);
      }
    );
  });
};

module.exports = {
  AddFundingModel,
  FundingNotificationModel,
  FetchFundingIndividualgDetailsModel,
  FetchFundingModel,
  UpdateFundingDataModel,
  FetchFundingRecordModel,
  FetchFundingTotalNumbers,
  FetchStartupsDetailModel,
  GetStartupProjectBalanceModel,
  FetchFundingRequestsModel,
  UpdateFundingRequestStatusModel,
};
