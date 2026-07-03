const {CreateEventsModel, FetchEventsModel, RequestSpeakerModel, DeleteEventModal, UpdateEventModel} = require('../../../model/Admin/EventsModel');
const {
  CACHE_KEYS,
  getOrSet,
  invalidateEventCaches,
} = require('../../../utils/queryCache');
const { uploadToS3 } = require('../../../utils/s3Upload');
const CreateEvents = async (req, res) => {
  try {
    const {
      event_type,
      event_title,
      event_privacy,
      speaker,
      event_date,
      event_time,
      event_link,
      description,
    } = req.body;

  let thumbnail = null;

  if (req.files?.thumbnail?.[0]) {
      thumbnail = await uploadToS3(req.files.thumbnail[0], "thumbnail");
  }

 
    const result = await CreateEventsModel(
      event_type,
      event_title,
      event_privacy,
      speaker,
      event_date,
      event_time,
      event_link,
      thumbnail,
      description,
    );

    invalidateEventCaches();

    res.status(200).json({
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
};


const FetchEvents = async(req, res) => {
    try 
    {
        const rawLimit = req.query.limit;
        const rawOffset = req.query.offset;

        if (rawLimit !== undefined) {
            const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 25, 1), 100);
            const offset = Math.max(parseInt(rawOffset, 10) || 0, 0);
            const result = await FetchEventsModel({ limit, offset });
            res.status(200).json(result);
            return;
        }

        const result = await getOrSet(CACHE_KEYS.EVENTS_LIST, () =>
            FetchEventsModel()
        );
        res.status(200).json(result);
    }
    catch(err)
    {
        console.log(err);
    }
}
const DeleteEvent = async (req, res) => {
  const id = req.params.id;

  if (id) {
    try {
      const result = await DeleteEventModal(id);
      invalidateEventCaches();
      res.status(200).send(result);
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    res.status(400).send("params missing");
  }
};

const UpdateEvent = async (req, res) => {
  try {
    const {
      event_type,
      event_title,
      event_privacy,
      speaker,
      event_date,
      event_time,
      event_link,
      description,
      event_id,
      thumbnail: existingThumbnail,
    } = req.body;

    let thumbnail = existingThumbnail; // 👈 KEEP OLD IMAGE

    // If new thumbnail uploaded → replace
    if (req.files?.thumbnail?.[0]) {
      thumbnail = await uploadToS3(req.files.thumbnail[0], "event_thumbnail");
    }

    const result = await UpdateEventModel(
      event_type,
      event_title,
      event_privacy,
      speaker,
      event_date,
      event_time,
      event_link,
      thumbnail,
      description,
      event_id,
    );

    invalidateEventCaches();

    res.status(200).json({
      message: "Event updated successfully",
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update Event details" });
  }
};



const RequestSpeaker = async(req, res) => {
    const {select_speaker, event_description, created_by} = req.body;
    if(!select_speaker || !event_description || !created_by)
    {
        res.status(401).send("Not a Proper ")
    }
    else
    {
        try
        {
            const result = await RequestSpeakerModel(select_speaker, event_description, created_by);
            res.status(200).json(result);
        }
        catch(err)
        {
            console.log(err);
        }
    }
}

// const AddPastEvents = async(req, res) => {
//     const {event_type, event_title, event_description, select_speaker, event_date, event_time, created_by} = req.body;
//     if(!event_type || !event_title || !event_date || !event_time || !event_description || !select_speaker || !created_by)
//     {
//         res.status(401).send("Not a Proper");
//     }
//     else
//     {
//         try
//         {
//             const 
//         }
//         catch(err)
//     }
// }
module.exports = {CreateEvents, FetchEvents,DeleteEvent,UpdateEvent, RequestSpeaker};