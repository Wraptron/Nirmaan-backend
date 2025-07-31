const client = require("../utils/conn");
const generatePassword = require("../utils/GeneratePassword");
var md5 = require("md5");
const { v4: uuidv4 } = require("uuid");

const AddStartupModel = async (
  basic,
  official,
  founder,
  description,
  official_email_address
) => {
  return new Promise((resolve, reject) => {
    client.query(
      "INSERT INTO test_startup(basic, official, founder, description, official_email_address, startup_status) VALUES($1, $2, $3, $4, $5, $6)",
      [basic, official, founder, description, official_email_address, "Active"],
      (err, result) => {
        if (err) {
          reject({ err });
        } else {
          resolve(result);
        }
      }
    );
  });
};

// const AddStartupModel = async(basic, official, founder, description, official_email_address) => {
//     return new Promise((resolve, reject) => {
//         // First check if startup already exists
//         client.query(
//             "SELECT * FROM test_startup WHERE official_email_address = $1 OR (basic->>'startup_name') = $2",
//             [official_email_address, basic.startup_name],
//             (err, existingResult) => {
//                 if(err) {
//                     console.error("Error checking existing startup:", err);
//                     reject(err);
//                     return;
//                 }

//                 if(existingResult.rows.length > 0) {
//                     reject(new Error("Startup with this email or name already exists"));
//                     return;
//                 }

//                 // If no existing startup, insert new one
//                 client.query(
//                     "INSERT INTO test_startup(basic, official, founder, description, official_email_address, startup_status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
//                     [basic, official, founder, description, official_email_address, 'Active'],
//                     (insertErr, insertResult) => {
//                         if(insertErr) {
//                             console.error("Error inserting startup:", insertErr);
//                             reject(insertErr);
//                         } else {
//                             resolve(insertResult.rows[0]);
//                         }
//                     }
//                 );
//             }
//         );
//     });
// }

