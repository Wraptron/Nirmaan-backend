const express = require("express");
const {
  authLimiter,
  uploadLimiter,
  apiLimiter,
} = require("../helpers/ExpressRateLimit");

// const data = require("../pg_db/convert_data.js");
// 
const router = express.Router();
router.use(apiLimiter);
const multer = require("multer");
const storage = multer.memoryStorage(); // important for S3 upload
const upload = multer({ storage });
const LoginController = require("../controller/Admin/LoginController/LoginController");
const RefreshController = require("../controller/Admin/LoginController/RefreshController");
const LogoutController = require("../controller/Admin/LoginController/LogoutController");
const WorkController = require("../controller/Admin/WorkRequestController/WorkRequestController");
const ResumeController = require("../controller/Admin/Resume/ResumeController.js");
const GetAllResumeController = require("../controller/Admin/Resume/GetAllResumeController.js");
const ResumeUpload = require("../controller/Admin/Resume/ResumeUpload.js");
const Resumedata = require("../controller/Admin/Resume/Resumedata.js");
const ApprovalRequest = require("../controller/Admin/Resume/ApporvalRequest.js");
const {
  requestForgotPasswordOtp,
  resendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} = require("../controller/Admin/LoginController/ForgotRequest.js");
const {
  Profile,
  ProfilePhoto,
} = require("../controller/Admin/Profile/Profile.js");
const DeleteResume = require("../controller/Admin/Resume/DeleteResume.js");
const Settings = require("../controller/Admin/Settings/Settings.js");
const {
  AddStartup,
  SyncStartupFromIncubation,
  AddFounder,
  FetchFounder,
  UpdateAward,
  DeleteAward,
  FetchStartupDatainNumbers,
  FetchStartupData,
  UpdateStatus,
  IndividualStartups,
  TopStartupsSectorsCont,
  TeamDocuments,
  DeleteStartupData,
  UpdateStartupDetails,
  UpdateStartupAbout,
  UpdateStartupMentorDetails,
  UpdateStartupFounder,
  AddAward,
  FetchAwardData,
  IPDetails,
  DeleteFounder,
} = require("../controller/Admin/startups/AddStartup.js");
const {
  AddMessage,
  ViewMessage,
} = require("../controller/Admin/Messages/Messages.js");
const {
  AddConnections,
  ViewConnections,
  EstablishConnection,
} = require("../controller/Admin/Connections/Connection.js");
const Report = require("../controller/Admin/Reports/Report.js");
const Founder = require("../controller/Team/Founder.js");
const { FetchDataMentor } = require("../controller/Team/Mentor.js");
const Job = require("../controller/Admin/Job/Job.js");
const TeamMember = require("../controller/Team/TeamMember.js");
const AwsCredits = require("../controller/Team/AwsCredits.js");
const RaiseRequest = require("../controller/Team/RaiseRequest.js");
const { AddMentorHour } = require("../controller/Team/Mentor.js");
const {
  DeleteConnection,
} = require("../controller/Admin/Connections/Connection.js");
const {
  ViewNotification,
} = require("../controller/Admin/Notification/Notification.js");
const {
  CreateEvents,
  FetchEvents,
  RequestSpeaker,
  DeleteEvent,
  UpdateEvent,
} = require("../controller/Admin/Events/Events.js");
const {
  FetchMentorData,
  MentorCount,
  DeleteMentorData,
  Testimonial,
  FetchTestimonial,
  UpdateTestimonial,
  DeleteTestimonial,
  UpdateMentor,
  Meetings,
  FetchMeetings,
  MeetingFeedback,
  FetchMeetingFeedback,
  UpdateFeedback,
  FetchMeetingsDetailsWithMentor,
  DeleteMeetings,
  CancelMentorMeeting,
} = require("../controller/Admin/Mentors/MentorData.js");
const AddJob = require("../controller/Team/AddJob.js");
const {
  AddFunding,
  updateFundingNotif,
  FetchFundingAmount,
  FetchFundingData,
  UpdateFundingData,
  FetchFundingDatainNumbers,
  FetchStartupDataDetail,
} = require("../controller/Finance/AddFunding.js");
const {
  DashboardOverviewSummary,
  DashboardSummary,
} = require("../controller/Admin/Dashboard/DashboardSummary.js");
const {
  getNotifications,
  markNotificationsRead,
} = require("../controller/Notification/NotificationController.js");
const requireRole = require("../utils/requireRole.js");
const {
  ScheduleMentorMeeting,
} = require("../controller/Admin/Mentorship/Mentorship.js");
const {
  createMentorSessionRequest,
  updateMentorSessionRequest,
  listStartupMyMeetings,
} = require("../controller/Admin/Mentorship/MentorSessionRequest.js");
const IPdataUpload = require("../controller/Office/IPdata.js");
const { AddFundingProject, FetchFundingProject, FetchFundingProjectData, UpdateFundingProjectData } = require("../controller/Finance/AddFundingProject.js");
const Authenticate = require("../utils/Authenticate.js");
const { AddMentor} = require("../controller/Admin/Mentors/AddMentor.js");
const { saveAvailability, getAvailability } = require("../controller/Admin/Mentors/AvailabilitySlot.js");
router.get("/prof", ProfilePhoto);
router.put("/update-status", UpdateStatus);
router.get("/startup/my-meetings", Authenticate, listStartupMyMeetings);
router.get("/startup/:id", Authenticate, IndividualStartups);
router.put(
  "/edit-startupdata/personal-info", Authenticate,
  uploadLimiter,
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "background_image", maxCount: 1 },
  ]),
  UpdateStartupDetails
);
router.put("/edit-startup/mentordetails", UpdateStartupMentorDetails);
router.delete("delete-startup/:id", DeleteStartupData);
router.put("/edit-startup/about", UpdateStartupAbout);
router.post("/schedule-meeting", ScheduleMentorMeeting);
router.post("/mentor/session-request", Authenticate, createMentorSessionRequest);
router.patch("/mentor/session-request/:id", Authenticate, updateMentorSessionRequest);
router.post("/availability/save", Authenticate, saveAvailability);
router.get("/availability/:mentor_id", Authenticate, getAvailability);
router.post("/finance/addfunding", upload.none(), AddFunding);
router.get("/finance/funding_amount", FetchFundingAmount);
router.get("/finance/funding", FetchFundingData);
router.put("/funding/edit", UpdateFundingData);
router.get("/funding", FetchFundingDatainNumbers);
router.post("/finance/funding-project",AddFundingProject);
router.get("/finance/fetch-funding-project",FetchFundingProject);
router.get("/fetch-funding-project",FetchFundingProjectData);
router.put("/update-funding-project",UpdateFundingProjectData);
router.get("/finance/startup-data",FetchStartupDataDetail);
router.get("/fetch-startup", FetchStartupData);
router.get("/fetchevents", FetchEvents);
router.get("/count-startupdata", FetchStartupDatainNumbers);
router.get("/dashboard/overview-summary", DashboardOverviewSummary);
router.get("/dashboard/summary", DashboardSummary);
router.get("/mentor/count", MentorCount);
router.post("/mentor/request-speaker", RequestSpeaker);
router.post("/login", authLimiter, LoginController);
router.post("/auth/refresh", authLimiter, RefreshController);
router.post("/auth/logout", authLimiter, LogoutController);
router.post("/send-message", AddMessage);
router.post("/forgot-password", authLimiter, requestForgotPasswordOtp);
router.post("/forgot-password/request-otp", authLimiter, requestForgotPasswordOtp);
router.post("/forgot-password/resend-otp", authLimiter, resendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", authLimiter, verifyForgotPasswordOtp);
router.post("/work-request", WorkController);
router.get("/download/:filename", ResumeController);
router.get("/getdata", GetAllResumeController);
router.post("/resumeupload", uploadLimiter, ResumeUpload);
router.get("/get-mentor-details", FetchMentorData);
router.get("/resume-fetch/:page_data/:page_number", Resumedata);
router.post("/resume-send", ApprovalRequest);
router.get("/profile/:mail", Profile);
router.put("/edit-startupdata/personal-info", uploadLimiter, UpdateStartupDetails);
router.post("/addstartup/award", uploadLimiter, upload.single("document"), AddAward);
router.get("/fetchaward", FetchAwardData);
router.delete("/delete-award/:id", DeleteAward);
router.put("/updateaward", uploadLimiter, upload.single("document"), UpdateAward);
router.put("/ipdetails", IPDetails);
router.delete("/delete-resume/:id", DeleteResume);
router.put("/edit-startup/founder", UpdateStartupFounder);
router.post("/addfounder", AddFounder);
router.get("/fetchfounder/:userId", FetchFounder);
router.put("/deletefounder/:founderid", DeleteFounder);
router.post(
  "/mentor/add",
  uploadLimiter,
  upload.fields([{ name: "mentor_logo", maxCount: 1 }]),
  AddMentor
);
router.put(
  "/mentor/update",
  uploadLimiter,
  upload.fields([{ name: "mentor_logo", maxCount: 1 }]),
  UpdateMentor
);
router.post("/mentor/meeting", Authenticate, requireRole(2), Meetings);
router.get("/mentor/fetch-meeting/:mentor_id", FetchMeetings);
router.get("/mentor/fetch-mentor_meeting/",FetchMeetingsDetailsWithMentor);
router.delete("/mentor/delete-meeting/:id",DeleteMeetings);
router.patch(
  "/mentor/cancel-meeting/:id",
  Authenticate,
  requireRole(6),
  CancelMentorMeeting
);
router.post("/mentor/feedback", MeetingFeedback);
router.put("/mentor/update-feedback", UpdateFeedback);
router.get(
  "/mentor/fetch-feedback/:mentor_id/:startup_id",
  FetchMeetingFeedback
);
router.post("/mentor/add-testimonial", Testimonial);
router.get("/mentor/fetch-testimonial", FetchTestimonial);
router.put("/mentor/update-testimonial", UpdateTestimonial);
router.delete("/mentor/delete-testimonial/:id", DeleteTestimonial);
router.post(
  "/create-events",
  uploadLimiter,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  CreateEvents,
);
router.put(
  "/edit-event/",
  uploadLimiter,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  UpdateEvent
);
router.delete("/delete-event/:id", DeleteEvent);
router.get("/profile-data/:mail", Authenticate, Profile);
router.post("/add-sector", Settings);
router.get("/view-message", ViewMessage);
router.post("/add-connections", AddConnections);
router.post("/add-startup", AddStartup);
router.post("/sync/startup", SyncStartupFromIncubation);
router.get("/viewconnections", ViewConnections);
router.post("/post-job", Authenticate, Job);
router.get("/fetch-report-data", Report);
router.post("/establish-connection", EstablishConnection);
router.put("/customer/founder-update", Founder);
router.post("/customer/teams-update", TeamMember);
router.post("/customer/aws-credit-apply", AwsCredits);
router.post("/customer/raise-request", RaiseRequest);
router.post("/customer/apply-mentor", AddMentorHour);
router.get("/customer/fetch-mentor", FetchDataMentor);
router.post("/customer/add-job", AddJob);
router.get("/notification", Authenticate, getNotifications);
router.patch("/notification/read", Authenticate, markNotificationsRead);
router.delete("/delete-mentor/:id", DeleteMentorData);
router.delete("/delete-startup/:id", DeleteStartupData);
router.delete("/delete-connection", DeleteConnection);
router.post("/ipdataupload", uploadLimiter, upload.single("file"), IPdataUpload);
router.get("/st", TopStartupsSectorsCont);
router.post("/teamdoc-upload", uploadLimiter, TeamDocuments);
module.exports = router;
