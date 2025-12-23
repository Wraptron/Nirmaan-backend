const fs = require("fs");
const csv = require("csv-parser");
const { AddStartupModel } = require("../model/StartupModel");

// CSV → JSON Mapping Function
function mapRowToJson(row) {
  return {
    basic: {
      startup_name: row["Name of Startup"],
      startup_type: row["Type"] || "",
      startup_cohort: row["Cohort"] || "",
      startup_domain: row["Domain"],
      startup_sector: row["Sector"],
      startup_industry: row["Industry"] || "",
      startup_Community: row["Community"],
      startup_technology: row["Technology"] || "",
      program: row["Phase"],
      graduated_to: row["Graduated To"],
    },
    official: {
      password: "",
      pia_state: row["PIA Signed"] || "",
      linkedin_id: row["LinkedIn ID"] || "",
      dpiit_number: row["DPIIT Number"] || "",
      website_link: row["Website"] || "",
      funding_stage: row["Fund Source"] || "",
      role_of_faculty: row["Faculty Involved"] || "",
      mentor_associated: row["Mentor"] || "",
      official_registered: row["Official Registered"] || "",
      official_email_address:
        row["Personal Email Id"] || "",
      cin_registration_number: row["CIN Number"] || "",
      official_contact_number: row["Contact Number"],
    },
    official_email_address:
      row["Personal Email Id"] ?? "uttamsharma.867@gmail.com",
    founder: {
      founder_id: row["Founder ID"] || "",
      linkedInid: row["Founder LinkedIn"] || "",
      founder_name: row["Founder PoC"],
      founder_email: row["Personal Email Id"],
      founder_gender: row["Gender"] || "",
      founder_number: row["Contact Number"],
      founder_student_id: row["Roll Number"] || "",
      academic_background: row["Academic Background"],
    },
    description: {
      logo: {},
      logo_image: "",
      startup_description: row["Brief description"] || "",
    },
    startup_status: row["Status"],
    user_id: row["User ID"] || "",
    isdeleted: "f",
    ip_details: {
      patent: row["Patent"] || "",
      design: row["Design"] || "",
      trademark: row["Trademark"] || "",
      copyright: row["Copyright"] || "",
    },
  };
}

// ====== CSV READING & DB INSERTION ======
let totalCount = 0;
let rows1 = [];
let rows2 = [];
let rows3 = [];
let rows4 = [];

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
  await loadCSV("Pratham Teams.csv", rows1);
  await loadCSV("Akshar Teams.csv", rows2);
  await loadCSV("Graduated Teams.csv", rows3);
  await loadCSV("Dropped Teams.csv", rows4);

  console.log("All CSVs loaded:");
  console.log("Rows in file 1:", rows1.length);
  console.log("Rows in file 2:", rows2.length);
  console.log("Rows in file 3:", rows3.length);
  console.log("Rows in file 4:", rows4.length);


  // ⭐ SKIP FIRST ROW (csv-parser already handles headers, so this may be unnecessary)
  // if (rowCount === 1) {
  //   console.log("⏭ Skipping first row");
  //   return;
  // }

  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
const allRows = [...rows1, ...rows2, ...rows3, ...rows4];
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];

    const mapped = mapRowToJson(row);
    if (
      !mapped.basic.startup_name ||
      mapped.basic.startup_name.trim() === ""
    ) {
      // console.error(`❌ ERROR (Row ${i}): Startup Name is missing`);
      continue; // skip insert
    }
    try {
      const result = await AddStartupModel(
        mapped.basic,
        mapped.official,
        mapped.founder,
        mapped.description,
        mapped.official_email_address,
        mapped.startup_status,
        mapped.ip_details
      )

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