const CreateTeamUser = (
  user_mail,
  user_password,
  user_name,
  user_contact,
  personal_email
) => {
  const userId = uuidv4();
  return new Promise((resolve, reject) => {
    client.query(
      "INSERT INTO user_data(user_mail, user_password, user_hash, user_department, user_role, user_name, user_contact, personal_email) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        user_mail,
        user_password,
        md5(user_mail),
        "student",
        "5",
        user_name,
        user_contact,
        personal_email,
      ],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};

const StartupDataModel = async () => {
  return new Promise((resolve, reject) => {
    const TotalCountStartups = new Promise((resolveQuery1, rejectQuery1) => {
      client.query(
        "SELECT COUNT(*) AS startup_total FROM test_startup",
        (err, result) => {
          if (err) {
            rejectQuery1(err);
          } else {
            resolveQuery1(result);
          }
        }
      );
    });

    // Fixed ActiveStartups query - only count Akshar and Pratham programs that are Active
    const ActiveStartups = new Promise((resolveQuery2, rejectQuery2) => {
      client.query(
        "SELECT COUNT(startup_status) AS active FROM test_startup WHERE startup_status='Active' AND (basic->>'program'='Akshar' OR basic->>'program'='Pratham')",
        (err, result) => {
          if (err) {
            rejectQuery2(err);
          } else {
            resolveQuery2(result);
          }
        }
      );
    });

    const DroppedStartups = new Promise((resolveQuery3, rejectQuery3) => {
      client.query(
        "SELECT COUNT(*) AS program_count FROM test_startup WHERE basic->>'program'='Dropped out'",
        (err, result) => {
          if (err) {
            rejectQuery3(err);
          } else {
            resolveQuery3(result);
          }
        }
      );
    });

    const GraduatedStartups = new Promise((resolveQuery3, rejectQuery3) => {
      client.query(
        "SELECT COUNT(*) AS program_count FROM test_startup WHERE basic->>'program' = 'Graduated'",
        (err, result) => {
          if (err) {
            rejectQuery3(err);
          } else {
            resolveQuery3(result);
          }
        }
      );
    });

    const AksharStartups = new Promise((resolveQuery3, rejectQuery3) => {
      client.query(
        "SELECT COUNT(*) AS program_count FROM test_startup WHERE basic->>'program' = 'Akshar'",
        (err, result) => {
          if (err) {
            rejectQuery3(err);
          } else {
            resolveQuery3(result);
          }
        }
      );
    });

    const PrathamStartups = new Promise((resolveQuery3, rejectQuery3) => {
      client.query(
        "SELECT COUNT(*) AS program_count FROM test_startup WHERE basic->>'program' = 'Pratham'",
        (err, result) => {
          if (err) {
            rejectQuery3(err);
          } else {
            resolveQuery3(result);
          }
        }
      );
    });

    const IITMIC = new Promise((resolveQuery3, rejectQuery3) => {
      client.query(
        "SELECT COUNT(*) AS program_count FROM test_startup WHERE TRIM(both ' ' FROM basic->>'graduated_to') = 'IITM-IC';",
        (err, result) => {
          if (err) {
            rejectQuery3(err);
          } else {
            resolveQuery3(result);
          }
        }
      );
    });

    const PIA = new Promise((resolveQuery3, rejectQuery3) => {
      client.query(
        "SELECT COUNT(*) AS program_count FROM test_startup WHERE TRIM(both ' ' FROM official->>'pia_state') = 'Signed';",
        (err, result) => {
          if (err) {
            rejectQuery3(err);
          } else {
            resolveQuery3(result);
          }
        }
      );
    });

    Promise.all([
      TotalCountStartups,
      ActiveStartups,
      DroppedStartups,
      GraduatedStartups,
      AksharStartups,
      PrathamStartups,
      IITMIC,
      PIA,
    ])
      .then(
        ([
          TotalCountStartups,
          ActiveStartups,
          DroppedStartups,
          GraduatedStartups,
          AksharStartups,
          PrathamStartups,
          IITMIC,
          PIA,
        ]) => {
          resolve({
            TotalCountStartups,
            ActiveStartups,
            DroppedStartups,
            GraduatedStartups,
            AksharStartups,
            PrathamStartups,
            IITMIC,
            PIA,
          });
        }
      )
      .catch((err) => {
        reject(err);
      });
  });
};

const FetchStartupsModel = async () => {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT basic::jsonb->>'startup_name' AS startup_name, startup_status AS startup_status,  basic::jsonb->>'startup_domain' AS startup_domain, basic::jsonb->>'startup_sector' AS startup_sector, basic::jsonb->>'startup_Community' AS startup_Community, basic::jsonb->>'startup_type' AS startup_type, basic::jsonb->>'startup_technology' AS startup_technology, basic::jsonb->>'startup_cohort' AS startup_cohort, basic::jsonb->>'startup_yog' AS startup_yog, basic::jsonb->>'graduated_to' AS graduated_to, basic::jsonb->>'graduated_to_other' AS graduated_to_other, basic::jsonb->>'program' AS program, official::jsonb->>'official_email_address' AS email_address, official::jsonb->>'official_contact_number' AS official_contact_number,  official::jsonb->>'role_of_faculty' AS role_of_faculty, official::jsonb->>'cin_registration_number' AS cin_registration_number,official::jsonb->>'funding_stage' AS funding_stage,  official::jsonb->>'website_link' AS website_link, official::jsonb->>'dpiit_number' AS dpiit, official::jsonb->>'official_registered' AS register, official::jsonb->>'linkedin_id' AS linkedin, official::jsonb->>'mentor_associated' AS mentor_associated, official::jsonb->>'pia_state' AS pia_state, official::jsonb->>'scheme' AS scheme, founder::jsonb->>'founder_name' AS founder_name, founder::jsonb->>'founder_email' AS founder_email, founder::jsonb->>'founder_number' AS founder_number, founder::jsonb->>'academic_background' AS academic_background,  founder::jsonb->>'founder_gender' AS founder_gender, description::jsonb->>'logo' AS logo, description::jsonb->>'startup_description' AS startup_description FROM test_startup;",
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const UpdateStartupStatusModel = async (
  startup_status,
  official_email_address
) => {
  return new Promise((resolve, reject) => {
    client.query(
      "UPDATE test_startup SET startup_status=$1 WHERE official_email_address=$2",
      [startup_status, official_email_address],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const IndividualStarupModel = async (id) => {
  const GeneralData = () => {
    return new Promise((resolveQuery2, rejectQuery2) => {
      client.query(
        `select t.basic, t.official, t.founder, t.description, t.official_email_address, t.startup_status, u.startup_name, u.amount, u.funding_type from test_startup t LEFT JOIN update_funding u ON t.official_email_address = u.startup_name WHERE t.official_email_address=$1`,
        [id],
        (err, result) => {
          if (err) {
            rejectQuery2(err);
          } else {
            resolveQuery2(result);
          }
        }
      );
    });
  };

  const FundingDistributes = () => {
    return new Promise((resolveQuery1, rejectQuery1) => {
      client.query(
        "select u.funding_type, SUM(CAST(u.amount AS INTEGER)), u.startup_name from update_funding u JOIN test_startup t ON u.startup_name = t.official_email_address WHERE funding_type='Funding Utilized' AND startup_name=$1 GROUP BY u.funding_type, u.startup_name;",
        [id],
        (err, result) => {
          if (err) {
            rejectQuery1(err);
          } else {
            resolveQuery1(result);
          }
        }
      );
    });
  };

  return new Promise((resolve, reject) => {
    Promise.all([GeneralData(), FundingDistributes()])
      .then(([generalData, fundingDistributes]) => {
        resolve({
          GeneralData: generalData,
          FundingDistributes: fundingDistributes,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const TopStartupsSectors = (id) => {
  return new Promise((resolve, reject) => {
    client.query(
      "select t.basic->>'startup_program' as sector, SUM(uf.amount), uf.funding_type AS funding_type from test_startup t JOIN update_funding uf ON uf.startup_name=t.official_email_address WHERE funding_type='Funding Distributed' GROUP BY t.basic->>'startup_program', uf.funding_type ORDER by sum DESC LIMIT $1;",
      [id],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const StartupDeleteData = (email) => {
  return new Promise((resolve, reject) => {
    client.query(
      `DELETE FROM test_startup 
            WHERE TRIM(LOWER(official_email_address)) = TRIM(LOWER($1))`,
      [email.trim().toLowerCase()],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const UpdateStartupAboutModel = async (data) => {
  const { basic, email_address, description, startup_status } = data;

  const query = `
    UPDATE test_startup
    SET basic = jsonb_set(
                  jsonb_set(
                    jsonb_set(
                      jsonb_set(
                        basic,
                        '{program}', to_jsonb($1::text), true
                      ),
                      '{startup_domain}', to_jsonb($2::text), true
                    ),
                    '{startup_sector}', to_jsonb($3::text), true
                  ),
                  '{startup_type}', to_jsonb($4::text), true
                ),
        description = jsonb_set(
                        description,
                        '{startup_description}', to_jsonb($5::text), true
                      ),
              startup_status = $6
    WHERE official->>'official_email_address' = $7;
  `;

  const values = [
    basic.program || "",
    basic.startup_domain || "",
    basic.startup_sector || "",
    basic.startup_type || "",
    description.startup_description || "",
    startup_status || "",
    email_address,
  ];

  return new Promise((resolve, reject) => {
    client.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const UpdateStartupPersonalInfoModel = async (data) => {
  const { basic, official, startup_status } = data;
  const query = `
   UPDATE test_startup
    SET
      basic = jsonb_set(
                  basic,
                  '{startup_name}', to_jsonb($1::text), true
                ),
        startup_status = $2,
      official = jsonb_set(
                   jsonb_set(
                     jsonb_set(
                       official,
                       '{official_contact_number}', to_jsonb($3::text), true
                     ),
                     '{linkedin_id}', to_jsonb($4::text), true
                   ),
                   '{website_link}', to_jsonb($5::text), true
                 )
    WHERE official->>'official_email_address' = $6
  ;
`;
  const values = [
    basic.startup_name || "",
    startup_status || "",
    official.official_contact_number || "",
    official.linkedin_id || "",
    official.website_link || "",
    official.official_email_address || "",
  ];
  return new Promise((resolve, reject) => {
    client.query(query, values, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const UpdateStartupMentorDetailsModel = async (data) => {
  const { basic, official } = data;
  const query = `
   UPDATE test_startup
SET
  basic = jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    basic,
                    '{startup_yog}', to_jsonb($1::text), true
                  ),
                  '{graduated_to}', to_jsonb($2::text), true
                ),
                '{startup_cohort}', to_jsonb($3::text), true
              ),
              '{startup_industry}', to_jsonb($4::text), true
            ),
            '{startup_technology}', to_jsonb($5::text), true
          ),
  official = jsonb_set(
                 jsonb_set(
                   jsonb_set(
                     jsonb_set(
                       jsonb_set(
                         jsonb_set(
                           jsonb_set(
                             jsonb_set(
                               official,
                               '{scheme}', to_jsonb($6::text), true
                             ),
                             '{pia_state}', to_jsonb($7::text), true
                           ),
                           '{dpiit_number}', to_jsonb($8::text), true
                         ),
                         '{role_of_faculty}', to_jsonb($9::text), true
                       ),
                       '{funding_stage}', to_jsonb($10::text), true
                     ),
                     '{mentor_associated}', to_jsonb($11::text), true
                   ),
                   '{official_registered}', to_jsonb($12::text), true
                 ),
                 '{cin_registration_number}', to_jsonb($13::text), true
               )
WHERE official->>'official_email_address' = $14;
  `;

  const values = [
    basic.startup_yog,
    basic.graduated_to,
    basic.startup_cohort,
    basic.startup_industry,
    basic.startup_technology,
    official.scheme,
    official.pia_state,
    official.dpiit_number,
    official.role_of_faculty,
    official.funding_stage,
    official.mentor_associated,
    official.official_registered,
    official.cin_registration_number,
    official.official_email_address,
  ];

  return new Promise((resolve, reject) => {
    client.query(query, values, (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const UpdateStartupFounderModel = async (data) => {
  const { founder, email_address } = data;
  const query = `
  UPDATE test_startup
  SET  founder=jsonb_set(
             jsonb_set(
          jsonb_set(
          founder,
          '{founder_name}', to_jsonb($1::text), true
          ), '{founder_email}', to_jsonb($2::text), true
          ),'{founder_number}', to_jsonb($3::text), true
          )
           WHERE official->>'official_email_address' = $4;
           `;
  const values = [
    founder.founder_name || "",
    founder.founder_email || "",
    founder.founder_number || "",
    email_address,
  ];
  return new Promise((resolve, reject) => {
    client.query(query, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const AddAwardModel = async (
  official_email_address,
  award_name,
  award_org,
  prize_money,
  awarded_date,
  document_url,
  description
) => {
  return new Promise((resolve, reject) => {
    client.query(
      `INSERT INTO startup_awards (
        official_email_address,
        award_name,
        award_org,
        prize_money,
        awarded_date,
        document_url,
        description
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )`,
      [
        official_email_address,
        award_name,
        award_org,
        prize_money,
        awarded_date,
        document_url,
        description,
      ],
      (err, result) => {
        if (err) {
          reject({ err });
        } else {
          resolve(result);
        }
      }
    );
  });
};

const FetchAwardModel = () => {
  return new Promise((resolve, reject) => {
    client.query("select * from startup_awards", (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  AddStartupModel,
  UpdateStartupAboutModel,
  AddAwardModel,
  FetchAwardModel,
  UpdateStartupFounderModel,
  UpdateStartupMentorDetailsModel,
  UpdateStartupPersonalInfoModel,
  StartupDataModel,
  FetchStartupsModel,
  UpdateStartupStatusModel,
  IndividualStarupModel,
  CreateTeamUser,
  TopStartupsSectors,
  StartupDeleteData,
};
