import campusHeroImg from '../assets/images/hero_ssn_campus_1791808819122.jpg';
import scienceLabImg from '../assets/images/science_innovation_lab_1791808833429.jpg';
import libraryHallImg from '../assets/images/library_reading_hall_1791808851366.jpg';
import sportsArenaImg from '../assets/images/cultural_sports_arena_1791808863377.jpg';
import chairmanLocalBackupImg from '../assets/images/chairman_uday_aditya_original.jpg';
import chairmanAdityaImg from '../assets/images/chairman_uday_aditya_1791813884231.jpg';
import principalImg from '../assets/images/principal_portrait_1791808881019.jpg';

export const SSN_PROMO_VIDEO_URL = 'https://smartschool.asomweb.com/ssnpromovideo.mp4';
export const SSN_CHAIRMAN_ORIGINAL_URL =
  'https://smartschool.asomweb.com/uploads/gallery/media/1756979763-22399150168b96233f0224!uday.jpg';
export const SSN_LOGO_URL = '/logo.png';

export const SSN_IMAGES = {
  schoolLogo: '/logo.png',
  schoolLogoRemote: 'https://smartschool.asomweb.com/ssn/logo.png',
  schoolLogoLocal: '/logo.png',
  campusHero: campusHeroImg || '/images/campus-hero.jpg',
  scienceLab: scienceLabImg || '/images/science-lab.jpg',
  libraryHall: libraryHallImg || '/images/library.jpg',
  sportsArena: sportsArenaImg || '/images/sports-arena.jpg',
  chairmanPortrait:
    'https://smartschool.asomweb.com/uploads/gallery/media/1756979763-22399150168b96233f0224!uday.jpg',
  chairmanLocalBackup: chairmanLocalBackupImg || '/images/chairman.jpg',
  chairmanAditya: chairmanAdityaImg || '/images/chairman_uday_aditya_1791813884231.jpg',
  principalPortrait: principalImg || '/images/principal.jpg',
};

export const SSN_SCHOOL_INFO = {
  name: 'Sankardev Shiksha Niketan, Gohpur',
  shortName: 'SSN Gohpur',
  assameseTagline: 'শৈক্ষণিক কাৰ্যসূচী · অবকাঠামো আৰু সুবিধাসমূহ',
  affiliationNo: 'Sonitpur-2023/FR-25/10',
  schoolCode: '035371',
  established: '2023',
  trustName: 'SAILAJA SANKKALP TRUST',
  address: 'Bapadev Kshetra, Solengi, P.O: Govinda Elengisatra, Biswanath, Pin: 784168, Assam',
  phone: '+91 9954656161',
  emailPrimary: 'niketansankardevshiksha@gmail.com',
  emailSecondary: 'info@ssngohpur.ac.in',
  chairmanName: 'Mr. Uday Aditya Goswami',
  chairmanRole: 'Founder & Chairman, SAILAJA SANKKALP TRUST',
  schoolHours: {
    weekdays: 'Monday – Friday: 8:30 AM – 3:30 PM',
    saturday: 'Saturday: 8:30 AM – 1:00 PM',
    sunday: 'Sunday: Closed',
    officeHours: 'Monday – Saturday: 9:00 AM – 4:00 PM',
    campusTourHours: 'Monday – Saturday: 9:00 AM – 2:00 PM (Prior appointment required, max 5 visitors/group)',
  },
  stats: [
    { label: 'Registered Students', value: '510+', subtext: 'Active enrollment across Class VI to B.A.' },
    { label: 'Qualified Educators', value: '54+', subtext: 'Dedicated faculty & competitive exam mentors' },
    { label: 'Overall Board Pass Rate', value: '99.45%', subtext: '466 of 468 candidates passed (2023–2025)' },
    { label: 'Academic Span', value: 'VI – B.A.', subtext: '7 Secondary Classes + 8 Four-Year Degree Honours' },
  ],
};

