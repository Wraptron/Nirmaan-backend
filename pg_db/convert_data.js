const fs = require("fs");
const csv = require("csv-parser");
const { AddStartupModel } = require("../model/StartupModel");

// Helper function to clean strings
function cleanString(value) {
  return String(value || "").trim();
}

// Helper function to parse funding values
function parseFunding(value) {
  if (!value) return 0;
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : num;
}

// Helper function to parse CSV lists
function parseCSVList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// Helper to safely parse integers
function parseIntSafe(value, defaultVal = 0) {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

// CSV → JSON mapping
function mapRowToJson(row, userId) {
  const founderEmail = cleanString(
    row["Personal Email Id"] || row["Institute / Smail Id"] || ""
  );

  const contactNum = cleanString(row["Contact Number"]);
  const startupName = cleanString(row["Name of Startup"]);

  return {
    basic: {
      startup_name: startupName,
      startup_cohort: cleanString(row["Cohort"]),
      startup_domain: cleanString(row["Domain"]),
      startup_sector: cleanString(row["Sector"]),
      startup_community: cleanString(row["Community"]),
      program: cleanString(row["Phase"]),
      status: cleanString(row["Status"]),
      startup_technology: cleanString(row["Technology"])
    },

    official: {
      official_email_address: founderEmail,
      official_contact_number: contactNum,
      official_registered:
        cleanString(row["Officially Registered"]).toLowerCase() === "yes",
      cin_registration_number: cleanString(row["CIN/Registration Number"]),
      dpiit_number: cleanString(row["DPIIT Number"]),
      pia_signed: cleanString(row["PIA Signed"]),
      faculty_involved: cleanString(row["Faculty Involved"]),
      website_link: cleanString(row["Website"] || ""),
      funding_stage: cleanString(row["Fund Source"]),
      mentor_associated: cleanString(row["Mentors"]),
      role_of_faculty: cleanString(row["Role of Faculty"])
    },

    founder: {
      founder_name: cleanString(row["Founder PoC"]),
      founder_student_id: cleanString(row["Roll Number"]),
      personal_email: founderEmail,
      founder_email: founderEmail,
      founder_number: contactNum,
      academic_background: cleanString(row["Academic Background"]),
      university: cleanString(row["University"]),
      institute_email: cleanString(row["Institute / Smail Id"])
    },

    funding: {
      fund_source: cleanString(row["Fund Source"]),
      fund_allocated: parseFunding(row["Fund allocated"]),
      fund_used: parseFunding(row["Fund used"]),
      balance_fund: parseFunding(row["Balance Fund Left"]),
      external_funds_received: parseFunding(row["External Funds Received"]),
      external_funds_used: parseFunding(row["External Funds Used"])
    },

    intellectual_property: {
      patent: parseIntSafe(row["Patent"], 0),
      design: parseIntSafe(row["Design"], 0),
      trademark: parseIntSafe(row["Trademark"], 0),
      copyright: parseIntSafe(row["Copyright"], 0)
    },

    description: {
      achievements: cleanString(row["Achievements"]),
      about: cleanString(row["Brief description"]),
      pitch_deck_url: cleanString(row["Pitch Deck"])
    },

    graduation: {
      graduated_to: cleanString(row["Graduated TO"]),
      year_of_graduation: parseIntSafe(row["Year Of Graduation"], 0)
    },

    official_email_address: founderEmail,
    startup_status: cleanString(row["Status"]),
    user_id: userId
  };
}

// CSV IMPORT
async function importStartupsFromCSV(filePath = "startups.csv", userId = "admin") {
  let rowCount = 0;
  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  const results = [];
  const errors = [];

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`❌ File not found: ${filePath}`));
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (row) => {
        rowCount++;

        try {
          const startupName = cleanString(row["Name of Startup"]);

          // Skip if no startup name
          if (!startupName) {
            errorCount++;
            errors.push({ row: rowCount, startup: "N/A", error: "Missing startup name" });
            console.warn(`⏭️ Row ${rowCount}: Skipped (missing startup name)`);
            return;
          }

          console.log(`📝 Row ${rowCount}: Processing "${startupName}"`);

          // Convert row to JSON
          const mapped = mapRowToJson(row, userId);

          // Insert into DB
          const result = await AddStartupModel(
            mapped.basic,
            mapped.official,
            mapped.founder,
            mapped.funding,
            mapped.intellectual_property,
            mapped.description,
            mapped.graduation,
            mapped.official_email_address,
            mapped.user_id
          );

          if (result?.status === "duplicate_skipped") {
            duplicateCount++;
            console.log(`⚠️ Row ${rowCount}: Duplicate - "${startupName}"`);
          } else {
            successCount++;
            console.log(`✅ Row ${rowCount}: Inserted - "${startupName}"`);
          }

          results.push(mapped);

        } catch (err) {
          errorCount++;
          errors.push({
            row: rowCount,
            startup: row["Name of Startup"] || "N/A",
            error: err.message
          });

          console.error(`❌ Row ${rowCount}: ${err.message}`);
        }
      })

      .on("end", () => {
        console.log("\n" + "═".repeat(70));
        console.log("🚀 CSV IMPORT SUMMARY");
        console.log("═".repeat(70));
        console.log(`📌 Total Rows Processed:     ${rowCount}`);
        console.log(`✅ Successfully Inserted:    ${successCount}`);
        console.log(`⚠️ Duplicates Skipped:       ${duplicateCount}`);
        console.log(`❌ Failed:                   ${errorCount}`);
        console.log(
          `📊 Success Rate:             ${((successCount / rowCount) * 100).toFixed(
            2
          )}%`
        );
        console.log("═".repeat(70));

        // Save results
        if (results.length > 0) {
          fs.writeFileSync("output.json", JSON.stringify(results, null, 2));
          console.log(`✨ ${results.length} records saved → output.json`);
        }

        if (errors.length > 0) {
          fs.writeFileSync("import_errors.json", JSON.stringify(errors, null, 2));
          console.log(`📄 ${errors.length} errors saved → import_errors.json`);
        }

        resolve({
          total: rowCount,
          success: successCount,
          duplicate: duplicateCount,
          error: errorCount,
          errors,
          successRate: ((successCount / rowCount) * 100).toFixed(2) + "%"
        });
      })

      .on("error", (err) => {
        reject(new Error(`❌ CSV Reading Error: ${err.message}`));
      });
  });
}

// MAIN
(async () => {
  try {
    console.log("🚀 Starting CSV import...\n");

    const filePath = process.argv[2] || "startups.csv";
    const userId = process.argv[3] || "admin";

    const stats = await importStartupsFromCSV(filePath, userId);

    console.log("\n✨ Import completed successfully!");
    console.log("📊 Final Stats:");
    console.log(stats);
  } catch (err) {
    console.error("💥 Fatal error:", err.message);
    process.exit(1);
  }
})();

module.exports = { importStartupsFromCSV };