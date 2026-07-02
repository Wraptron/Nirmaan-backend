const {AddMentorHourModel} = require("../../model/CustomerModel/AddMentorHourModel");
const {FetchMentorData} = require('../../model/CustomerModel/FetchData');
const { sendErrorResponse } = require('../../utils/sendErrorResponse');

const AddMentorHour = async(req, res) => {
    const {team_mail, startup, mentor, date, time, description} = req.body;
    if(!team_mail || !startup || !mentor || !date || !time || !description)
    {
        res.status(400).json({data : "Bad request  "});
    }
    else
    {
        try 
        {
                const result = await AddMentorHourModel(team_mail, startup, mentor, date, time, description);
                if(result.code == "23505")
                {
                    res.status(401).send("Request already raised");
                }
                else
                {
                    res.status(200).json({result});
                }
        }
        catch(err)
        {
                if(err.code=="23505")
                {
                    res.status(409).send("Error");
                } 
                else 
                {
                    sendErrorResponse(res, 500, 'Internal Server Error', err);
                }
        }   
    }
}
const FetchDataMentor = async(req, res) => {

        try
        {
            const result = await FetchMentorData();
            res.status(200).json({result});
        }
        catch(err)
        {
            sendErrorResponse(res, 500, 'Internal Server Error', err);
        }
}
module.exports = {AddMentorHour, FetchDataMentor}
