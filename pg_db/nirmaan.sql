--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-07-20 23:19:35

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 8 (class 2615 OID 16388)
-- Name: pgagent; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA pgagent;


ALTER SCHEMA pgagent OWNER TO postgres;

--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA pgagent; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA pgagent IS 'pgAgent system tables';


--
-- TOC entry 2 (class 3079 OID 16389)
-- Name: pgagent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgagent WITH SCHEMA pgagent;


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgagent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgagent IS 'A PostgreSQL job scheduler';


--
-- TOC entry 3 (class 3079 OID 147485)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 923 (class 1247 OID 16548)
-- Name: status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.status_enum OWNER TO postgres;

--
-- TOC entry 926 (class 1247 OID 16556)
-- Name: tag_connection_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tag_connection_enum AS ENUM (
    '0',
    '2'
);


ALTER TYPE public.tag_connection_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 16561)
-- Name: add_job; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.add_job (
    email character varying(30) NOT NULL,
    role character varying(10),
    duration character varying(20),
    jobtype character varying(20),
    remuneration character varying(20),
    requirements character varying(30),
    description character varying(20)
);


ALTER TABLE public.add_job OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16564)
-- Name: add_mentor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.add_mentor (
    mentor_id character varying(40),
    mentor_name character varying(40),
    mentor_logo character varying(200),
    mento_description character varying(200),
    years_of_exp integer,
    area_of_expertise character varying(25),
    designation character varying(30),
    institution character varying(50),
    qualification character varying(20),
    year_of_passing_out character varying(20),
    startup_assoc character varying(30),
    contact_num character varying(20),
    email_address character varying(40) NOT NULL,
    linkedin_id character varying(50),
    password character varying(18),
    hashkey character varying(50),
    user_role character varying(3)
);


ALTER TABLE public.add_mentor OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16569)
-- Name: aws_applied; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aws_applied (
    team_email character varying(50) NOT NULL,
    aws_startup_name character varying(20),
    aws_email character varying(50),
    aws_description character varying(30),
    created_at timestamp without time zone,
    valid_till timestamp without time zone,
    status public.status_enum DEFAULT 'pending'::public.status_enum
);


ALTER TABLE public.aws_applied OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16573)
-- Name: documents_uploaded; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents_uploaded (
    startup_email character varying(30) NOT NULL,
    document_name character varying(30),
    datetime timestamp without time zone
);


ALTER TABLE public.documents_uploaded OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16576)
-- Name: establish_connections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.establish_connections (
    connection_name character varying(20),
    organization character varying(20),
    connect_for character varying(20),
    contact_number character varying(15) NOT NULL,
    email_address character varying(40),
    connection_desig character varying(20)
);


ALTER TABLE public.establish_connections OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16579)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_type character varying(50),
    event_title character varying(20),
    event_privacy character varying(20),
    event_description character varying(300),
    event_date character varying(20),
    event_time character varying(20),
    created_by character varying(40),
    select_speaker character varying(35)
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16584)
-- Name: founder_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.founder_details (
    name character varying(20),
    email character varying(25) NOT NULL,
    number bigint,
    gender character varying(30),
    studentid bigint,
    linkedin character varying(40),
    role character varying(10)
);


ALTER TABLE public.founder_details OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16587)
-- Name: mentor_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mentor_schedule (
    startup character varying(50),
    mentor_mail character varying(50),
    date character varying(30),
    "time" character varying(30),
    description character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mentor_schedule OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16591)
-- Name: mentors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mentors (
    mentor_id integer NOT NULL,
    mentor_logo bytea,
    mentor_description character varying(100),
    mentor_experience character varying(10),
    mentor_area_expertise character varying(20),
    mentor_current_designation character varying(20),
    mentor_insti character varying(40),
    mentor_qualification character varying(20),
    mentor_year_of_passing character varying(20),
    mentor_starup_associated character varying(35),
    mentor_contact_number character varying(15),
    mentor_email character varying(30),
    mentor_linkedin character varying(60),
    mentor_password character varying(20),
    created_at timestamp without time zone
);


ALTER TABLE public.mentors OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16596)
-- Name: messages_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages_data (
    message_id character varying(18),
    sender_id character varying(25),
    message character varying(100),
    receiver_id character varying(25),
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages_data OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16600)
-- Name: raised_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raised_request (
    team_mail character varying(30) NOT NULL,
    request_type character varying(70),
    description character varying(50),
    time_stamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.raised_request OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16604)
-- Name: request_speaker; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.request_speaker (
    speaker_name character varying(30),
    event_description character varying(200),
    created_by character varying(35)
);


ALTER TABLE public.request_speaker OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16607)
-- Name: resume_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resume_data (
    resume_name character varying(25),
    resume_email character varying(30) NOT NULL,
    college_data character varying(50),
    college_department character varying(20),
    resume_url character varying(150),
    resume_year integer,
    created_at timestamp without time zone
);