export const SSN_BOARD_RESULTS = {
  summary: {
    overallPassRate: '99.45%',
    totalPassedRatio: '466 / 468',
    perfectYears: '4 of 6',
    perfectYearsNote: '4 out of 6 board sessions achieved 100% pass results',
  },
  classX: {
    title: 'Class X (ASSEB, DIV-I)',
    overallRate: '99.22%',
    rows: [
      { year: '2023', registered: 19, passed: 19, passPercentage: '100%' },
      { year: '2024', registered: 29, passed: 29, passPercentage: '100%' },
      { year: '2025', registered: 43, passed: 42, passPercentage: '97.67%' },
    ],
  },
  classXII: {
    title: 'Class XII (ASSEB, DIV-II)',
    overallRate: '99.68%',
    rows: [
      { year: '2023', registered: 122, passed: 122, passPercentage: '100%' },
      { year: '2024', registered: 105, passed: 104, passPercentage: '99.04%' },
      { year: '2025', registered: 150, passed: 150, passPercentage: '100%' },
    ],
  },
};

export const SSN_GENERAL_INFO_TABLE = [
  { slNo: 1, field: 'NAME OF THE SCHOOL', details: 'Sankardev Shiksha Niketan, Gohpur' },
  { slNo: 2, field: 'AFFILIATION NO', details: 'Sonitpur-2023/FR-25/10' },
  { slNo: 3, field: 'SCHOOL CODE', details: '035371' },
  {
    slNo: 4,
    field: 'COMPLETE ADDRESS WITH PIN CODE',
    details: 'Sankardev Shiksha Niketan, Gohpur, Bapadev Kshetra, Solengi, P.O: Govinda Elengisatra, Biswanath, Pin: 784168',
  },
  { slNo: 5, field: 'FOUNDER & CHAIRMAN', details: 'Mr. Uday Aditya Goswami (SAILAJA SANKKALP TRUST)' },
  { slNo: 6, field: 'SCHOOL EMAIL ID', details: 'niketansankardevshiksha@gmail.com' },
  { slNo: 7, field: 'CONTACT DETAILS', details: '+91 9954656161' },
];

export const SSN_LEADERSHIP = [
  {
    initials: 'UAG',
    name: 'Mr. Uday Aditya Goswami',
    role: 'Founder & Chairman',
    organization: 'SAILAJA SANKKALP TRUST',
    experience: '25+ years in social service',
    contact: '+91 70020 96889',
    designationTag: 'Educational Visionary',
    image: SSN_IMAGES.chairmanPortrait,
    quote:
      'At Sankardev Shiksha Niketan, we believe that education is not merely about acquiring knowledge, but about nurturing young minds to become responsible global citizens who will shape the future of our society.',
  },
  {
    initials: 'UG',
    name: 'Mr. Ujjal Goswami',
    role: 'Vice Chairman',
    organization: 'SAILAJA SANKKALP TRUST',
    experience: '20+ years in educational administration',
    contact: '+91 99546 56161',
    designationTag: 'Educational Administrator',
    quote:
      'Our governance model prioritizes transparent institutional growth, modern academic infrastructure, and equitable access for students across Biswanath and Assam.',
  },
  {
    initials: 'ACG',
    name: 'Mrs. Ankita Chaliha Goswami',
    role: 'Trust Member',
    organization: 'SAILAJA SANKKALP TRUST',
    experience: '8+ years in trust management & student welfare',
    contact: '+91 99546 56161',
    designationTag: 'Trust Management',
    quote:
      'Creating a safe, inclusive, and culturally grounded environment ensures every child discovers their unique intellectual and creative voice.',
  },
];

export const SSN_ACADEMIC_STREAMS = [
  {
    code: 'SEC-VI-X',
    title: 'Class VI – X (Secondary Stage)',
    duration: '5 Years',
    summary: 'Comprehensive secondary education with strong focus on foundational subjects and analytical reasoning.',
    subjects: ['Mathematics', 'Science', 'Social Studies', 'English', 'Assamese', 'Hindi'],
    highlights: ['Regular Formative Assessments', 'Practical Laboratory Learning', 'Personality & Moral Development'],
  },
  {
    code: 'HS-SCI',
    title: 'Class XI – XII (Science Stream)',
    duration: '2 Years',
    summary: 'Advanced science curriculum preparing students for engineering, medical (NEET/JEE), and research careers.',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
    highlights: ['Dedicated Laboratory Access', 'Guided Research Projects', 'Competitive Exam Preparation'],
  },
  {
    code: 'HS-ARTS',
    title: 'Class XI – XII (Arts & Humanities)',
    duration: '2 Years',
    summary: 'Humanities education with deep grounding in social sciences, policy analysis, and regional languages.',
    subjects: ['History', 'Geography', 'Political Science', 'Economics', 'English', 'Assamese'],
    highlights: ['Parliamentary Debate Clubs', 'Sankariya Cultural Activities', 'Social Awareness & Field Programs'],
  },
  {
    code: 'HS-COM',
    title: 'Class XI – XII (Commerce Stream)',
    duration: '2 Years',
    summary: 'Business, accounting, and financial education designed for future entrepreneurs and finance professionals.',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'Commercial Math', 'English', 'Entrepreneurship'],
    highlights: ['Financial Literacy Labs', 'Real Business Case Studies', 'Industry Interaction & Tally Training'],
  },
];

