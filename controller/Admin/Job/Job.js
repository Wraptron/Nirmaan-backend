const JobModel = require("../../../model/JobModel");

const job = async (req, res) => {
  const { role, duration, jobtype, remuneration, requirements, description } = req.body;
  const email = req.user?.user_mail;

  if (!email || !role || !duration || !jobtype || !remuneration || !requirements || !description) {
    return res.status(401).json({ error: "Missing required fields" });
  }

  try {
    const result = await JobModel(email, role, duration, jobtype, remuneration, requirements, description);
    res.status(200).json({ data: result });
  } catch (err) {
    res.status(500).send({ err });
  }
};

module.exports = job;