ALTER TABLE public.resume_data OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 147496)
-- Name: schedule_meetings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_meetings (
    meet_id integer NOT NULL,
    mentor_reference_id character varying(255),
    start_up_name character varying(255),
    founder_name character varying(255),
    meeting_mode character varying(50),
    meeting_link character varying(255),
    meeting_location character varying(255),
    participants character varying(255),
    date date,
    "time" time without time zone,
    meeting_duration character varying(50),
    meeting_agenda text
);


ALTER TABLE public.schedule_meetings OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 147501)
-- Name: schedule_meetings_meet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schedule_meetings_meet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schedule_meetings_meet_id_seq OWNER TO postgres;

--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 257
-- Name: schedule_meetings_meet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schedule_meetings_meet_id_seq OWNED BY public.schedule_meetings.meet_id;


--
-- TOC entry 262 (class 1259 OID 589877)
-- Name: startup_awards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.startup_awards (
    id integer NOT NULL,
    official_email_address character varying(255) NOT NULL,
    award_name character varying(255) NOT NULL,
    award_org character varying(255) NOT NULL,
    prize_money character varying(100),
    awarded_date date NOT NULL,
    document_url text,
    description text
);


ALTER TABLE public.startup_awards OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 589876)
-- Name: startup_awards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.startup_awards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.startup_awards_id_seq OWNER TO postgres;

--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 261
-- Name: startup_awards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.startup_awards_id_seq OWNED BY public.startup_awards.id;


--
-- TOC entry 250 (class 1259 OID 16610)
-- Name: tag_connection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tag_connection (
    startup_team_mail character varying(30) NOT NULL,
    connection_email character varying(30),
    email_content character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_role public.tag_connection_enum
);


ALTER TABLE public.tag_connection OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 16614)
-- Name: team_member_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_member_details (
    team_name character varying(25),
    team_email character varying(30) NOT NULL,
    team_number bigint,
    team_designation character varying(30)
);


ALTER TABLE public.team_member_details OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 16617)
-- Name: test_startup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test_startup (
    basic jsonb,
    official jsonb,
    founder jsonb,
    description jsonb,
    official_email_address text NOT NULL,
    startup_status character varying(20)
);


ALTER TABLE public.test_startup OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 147502)
-- Name: testimonials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.testimonials (
    testimonial_id integer NOT NULL,
    mentor_ref_id character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(100),
    description text NOT NULL
);


ALTER TABLE public.testimonials OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 147507)
-- Name: testimonials_testimonial_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.testimonials_testimonial_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.testimonials_testimonial_id_seq OWNER TO postgres;

--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 259
-- Name: testimonials_testimonial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.testimonials_testimonial_id_seq OWNED BY public.testimonials.testimonial_id;


--
-- TOC entry 253 (class 1259 OID 16622)
-- Name: update_funding; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.update_funding (
    id integer NOT NULL,
    startup_name character varying(255),
    funding_type character varying(50),
    amount numeric(15,2),
    purpose character varying(255),
    funding_date character varying(20),
    reference_number character varying(50),
    document text,
    description text,
    status character varying(20)
);


ALTER TABLE public.update_funding OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16627)
-- Name: update_funding_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.update_funding_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.update_funding_id_seq OWNER TO postgres;

--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 254
-- Name: update_funding_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.update_funding_id_seq OWNED BY public.update_funding.id;


--
-- TOC entry 255 (class 1259 OID 16628)
-- Name: user_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_data (
    user_id integer NOT NULL,
    user_mail character varying(50),
    user_password character varying(30),
    user_hash character varying(40),
    user_department character varying(20),
    user_role integer NOT NULL,
    created_at timestamp with time zone,
    user_name character varying(30) DEFAULT 'Nandhini K S'::character varying NOT NULL,
    user_contact character varying(20) DEFAULT '7092311114'::character varying NOT NULL,
    personal_email character varying(30) DEFAULT 'nandhini.ramu@gmail.com'::character varying NOT NULL,
    profile_photo character varying(70)
);


ALTER TABLE public.user_data OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 499761)
-- Name: user_data_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_data ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_data_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4884 (class 2604 OID 147508)
-- Name: schedule_meetings meet_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_meetings ALTER COLUMN meet_id SET DEFAULT nextval('public.schedule_meetings_meet_id_seq'::regclass);


