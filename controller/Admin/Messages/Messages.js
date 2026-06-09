const {SendMessageModel, ViewMessageModel} = require("../../../model/Messages");
const { sendErrorResponse } = require("../../../utils/sendErrorResponse");

const AddMessage = async(req, res) => {
    try 
    {
        const {message_id, sender_id, message, receiver_id} = req.body;
        const result = await SendMessageModel(message_id, sender_id, message, receiver_id);
        res.send(result);
    }
    catch(err)
    {
        sendErrorResponse(res, 400, 'Failed to send message', err);
    }
}
const ViewMessage = async(req, res) => {
      try
      {
        const {sender_id} = req.body;
        const result = await ViewMessageModel(sender_id);
        res.send(result);
      }
      catch(err)
      {
        sendErrorResponse(res, 500, 'Internal Server Error', err);
      }
}
module.exports = {AddMessage, ViewMessage}
