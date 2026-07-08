const client = require("../utils/conn");

const JobModel = (email, role, duration, jobtype, remuneration, requirements, description) => {
  return new Promise((resolve, reject) => {
    client.query(
      "INSERT INTO add_job(email, role, duration, jobtype, remuneration, requirements, description) VALUES($1, $2, $3, $4, $5, $6, $7)",
      [email, role, duration, jobtype, remuneration, requirements, description],
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

module.exports = JobModel;
