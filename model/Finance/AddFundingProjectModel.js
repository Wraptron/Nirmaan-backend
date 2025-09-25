const client = require("../../utils/conn");

const AddFundingProjectModel = async (
  project_name,
  funding_type,
  amount,
  date
) => {
  return new Promise((resolve, reject) => {
    client.query(
      "INSERT INTO funding_projects(project_name,funding_type,amount,date) VALUES ($1,$2,$3,$4)",
      [project_name, funding_type, amount, date],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
  });
};

const FetchFundingProjectModel = async () => {
  try {
    const queries = [
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS nirmaan_seed_funding FROM funding_projects WHERE project_name = 'Nirmaan Seed Funding'"
      ),
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS shankar_endownment_fund FROM funding_projects WHERE project_name = 'Shankar Endownment Fund'"
      ),
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS nirmaan_external FROM funding_projects WHERE project_name = 'Nirmaan External'"
      ),
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS ai_for_healthcare FROM funding_projects WHERE project_name = 'AI for Healthcare'"
      ),
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS ugfir FROM funding_projects WHERE project_name = 'UGFIR'"
      ),
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS pgfir FROM funding_projects WHERE project_name = 'PGFIR'"
      ),
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS nirmaan_the_pre_incubator FROM funding_projects WHERE project_name = 'Nirmaan the Pre-Incubator'"
      ),
      client.query(
        "SELECT COALESCE(SUM(amount), 0)::numeric AS apie FROM funding_projects WHERE project_name = 'Amex Program for Innovation & Entrepreneurship'"
      ),
     
    ];

    const [ NirmaanSeedFunding,
    ShankarEndownmentFund,
    NirmaanExternal,
    AIforHealthcare,
    UGFIR,
    PGFIR,
    NirmaanthePre_Incubator,
    AmexProgramforInnovationEntrepreneurship] = await Promise.all(queries);

    return {
      nirmaan_seed_funding:NirmaanSeedFunding.rows[0].nirmaan_seed_funding,
      shankar_endownment_fund:ShankarEndownmentFund.rows[0].shankar_endownment_fund,
      nirmaan_external:NirmaanExternal.rows[0].nirmaan_external,
      ai_for_healthcare:AIforHealthcare.rows[0].ai_for_healthcare,
      ugfir: UGFIR.rows[0].ugfir,
      pgfir: PGFIR.rows[0].pgfir,
      nirmaan_the_pre_incubator:NirmaanthePre_Incubator.rows[0].nirmaan_the_pre_incubator,
      apie:AmexProgramforInnovationEntrepreneurship.rows[0].apie
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  AddFundingProjectModel,
  FetchFundingProjectModel
};