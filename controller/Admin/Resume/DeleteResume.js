const DeleteResumeModel = require("../../../model/DeleteResumeModel");
const { sendErrorResponse } = require("../../../utils/sendErrorResponse");

const DeleteResume = async(req, res) => {
    try
    {
        const {id} = req.params;
        const result = await DeleteResumeModel(id);
        res.status(200).json(result);
    }  
    catch(err)
    {
        sendErrorResponse(res, 500, "Failed to delete resume", err);
    }  
}
module.exports = DeleteResume;
