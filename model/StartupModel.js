const client = require('../utils/conn');
const generatePassword = require('../utils/GeneratePassword');
var md5 = require('md5');
const { v4: uuidv4 } = require('uuid');

const AddStartupModel = async(basic, official, founder, description, official_email_address) => {
    return new Promise((resolve, reject)=> {
        client.query("INSERT INTO test_startup(basic, official, founder, description, official_email_address, startup_status) VALUES($1, $2, $3, $4, $5, $6)", [basic, official, founder, description, official_email_address, 'Active'], 
          (err, result) => {
            if(err)
            {
                reject({err});
            }
            else
            {
                resolve(result);
            }
          }  
        )
    })
}
const CreateTeamUser = (user_mail, user_password, user_name, user_contact, personal_email) => {
    const userId = uuidv4();
    return new Promise((resolve, reject) => {
        client.query(
            "INSERT INTO user_data(user_mail, user_password, user_hash, user_department, user_role, user_name, user_contact, personal_email) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
            [user_mail, user_password, md5(user_mail), 'student', '5', user_name, user_contact, personal_email],
            (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        );
    });
}
const StartupDataModel = async() => {
    return new Promise((resolve, reject) => {
            const TotalCountStartups = new Promise((resolveQuery1, rejectQuery1) => {
                    client.query("SELECT COUNT(basic::json->'startup_name,program') AS startup_total FROM test_startup", (err, result) => {
                        if(err)
                        {
                            rejectQuery1(err)
                        }
                        else
                        {
                            resolveQuery1(result)
                        }
                    })
            })
            const ActiveStartups = new Promise((resolveQuery2, rejectQuery2) => {
                client.query("SELECT COUNT(startup_status) AS active FROM test_startup WHERE startup_status='Active'", (err, result) => {
                    if(err)
                    {
                        rejectQuery2(err)
                    }
                    else
                    {
                        resolveQuery2(result)
                    }
                }) 
            })
            const DroppedStartups = new Promise((resolveQuery3, rejectQuery3) => {
                client.query("SELECT COUNT(startup_status) AS Dropped_status FROM test_startup WHERE startup_status='Dropped'", (err, result) => {
                    if(err)
                    {
                        rejectQuery3(err);
                    }
                    else
                    {
                        resolveQuery3(result)
                    }
                })
            })

            const GraduatedStartups = new Promise((resolveQuery3, rejectQuery3) => {
                client.query("SELECT COUNT(startup_status) AS graduated_status FROM test_startup WHERE startup_status='Graduated'", (err, result) => {
                    if(err)
                    {
                        rejectQuery3(err);
                    }
                    else
                    {
                        resolveQuery3(result)
                    }
                })
            })

            Promise.all([TotalCountStartups, ActiveStartups, DroppedStartups, GraduatedStartups, 
              
                
                ])
            .then(([TotalCountStartups, ActiveStartups, DroppedStartups, GraduatedStartups, 
                
            ]) => {
                resolve({
                    TotalCountStartups,
                    ActiveStartups,
                    DroppedStartups,
                    GraduatedStartups,
                    
                });
            })
            .catch((err) => {
                reject(err)
            });
    })  
}
const FetchStartupsModel = async() => {
    return new Promise((resolve, reject) => {
        client.query(
"SELECT basic::jsonb->>'startup_name' AS startup_name, startup_status AS status, basic::jsonb->>'startup_industry' AS startup_industry, basic::jsonb->>'startup_sector' AS startup_sector, basic::jsonb->>'startup_type' AS startup_type, basic::jsonb->>'startup_technology' AS startup_technology, basic::jsonb->>'startup_cohort' AS startup_cohort, basic::jsonb->>'startup_yog' AS startup_yog, basic::jsonb->>'graduated_to' AS graduated_to, basic::jsonb->>'program' AS program, official::jsonb->>'official_email_address' AS email_address, official::jsonb->>'official_contact_number' AS contact_number, official::jsonb->>'cin_registration_number' AS cin, official::jsonb->>'website_link' AS website, official::jsonb->>'dpiit_number' AS dpiit, official::jsonb->>'official_registered' AS register, official::jsonb->>'linkedin_id' AS linkedin, official::jsonb->>'mentor_associated' AS mentor_associated, official::jsonb->>'pia_state' AS pia_state, official::jsonb->>'scheme' AS scheme, founder::jsonb->>'founder_name' AS founder_name, founder::jsonb->>'founder_email' AS founder_email, founder::jsonb->>'founder_number' AS founder_number, founder::jsonb->>'founder_gender' AS founder_gender, description::jsonb->>'startup_description' AS startup_description FROM test_startup;",
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
    })
} 
const UpdateStartupStatusModel = async(startup_status, official_email_address) => {
    return new Promise((resolve, reject) => {
        client.query("UPDATE test_startup SET startup_status=$1 WHERE official_email_address=$2", [startup_status, official_email_address], (err, result) => {
            if(err)
            {
                reject(err)
            }
            else 
            {
                resolve(result)
            }
        })
    })
}
const IndividualStarupModel = async(id) => {
    const GeneralData = () => {
        return new Promise((resolveQuery2, rejectQuery2) => {
            client.query(`select t.basic, t.official, t.founder, t.description, t.official_email_address, t.startup_status, u.startup_name, u.amount, u.funding_type from test_startup t LEFT JOIN update_funding u ON t.official_email_address = u.startup_name WHERE t.official_email_address=$1`, [id], (err, result) => { //select t.basic, t.official_email_address, u.startup_name, u.amount, u.funding_type from test_startup t JOIN update_funding u ON t.official_email_address = u.startup_name;
                if(err)
                {
                    //SELECT * FROM test_startup WHERE official_email_address=$1
                    rejectQuery2(err)
                }
                else
                {
                    resolveQuery2(result)
                }
            })
        })
    }

    const FundingDistributes = () => {
        return new Promise((resolveQuery1, rejectQuery1) => {
            client.query("select u.funding_type, SUM(CAST(u.amount AS INTEGER)), u.startup_name from update_funding u JOIN test_startup t ON u.startup_name = t.official_email_address WHERE funding_type='Funding Utilized' AND startup_name=$1 GROUP BY u.funding_type, u.startup_name;", [id], (err, result) => {
                if(err)
                {     
                    rejectQuery1(err)
                }
                else 
                {
                    resolveQuery1(result);
                }
            })
        })
    }

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
}

const TopStartupsSectors = (id) => {
    return new Promise((resolve, reject) => {
        client.query("select t.basic->>'startup_program' as sector, SUM(uf.amount), uf.funding_type AS funding_type from test_startup t JOIN update_funding uf ON uf.startup_name=t.official_email_address WHERE funding_type='Funding Distributed' GROUP BY t.basic->>'startup_program', uf.funding_type ORDER by sum DESC LIMIT $1;", [id], (err, result) => {
            if(err)
            {
                reject(err)
            }
            else
            {
                resolve(result)
            }
        })
    })
}
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
    })
} 
module.exports = {AddStartupModel, StartupDataModel, FetchStartupsModel, UpdateStartupStatusModel, IndividualStarupModel, CreateTeamUser, TopStartupsSectors,StartupDeleteData};