--
-- TOC entry 4886 (class 2604 OID 589880)
-- Name: startup_awards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.startup_awards ALTER COLUMN id SET DEFAULT nextval('public.startup_awards_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 147509)
-- Name: testimonials testimonial_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN testimonial_id SET DEFAULT nextval('public.testimonials_testimonial_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 180260)
-- Name: update_funding id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.update_funding ALTER COLUMN id SET DEFAULT nextval('public.update_funding_id_seq'::regclass);


--
-- TOC entry 4837 (class 0 OID 16390)
-- Dependencies: 222
-- Data for Name: pga_jobagent; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobagent (jagpid, jaglogintime, jagstation) FROM stdin;
8644	2025-07-20 12:01:50.339318+05:30	MSI
\.


--
-- TOC entry 4838 (class 0 OID 16399)
-- Dependencies: 224
-- Data for Name: pga_jobclass; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobclass (jclid, jclname) FROM stdin;
\.


--
-- TOC entry 4839 (class 0 OID 16409)
-- Dependencies: 226
-- Data for Name: pga_job; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_job (jobid, jobjclid, jobname, jobdesc, jobhostagent, jobenabled, jobcreated, jobchanged, jobagentid, jobnextrun, joblastrun) FROM stdin;
\.


--
-- TOC entry 4841 (class 0 OID 16457)
-- Dependencies: 230
-- Data for Name: pga_schedule; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_schedule (jscid, jscjobid, jscname, jscdesc, jscenabled, jscstart, jscend, jscminutes, jschours, jscweekdays, jscmonthdays, jscmonths) FROM stdin;
\.


--
-- TOC entry 4842 (class 0 OID 16485)
-- Dependencies: 232
-- Data for Name: pga_exception; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_exception (jexid, jexscid, jexdate, jextime) FROM stdin;
\.


--
-- TOC entry 4843 (class 0 OID 16499)
-- Dependencies: 234
-- Data for Name: pga_joblog; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_joblog (jlgid, jlgjobid, jlgstatus, jlgstart, jlgduration) FROM stdin;
\.


--
-- TOC entry 4840 (class 0 OID 16433)
-- Dependencies: 228
-- Data for Name: pga_jobstep; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobstep (jstid, jstjobid, jstname, jstdesc, jstenabled, jstkind, jstcode, jstconnstr, jstdbname, jstonerror, jscnextrun) FROM stdin;
\.


--
-- TOC entry 4844 (class 0 OID 16515)
-- Dependencies: 236
-- Data for Name: pga_jobsteplog; Type: TABLE DATA; Schema: pgagent; Owner: postgres
--

COPY pgagent.pga_jobsteplog (jslid, jsljlgid, jsljstid, jslstatus, jslresult, jslstart, jslduration, jsloutput) FROM stdin;
\.


--
-- TOC entry 5111 (class 0 OID 16561)
-- Dependencies: 237
-- Data for Name: add_job; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.add_job (email, role, duration, jobtype, remuneration, requirements, description) FROM stdin;
test@gmail.com	a	s	s	s	s	s
\.


--
-- TOC entry 5112 (class 0 OID 16564)
-- Dependencies: 238
-- Data for Name: add_mentor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.add_mentor (mentor_id, mentor_name, mentor_logo, mento_description, years_of_exp, area_of_expertise, designation, institution, qualification, year_of_passing_out, startup_assoc, contact_num, email_address, linkedin_id, password, hashkey, user_role) FROM stdin;
bec1205261eca53ec66abbd58ef54567	Uttam sharma	https://trktorrr.s3.ap-south-1.amazonaws.com/Mentor/nirmaan%20logo.png	hi	5	Software Development	Software Developer	IITM	B.Tech	2020	Seed Stage Startups	9988777788	utam@gmail.com	manager.iedsd	werty223344	1	1
3012894bb5d80a58f0a9a4e61d34fb4e	virat Kohli	/uploads/https://trktorrr.s3.ap-south-1.amazonaws.com/Mentor/headpro.jpg	\N	4	Software Development	Developer	IITM	B.Des	2021	Seed Stage Startups	7755889966	jhkj@gmail.com	manager.ied	qwty223344	1	1
3fa2c9a6ed1105b8a1010504173cc8f3	virat rohit	https://trktorrr.s3.ap-south-1.amazonaws.com/Mentor/WhatsApp%20Image%202025-06-03%20at%2013.20.36_b4ae6138.jpg	Hi 	5	Software Development	Software Developer	IIT Bombay	B.Tech	2020	Seed Stage Startups	8899558566	kis@gmail.com	manager.iehjg	qwer223344	1	1
dd9722e3930118f5e7d398420133ad38	Kishore mk	https://trktorrr.s3.ap-south-1.amazonaws.com/Mentor/WhatsApp%20Image%202025-06-03%20at%2013.20.36_b4ae6138.jpg	HI Santhosh	4	Business Strategy	Software Developer	IITM	B.E	2020	Growth Stage Startups	9878987723	santhpsh@gmail.com	manager.ieds	qwers223344	1	1
29d2f6adc6faf432284f41106955a20c	Brahma 	https://trktorrr.s3.ap-south-1.amazonaws.com/Mentor/WhatsApp%20Image%202025-03-27%20at%2011.28.41%20AM.jpeg	sdds	4	Business Strategy	 SDeveloper	IITM	B.Tech	2021	Seed Stage Startups	8899662366	brahma@gmail.com	manager.ied	qwer223344	1	1
422996b3c276f4e012534c4f42f23711	Nirmaan	/uploads/https://trktorrr.s3.ap-south-1.amazonaws.com/Mentor/WhatsApp%20Image%202024-07-22%20at%209.20.11%20PM.jpeg	fdf	4	Software Development	devele	eee	dsfd	2020	Seed Stage Startups	7788445567	dsd@gmail.com	managerklj	dsjfdsfs	1	1
c0baa9e21e9b4a817c5ce3ecfdfeacf9	Tester 1	https://trktorrr.s3.ap-south-1.amazonaws.com/Mentor/WhatsApp%20Image%202025-06-03%20at%2013.20.36_b4ae6138.jpg	Test	5	Test	Test	Test	Test	2020	Growth Stage Startups	8899775566	test1@gmail.com	Test.linkedin	qwer223344	1	1
\.


--
-- TOC entry 5113 (class 0 OID 16569)
-- Dependencies: 239
-- Data for Name: aws_applied; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aws_applied (team_email, aws_startup_name, aws_email, aws_description, created_at, valid_till, status) FROM stdin;
sath@gnail.mom	Plenome	sathik@gmail.com	HealthCare	2024-07-22 16:13:32.638	2024-07-23 15:13:32.638	approved
M2Gi92OVDZ4Mk4UWYI7p8A==	Plenome	uNA8/CGeVbxHYssl/BLZv7gWqP0NNv8XXE/mqIrhZio=	HealthCare	2024-07-22 16:41:35.501	2024-07-23 15:41:35.501	approved
sat@gnail.mom	Plenome	sathi@gmail.com	HealthCare	2024-07-22 11:52:43.539	2024-07-23 10:52:43.539	approved
\.


--
-- TOC entry 5114 (class 0 OID 16573)
-- Dependencies: 240
-- Data for Name: documents_uploaded; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents_uploaded (startup_email, document_name, datetime) FROM stdin;
sath@gmail.com	Hello	2025-01-09 17:52:39.270875
\.


--
-- TOC entry 5115 (class 0 OID 16576)
-- Dependencies: 241
-- Data for Name: establish_connections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.establish_connections (connection_name, organization, connect_for, contact_number, email_address, connection_desig) FROM stdin;
Prasath Narayanan	OIE	Technical Assistance	9962383309	tech_support.ie@imail.iitm.ac.in	Technical Support
Satyajit Seal	OIE	Content Assistance	8335840840	cm.ie@imail.iitm.ac.in	Content Manager
Liya	OIE	Design Assistance	8606240571	design_ie@icsrpis.iitm.ac.in	Design Intern
Sundarraj E	OIE	Patent Assistance	9790510340	pm.ie@imail.iitm.ac.in	Project Manager
Jayaprakash M	OIE	Technical Assistance	6379120338	IC40580@imail.iitm.ac.in	Trainee
\.


--
-- TOC entry 5116 (class 0 OID 16579)
-- Dependencies: 242
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_type, event_title, event_privacy, event_description, event_date, event_time, created_by, select_speaker) FROM stdin;
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Masterclass	Test	Public	Test MasterClass	2024-09-16	15:23	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Webinar	Test2	Private	Test2	2024-09-11	15:26	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
Workshop	Demo Day	Public	Test	2024-09-27	09:30	manager.ie@imail.iitm.ac.in	C.P.Madhusudhan
\.


--
-- TOC entry 5117 (class 0 OID 16584)
-- Dependencies: 243
-- Data for Name: founder_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.founder_details (name, email, number, gender, studentid, linkedin, role) FROM stdin;
\.


--
-- TOC entry 5118 (class 0 OID 16587)
-- Dependencies: 244
-- Data for Name: mentor_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mentor_schedule (startup, mentor_mail, date, "time", description, created_at) FROM stdin;
me17d002@smail.iitm.ac.in	madhu@lucidindia.com	2024-09-30	16:30		2024-09-25 12:31:26.272011
me17d002@smail.iitm.ac.in	madhuu@lucidindia.com	2024-11-30	15.20	\N	2024-11-12 11:51:54.310442
\.


--
-- TOC entry 5119 (class 0 OID 16591)
-- Dependencies: 245
-- Data for Name: mentors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mentors (mentor_id, mentor_logo, mentor_description, mentor_experience, mentor_area_expertise, mentor_current_designation, mentor_insti, mentor_qualification, mentor_year_of_passing, mentor_starup_associated, mentor_contact_number, mentor_email, mentor_linkedin, mentor_password, created_at) FROM stdin;
4321	\\x69333239392e2f6c6b692e6a7067	-	10+	Management	Associate Prof	IITM	Phd	2007	Grow your farm	9962383309	sath@gmail.com	NULL	Nirmaan123	2024-05-03 16:48:40.432112
\.


--
-- TOC entry 5120 (class 0 OID 16596)
-- Dependencies: 246
-- Data for Name: messages_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages_data (message_id, sender_id, message, receiver_id, sent_at) FROM stdin;
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
qwesaez12aA	prasath@gmail.com	Hi Prof! how are you	prajagopal@iitm.ac.in	2024-05-31 15:21:45.899332
\.


--
-- TOC entry 5121 (class 0 OID 16600)
-- Dependencies: 247
-- Data for Name: raised_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.raised_request (team_mail, request_type, description, time_stamp) FROM stdin;
test@gmail.com	Request regarding Members	zds	2024-07-12 12:22:02.61322
test@gmail.com	Request regarding Members	as	2024-07-12 14:42:53.423314
test@gmail.com	Request regarding Members	as	2024-07-12 14:42:55.46152
test@gmail.com	Request regarding Contact / Connections	as	2024-07-12 14:43:01.116408
test@gmail.com	Request regarding Contact / Connections	as	2024-07-12 14:45:32.357573
test@gmail.com	Request regarding Members	fg	2024-07-12 14:46:04.287054
test@gmail.com	Type of Request	fg	2024-07-12 14:47:31.310117
test@gmail.com	Request regarding Members	fgsfc	2024-07-12 14:48:23.164817
test@gmail.com	Request regarding Members	For web development	2024-07-16 14:53:38.376454
test@gmail.com	Request regarding Documentation	n	2024-07-16 15:15:09.586183
test@gmail.com	Request regarding Internship Certificate	Working	2024-07-16 16:17:55.532369
\.


--
-- TOC entry 5122 (class 0 OID 16604)
-- Dependencies: 248
-- Data for Name: request_speaker; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.request_speaker (speaker_name, event_description, created_by) FROM stdin;
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	fn	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	Demo Day -24	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ajd	manager.ie@imail.iitm.ac.in
C.P.Madhusudhan	test	manager.ie@imail.iitm.ac.in
B.Vaidyanathan	ad	manager.ie@imail.iitm.ac.in
\.


--
-- TOC entry 5123 (class 0 OID 16607)
-- Dependencies: 249
-- Data for Name: resume_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resume_data (resume_name, resume_email, college_data, college_department, resume_url, resume_year, created_at) FROM stdin;
Shayno Beryl	shaynoberyl2302@gmail.com	St. Joseph's Institute of Technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/1000062794.png	2	\N
Karthik	karthiksiky@gmail.com	St. Joseph's Institute of Technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/CV.pdf	2	\N
Aswin K	k.ashwin.2603@gmail.com	St. Joseph's Institute of Technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/Aswin's+Resume+(7).pdf	2	\N
Chandra sekaran S	scsvr2004@gmail.com	St. Joseph's Institute of Technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/Chandra+Sekaran+Resume.pdf	2	\N
Navitha M	Navithanavitha342@gmail.com	St. Joseph's Institute of Technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/DOC-20240326-WA0003_.pdf	2	\N
Ubadulla R	ubadulla125@gmail.com	St. Joseph's Institute of technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/Grey+Clean+CV+Resume+Photo.pdf	2	\N
LAKSHMI PRIYA R	rajeshkumarc127@gmail.com	St.Joseph's Institute of technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/LAKSHMI+PRIYA+RESUME.docx	2	\N
IMMAN	mmanfrk23@gmail.com	St.Joseph's Institute of technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/Imman+F.pdf	2	\N
Soundariya B	soundarsoundariya@gmail.com	St.Joseph's Institute of technology	ECE	https://resume-data-nirmaan.s3.ap-south-1.amazonaws.com/Minimalist+White+and+Grey+Professional+Resume.jpg	2	\N
\.


--
-- TOC entry 5130 (class 0 OID 147496)
-- Dependencies: 256
-- Data for Name: schedule_meetings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_meetings (meet_id, mentor_reference_id, start_up_name, founder_name, meeting_mode, meeting_link, meeting_location, participants, date, "time", meeting_duration, meeting_agenda) FROM stdin;
21	422996b3c276f4e012534c4f42f23711	Seed Stage Startups	Krish	Virtual	jgjh		John Doe	2025-05-26	17:44:00	30 mins	dfsdf
22	dd9722e3930118f5e7d398420133ad38	Seed Stage Startups	charu	Virtual	kishfuhshkdj		John Doe	2025-05-28	14:11:00	1 hour	dsd
25	c0baa9e21e9b4a817c5ce3ecfdfeacf9	Seed Stage Startups	Krish	Virtual	jgjh			2025-05-29	15:45:00	1 hour	jbm
26	c0baa9e21e9b4a817c5ce3ecfdfeacf9	Seed Stage Startups	Krish	In Person		jhgfhjg	John Doe	2025-05-29	15:46:00	1 hour	bvcbchchg
27	dd9722e3930118f5e7d398420133ad38	Enterprise Level	Krish	In Person		jhb	John Doe	2025-05-29	15:54:00	1 hour	nmjkn
28	3012894bb5d80a58f0a9a4e61d34fb4e	Growth Stage Startups	Krish	Virtual	sdsd		John Doe	2025-05-30	10:47:00	1 hour	fd
\.


--
-- TOC entry 5136 (class 0 OID 589877)
-- Dependencies: 262
-- Data for Name: startup_awards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.startup_awards (id, official_email_address, award_name, award_org, prize_money, awarded_date, document_url, description) FROM stdin;
\.


--
-- TOC entry 5124 (class 0 OID 16610)
-- Dependencies: 250
-- Data for Name: tag_connection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tag_connection (startup_team_mail, connection_email, email_content, created_at, user_role) FROM stdin;
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
cm.ie@imail.iitm.ac.in	cm.ie@imail.iitm.ac.in	ad	2024-08-23 12:16:30.813262+05:30	2
cm.ie@imail.iitm.ac.in	pm.ie@imail.iitm.ac.in	axc	2024-08-23 12:24:55.983827+05:30	2
\.


--
-- TOC entry 5125 (class 0 OID 16614)
-- Dependencies: 251
-- Data for Name: team_member_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_member_details (team_name, team_email, team_number, team_designation) FROM stdin;
prasath narayanan	admin@machintell.co.in	9962383309	OIE
JayaPrakash JP	prasathnarayanan6@gmail.com	9962383309	CTO
Prasath Narayanan	prasathnarayanan@gmail.com	9962383309	Developer
Prasath Narayanan	prasathnarayana@gmail.com	9962383309	Developer
Prasath Narayanan	jayaprakash@hotmail.in	99872441	Tech_support
scsdf	sath@gmail.com	123445667	skfkwf
zscsc	jp@gmail.com	12345678	Test
\.


--
-- TOC entry 5126 (class 0 OID 16617)
-- Dependencies: 252
-- Data for Name: test_startup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test_startup (basic, official, founder, description, official_email_address, startup_status) FROM stdin;
{"cohort": "2025-07", "program": "Pratham", "community": "CZC", "startup_yog": "", "graduated_to": "Incubation", "startup_name": "Seat of Joy", "startup_tech": "Software", "startup_type": "Industry 4.0", "startup_sector": "Software and Data", "startup_program": "", "startup_industry": "Industry 4.0"}	{"scheme": "Pratham", "password": "", "pia_state": "Tamil Nadu", "linkedin_id": "https://www.linkedin.com/in/sundar-lingam-8407a5221/", "dpiit_number": "DPIIT525252575257", "website_link": "https://nirmaan-staging.wraptron.com/", "funding_stage": "Pre-Series A", "role_of_faculty": "Advisor/ Mentor", "mentor_associated": "S.Gopal", "official_registered": "yes", "official_email_address": "krish21498@gmail.com", "cin_registration_number": "52524245", "official_contact_number": "8807919181"}	{"linkedInid": "https://www.linkedin.com/in/sundar-lingam-8407a5221/", "founder_name": "Krish", "founder_email": "test1@gmail.com", "founder_gender": "Male", "founder_number": "8807818191", "founder_student_id": "ic2345", "academic_background": "MBA"}	{"logo": {}, "startup_description": " \\"AI-powered video analytics that analyze workplace CCTV footage to measure productivity and efficiency.\\""}	krish21498@gmail.com	
{"cohort": "2025-07", "program": "Pratham", "community": "PALS", "startup_yog": "", "graduated_to": "Incubation", "startup_name": "DemCare", "startup_tech": "Hardware", "startup_type": "Industry 4.0", "startup_sector": "Software and Data", "startup_program": "", "startup_industry": "Industry 4.0"}	{"scheme": "Pratham", "password": "", "pia_state": "Tamil Nadu", "linkedin_id": "https://www.linkedin.com/in/sundar-lingam-8407a5221/", "dpiit_number": "DPIIT525252575257", "website_link": "https://nirmaan-staging.wraptron.com/", "funding_stage": "Seed", "role_of_faculty": "Advisor/ Mentor", "mentor_associated": "S.Gopal", "official_registered": "yes", "official_email_address": "kishore.madhavan@wraptron.com", "cin_registration_number": "52524245", "official_contact_number": "8807919181"}	{"linkedInid": "https://www.instagram.com/matloadsolutions/", "founder_name": "Krish", "founder_email": "test1@gmail.com", "founder_gender": "Male", "founder_number": "8807818191", "founder_student_id": "ic2345", "academic_background": "B.Tech"}	{"logo": {}, "startup_description": "adsadadasfdsf"}	kishore.madhavan@wraptron.com	Active
{"program": "Graduated", "startup_yog": "2022", "graduated_to": "Incubation", "startup_name": "DemCare", "startup_type": "Industry 4.0", "startup_cohort": "2025-07", "startup_sector": "Healthcare", "startup_industry": "Industry 4.0", "startup_Community": "Direct entry", "startup_technology": "Hardware"}	{"scheme": "Graduated", "password": "", "pia_state": "Tamil Nadu", "linkedin_id": "https://www.linkedin.com/in/sundar-lingam-8407a5221/", "dpiit_number": "DPIIT525252575257", "website_link": "", "funding_stage": "Pre-Series A", "role_of_faculty": "Advisor/ Mentor", "mentor_associated": "S.Gopal", "official_registered": "yes", "official_email_address": "jayaprakashtrk8@gmail.com", "cin_registration_number": "11221122", "official_contact_number": ""}	{"linkedInid": "https://www.linkedin.com/in/sundar-lingam-8407a5221/", "founder_name": "Krish", "founder_email": "test123@gmail.com", "founder_gender": "", "founder_number": "8807814191", "founder_student_id": "1121212", "academic_background": "MBA"}	{"logo": {}, "logo_image": "", "startup_description": "Heeeeee"}	jayaprakashtrk8@gmail.com	
{"program": "Graduated", "startup_yog": "2025", "graduated_to": "Incubation", "startup_name": "Theaj", "startup_type": "Hardware", "startup_cohort": "2025-07", "startup_sector": "Software and Data", "startup_industry": "Healthcare", "startup_Community": "IZI", "startup_technology": "Hardware"}	{"scheme": "Graduated", "password": "", "pia_state": "Tamil Nadu", "linkedin_id": "https://www.linkedin.com/in/kishore-m-430ba5187/", "dpiit_number": "DPIIT525252575257", "website_link": "https://nirmaan-staging.wraptron.com/", "funding_stage": "Pre-Seed", "role_of_faculty": "Advisor/ Mentor", "mentor_associated": "S.Gopal", "official_registered": "yes", "official_email_address": "tejatharun90@gmail.com", "cin_registration_number": "52524245", "official_contact_number": "8807919181"}	{"linkedInid": "https://www.linkedin.com/in/sundar-lingam-8407a5221/", "founder_name": "Krish", "founder_email": "test41@gmail.com", "founder_gender": "Male", "founder_number": "8807814191", "founder_student_id": "ic2345", "academic_background": "Msc"}	{"logo": {}, "logo_image": "", "startup_description": "safasdfadfsa"}	tejatharun90@gmail.com	Active
\.


--
-- TOC entry 5132 (class 0 OID 147502)
-- Dependencies: 258
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.testimonials (testimonial_id, mentor_ref_id, name, role, description) FROM stdin;
20	dd9722e3930118f5e7d398420133ad38	kishore	cricket	Hello
26	dd9722e3930118f5e7d398420133ad38	jp	Software Developer	hi jp
27	3012894bb5d80a58f0a9a4e61d34fb4e	kishore m	Software Developer	HI\n
28	c0baa9e21e9b4a817c5ce3ecfdfeacf9	kishore m	zx	xzc
\.


--
-- TOC entry 5127 (class 0 OID 16622)
-- Dependencies: 253
-- Data for Name: update_funding; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.update_funding (id, startup_name, funding_type, amount, purpose, funding_date, reference_number, document, description, status) FROM stdin;
19	me17d002@smail.iitm.ac.in	Funding Distributed	200000.00	Pratham Fund 	2024-09-25	00000		Pratham Fund 2L	\N
21	ae19b010@smail.iitm.ac.in	Funding Distributed	500000.00	Akshar Fund	2024-09-25	00000		Akshar Fund 5L	\N
22	cs19d002@smail.iitm.ac.in	Funding Distributed	500000.00	Akshar Fund Allocation	2024-09-25	00000		Akshar fund 5L Distributed	\N
20	mm20d016@smail.iitm.ac.in	Funding Distributed	200000.00	Pratham Fund	2024-09-25	00000		Pratham Fund 2L	Approved
27	mm20d016@smail.iitm.ac.in	Funding Utilized	33333.00	AWS cloud cost	2024-10-22	1234567		Please approve the bill	Approved
\.


--
-- TOC entry 5129 (class 0 OID 16628)
-- Dependencies: 255
-- Data for Name: user_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_data (user_id, user_mail, user_password, user_hash, user_department, user_role, created_at, user_name, user_contact, personal_email, profile_photo) FROM stdin;
24080503	test@gmail.com	data@gmail.com	m76ii1t$3sh-+yUaai+=	student	5	2024-05-08 11:16:45.016111+05:30	test	9677293620	test@yahoo.com	\N
24080504	finance_new@imail.iitm.ac.in	securepassword	generatedhash123	FINANCE	3	2024-09-21 12:52:12.592895+05:30	Finance Team	9876543210	finance@imail.com	Office/39529.jpg
250420241	manager.ie@imail.iitm.ac.in	qwerty223344	bwesubaoxjnxidydgwj+:+	MANAGEMENT	2	2024-04-25 17:26:37.221773+05:30	Nandhini K S	7092311114	nandhini.ramu@gmail.com	Admin/Nandhinimamtraktor.png
22	krish21498@gmail.com	gNHMEBsq	bd1dc2cdb9f1b97cf7fd6d4122b04edb	student	5	\N	Krish	8807818191	test1@gmail.com	\N
23	kishore.madhavan@wraptron.com	4NZu8LOg	d05d5c91b76655dae72e6e553ade9eaf	student	5	\N	Krish	8807818191	test1@gmail.com	\N
24	sundarlingam272000@gmail.com	zhDLwa0C	8a31ab969a94790f568f8bce6c9d7e28	student	5	\N	virat	8807814191	test141@gmail.com	\N
25	jayaprakashtrk8@gmail.com	ZaiI975y	4c29b3887c120a25db9075f2bdf05c02	student	5	\N	Krish	8807814191	test123@gmail.com	\N
26	tejatharun90@gmail.com	5SFqqwBA	e5a3f07cae635854284f4af6ff74899f	student	5	\N	Krish	8807814191	test41@gmail.com	\N
\.


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 257
-- Name: schedule_meetings_meet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schedule_meetings_meet_id_seq', 28, true);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 261
-- Name: startup_awards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.startup_awards_id_seq', 6, true);


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 259
-- Name: testimonials_testimonial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.testimonials_testimonial_id_seq', 28, true);


--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 254
-- Name: update_funding_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.update_funding_id_seq', 27, true);


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 260
-- Name: user_data_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_data_user_id_seq', 26, true);


--
-- TOC entry 4922 (class 2606 OID 16636)
-- Name: add_job add_job_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.add_job
    ADD CONSTRAINT add_job_pkey PRIMARY KEY (email);


--
-- TOC entry 4924 (class 2606 OID 16638)
-- Name: add_mentor add_mentor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.add_mentor
    ADD CONSTRAINT add_mentor_pkey PRIMARY KEY (email_address);


--
-- TOC entry 4928 (class 2606 OID 16640)
-- Name: aws_applied aws_applied_aws_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aws_applied
    ADD CONSTRAINT aws_applied_aws_email_key UNIQUE (aws_email);


--
-- TOC entry 4930 (class 2606 OID 16642)
-- Name: aws_applied aws_applied_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aws_applied
    ADD CONSTRAINT aws_applied_pkey PRIMARY KEY (team_email);


--
-- TOC entry 4932 (class 2606 OID 16644)
-- Name: documents_uploaded documents_uploaded_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents_uploaded
    ADD CONSTRAINT documents_uploaded_pkey PRIMARY KEY (startup_email);


--
-- TOC entry 4934 (class 2606 OID 16646)
-- Name: establish_connections establish_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.establish_connections
    ADD CONSTRAINT establish_connections_pkey PRIMARY KEY (contact_number);


--
-- TOC entry 4936 (class 2606 OID 16648)
-- Name: founder_details founder_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.founder_details
    ADD CONSTRAINT founder_details_pkey PRIMARY KEY (email);


--
-- TOC entry 4938 (class 2606 OID 16650)
-- Name: mentor_schedule mentor_schedule_mentor_mail_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentor_schedule
    ADD CONSTRAINT mentor_schedule_mentor_mail_key UNIQUE (mentor_mail);


--
-- TOC entry 4940 (class 2606 OID 16652)
-- Name: mentors mentors_mentor_contact_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentors
    ADD CONSTRAINT mentors_mentor_contact_number_key UNIQUE (mentor_contact_number);


--
-- TOC entry 4942 (class 2606 OID 16654)
-- Name: mentors mentors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mentors
    ADD CONSTRAINT mentors_pkey PRIMARY KEY (mentor_id);


--
-- TOC entry 4950 (class 2606 OID 16656)
-- Name: test_startup pk_official_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test_startup
    ADD CONSTRAINT pk_official_email PRIMARY KEY (official_email_address);


--
-- TOC entry 4944 (class 2606 OID 16658)
-- Name: raised_request raised_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raised_request
    ADD CONSTRAINT raised_request_pkey PRIMARY KEY (team_mail, time_stamp);


--
-- TOC entry 4946 (class 2606 OID 16660)
-- Name: resume_data resume_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resume_data
    ADD CONSTRAINT resume_data_pkey PRIMARY KEY (resume_email);


--
-- TOC entry 4958 (class 2606 OID 147512)
-- Name: schedule_meetings schedule_meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_meetings
    ADD CONSTRAINT schedule_meetings_pkey PRIMARY KEY (meet_id);


--
-- TOC entry 4962 (class 2606 OID 589884)
-- Name: startup_awards startup_awards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.startup_awards
    ADD CONSTRAINT startup_awards_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 16662)
