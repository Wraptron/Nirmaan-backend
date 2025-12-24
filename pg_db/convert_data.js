const fs = require("fs");
const csv = require("csv-parser");
const { AddStartupModel } = require("../model/StartupModel");
const { AddMentorModel } = require("../model/AddMentorModel");

// CSV → JSON Mapping Function
function mapRowToJson(row) {
  return {
    mentor_name: row["Mentor Name"],
    mento_description: row["Mentor Description"],
    years_of_exp: row["Years of Experience"],
    area_of_expertise: row["Area of Expertise"],
    designation: row["Designation"],
    institution: row["Institution"],
    qualification: row["Qualification"],
    year_of_passing_out: row["Year of Passing Out"],
    startup_assoc: row["Startup Associated"],
    contact_num: row["Contact Number"],
    email_address: row["Email Address"],
    linkedin_id: row["Linkedin"],
  };
}

// ====== CSV READING & DB INSERTION ======
let totalCount = 0;
let rows = [];

function loadCSV(filePath, targetArray) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", row => targetArray.push(row))
      .on("end", () => {
        console.log(`Loaded: ${filePath}`);
        resolve();
      })
      .on("error", reject);
  });
}

async function start() {
  await loadCSV("Mentor Details.csv", rows);

  console.log("All CSVs loaded:");
  console.log("Rows in file:", rows.length);



  // ⭐ SKIP FIRST ROW (csv-parser already handles headers, so this may be unnecessary)
  // if (rowCount === 1) {
  //   console.log("⏭ Skipping first row");
  //   return;
  // }

  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const mapped = mapRowToJson(row);
    try {
    const result = await AddMentorModel(
      mapped.mentor_name,
      null,
      mapped.mento_description,
      parseInt(mapped.years_of_exp) || 0,
      mapped.area_of_expertise,
      mapped.designation,
      mapped.institution,
      mapped.qualification,
      parseInt(mapped.year_of_passing_out || 0),
      mapped.startup_assoc,
      mapped.contact_num,
      mapped.email_address,
      mapped.linkedin_id,
      null
    );


      if (result?.status === "duplicate_skipped") {
        // console.log(
        //   `⚠ Duplicate skipped at row ${i + 1}: ${mapped.basic.startup_name || "No Name"}`
        // );
        duplicateCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      errorCount++;
      console.error(`❌ Insert failed at row ${i + 1}:`, err);
    }
  }
  console.log("=====================================");
  console.log("🚀 IMPORT SUMMARY");
  console.log("=====================================");
  console.log(`📌 Total Rows Read:         ${totalCount}`);
  console.log(`✅ Successfully Inserted:   ${successCount}`);
  console.log(`⚠ Duplicate Skipped:        ${duplicateCount}`);
  console.log(`❌ Failed Rows:             ${errorCount}`);
  console.log("=====================================");
  console.log("✅ JSON generated → output.json");

};
start()
