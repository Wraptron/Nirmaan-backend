const client = require("../utils/conn");

const ScheduleMeetingModel = (
  mentor_reference_id,
  start_up_name,
  founder_name,
  meeting_mode,
  meeting_link,
  meeting_location,
  participants,
  date,
  time,
  meeting_duration,
  meeting_agenda
) => {
  return new Promise((resolve, reject) => {
    client.query(
      `
        INSERT INTO meetings (
          meet_id,
          mentor_reference_id,
          start_up_name,
          founder_name,
          meeting_mode,
          meeting_link,
          meeting_location,
          participants,
          date,
          time,
          meeting_duration,
          meeting_agenda
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        mentor_reference_id,
        start_up_name,
        founder_name,
        meeting_mode,
        meeting_link,
        meeting_location,
        participants,
        date,
        time,
        meeting_duration,
        meeting_agenda,
      ],
      (err, result) => {
        if (err) {
          console.log("SQL INSERT ERROR:", err);
          reject({ STATUS: err });
        } else {
          resolve({ STATUS: result });
        }
      }
    );
  });
};

module.exports = { ScheduleMeetingModel };