-- Name: team_member_details team_member_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_member_details
    ADD CONSTRAINT team_member_details_pkey PRIMARY KEY (team_email);


--
-- TOC entry 4960 (class 2606 OID 147514)
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (testimonial_id);


--
-- TOC entry 4926 (class 2606 OID 147516)
-- Name: add_mentor unique_mentor_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.add_mentor
    ADD CONSTRAINT unique_mentor_id UNIQUE (mentor_id);


--
-- TOC entry 4952 (class 2606 OID 16664)
-- Name: update_funding update_funding_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.update_funding
    ADD CONSTRAINT update_funding_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 16666)
-- Name: user_data user_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_data
    ADD CONSTRAINT user_data_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4956 (class 2606 OID 16668)
-- Name: user_data user_data_user_mail_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_data
    ADD CONSTRAINT user_data_user_mail_key UNIQUE (user_mail);


--
-- TOC entry 4963 (class 2606 OID 147517)
-- Name: schedule_meetings schedule_meetings_mentor_reference_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_meetings
    ADD CONSTRAINT schedule_meetings_mentor_reference_id_fkey FOREIGN KEY (mentor_reference_id) REFERENCES public.add_mentor(mentor_id);


--
-- TOC entry 4965 (class 2606 OID 589885)
-- Name: startup_awards startup_awards_official_email_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.startup_awards
    ADD CONSTRAINT startup_awards_official_email_address_fkey FOREIGN KEY (official_email_address) REFERENCES public.test_startup(official_email_address) ON DELETE CASCADE;


--
-- TOC entry 4964 (class 2606 OID 147522)
-- Name: testimonials testimonials_mentor_ref_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_mentor_ref_id_fkey FOREIGN KEY (mentor_ref_id) REFERENCES public.add_mentor(mentor_id) ON DELETE CASCADE;


-- Completed on 2025-07-20 23:19:40

--
-- PostgreSQL database dump complete
--

