const express = require("express");

// const data = require("../pg_db/convert_data.js");
// 
const router = express.Router();
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
router.put("/update-status", requireRole(2), UpdateStatus);
router.get("/startup/my-meetings", Authenticate, listStartupMyMeetings);
router.get("/startup/:id", Authenticate, IndividualStartups);
router.put(
  "/edit-startupdata/personal-info", Authenticate,
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "background_image", maxCount: 1 },
  ]),
  UpdateStartupDetails
);
router.put("/edit-startup/mentordetails", requireRole(2, 5), UpdateStartupMentorDetails);
router.delete("/delete-startup/:id", requireRole(2), DeleteStartupData);
router.put("/edit-startup/about", requireRole(2, 5), UpdateStartupAbout);
router.post("/schedule-meeting", ScheduleMentorMeeting);
router.post("/mentor/session-request", Authenticate, createMentorSessionRequest);
router.patch("/mentor/session-request/:id", Authenticate, updateMentorSessionRequest);
router.post("/availability/save", Authenticate, saveAvailability);
router.get("/availability/:mentor_id", Authenticate, getAvailability);
router.post("/finance/addfunding", requireRole(2, 3), upload.none(), AddFunding);
router.get("/finance/funding_amount", requireRole(2, 3, 5), FetchFundingAmount);
router.get("/finance/funding", requireRole(3), FetchFundingData);
router.put("/funding/edit", requireRole(2, 3), UpdateFundingData);
router.get("/funding", requireRole(3), FetchFundingDatainNumbers);
router.post("/finance/funding-project", requireRole(3), AddFundingProject);
router.get("/finance/fetch-funding-project", requireRole(3), FetchFundingProject);
router.get("/fetch-funding-project", requireRole(3), FetchFundingProjectData);
router.put("/update-funding-project", requireRole(3), UpdateFundingProjectData);
router.get("/finance/startup-data", requireRole(3), FetchStartupDataDetail);
router.get("/fetch-startup", requireRole(2, 5), FetchStartupData);
router.get("/fetchevents", FetchEvents);
router.get("/count-startupdata", requireRole(2), FetchStartupDatainNumbers);
router.get("/mentor/count", requireRole(2), MentorCount);
router.post("/mentor/request-speaker", RequestSpeaker);
router.post("/login", LoginController);
router.post("/auth/refresh", RefreshController);
router.post("/auth/logout", LogoutController);
router.post("/send-message", AddMessage);
router.post("/forgot-password", requestForgotPasswordOtp);
router.post("/forgot-password/request-otp", requestForgotPasswordOtp);
router.post("/forgot-password/resend-otp", resendForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);
router.post("/work-request", WorkController);
router.get("/download/:filename", ResumeController);
router.get("/getdata", GetAllResumeController);
router.post("/resumeupload", requireRole(2, 5), ResumeUpload);
router.get("/get-mentor-details", requireRole(2, 6), FetchMentorData);
router.get("/resume-fetch/:page_data/:page_number", requireRole(5), Resumedata);
router.post("/resume-send", ApprovalRequest);
router.get("/profile/:mail", Profile);
router.put("/edit-startupdata/personal-info", UpdateStartupDetails);
router.post("/addstartup/award", requireRole(2, 5), upload.single("document"), AddAward);
router.get("/fetchaward", requireRole(2, 5), FetchAwardData);
router.delete("/delete-award/:id", requireRole(2, 5), DeleteAward);
router.put("/updateaward", requireRole(2, 5), UpdateAward);
router.put("/ipdetails", requireRole(2, 5), IPDetails);
router.delete("/delete-resume/:id", requireRole(2, 5), DeleteResume);
router.put("/edit-startup/founder", requireRole(2, 5), UpdateStartupFounder);
router.post("/addfounder", requireRole(2, 5), AddFounder);
router.get("/fetchfounder/:userId", requireRole(2, 5), FetchFounder);
router.put("/deletefounder/:founderid", requireRole(2, 5), DeleteFounder);
router.post(
  "/mentor/add",
  requireRole(2),
  upload.fields([{ name: "mentor_logo", maxCount: 1 }]),
  AddMentor
);
router.put("/mentor/update", requireRole(2, 6), upload.fields([{ name: "mentor_logo", maxCount: 1 }]), UpdateMentor);
router.post("/mentor/meeting", Authenticate, requireRole(2), Meetings);
router.get("/mentor/fetch-meeting/:mentor_id", requireRole(2, 6), FetchMeetings);
router.get("/mentor/fetch-mentor_meeting/", requireRole(2, 6), FetchMeetingsDetailsWithMentor);
router.delete("/mentor/delete-meeting/:id", requireRole(2, 6), DeleteMeetings);
router.patch(
  "/mentor/cancel-meeting/:id",
  Authenticate,
  requireRole(6),
  CancelMentorMeeting
);
router.post("/mentor/feedback", requireRole(2, 6), MeetingFeedback);
router.put("/mentor/update-feedback", requireRole(2, 6), UpdateFeedback);
router.get(
  "/mentor/fetch-feedback/:mentor_id/:startup_id",
  requireRole(2, 6),
  FetchMeetingFeedback
);
router.post("/mentor/add-testimonial", requireRole(2, 6), Testimonial);
router.get("/mentor/fetch-testimonial", requireRole(2, 6), FetchTestimonial);
router.put("/mentor/update-testimonial", requireRole(2, 6), UpdateTestimonial);
router.delete("/mentor/delete-testimonial/:id", requireRole(2, 6), DeleteTestimonial);
router.post(
  "/create-events",
  requireRole(2),
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  CreateEvents,
);
router.put("/edit-event/", requireRole(2), upload.fields([{ name: "thumbnail", maxCount: 1 }]), UpdateEvent);
router.delete("/delete-event/:id", requireRole(2), DeleteEvent);
router.get("/profile-data/:mail", Authenticate, Profile);
router.post("/add-sector", requireRole(2), Settings);
router.get("/view-message", ViewMessage);
router.post("/add-connections", AddConnections);
router.post("/add-startup", requireRole(2), AddStartup);
router.post("/sync/startup", SyncStartupFromIncubation);
router.get("/viewconnections", ViewConnections);
router.post("/post-job", Authenticate, Job);
router.get("/fetch-report-data", requireRole(2), Report);
router.post("/establish-connection", EstablishConnection);
router.put("/customer/founder-update", requireRole(5), Founder);
router.post("/customer/teams-update", requireRole(5), TeamMember);
router.post("/customer/aws-credit-apply", requireRole(5), AwsCredits);
router.post("/customer/raise-request", requireRole(5), RaiseRequest);
router.post("/customer/apply-mentor", requireRole(5), AddMentorHour);
router.get("/customer/fetch-mentor", requireRole(5), FetchDataMentor);
router.post("/customer/add-job", requireRole(5), AddJob);
router.get("/notification", Authenticate, getNotifications);
router.patch("/notification/read", Authenticate, markNotificationsRead);
router.delete("/delete-mentor/:id", requireRole(2), DeleteMentorData);
router.delete("/delete-startup/:id", requireRole(2), DeleteStartupData);
router.delete("/delete-connection", requireRole(2), DeleteConnection);
router.post("/ipdataupload", requireRole(2), upload.single("file"), IPdataUpload);
router.get("/st", TopStartupsSectorsCont);
router.post("/teamdoc-upload", TeamDocuments);
module.exports = router;
