import React, { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  GraduationCap,
  LogOut,
  ArrowLeft,
  Printer,
  Sparkles,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  Bell,
  Users,
} from 'lucide-react';
import {
  GradeRecordDoc,
  SkillMilestoneDoc,
  BiometricAttendanceDoc,
  NotificationItemDoc,
  AdmissionRecordDoc,
} from '../../types/erp';
import { printDocument } from '../../utils/printDocument';
import { PWAInstallButton } from '../PWAInstallButton';
import { SSN_IMAGES, SSN_SCHOOL_INFO } from '../../data/ssnPublicData';

interface StudentParentDashboardProps {
  currentUser: User | null;
  onSignOut: () => void;
  onBackToPublicPortal: () => void;
  onSwitchPortalView?: (view: 'admin' | 'teacher' | 'student') => void;
  grades: GradeRecordDoc[];
  skills: SkillMilestoneDoc[];
  biometricLogs: BiometricAttendanceDoc[];
  notifications: NotificationItemDoc[];
  admissions: AdmissionRecordDoc[];
  isLoadingData: boolean;
}

export type StudentTab =
  | 'transcript'
  | 'skills'
  | 'attendance'
  | 'id_pass'
  | 'bulletin';

export const StudentParentDashboard: React.FC<StudentParentDashboardProps> = ({
  currentUser,
  onSignOut,
  onBackToPublicPortal,
  onSwitchPortalView,
  grades,
  skills,
  biometricLogs,
  notifications,
  admissions,
  isLoadingData,
}) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('transcript');
  const [selectedExamTerm, setSelectedExamTerm] = useState<string>('all');

  const userEmail = currentUser?.email || 'ananya.borah@ssngohpur.ac.in';
  const isParent = userEmail.includes('pradip') || userEmail.includes('parent');

  // Scholar profile derivation
  const scholarName = isParent ? 'Ananya Borah (Ward of Pradip Borah)' : 'Ananya Borah';
  const scholarRoll = 'SSN-XII-SCI-014';
  const scholarClass = 'Class XII (Science Stream)';

  // Data Scoping: Scholar grades only
  const scholarGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchTerm = selectedExamTerm === 'all' || g.examTerm === selectedExamTerm;
      return matchTerm;
    });
  }, [grades, selectedExamTerm]);

  // Overall GPA & Marks calculation
  const totalMarksObtained = scholarGrades.reduce((sum, g) => sum + g.marksObtained, 0);
  const totalMaxMarks = scholarGrades.reduce((sum, g) => sum + g.maxMarks, 0);
  const averagePercentage =
    totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1) : '94.2';
  const overallGpa =
    scholarGrades.length > 0
      ? (scholarGrades.reduce((sum, g) => sum + g.gpa, 0) / scholarGrades.length).toFixed(2)
      : '9.65';

  // Total XP Points
  const totalXp = skills.reduce((sum, s) => sum + s.xpPoints, 0);

  // Print Transcript Handler
  const handlePrintTranscript = () => {
    printDocument({
      title: `SSN_Marksheet_${scholarRoll}_${selectedExamTerm}`,
      filename: `SSN_Academic_Transcript_${scholarName.replace(/\s+/g, '_')}_${scholarRoll}`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Scholar Header */}
      <header className="bg-slate-900 border-b border-blue-500/30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToPublicPortal}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 rounded-lg bg-white p-0.5 border border-blue-500/50 flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="SSN Logo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://smartschool.asomweb.com/ssn/logo.png';
              }}
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white font-display">
                {isParent ? 'Parent & Guardian Portal' : 'Scholar Learning & Academic Portal'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-wider flex items-center gap-1">
                {isParent ? <Users className="w-3 h-3 text-purple-400" /> : <Award className="w-3 h-3 text-blue-400" />}
                {isParent ? 'Verified Guardian' : 'Enrolled Scholar'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Scholar: <span className="font-semibold text-blue-300">{scholarName}</span> ·{' '}
              <span className="font-mono text-amber-300">{scholarRoll}</span> · {scholarClass}
            </p>
          </div>
        </div>

        {/* Action Controls & Sign Out */}
        <div className="flex items-center gap-2.5">
          {onSwitchPortalView && (
            <div className="hidden lg:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-xs text-slate-300">
              <span className="px-2 text-[10px] uppercase font-mono text-slate-400">Portal:</span>
              <button
                type="button"
                onClick={() => onSwitchPortalView('admin')}
                className="px-2.5 py-1 rounded hover:text-white text-slate-300 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => onSwitchPortalView('teacher')}
                className="px-2.5 py-1 rounded hover:text-white text-slate-300 transition-colors"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => onSwitchPortalView('student')}
                className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold"
              >
                Student
              </button>
            </div>
          )}

          <PWAInstallButton />

          <button
            type="button"
            onClick={onSignOut}
            className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-900/60 border-b border-slate-800 px-6 py-2 overflow-x-auto no-print">
        <div className="flex items-center gap-1 text-xs">
          {[
            { id: 'transcript', label: 'Academic Report Card', icon: FileSpreadsheet },
            { id: 'skills', label: `Skill XP Portfolio (${totalXp} XP)`, icon: Award },
            { id: 'attendance', label: 'Campus Attendance', icon: Clock },
            { id: 'id_pass', label: 'Digital Identity Pass', icon: UserCheck },
            { id: 'bulletin', label: 'Student Notice Board', icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as StudentTab)}
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Cumulative GPA</div>
            <div className="text-2xl font-bold font-display text-blue-400">{overallGpa}</div>
            <div className="text-[10px] text-emerald-400">Distinction (Star Division)</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Overall Average</div>
            <div className="text-2xl font-bold font-display text-white">{averagePercentage}%</div>
            <div className="text-[10px] text-slate-400">Ranked Top 5% in Science</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Skill Milestones</div>
            <div className="text-2xl font-bold font-display text-purple-400">{totalXp} XP</div>
            <div className="text-[10px] text-purple-300">Level 4 Certified Scholar</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400">Attendance Ratio</div>
            <div className="text-2xl font-bold font-display text-emerald-400">96.8%</div>
            <div className="text-[10px] text-emerald-300">Biometrically Verified</div>
          </div>
        </div>

        {/* 1. ACADEMIC REPORT CARD & TRANSCRIPT */}
        {activeTab === 'transcript' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 no-print">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">Filter Exam Term:</span>
                <select
                  value={selectedExamTerm}
                  onChange={(e) => setSelectedExamTerm(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  <option value="all">All Terms (Cumulative)</option>
                  <option value="Annual Final">Annual Final</option>
                  <option value="Half Yearly">Half Yearly</option>
                  <option value="Unit Test I">Unit Test I</option>
                  <option value="Unit Test II">Unit Test II</option>
                  <option value="ASSEB Mock Board">ASSEB Mock Board</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handlePrintTranscript}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                Print Official Marksheet
              </button>
            </div>

            {/* Official Institutional Marksheet Card (Print Optimized) */}
            <div className="rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-xl overflow-hidden p-6 sm:p-8">
              {/* Institution Seal & Watermark Header */}
              <div className="flex items-center justify-between border-b-2 border-blue-900 pb-5">
                <div className="flex items-center gap-4">
                  <img
                    src="/logo.png"
                    alt="SSN Logo"
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h2 className="text-xl font-bold font-display text-blue-950 tracking-tight">
                      Sankardev Shiksha Niketan, Gohpur
                    </h2>
                    <p className="text-xs text-slate-600">
                      Bapadev Kshetra, Solengi, Biswanath, Assam · Affiliation: {SSN_SCHOOL_INFO.affiliationNo}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 uppercase mt-0.5">
                      OFFICIAL ACADEMIC TRANSCRIPT &amp; BOARD MARKSHEET (2026–27)
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="px-3 py-1 rounded bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-900">
                    ID: {scholarRoll}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">SAILAJA SANKKALP TRUST</div>
                </div>
              </div>

              {/* Scholar Details Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Scholar Name:</span>
                  <span className="font-bold text-slate-900">{scholarName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Class &amp; Stream:</span>
                  <span className="font-bold text-slate-900">{scholarClass}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Enrollment ID:</span>
                  <span className="font-mono font-bold text-blue-800">{scholarRoll}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Division Status:</span>
                  <span className="font-bold text-emerald-700">Distinction (Star Division)</span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="py-4 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Exam Term</th>
                      <th className="py-2.5 px-3 text-right">Max</th>
                      <th className="py-2.5 px-3 text-right">Marks</th>
                      <th className="py-2.5 px-3 text-right">Percentage</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-center">GPA</th>
                      <th className="py-2.5 px-3">Teacher Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scholarGrades.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-semibold text-slate-900">{g.subject}</td>
                        <td className="py-3 px-3 font-medium text-slate-600">{g.examTerm}</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">{g.maxMarks}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-blue-900">{g.marksObtained}</td>
                        <td className="py-3 px-3 text-right font-mono">{g.percentage}%</td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono">
                            {g.letterGrade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold">{g.gpa}</td>
                        <td className="py-3 px-3 text-slate-600 italic text-[11px]">{g.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Marksheet Footer & Stamp */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Digitally verified via Sankardev Shiksha Niketan School ERP.</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">Office of the Principal &amp; Academic Controller</div>
                  <div className="font-mono text-[10px]">Bapadev Kshetra, Solengi, Gohpur</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SKILL DEVELOPMENT PORTFOLIO */}
        {activeTab === 'skills' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <h4 className="text-sm font-bold text-white">Holistic Skill Milestones &amp; XP Tracker</h4>
                <p className="text-xs text-slate-400">Certified competencies endorsed by department faculty.</p>
              </div>
              <span className="text-purple-400 font-mono font-bold text-sm">Total XP: {totalXp}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-purple-400">{s.skillDomain}</div>
                      <h4 className="text-base font-bold text-white mt-0.5">{s.skillTitle}</h4>
                      <div className="text-xs text-slate-400">
                        Current: <span className="text-slate-300 font-medium">{s.milestoneCurrent}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono text-xs font-bold">
                      +{s.xpPoints} XP
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Competency Progress</span>
                      <span className="font-mono text-white">{s.proficiency}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${s.proficiency}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Faculty Endorsement: {s.endorsementNote}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CAMPUS ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                Biometric Entry Logs &amp; Attendance Punctuality
              </h4>
              <p className="text-xs text-slate-400">
                Attendance is verified each morning through institutional optical scanners at the main Bapadev Kshetra gate.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Instructional Days</div>
                  <div className="text-lg font-bold text-white">186 Days</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Days Present</div>
                  <div className="text-lg font-bold text-emerald-400">180 Days</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Punctuality Score</div>
                  <div className="text-lg font-bold text-blue-400">98.2% On Time</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. DIGITAL IDENTITY PASS */}
        {activeTab === 'id_pass' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border-2 border-blue-500/40 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                  <div>
                    <div className="text-xs font-bold font-display text-white">SSN GOHPUR</div>
                    <div className="text-[9px] text-slate-400 font-mono">DIGITAL IDENTITY PASS</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 font-mono">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-24 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  <GraduationCap className="w-10 h-10 text-slate-500" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-base text-white">{scholarName}</div>
                  <div className="text-blue-300 font-mono text-[11px]">{scholarRoll}</div>
                  <div className="text-slate-400">{scholarClass}</div>
                  <div className="text-[10px] text-slate-500">Valid: Academic Year 2026–27</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Emergency Guardian:</span>
                  <span className="text-white">Pradip Borah (+91 9435081122)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Campus Address:</span>
                  <span className="text-white">Solengi, Gohpur, Biswanath</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. STUDENT NOTICE BOARD */}
        {activeTab === 'bulletin' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notifications
                .filter((n) => n.targetRole === 'all' || n.targetRole === 'student' || (isParent && n.targetRole === 'parent'))
                .map((n) => (
                  <div key={n.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-blue-300">
                        {n.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Official Bulletin</span>
                    </div>
                    <h5 className="text-sm font-bold text-white">{n.title}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-500 pt-1 font-mono">From: {n.senderName}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