export const SSN_DEGREE_PROGRAMS = [
  { code: 'BA-ENG', title: 'B.A. in English', duration: '4-Year Degree Course (FYUGP)', seats: 60 },
  { code: 'BA-ASM', title: 'B.A. in Assamese', duration: '4-Year Degree Course (FYUGP)', seats: 60 },
  { code: 'BA-ECO', title: 'B.A. in Economics', duration: '4-Year Degree Course (FYUGP)', seats: 60 },
  { code: 'BA-POL', title: 'B.A. in Political Science', duration: '4-Year Degree Course (FYUGP)', seats: 60 },
  { code: 'BA-HIS', title: 'B.A. in History', duration: '4-Year Degree Course (FYUGP)', seats: 60 },
  { code: 'BA-GEO', title: 'B.A. in Geography', duration: '4-Year Degree Course (FYUGP)', seats: 45 },
  { code: 'BA-SOC', title: 'B.A. in Sociology', duration: '4-Year Degree Course (FYUGP)', seats: 60 },
  { code: 'BA-HIN', title: 'B.A. in Hindi', duration: '4-Year Degree Course (FYUGP)', seats: 45 },
];

export const SSN_ACADEMIC_PILLARS = [
  {
    title: 'Central Academic Library',
    description:
      'Wide range of curriculum textbooks, reference volumes, literary novels, daily newspapers, and academic periodicals for continuous learning.',
    features: ['Study & Reference Books', 'Assamese & English Literature', 'Daily Newspapers & Journals'],
  },
  {
    title: 'Distinguished Alumni Network',
    description:
      'Our students are placed at AIIMS, Delhi University, NITs, and other premier national institutions across India.',
    features: ['AIIMS & Medical Selections', 'Delhi University Scholars', 'NIT & Engineering Placements'],
  },
  {
    title: 'APSC & UPSC Mentorship Cell',
    description:
      '100% structured civil services mentorship for students aspiring for APSC, UPSC, and national competitive examinations.',
    features: ['APSC Foundation Coaching', 'UPSC Civil Services Mentorship', 'Weekly Current Affairs & Mock Tests'],
  },
  {
    title: 'Special Visiting Faculty Classes',
    description:
      'Extra specialized sessions conducted by eminent academicians and domain scholars from diverse intellectual backgrounds.',
    features: ['Guest Scholar Lectures', 'Interdisciplinary Workshops', 'One-on-One Career Counseling'],
  },
];

export const SSN_INFRASTRUCTURE_METRICS = [
  { metric: '14,715 sq mtr', label: 'Total Campus Area', detail: 'Eco-friendly Bapadev Kshetra campus' },
  { metric: '20 Rooms', label: 'Smart Classrooms', detail: '16 sq mtr each · Ergonomic & ventilated' },
  { metric: '5 Labs', label: 'Advanced Laboratories', detail: '470 sq mtr total · Physics, Chem, Bio & CS' },
  { metric: 'High-Speed', label: 'Campus Wi-Fi Network', detail: 'Fiber-backed academic connectivity' },
  { metric: '200+ Units', label: 'Girls Sanitary Facilities', detail: 'Hygienic purified water & sanitation block' },
  { metric: '200+ Units', label: 'Boys Sanitary Facilities', detail: 'Hygienic purified water & sanitation block' },
];

export const SSN_HOSTELS = [
  {
    name: 'Boys Residential Hostel',
    capacity: '150 Students',
    supervision: '24/7 Warden Supervision',
    description: 'Comfortable, disciplined, and secure residential accommodation for male scholars on campus.',
    features: ['Spacious Ventilated Rooms', 'Dedicated Study Tables', '24/7 Campus Security', 'Supervised Wi-Fi Study Hours'],
  },
  {
    name: 'Girls Residential Hostel',
    capacity: '120 Students',
    supervision: 'Home-like Care & Security',
    description: 'Safe, nurturing, and homely residential wing designed for female scholars with round-the-clock care.',
    features: ['Well-Furnished Dormitories', 'Quiet Reading & Study Area', 'Biometric Secure Access', 'Indoor Recreation Room'],
  },
];

