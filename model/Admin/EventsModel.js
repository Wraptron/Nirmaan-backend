const client = require('../../utils/conn');
const CreateEventsModel = (  event_type,
    event_title,
    event_privacy,
    speaker,
    event_date,
    event_time,
    event_link,
    thumbnail,
    description) => {
    return new Promise((resolve, reject) => {
        client.query('INSERT INTO events (event_type, event_title, event_privacy, speaker, event_date, event_time, event_link, event_thumbnail, event_description) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [event_type, event_title, event_privacy, speaker, event_date, event_time, event_link, thumbnail, description], 
            (err, result) => {
                 if(err) 
                 {
                    reject(err);
                 }
                 else 
                 {
                    resolve(result);
                 }
            }
        )
    })
}

const FetchEventsModel = () => {
    return new Promise((resolve, reject) => {
        client.query('SELECT * FROM events',
            (err, result) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(result)
                }
            }
        )
    })
}
const DeleteEventModal = (id) => {
  return new Promise((resolve, reject) => {
    client.query(
      "DELETE from events where event_id=$1",
      [id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      },
    );
  });
};

const UpdateEventModel = async (
  event_type,
    event_title,
    event_privacy,
    speaker,
    event_date,
    event_time,
    event_link,
    thumbnail,
    description,
    event_id
) => {
  return new Promise((resolve, reject) => {
    client.query(
      `UPDATE events 
       SET event_type=$1, event_title=$2, event_privacy=$3, speaker=$4, 
        event_date=$5, event_time=$6,event_link=$7,event_thumbnail=$8,event_description=$9
       WHERE event_id=$10 RETURNING *`,
      [
        event_type,
        event_title,
        event_privacy,
        speaker,
        event_date,
        event_time,
        event_link,
        thumbnail,
          description,
        event_id
      ],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0]);
        }
      },
    );
  });
};
const RequestSpeakerModel = (select_speaker, event_description, created_by) => {
    return new Promise((resolve, reject) => {
        client.query('INSERT INTO request_speaker(speaker_name, event_description, created_by) VALUES($1, $2, $3)', [select_speaker, event_description, created_by],
            (err, result) => {
                if(err)
                {
                    reject(err)
                }
                else 
                {
                    resolve(result);
                }
            }
        )
    })
}

const AddPastEventsModel = (event_type, event_title, event_date, event_time, event_description, created_by, select_speaker) => {
    return new Promise((resolve, reject) => {
        client.query('INSERT INTO EVENTS (event_type, event_title, event_privacy, event_description, event_date, event_time, created_by, select_speaker) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [event_type, event_title, 'Public', event_description, event_date, event_time, created_by, select_speaker], 
            (err, result) => {
                 if(err) 
                 {
                    reject(err);
                 }
                 else 
                 {
                    resolve(result);
                 }
            }
        )
    })
}

module.exports = {CreateEventsModel, FetchEventsModel,DeleteEventModal,UpdateEventModel, RequestSpeakerModel, AddPastEventsModel};