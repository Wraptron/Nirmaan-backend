const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "../uploads/" }); // For handling multipart/form-data

// Middleware
const Authenticate = require("../utils/Authenticate.js");

// Login & Authentication
const LoginController = require("../controller/Admin/LoginController/LoginController");
const ForgotRequest = require("../controller/Admin/LoginController/ForgotRequest.js");

// Profile
const {
  Profile,
  ProfilePhoto,
} = require("../controller/Admin/Profile/Profile.js");

// Resume Management
const ResumeController = require("../controller/Admin/Resume/ResumeController.js");
const GetAllResumeController = require("../controller/Admin/Resume/GetAllResumeController.js");
const ResumeUpload = require("../controller/Admin/Resume/ResumeUpload.js");
const Resumedata = require("../controller/Admin/Resume/Resumedata.js");
const ApprovalRequest = require("../controller/Admin/Resume/ApporvalRequest.js");
const DeleteResume = require("../controller/Admin/Resume/DeleteResume.js");

// Mentor Management
const {AddMentor, updateMentorProfile} = require("../controller/Admin/Mentors/AddMentor.js");
const {
  FetchMentorData,
  MentorCount,
  DeleteMentorData,
  UpdateMentorData,
} = require("../controller/Admin/Mentors/MentorData.js");
const {
  AddMentorHour,
  FetchDataMentor,
} = require("../controller/Team/Mentor.js");
const ScheduleMeeting = require("../controller/Admin/Mentors/ScheduleMeeting.js");
const {
  FetchMeetings,
} = require("../controller/Admin/Mentors/FetchMeetings.js");


// Startups
const {
  AddStartup,
  FetchStartupDatainNumbers,
  FetchStartupData,
  UpdateStatus,
  IndividualStartups,
  TopStartupsSectorsCont,
  TeamDocuments,
} = require("../controller/Admin/startups/AddStartup.js");

// Messaging
const {
  AddMessage,
  ViewMessage,
} = require("../controller/Admin/Messages/Messages.js");

// Work Requests
const WorkController = require("../controller/Admin/WorkRequestController/WorkRequestController");

// Connections
const {
  AddConnections,
  ViewConnections,
  EstablishConnection,
  DeleteConnection,
} = require("../controller/Admin/Connections/Connection.js");

// Notifications
const {
  ViewNotification,
} = require("../controller/Admin/Notification/Notification.js");

// Events
const {
  CreateEvents,
  FetchEvents,
  RequestSpeaker,
} = require("../controller/Admin/Events/Events.js");

// Reports
const Report = require("../controller/Admin/Reports/Report.js");

// Jobs
const Job = require("../controller/Admin/Job/Job.js");
const AddJob = require("../controller/Team/AddJob.js");

// Team & Founder
const Founder = require("../controller/Team/Founder.js");
const TeamMember = require("../controller/Team/TeamMember.js");

// AWS, Raise Requests, IP Data
const AwsCredits = require("../controller/Team/AwsCredits.js");
const RaiseRequest = require("../controller/Team/RaiseRequest.js");
const IPdataUpload = require("../controller/Office/IPdata.js");

// Finance
const {
  AddFunding,
  updateFundingNotif,
} = require("../controller/Finance/AddFunding.js");

// Settings
const Settings = require("../controller/Admin/Settings/Settings.js");

// Mentorship Scheduling
const {
  ScheduleMentorMeeting,
} = require("../controller/Admin/Mentorship/Mentorship.js");
const Testimonial = require("../controller/Admin/Mentors/Testimonials.js");
const { FetchTestimonial } = require("../controller/Admin/Mentors/FetchTestimonial.js");

// ======== ROUTES ========

// Profile & Auth
router.get("/profile/:mail", Profile);
router.get("/profile-data/:mail", Authenticate, Profile);
router.get("/prof", ProfilePhoto);
router.post("/login", LoginController);
router.post("/forgot-password", ForgotRequest);

// Resume
router.get("/download/:filename", ResumeController);
router.get("/getdata", GetAllResumeController);
router.post("/resumeupload", ResumeUpload);
router.get("/resume-fetch/:page_data/:page_number", Resumedata);
router.post("/resume-send", ApprovalRequest);
router.delete("/delete-resume/:id", DeleteResume);

// Mentors
router.post("/mentor/add", upload.single('choose_logo'), AddMentor);
router.get("/get-mentor-details", FetchMentorData);
router.get("/mentor/count", MentorCount);
router.delete("/delete-mentor/:id", DeleteMentorData);
router.put("/mentor/update/:id", UpdateMentorData);
router.post("/customer/apply-mentor", AddMentorHour);
router.get("/customer/fetch-mentor", FetchDataMentor);
router.post("/schedulemeeting", ScheduleMeeting);
router.get("/fetchmeeting/:mentor_reference_id", FetchMeetings);

router.post("/testimonial",Testimonial)
router.get("/fetchtestimonial/:mentor_ref_id",FetchTestimonial)
router.put("/updateprofilephoto/:mentor_id", upload.single('mentor_logo'), updateMentorProfile)
// Startups
router.post("/add-startup", AddStartup);
router.get("/startup/:id", IndividualStartups);
router.put("/update-status", UpdateStatus);
router.get("/fetch-startup", FetchStartupData);
router.get("/count-startupdata", FetchStartupDatainNumbers);
router.get("/st", TopStartupsSectorsCont);
router.post("/teamdoc-upload", TeamDocuments);

// Work
router.post("/work-request", WorkController);

// Messages
router.post("/send-message", AddMessage);
router.get("/view-message", ViewMessage);

// Connections
router.post("/add-connections", AddConnections);
router.get("/viewconnections", ViewConnections);
router.post("/establish-connection", EstablishConnection);
router.delete("/delete-connection", DeleteConnection);

// Notifications
router.get("/notification", ViewNotification);

// Events
router.post("/create-events", CreateEvents);
router.get("/fetchevents", FetchEvents);
router.post("/mentor/request-speaker", RequestSpeaker);

// Reports
router.get("/fetch-report-data", Report);

// Jobs
router.post("/post-job", Authenticate, Job);
router.post("/customer/add-job", AddJob);

// Founder/Team
router.put("/customer/founder-update", Founder);
router.post("/customer/teams-update", TeamMember);

// AWS & Requests
router.post("/customer/aws-credit-apply", AwsCredits);
router.post("/customer/raise-request", RaiseRequest);

// Finance
router.post("/finance/funding-update", AddFunding);
router.get("/notification", updateFundingNotif);

// Settings
router.post("/add-sector", Settings);

// IP Upload
router.post("/ipdataupload", upload.single("file"), IPdataUpload);

// Export router
module.exports = router;
