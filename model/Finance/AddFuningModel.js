const client = require('../../utils/conn');
const DataViewModel = async(startup_id) => {
    return new Promise((resolve, reject) => {
        client.query(`SELECT * FROM update_funding WHERE startup_id = $1 AND funding_type=$2`, [startup_id, 'Funding Disbursed'], (err, result) => {
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
const AddFundingModel = async (startup_id,startup_name, funding_type, amount, purpose, funding_date, reference_number, document,status) => {    
    return new Promise((resolve, reject) => {
        client.query(
            "INSERT INTO update_funding(startup_id,startup_name, funding_type, amount, purpose, funding_date, reference_number, document, status) VALUES($1, $2, $3, $4, $5, $6, $7, $8,$9)", 
            [startup_id,startup_name, funding_type, amount, purpose, funding_date, reference_number, document,status ], 
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
      SELECT startup_id,
              SUM(CASE WHEN funding_type = 'Funding Disbursed' THEN amount ELSE 0 END) AS funding_disbursed,
    SUM(CASE WHEN funding_type = 'Funding Utilized' THEN amount ELSE 0 END) AS funding_utilized,
    SUM(CASE WHEN funding_type = 'Funding Disbursed' THEN amount ELSE 0 END) -
    SUM(CASE WHEN funding_type = 'Funding Utilized' THEN amount ELSE 0 END) AS balance,
     SUM(CASE WHEN funding_type = 'External Funding' THEN amount ELSE 0 END) AS  external_funding

      FROM update_funding
      GROUP BY startup_id
    `;

    client.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching funding details:", err);
        reject(err);
      } else {
        const formattedData = {};
        result.rows.forEach(row => {
          formattedData[row.startup_id] = {
            funding_disbursed: parseFloat(row.funding_disbursed) || 0,
            funding_utilized: parseFloat(row.funding_utilized) || 0 ,
           balance: parseFloat(row.balance) || 0,
            external_funding: parseFloat(row.external_funding) || 0
          };
        });
        resolve(formattedData);
      }
    });
  });
};


const FetchFundingModel=()=>{
  return new Promise((resolve,reject)=>{
    client.query("select * from update_funding",(err,result)=>{
      if(err){
        reject(err)
      }
      else{
        resolve(result)
      }
    })
  })
}


module.exports = {
  AddFundingModel,
  DataViewModel,
  FundingNotificationModel,
  FetchFundingDetailsModel,
  FetchFundingModel,
};