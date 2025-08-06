const client = require('../../utils/conn');
const DataViewModel = async(startup_name) => {
    return new Promise((resolve, reject) => {
        client.query(`SELECT * FROM update_funding WHERE startup_name = $1 AND funding_type=$2`, [startup_name, 'Funding Disbursed'], (err, result) => {
            if(err)
            {
                  console.error("Error in DataViewModel:", err);
                reject(err)
            }
            else
            {
                resolve(result)
            }
        })
    })
}
const AddFundingModel = async (startup_name, funding_type, amount, purpose, funding_date, reference_number, document,status, official_email_address) => {    
    return new Promise((resolve, reject) => {
        client.query(
            "INSERT INTO update_funding(startup_name, funding_type, amount, purpose, funding_date, reference_number, document, status, official_email_address) VALUES($1, $2, $3, $4, $5, $6, $7, $8,$9)", 
            [startup_name, funding_type, amount, purpose, funding_date, reference_number, document,status, official_email_address], 
            (err, result) => {
                if (err) {
                    reject({ err });
                } else {
                    resolve(result);
                }
            }
        );
    });
};

const FundingNotificationModel = async() => {
    return new Promise((resolve, reject) => {
        client.query("SELECT * FROM update_funding ORDER BY funding_date DESC ", (err, result) => {
            if(err)
            {
                reject(err)
            }
            else
            {
                resolve(result);
            }
        })
    })
}


const FetchFundingDetailsModel = async () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT startup_name,
              SUM(CASE WHEN funding_type = 'Funding Disbursed' THEN amount ELSE 0 END) AS funding_disbursed,
    SUM(CASE WHEN funding_type = 'Funding Utilized' THEN amount ELSE 0 END) AS funding_utilized,
    SUM(CASE WHEN funding_type = 'Funding Disbursed' THEN amount ELSE 0 END) -
    SUM(CASE WHEN funding_type = 'Funding Utilized' THEN amount ELSE 0 END) AS balance,
     SUM(CASE WHEN funding_type = 'External Funding' THEN amount ELSE 0 END) AS  external_funding

      FROM update_funding
      GROUP BY startup_name
    `;

    client.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching funding details:", err);
        reject(err);
      } else {
        const formattedData = {};
        result.rows.forEach(row => {
          formattedData[row.startup_name] = {
            funding_disbursed: parseFloat(row.funding_disbursed),
            funding_utilized: parseFloat(row.funding_utilized),
           balance: parseFloat(row.balance),
            external_funding: parseFloat(row.external_funding)
          };
        });
        resolve(formattedData);
      }
    });
  });
};

module.exports = { AddFundingModel, DataViewModel, FundingNotificationModel,FetchFundingDetailsModel};