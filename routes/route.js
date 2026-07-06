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
const MeController = require("../controller/Admin/LoginController/MeController");
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
const ChangePassword = require("../controller/Admin/LoginController/ChangePassword.js");
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
router.get("/prof", Authenticate, ProfilePhoto);
router.put("/update-status", Authenticate, requireRole(2), UpdateStatus);
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
router.put("/edit-startup/mentordetails", Authenticate, UpdateStartupMentorDetails);
router.put("/edit-startup/about", Authenticate, UpdateStartupAbout);
router.post("/schedule-meeting", Authenticate, ScheduleMentorMeeting);
router.post("/mentor/session-request", Authenticate, createMentorSessionRequest);
router.patch("/mentor/session-request/:id", Authenticate, updateMentorSessionRequest);
router.post("/availability/save", Authenticate, saveAvailability);
router.get("/availability/:mentor_id", Authenticate, getAvailability);
router.post("/finance/addfunding", Authenticate, requireRole(2, 3), upload.none(), AddFunding);
router.get("/finance/funding_amount", Authenticate, FetchFundingAmount);
router.get("/finance/funding", Authenticate, FetchFundingData);
router.put("/funding/edit", Authenticate, requireRole(2, 3), UpdateFundingData);
router.get("/funding", Authenticate, FetchFundingDatainNumbers);
router.post("/finance/funding-project", Authenticate, requireRole(2, 3), AddFundingProject);
router.get("/finance/fetch-funding-project", Authenticate, FetchFundingProject);
router.get("/fetch-funding-project", Authenticate, FetchFundingProjectData);
router.put("/update-funding-project", Authenticate, requireRole(2, 3), UpdateFundingProjectData);
router.get("/finance/startup-data", Authenticate, FetchStartupDataDetail);
router.get("/fetch-startup", Authenticate, FetchStartupData);
router.get("/fetchevents", Authenticate, FetchEvents);
router.get("/count-startupdata", Authenticate, FetchStartupDatainNumbers);
router.get("/dashboard/overview-summary", Authenticate, requireRole(2, 3), DashboardOverviewSummary);
router.get("/dashboard/summary", Authenticate, requireRole(2, 3), DashboardSummary);
router.get("/mentor/count", Authenticate, MentorCount);
router.post("/mentor/request-speaker", Authenticate, RequestSpeaker);
router.post("/login", authLimiter, LoginController);
router.post("/auth/refresh", authLimiter, RefreshController);
router.post("/auth/logout", authLimiter, LogoutController);
router.get("/auth/me", Authenticate, MeController);
router.post("/send-message", Authenticate, AddMessage);
router.post("/change-password", Authenticate, ChangePassword);
router.post("/forgot-password", authLimiter, requestForgotPasswordOtp);
router.post("/forgot-password/request-otp", authLimiter, requestForgotPasswordOtp);
router.post("/forgot-password/resend-otp", authLimiter, resendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", authLimiter, verifyForgotPasswordOtp);
router.post("/work-request", Authenticate, WorkController);
router.get("/download/:filename", Authenticate, ResumeController);
router.get("/getdata", Authenticate, GetAllResumeController);
router.post("/resumeupload", uploadLimiter, Authenticate, ResumeUpload);
router.get("/get-mentor-details", Authenticate, FetchMentorData);
router.get("/resume-fetch/:page_data/:page_number", Authenticate, Resumedata);
router.post("/resume-send", Authenticate, ApprovalRequest);
router.get("/profile/:mail", Authenticate, Profile);
router.post("/addstartup/award", uploadLimiter, Authenticate, upload.single("document"), AddAward);
router.get("/fetchaward", Authenticate, FetchAwardData);
router.delete("/delete-award/:id", Authenticate, DeleteAward);
router.put("/updateaward", uploadLimiter, Authenticate, upload.single("document"), UpdateAward);
router.put("/ipdetails", Authenticate, IPDetails);
router.delete("/delete-resume/:id", Authenticate, requireRole(2), DeleteResume);
router.put("/edit-startup/founder", Authenticate, UpdateStartupFounder);
router.post("/addfounder", Authenticate, AddFounder);
router.get("/fetchfounder/:userId", Authenticate, FetchFounder);
router.put("/deletefounder/:founderid", Authenticate, DeleteFounder);
router.post(
  "/mentor/add",
  uploadLimiter,
  Authenticate,
  requireRole(2),
  upload.fields([{ name: "mentor_logo", maxCount: 1 }]),
  AddMentor
);
router.put(
  "/mentor/update",
  uploadLimiter,
  Authenticate,
  requireRole(2, 6),
  upload.fields([{ name: "mentor_logo", maxCount: 1 }]),
  UpdateMentor
);
router.post("/mentor/meeting", Authenticate, requireRole(2), Meetings);
router.get("/mentor/fetch-meeting/:mentor_id", Authenticate, FetchMeetings);
router.get("/mentor/fetch-mentor_meeting/", Authenticate, FetchMeetingsDetailsWithMentor);
router.delete("/mentor/delete-meeting/:id", Authenticate, requireRole(2), DeleteMeetings);
router.patch(
  "/mentor/cancel-meeting/:id",
  Authenticate,
  requireRole(6),
  CancelMentorMeeting
);
router.post("/mentor/feedback", Authenticate, MeetingFeedback);
router.put("/mentor/update-feedback", Authenticate, UpdateFeedback);
router.get(
  "/mentor/fetch-feedback/:mentor_id/:startup_id",
  Authenticate,
  FetchMeetingFeedback
);
router.post("/mentor/add-testimonial", Authenticate, Testimonial);
router.get("/mentor/fetch-testimonial", Authenticate, FetchTestimonial);
router.put("/mentor/update-testimonial", Authenticate, UpdateTestimonial);
router.delete("/mentor/delete-testimonial/:id", Authenticate, requireRole(2), DeleteTestimonial);
router.post(
  "/create-events",
  uploadLimiter,
  Authenticate,
  requireRole(2),
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  CreateEvents,
);
router.put(
  "/edit-event/",
  uploadLimiter,
  Authenticate,
  requireRole(2),
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  UpdateEvent
);
router.delete("/delete-event/:id", Authenticate, requireRole(2), DeleteEvent);
router.get("/profile-data/:mail", Authenticate, Profile);
router.post("/add-sector", Authenticate, requireRole(2), Settings);
router.get("/view-message", Authenticate, ViewMessage);
router.post("/add-connections", Authenticate, AddConnections);
router.post("/add-startup", Authenticate, requireRole(2), AddStartup);
router.post("/sync/startup", SyncStartupFromIncubation);
router.get("/viewconnections", Authenticate, ViewConnections);
router.post("/post-job", Authenticate, Job);
router.get("/fetch-report-data", Authenticate, Report);
router.post("/establish-connection", Authenticate, EstablishConnection);
router.put("/customer/founder-update", Authenticate, Founder);
router.post("/customer/teams-update", Authenticate, TeamMember);
router.post("/customer/aws-credit-apply", Authenticate, AwsCredits);
router.post("/customer/raise-request", Authenticate, RaiseRequest);
router.post("/customer/apply-mentor", Authenticate, AddMentorHour);
router.get("/customer/fetch-mentor", Authenticate, FetchDataMentor);
router.post("/customer/add-job", Authenticate, AddJob);
router.get("/notification", Authenticate, getNotifications);
router.patch("/notification/read", Authenticate, markNotificationsRead);
router.delete("/delete-mentor/:id", Authenticate, requireRole(2), DeleteMentorData);
router.delete("/delete-startup/:id", Authenticate, requireRole(2), DeleteStartupData);
router.delete("/delete-connection", Authenticate, requireRole(2), DeleteConnection);
router.post("/ipdataupload", uploadLimiter, Authenticate, upload.single("file"), IPdataUpload);
router.get("/st", Authenticate, TopStartupsSectorsCont);
router.post("/teamdoc-upload", uploadLimiter, Authenticate, TeamDocuments);
module.exports = router;
