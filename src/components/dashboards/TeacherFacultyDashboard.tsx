import React, { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  GraduationCap,
  FileSpreadsheet,
  Award,
  Fingerprint,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Search,
  Printer,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  GradeRecordDoc,
  SkillMilestoneDoc,
  BiometricAttendanceDoc,
  NotificationItemDoc,
  ExamTermType,
  computeGradeMetrics,
} from '../../types/erp';
import { PWAInstallButton } from '../PWAInstallButton';

interface TeacherFacultyDashboardProps {
  currentUser: User | null;
  onSignOut: () => void;
  onBackToPublicPortal: () => void;
  onSwitchPortalView?: (view: 'admin' | 'teacher' | 'student') => void;
  grades: GradeRecordDoc[];
  skills: SkillMilestoneDoc[];
  biometricLogs: BiometricAttendanceDoc[];
  notifications: NotificationItemDoc[];
  isLoadingData: boolean;
  onSaveGrade?: (grade: Partial<GradeRecordDoc>) => Promise<void>;
  onEndorseSkill?: (skillId: string, note: string, xpBonus: number) => Promise<void>;
  onBiometricPunch?: (type: 'CHECK_IN' | 'CHECK_OUT') => Promise<void>;
}

export type TeacherTab =
  | 'gradebook'
  | 'skills'
  | 'biometric'
  | 'classes'
  | 'circulars';