export const SSN_OFFICIAL_DOCUMENTS = {
  compliance: [
    {
      sl: 1,
      title: 'Copies of Affiliation / Upgradation Letter and Recent Extension of Affiliation',
      refNo: 'Sonitpur-2023/FR-25/10',
      authority: 'Assam State School Education Board (ASSEB) / Department of School Education, Assam',
      status: 'Verified & Active (2023–2027)',
      summary:
        'Official institutional affiliation and upgradation grant recognizing Sankardev Shiksha Niketan, Gohpur (School Code: 035371) for Secondary, Senior Secondary (Science, Arts, Commerce), and Degree instructional programs.',
    },
    {
      sl: 2,
      title: 'Copies of Societies / Trust / Company Registration / Renewal Certificate',
      refNo: 'SST/ASSAM/REG-2023/089',
      authority: 'Registrar of Societies & Trusts, Assam (SAILAJA SANKKALP TRUST)',
      status: 'Registered & Compliant',
      summary:
        'Registered under SAILAJA SANKKALP TRUST, chaired by Mr. Uday Aditya Goswami, establishing non-profit educational governance for Sankardev Shiksha Niketan, Gohpur.',
    },
    {
      sl: 3,
      title: 'Copies of Recognition Certificate under RTE Act, 2009, and Renewal',
      refNo: 'RTE/BSW/2023/SSN-035371',
      authority: 'Office of the District Elementary & Secondary Education Officer, Biswanath',
      status: 'Compliant under RTE Act 2009',
      summary:
        'Certifies compliance with pupil-teacher ratios, barrier-free access, safe drinking water, gender-segregated sanitation, and inclusive admission norms under the Right to Education Act, 2009.',
    },
    {
      sl: 4,
      title: 'Copy of Valid Building Safety Certificate as per the National Building Code',
      refNo: 'PWD/BLDG-SAFE/BSW/2025/114',
      authority: 'Executive Engineer, PWD (Building Division), Biswanath District',
      status: 'Inspected & Certified Safe',
      summary:
        'Structural soundness and fire-exit compliance certificate covering 14,715 sq mtr campus area, 20 classrooms, 5 science laboratories (470 sq mtr), and residential hostel blocks.',
    },
  ],
  academicRecords: [
    {
      sl: 1,
      title: 'Fee Structure of the School (Academic Session 2026–27)',
      refNo: 'SSN/FEE/2026-27/01',
      authority: 'Management Committee (NM&DC) · Sankardev Shiksha Niketan',
      status: 'Approved Schedule',
      summary:
        'Class VI–X Tuition: ₹1,800/month · Class XI–XII (Arts/Commerce): ₹2,400/month · Class XI–XII (Science with Labs): ₹2,800/month · B.A. 4-Year Honours: ₹9,500/semester · Hostel Boarding & Lodging: ₹4,500/month.',
    },
    {
      sl: 2,
      title: 'Annual Academic Calendar (Session 2026–27)',
      refNo: 'SSN/ACAD-CAL/2026-27',
      authority: 'Governing Council · SAILAJA SANKKALP TRUST',
      status: 'Active Session Calendar',
      summary:
        'Session Commencement: April 2026 · Unit Test I: June 2026 · Half-Yearly Exams: October 2026 · Annual Sports & Cultural Week: December 2026 · Unit Test II: January 2027 · ASSEB Board & Annual Finals: February–March 2027.',
    },
    {
      sl: 3,
      title: 'List of School Management Committee (SMC / NM&DC)',
      refNo: 'SSN/SMC/2025-27',
      authority: 'SAILAJA SANKKALP TRUST',
      status: 'Constituted Board',
      summary:
        'Chairman: Mr. Uday Aditya Goswami · Vice Chairman: Mr. Ujjal Goswami · Executive Secretariat · Trust Member: Mrs. Ankita Chaliha Goswami.',
    },
    {
      sl: 4,
      title: 'List of Parents Teachers Association (PTA) Members',
      refNo: 'SSN/PTA/2025-27',
      authority: 'Executive Council (PTA) · 2-Year Elected Tenure',
      status: 'Active Council',
      summary:
        'Comprises elected Chairperson, Secretary, Joint Secretary, and Class-wise Parent & Faculty Representatives across Classes VI–XII and B.A. cohorts, meeting quarterly for student welfare and feedback integration.',
    },
    {
      sl: 5,
      title: 'Last Three-Year Result of the Board Examination (2023–2025)',
      refNo: 'SSN/RESULTS/ASSEB/2023-25',
      authority: 'Assam State School Education Board (ASSEB)',
      status: '99.45% Cumulative Pass Rate',
      summary:
        'Class X (DIV-I): 2023 (19/19, 100%), 2024 (29/29, 100%), 2025 (42/43, 97.67%). Class XII (DIV-II): 2023 (122/122, 100%), 2024 (104/105, 99.04%), 2025 (150/150, 100%). Total: 466/468 passed.',
    },
  ],
};

