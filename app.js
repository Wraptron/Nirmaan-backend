const express = require('express');
// const {RateLimitMiddleware} = require("./helpers/ExpressRateLimit");
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const LoginController= require('./routes/route');
const WorkRequestController = require('./routes/route');
const ResumeController = require('./routes/route');
const GetAllResumeController = require('./routes/route');
const ResumeUpload = require('./routes/route');
const Resumedata = require('./routes/route');
const ApporvalRequest = require('./routes/route');
const ForgotRequest = require('./routes/route');
const Profile = require('./routes/route');
const DeleteResume = require('./routes/route');
const AddMentor = require('./routes/route');
const bodyParser = require('body-parser');
const Settings = require('./routes/route')
const AddMessage = require('./routes/route');
const ViewMessage = require('./routes/route');
const AddConnections = require('./routes/route');
const AddStartup = require('./routes/route');
const ViewConnections = require('./routes/route');
const Job = require('./routes/route');
const Report = require('./routes/route');
const EstablishConnection = require('./routes/route');
const TeamMember = require('./routes/route');
const RaiseRequest = require('./routes/route');
const Authenticate = require('./utils/Authenticate');
const FetchDataMentor = require('./routes/route');
const Founder = require('./routes/route')
const cors = require('cors');
const AddMentorHour = require('./routes/route');
const AddJob = require('./routes/route');
const ViewNotification = require('./routes/route');
const  DeleteConnection = require('./routes/route');
const FetchMentorData = require('./routes/route');
const MentorCount = require('./routes/route');
const DeleteMentorData = require('./routes/route');
const CreateEvents = require('./routes/route');
const FetchEvents = require('./routes/route');
const RequestSpeaker = require('./routes/route');
const FetchStartupDatainNumbers = require('./routes/route');
const FetchStartupData = require('./routes/route');
const AddFunding = require('./routes/route');
const ScheduleMentorMeeting = require('./routes/route');
const UpdateStatus = require('./routes/route');
const IndividualStartups = require('./routes/route');
const IPdataUpload = require('./routes/route');
const TopStartupsSectorsCont = require('./routes/route');
// const {uploadFile, getFileStream} = require('./utils/s3');
const multer = require('multer')
const upload = multer({dest: 'uploads/'})
const app = express();
const ProfilePhoto = require('./routes/route');
const http = require('http').createServer(app);
var io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});
app.get('/images/:key', (req, res) => {
    //console.log(req.query)
    const fileKey = req.params.key;
    //console.log(key)
    const readStream = getFileStream(fileKey)
    readStream.pipe(res)
})
app.post('/imagess', upload.single('image'), async(req, res) => {
    const file = req.file
    console.log(file)
    const result = await uploadFile(file)
    console.log(result)
    //const description = req.body.description
    res.send({imagePath : `/images/${result.Key}`})
} )
app.use(cors({ origin: true }));
app.use(cookieParser());
// app.use(RateLimitMiddleware);
app.use(responseTime());
app.use(bodyParser.json());
app.listen('3003', (err)=> {
    if(err) process.exit(1);
    console.log("working");
})
let onlineUsers = [];
const addNewUser = (username, socketId) => {
    !onlineUsers.some((user)=>user.username === username) && 
            onlineUsers.push({username, socketId})

    console.log('da')
}
console.log(onlineUsers);

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
}
const getUser = (username) => {
    return onlineUsers.find((user) => user.username === username)
}
http.listen(5000, function() {
    console.log("listening on *: 5000");
});
io.on('connection', function(socket) {
    
    //console.log("a user has connected!");
    //io.to('ISm3D19Ll91AuyU8AAAC').emit("FirstEvent", "Hello Test");
    socket.on('newUser', (username) => {
        addNewUser(username, socket.id);
    })
    socket.on("sendText", ({ senderName, receiverName, text }) => {
        const receiver = getUser(receiverName);
        io.to(receiver.socketId).emit("getText", {
          senderName,
          text,
        });
      });
    socket.on("disconnect", () => {
        removeUser(socket.id);
    });
})
app.use('api/v1/', IndividualStartups);
app.use('api/v1/', ProfilePhoto);
app.use('api/v1/', ScheduleMentorMeeting);
app.use('/api/v1/', AddFunding);
app.use('/api/v1/', LoginController);
app.use('api/v1/', ForgotRequest)
app.use('api/v1/', FetchStartupDatainNumbers)
app.get('/profile', (req, res) => {
    //const {Test} = req.body;
    console.log(req.body);
})
app.use('api/v1/', UpdateStatus);
app.use('api/v1/', FetchStartupData);
app.use('api/v1/', FetchEvents);
app.use('api/v1/', MentorCount);
app.use('api/v1/', RequestSpeaker);
app.use('api/v1/', Profile);
app.use('api/v1/', AddJob);
app.use('api/v1/', CreateEvents);
app.use('/api/v1/work', WorkRequestController);
app.use('/api/v1/resume', ResumeController);
app.use('api/v1/resume',GetAllResumeController);
app.use('api/v1/resume',  ResumeUpload);
app.use('api/v1/resume', Resumedata);
app.use('api/v1/resume', ApporvalRequest);
app.use('api/v1/resume', DeleteResume);
app.use('api/v1/', AddMentor);
app.use('api/v1/', Profile);
app.use('api/v1/', Settings);
app.use('api/v1/', AddMessage);
app.use('api/v1/', ViewMessage);
app.use('api/v1/', AddConnections);
app.use('api/v1/',AddStartup);
app.use('api/v1/', ViewConnections);
app.use('api/v1/',FetchMentorData);
app.use('api/v1/', Job);
app.use('api/v1/', EstablishConnection);
app.use('api/v1/', Report);
app.use('api/v1/', Founder);
app.use('api/v1/', TeamMember);
app.use('api/v1/', RaiseRequest);
app.use('api/v1/', AddMentorHour)
app.use('api/v1/', FetchDataMentor);
app.use('api/v1/', ViewNotification);
app.use('api/v1/', DeleteConnection);
app.use('api/v1/', DeleteMentorData);
app.use('api/v1/', IPdataUpload);
app.use('api/v1/', TopStartupsSectorsCont);
module.exports = app;


