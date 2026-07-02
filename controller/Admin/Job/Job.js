const JobModel = require("../../../model/JobModel");
const { sendErrorResponse } = require("../../../utils/sendErrorResponse");

const job = async(req, res) => {
    try 
    {
        const {role, duration, jobtype, remuneration, requirements, description} = req.body;
        const result = await JobModel(role, duration, jobtype, remuneration, requirements, description);
        res.send(result);
    }
    catch(err)
    {
        sendErrorResponse(res, 400, "Failed to post job", err);
    }
}
module.exports = job;