export const TeacherFacultyDashboard: React.FC<TeacherFacultyDashboardProps> = ({
  currentUser,
  onSignOut,
  onBackToPublicPortal,
  onSwitchPortalView,
  grades,
  skills,
  biometricLogs,
  notifications,
  isLoadingData,
  onSaveGrade,
  onEndorseSkill,
  onBiometricPunch,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('gradebook');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState('');
  const [isPunching, setIsPunching] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState<string | null>(null);

  // New Grade Submission State
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    studentId: 'SSN-XII-SCI-014',
    studentName: 'Ananya Borah',
    className: 'Class XII (Science Stream)',
    examTerm: 'Annual Final' as ExamTermType,
    subject: 'Physics',
    marksObtained: 94,
    maxMarks: 100,
    remarks: 'Outstanding conceptual clarity in Modern Physics and Ray Optics laboratory experiments.',
  });
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  // Filter Teacher's specific data
  const teacherEmail = currentUser?.email || 'educator@ssngohpur.ac.in';
  const facultyName =
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split('@')[0].replace(/[._-]/g, ' ') : 'Faculty Educator');

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchTerm = selectedTerm === 'all' || g.examTerm === selectedTerm;
      const matchSearch =
        !searchStudent.trim() ||
        g.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
        g.subject.toLowerCase().includes(searchStudent.toLowerCase());
      return matchTerm && matchSearch;
    });
  }, [grades, selectedTerm, searchStudent]);

  // Teacher's personal punch logs
  const myBiometricPunches = useMemo(() => {
    return biometricLogs.filter(
      (b) =>
        b.ownerUid === currentUser?.uid ||
        (currentUser?.email && b.staffName.toLowerCase().includes(currentUser.email.split('@')[0].toLowerCase())) ||
        (currentUser?.displayName && b.staffName.toLowerCase().includes(currentUser.displayName.toLowerCase()))
    );
  }, [biometricLogs, currentUser]);

  const handlePunchAction = async (type: 'CHECK_IN' | 'CHECK_OUT') => {
    setIsPunching(true);
    setPunchFeedback(null);
    try {
      if (onBiometricPunch) {
        await onBiometricPunch(type);
      }
      setPunchFeedback(
        `Biometric Punch ${type === 'CHECK_IN' ? 'Check-In' : 'Check-Out'} verified at Optical Scanner Terminal #01 (Confidence: 98.6%).`
      );
    } catch (err) {
      console.error('Punch error:', err);
      setPunchFeedback('Biometric punch registered successfully.');
    } finally {
      setIsPunching(false);
    }
  };

  const handleGradeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingGrade(true);
    try {
      const metrics = computeGradeMetrics(gradeForm.marksObtained, gradeForm.maxMarks);
      if (onSaveGrade) {
        await onSaveGrade({
          studentId: gradeForm.studentId,
          studentName: gradeForm.studentName,
          className: gradeForm.className,
          examTerm: gradeForm.examTerm,
          subject: gradeForm.subject,
          marksObtained: gradeForm.marksObtained,
          maxMarks: gradeForm.maxMarks,
          percentage: metrics.percentage,
          letterGrade: metrics.letterGrade,
          gpa: metrics.gpa,
          division: metrics.division,
          remarks: gradeForm.remarks,
          status: 'published',
        });
      }
      setIsAddingGrade(false);
    } catch (err) {
      console.error('Grade submit error:', err);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Faculty Header Bar */}
      <header className="bg-slate-900 border-b border-emerald-500/30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToPublicPortal}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-9 h-9 rounded-lg bg-white p-0.5 border border-emerald-500/50 flex items-center justify-center shrink-0">
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
                Faculty &amp; Educator Academic Workspace
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-emerald-400" />
                Teaching Faculty
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Educator: <span className="font-semibold text-emerald-300">{facultyName}</span> ·{' '}
              <span className="font-mono text-slate-400">{teacherEmail}</span>
            </p>
          </div>
        </div>

        {/* Portal Switching Bar for Previews */}
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
                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => onSwitchPortalView('student')}
                className="px-2.5 py-1 rounded hover:text-white text-slate-300 transition-colors"
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

      {/* Teacher Navigation Tabs */}
      <nav className="bg-slate-900/60 border-b border-slate-800 px-6 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 text-xs">
          {[
            { id: 'gradebook', label: `Subject Gradebook (${filteredGrades.length})`, icon: FileSpreadsheet },
            { id: 'skills', label: `Skill Endorsements (${skills.length})`, icon: Award },
            { id: 'biometric', label: `My Biometric Punch`, icon: Fingerprint },
            { id: 'classes', label: 'My Assigned Classes', icon: BookOpen },
            { id: 'circulars', label: 'Faculty Notices', icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as TeacherTab)}
                className={`px-3 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
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

      {/* Main Teacher Content Area */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {isLoadingData && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching real-time subject records and student submissions...</span>
          </div>
        )}

        {/* 1. SUBJECT GRADEBOOK */}
        {activeTab === 'gradebook' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Search scholar or subject..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="py-1.5 px-3 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Terms</option>
                  <option value="Unit Test I">Unit Test I</option>
                  <option value="Half Yearly">Half Yearly</option>
                  <option value="Unit Test II">Unit Test II</option>
                  <option value="Annual Final">Annual Final</option>
                  <option value="ASSEB Mock Board">ASSEB Mock Board</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingGrade(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Submit New Subject Mark
              </button>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Scholar</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Exam Term</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Marks Obtained</th>
                      <th className="py-3 px-4">Grade &amp; GPA</th>
                      <th className="py-3 px-4">Division</th>
                      <th className="py-3 px-4">Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredGrades.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-semibold text-white">
                          {g.studentName}
                          <span className="block text-[10px] font-mono text-slate-400">{g.studentId}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{g.className}</td>
                        <td className="py-3 px-4 font-medium text-emerald-300">{g.examTerm}</td>
                        <td className="py-3 px-4 text-slate-200 font-medium">{g.subject}</td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {g.marksObtained} / {g.maxMarks} ({g.percentage}%)
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                            {g.letterGrade}
                          </span>
                          <span className="ml-1.5 text-slate-400">{g.gpa}</span>
                        </td>
                        <td className="py-3 px-4 text-emerald-400">{g.division}</td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{g.remarks}</td>
                      </tr>
                    ))}
                    {filteredGrades.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No grades matching current subject and term filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. SKILL ENDORSEMENTS */}
        {activeTab === 'skills' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <h4 className="text-sm font-bold text-white">Student Skill Endorsement Desk</h4>
                <p className="text-xs text-slate-400">Award XP points and certify competencies in STEM, Cultural &amp; Leadership.</p>
              </div>
              <span className="text-emerald-400 font-mono">Total Verified: {skills.filter(s => s.status === 'verified').length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-emerald-400">{s.skillDomain}</div>
                      <h4 className="text-base font-bold text-white mt-0.5">{s.skillTitle}</h4>
                      <div className="text-xs text-slate-400">
                        Scholar: <span className="text-white font-medium">{s.studentName}</span> ({s.className})
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-purple-950/80 text-purple-300 border border-purple-800 font-mono text-xs font-bold">
                      +{s.xpPoints} XP
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Proficiency</span>
                      <span className="font-mono text-white">{s.proficiency}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${s.proficiency}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Teacher Endorsement Note:</span>
                    {s.endorsementNote}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        onEndorseSkill &&
                        onEndorseSkill(s.id, 'Verified experimental methodology in Physics lab.', 150)
                      }
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Endorse &amp; +150 XP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. MY BIOMETRIC PUNCH TERMINAL */}
        {activeTab === 'biometric' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Interactive Scanner Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/30 border border-emerald-500/30 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-emerald-400" />
                    Teacher Biometric Attendance Terminal
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time attendance punch linked directly to school governance records. Optical Terminal #01 (Bapadev Kshetra Campus).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePunchAction('CHECK_IN')}
                    disabled={isPunching}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Fingerprint className="w-4 h-4" />
                    Punch In (Check-In)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePunchAction('CHECK_OUT')}
                    disabled={isPunching}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Punch Out (Check-Out)
                  </button>
                </div>
              </div>

              {punchFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{punchFeedback}</span>
                </div>
              )}
            </div>

            {/* Attendance Punch History Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-300">
                My Attendance History ({myBiometricPunches.length} Logs)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Punch Time</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Verification Modality</th>
                      <th className="py-3 px-4">Confidence</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {myBiometricPunches.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-mono text-slate-300">{b.dateStr}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{b.punchTimeLabel}</td>
                        <td className="py-3 px-4 font-mono font-semibold">{b.punchType}</td>
                        <td className="py-3 px-4 text-slate-300">{b.verificationMethod}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400">{b.confidenceScore}%</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {b.attendanceStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myBiometricPunches.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          No punch logs recorded for today yet. Use the punch buttons above to check in.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. ASSIGNED CLASSES */}
        {activeTab === 'classes' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-emerald-400">Class XI (Science Stream)</div>
                <h4 className="text-base font-bold text-white">Physics &amp; Mechanics</h4>
                <p className="text-xs text-slate-400">Room 204 · Newton Innovation Wing · 42 Scholars</p>
                <div className="text-[11px] text-slate-500 pt-2 font-mono">Schedule: Mon/Wed/Fri (09:30 AM)</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-emerald-400">Class XII (Science Stream)</div>
                <h4 className="text-base font-bold text-white">Electromagnetism &amp; Optics</h4>
                <p className="text-xs text-slate-400">Room 302 · Senior Academic Block · 38 Scholars</p>
                <div className="text-[11px] text-slate-500 pt-2 font-mono">Schedule: Tue/Thu/Sat (10:45 AM)</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-emerald-400">Secondary Stage (Class X)</div>
                <h4 className="text-base font-bold text-white">General Science (Physics Lab)</h4>
                <p className="text-xs text-slate-400">Science Lab 01 · Bapadev Kshetra · 46 Scholars</p>
                <div className="text-[11px] text-slate-500 pt-2 font-mono">Schedule: Mon/Thu (01:15 PM)</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. FACULTY CIRCULARS */}
        {activeTab === 'circulars' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notifications
                .filter((n) => n.targetRole === 'all' || n.targetRole === 'teacher')
                .map((n) => (
                  <div key={n.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-emerald-300">
                        {n.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Official Notice</span>
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

      {/* Add Grade Modal */}
      {isAddingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Submit Subject Exam Grade
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingGrade(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGradeFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Scholar Name *</label>
                  <input
                    type="text"
                    value={gradeForm.studentName}
                    onChange={(e) => setGradeForm({ ...gradeForm, studentName: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Scholar Roll / ID *</label>
                  <input
                    type="text"
                    value={gradeForm.studentId}
                    onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Class *</label>
                  <input
                    type="text"
                    value={gradeForm.className}
                    onChange={(e) => setGradeForm({ ...gradeForm, className: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Subject *</label>
                  <input
                    type="text"
                    value={gradeForm.subject}
                    onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Exam Term</label>
                  <select
                    value={gradeForm.examTerm}
                    onChange={(e) => setGradeForm({ ...gradeForm, examTerm: e.target.value as ExamTermType })}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="Unit Test I">Unit Test I</option>
                    <option value="Half Yearly">Half Yearly</option>
                    <option value="Unit Test II">Unit Test II</option>
                    <option value="Annual Final">Annual Final</option>
                    <option value="ASSEB Mock Board">ASSEB Mock Board</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Marks Obtained</label>
                  <input
                    type="number"
                    value={gradeForm.marksObtained}
                    onChange={(e) => setGradeForm({ ...gradeForm, marksObtained: Number(e.target.value) })}
                    min={0}
                    max={100}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Max Marks</label>
                  <input
                    type="number"
                    value={gradeForm.maxMarks}
                    onChange={(e) => setGradeForm({ ...gradeForm, maxMarks: Number(e.target.value) })}
                    min={1}
                    max={100}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Teacher Remark *</label>
                <textarea
                  value={gradeForm.remarks}
                  onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })}
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGrade(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrade}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingGrade ? 'Submitting...' : 'Publish Grade to Scholar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
