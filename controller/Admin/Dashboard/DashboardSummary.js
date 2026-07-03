const pool = require("../../../utils/conn");
const { StartupDataModel } = require("../../../model/StartupModel");
const { FetchMentorDataModel, MentorCountData } = require("../../../model/AddMentorModel");
const { FetchEventsModel } = require("../../../model/Admin/EventsModel");
const {
  FetchFundingModel,
  FetchFundingTotalNumbers,
} = require("../../../model/Finance/AddFuningModel");
const { ViewConnectionModel } = require("../../../model/ConnectionModel");
const { CACHE_KEYS, getOrSet } = require("../../../utils/queryCache");

const STARTUP_LIST_SQL =
  "SELECT user_id AS startup_id, basic::jsonb->>'profile_image' AS profile_image, basic::jsonb->>'startup_name' AS startup_name, startup_status AS startup_status, basic::jsonb->>'startup_domain' AS startup_domain, basic::jsonb->>'startup_sector' AS startup_sector, basic::jsonb->>'startup_Community' AS startup_Community, basic::jsonb->>'startup_type' AS startup_type, basic::jsonb->>'startup_technology' AS startup_technology, basic::jsonb->>'startup_cohort' AS startup_cohort, basic::jsonb->>'startup_yog' AS startup_yog, basic::jsonb->>'graduated_to' AS graduated_to, basic::jsonb->>'graduated_to_other' AS graduated_to_other, basic::jsonb->>'program' AS program, official::jsonb->>'official_email_address' AS email_address, official::jsonb->>'official_contact_number' AS official_contact_number, official::jsonb->>'role_of_faculty' AS role_of_faculty, official::jsonb->>'cin_registration_number' AS cin_registration_number, official::jsonb->>'funding_stage' AS funding_stage, official::jsonb->>'website_link' AS website_link, official::jsonb->>'dpiit_number' AS dpiit, official::jsonb->>'official_registered' AS register, official::jsonb->>'linkedin_id' AS linkedin, official::jsonb->>'mentor_associated' AS mentor_associated, official::jsonb->>'pia_state' AS pia_state, official::jsonb->>'scheme' AS scheme, founder::jsonb->>'founder_name' AS founder_name, founder::jsonb->>'founder_email' AS founder_email, founder::jsonb->>'founder_number' AS founder_number, founder::jsonb->>'academic_background' AS academic_background, founder::jsonb->>'founder_gender' AS founder_gender, ip_details::jsonb->>'patent' AS patent, ip_details::jsonb->>'design' AS design, ip_details::jsonb->>'trademark' AS trademark, ip_details::jsonb->>'copyright' AS copyright, description::jsonb->>'logo' AS logo, description::jsonb->>'startup_description' AS startup_description FROM test_startup WHERE isdeleted = 'f' ORDER BY user_id";

function shapeStartupCounts(result) {
  return {
    startup_total: result?.TotalCountStartups?.rows?.[0]?.startup_total || 0,
    active_startups: result?.ActiveStartups?.rows?.[0]?.active || 0,
    dropped_startups: result?.DroppedStartups?.rows?.[0]?.program_count || 0,
    graduated_startups: result?.GraduatedStartups?.rows?.[0]?.program_count || 0,
    akshar: result?.AksharStartups?.rows?.[0]?.program_count || 0,
    pratham: result?.PrathamStartups?.rows?.[0]?.program_count || 0,
    IITMIC: result?.IITMIC?.rows?.[0]?.program_count || 0,
    PIA: result?.PIA?.rows?.[0]?.program_count || 0,
    IP: result?.IP?.rows?.[0]?.total_ip_sum || 0,
    Mentors: {
      Session_Total: parseInt(
        result?.TotalMentoringSessions?.rows?.[0]?.session_total || 0
      ),
    },
  };
}

function shapeFundingTotals(result) {
  return {
    funding_disbursed: Number(result.disbursed) || 0,
    funding_utilized: Number(result.utilized) || 0,
    external_funding: Number(result.external) || 0,
  };
}

async function fetchStartupCounts() {
  return getOrSet(CACHE_KEYS.STARTUP_COUNTS, async () => {
    const result = await StartupDataModel();
    return shapeStartupCounts(result);
  });
}

async function fetchFundingTotals() {
  return getOrSet(CACHE_KEYS.FUNDING_TOTALS, async () => {
    const result = await FetchFundingTotalNumbers();
    return shapeFundingTotals(result);
  });
}

async function fetchMentorCount() {
  return getOrSet(CACHE_KEYS.MENTOR_COUNT, () => MentorCountData());
}

async function fetchMentorList() {
  return getOrSet(CACHE_KEYS.MENTOR_LIST, () => FetchMentorDataModel());
}

async function fetchEventsList() {
  return getOrSet(CACHE_KEYS.EVENTS_LIST, () => FetchEventsModel());
}

async function fetchConnectionsList() {
  return getOrSet(CACHE_KEYS.CONNECTIONS_LIST, () => ViewConnectionModel());
}

/**
 * Fetches the full startup list using one pooled connection (count + rows sequential).
 */
async function fetchAllStartupsOnClient(client) {
  const countResult = await client.query(
    "SELECT COUNT(*)::int AS total FROM test_startup WHERE isdeleted = 'f'"
  );
  const rowsResult = await client.query(STARTUP_LIST_SQL);
  const total = countResult.rows[0]?.total || 0;
  const rows = rowsResult.rows || [];

  return {
    rows,
    rowCount: rows.length,
    total,
    page: 1,
    limit: rows.length,
    offset: 0,
    totalPages: total > 0 ? 1 : 0,
  };
}

/**
 * Runs uncached read queries sequentially on a single DB connection.
 */
async function withSingleConnection(runQueries) {
  const client = await pool.connect();
  try {
    return await runQueries(client);
  } finally {
    client.release();
  }
}

/**
 * Overview + Start-ups tabs: count-startupdata, /funding totals, fetch-startup (all rows).
 * One HTTP round-trip instead of 3 (or more when fetch-startup paginates).
 */
const DashboardOverviewSummary = async (req, res) => {
  try {
    const [startupCounts, fundingTotals, startups] = await Promise.all([
      fetchStartupCounts(),
      fetchFundingTotals(),
      withSingleConnection((client) => fetchAllStartupsOnClient(client)),
    ]);

    res.status(200).json({
      startupCounts,
      fundingTotals,
      startups,
    });
  } catch (err) {
    console.error("Error in DashboardOverviewSummary:", err.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Full dashboard read bundle used by load tests: all 8 endpoints in one request.
 * Cached sections skip DB; uncached funding rows + startup list share one connection.
 */
const DashboardSummary = async (req, res) => {
  try {
    const [
      startupCounts,
      mentors,
      mentorCount,
      events,
      connections,
      fundingTotals,
    ] = await Promise.all([
      fetchStartupCounts(),
      fetchMentorList(),
      fetchMentorCount(),
      fetchEventsList(),
      fetchConnectionsList(),
      fetchFundingTotals(),
    ]);

    const { startups, funding } = await withSingleConnection(async (client) => {
      const startupsPayload = await fetchAllStartupsOnClient(client);
      const fundingResult = await client.query("SELECT * FROM update_funding");
      return {
        startups: startupsPayload,
        funding: fundingResult,
      };
    });

    res.status(200).json({
      startupCounts,
      startups,
      mentors,
      mentorCount,
      events,
      funding,
      fundingTotals,
      connections,
    });
  } catch (err) {
    console.error("Error in DashboardSummary:", err.stack || err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  DashboardOverviewSummary,
  DashboardSummary,
  shapeStartupCounts,
  shapeFundingTotals,
};