export const SSN_ACTIVITIES = [
  {
    title: 'Sports & Athletics Academy',
    category: 'Physical Development',
    schedule: 'Monday – Saturday, 4:00 PM – 6:00 PM',
    eligibility: 'Open to all students (Class VI to B.A.)',
    description:
      'Comprehensive sports program including cricket academy, football team, athletics track, and indoor games promoting physical endurance and team spirit.',
    image: SSN_IMAGES.sportsArena,
  },
  {
    title: 'Cultural & Performing Arts',
    category: 'Creative Arts',
    schedule: 'Wednesday & Saturday Cultural Hours',
    eligibility: 'All classes & Sankariya cultural societies',
    description:
      'Rich cultural training in Sattriya music, Borgeet, traditional Assamese dance, drama, and fine art exhibitions celebrating regional heritage and creativity.',
    image: SSN_IMAGES.campusHero,
  },
  {
    title: 'Literary Competitions & Debate',
    category: 'Expression & Oratory',
    schedule: 'Fortnightly Literary Seminars',
    eligibility: 'Secondary, Senior Secondary & Degree Wings',
    description:
      'Structured literary symposiums, extempore speech, essay writing in Assamese, English, and Hindi, and inter-school quiz competitions.',
    image: SSN_IMAGES.libraryHall,
  },
  {
    title: 'Competitive Exam Prep (APSC / UPSC)',
    category: 'Career Mentorship',
    schedule: 'Dedicated Afternoon Mentorship Slots',
    eligibility: 'Class XI–XII & 4-Year B.A. Degree Scholars',
    description:
      'Specialized coaching and personalized faculty mentorship for students preparing for APSC, UPSC, NEET, JEE, and national competitive examinations.',
    image: SSN_IMAGES.scienceLab,
  },
];

export const SSN_PUBLIC_NOTICES = [
  {
    id: 'NAT-2026-01',
    date: 'October 10, 2026',
    category: 'Admission',
    title: 'Online Admission Portal & Document Verification Schedule for Session 2026–27',
    summary:
      'Applicants submitting the online form must print the barcoded Acknowledgement Slip and visit the Bapadev Kshetra, Solengi office within 3 working days with original Birth Certificate, Marksheets, and Transfer Certificate.',
  },
  {
    id: 'NAT-2026-02',
    date: 'October 06, 2026',
    category: 'Academic',
    title: 'Half-Yearly Assessment & ASSEB Mock Board Practical Schedule',
    summary:
      'Physics, Chemistry, Biology, and Computer Science practical assessments for Class XI and XII Science streams will be conducted in the 470 sq mtr laboratory complex starting October 18, 2026.',
  },
  {
    id: 'NAT-2026-03',
    date: 'September 28, 2026',
    category: 'Competition',
    title: 'APSC & UPSC Civil Services Foundation Batch Registration Open',
    summary:
      'Students of Class XI, XII, and 4-Year B.A. Honours programs can enroll in the afternoon Civil Services Mentorship track under the guidance of SAILAJA SANKKALP TRUST Mentorship Council and visiting faculty.',
  },
  {
    id: 'NAT-2026-04',
    date: 'September 19, 2026',
    category: 'Governance',
    title: 'Parent-Teacher Association (PTA) Quarterly Academic Review Meeting',
    summary:
      'All class-wise parent representatives and faculty mentors are invited to review student skill milestones, biometric attendance reports, and board exam readiness.',
  },
];
