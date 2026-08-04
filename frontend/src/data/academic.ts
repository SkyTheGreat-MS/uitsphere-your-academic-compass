/** UIT University of Information Technology — 2025–2026, Semester IV, Second Year A. */

export interface Subject { id: string; code: string; name: string; lecturer: string; colorToken: string; }

export const subjects: Subject[] = [
  { id: "sub_1", code: "CST-4104", name: "Artificial Intelligence", lecturer: "Dr. Thet Thet Zin", colorToken: "chart-1" },
  { id: "sub_2", code: "CST-4204", name: "Linear Algebra", lecturer: "Daw Phyu Phyu Aung", colorToken: "chart-2" },
  { id: "sub_3", code: "CST-4306", name: "Management Principles and Engineering Economics", lecturer: "Daw Lay Myat Myat Thein", colorToken: "chart-3" },
  { id: "sub_4", code: "CST-4404", name: "Network Design and Engineering", lecturer: "Dr. Thiri Thitsar Khaing", colorToken: "chart-4" },
  { id: "sub_5", code: "CST-4405", name: "Computer Architecture and Organization", lecturer: "Daw Shwe Sin Myat Than", colorToken: "chart-5" },
  { id: "sub_6", code: "CST-4503", name: "IELTS Academic Skills and Strategies", lecturer: "Daw Khin Cho Latt", colorToken: "chart-1" },
  { id: "sub_7", code: "CST-4105", name: "Enterprise Applications Development using Java", lecturer: "Dr. Ei Moh Moh Aung", colorToken: "chart-3" },
];

export const formatTime = (t: string) => { const h = Number(t.slice(0, 2)); const m = t.slice(3); return `${h % 12 || 12}:${m}`; };
export interface ClassSession { id: string; subjectId: string; day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri"; start: string; end: string; room: string; type: "Lecture" | "Lab" | "Seminar" | "Tutorial"; }
export const timetable: ClassSession[] = [
  ["Mon", "sub_5", "08:30", "09:30", "235", "Tutorial"], ["Mon", "sub_6", "09:40", "10:40", "244 E-Lab", "Lab"], ["Mon", "sub_2", "10:50", "11:50", "322", "Lecture"], ["Mon", "sub_1", "12:40", "13:40", "321", "Lecture"], ["Mon", "sub_3", "13:50", "14:50", "321", "Lecture"], ["Mon", "sub_4", "15:00", "16:00", "321", "Lecture"],
  ["Tue", "sub_7", "08:30", "09:30", "231", "Tutorial"], ["Tue", "sub_6", "09:40", "10:40", "421", "Tutorial"], ["Tue", "sub_4", "10:50", "11:50", "421", "Tutorial"], ["Tue", "sub_6", "12:40", "13:40", "321", "Lecture"], ["Tue", "sub_5", "13:50", "14:50", "321", "Lecture"], ["Tue", "sub_1", "15:00", "16:00", "321", "Lecture"],
  ["Wed", "sub_3", "09:40", "10:40", "421", "Tutorial"], ["Wed", "sub_5", "10:50", "11:50", "421", "Tutorial"], ["Wed", "sub_2", "12:40", "13:40", "425", "Tutorial"], ["Wed", "sub_7", "13:50", "14:50", "232", "Tutorial"],
  ["Thu", "sub_2", "08:30", "09:30", "421", "Tutorial"], ["Thu", "sub_4", "09:40", "10:40", "421", "Tutorial"], ["Thu", "sub_1", "10:50", "11:50", "421", "Tutorial"], ["Thu", "sub_3", "12:40", "13:40", "321", "Lecture"], ["Thu", "sub_6", "13:50", "14:50", "321", "Lecture"], ["Thu", "sub_5", "15:00", "16:00", "336", "Lecture"],
  ["Fri", "sub_7", "08:30", "09:30", "233", "Lecture"], ["Fri", "sub_3", "09:40", "10:40", "421", "Tutorial"], ["Fri", "sub_1", "10:50", "11:50", "421", "Tutorial"], ["Fri", "sub_2", "12:40", "13:40", "321", "Lecture"], ["Fri", "sub_4", "13:50", "14:50", "321", "Lecture"], ["Fri", "sub_7", "15:00", "16:00", "233", "Lecture"],
].map(([day, subjectId, start, end, room, type], i) => ({ id: `c${i + 1}`, day, subjectId, start, end, room, type } as ClassSession));
export const todayClasses = timetable.filter((c) => c.day === "Mon");

export interface Deadline { id: string; title: string; subjectId: string; dueIn: string; dueDate: string; priority: "high" | "medium" | "low"; progress: number; }
export const deadlines: Deadline[] = [
  { id: "d1", title: "AI model evaluation report", subjectId: "sub_1", dueIn: "in 2 days", dueDate: "12 Mar", priority: "high", progress: 65 }, { id: "d2", title: "Matrix methods problem set", subjectId: "sub_2", dueIn: "in 4 days", dueDate: "14 Mar", priority: "high", progress: 30 }, { id: "d3", title: "Engineering economics case study", subjectId: "sub_3", dueIn: "in 6 days", dueDate: "16 Mar", priority: "medium", progress: 80 }, { id: "d4", title: "Network design lab report", subjectId: "sub_4", dueIn: "in 9 days", dueDate: "19 Mar", priority: "medium", progress: 15 }, { id: "d5", title: "Java enterprise application milestone", subjectId: "sub_7", dueIn: "in 12 days", dueDate: "22 Mar", priority: "low", progress: 0 },
];
export interface StudyGoal { id: string; title: string; subjectId: string; targetHours: number; completedHours: number; }
export const studyGoals: StudyGoal[] = [
  { id: "g1", title: "Revise intelligent search methods", subjectId: "sub_1", targetHours: 12, completedHours: 8.5 }, { id: "g2", title: "Practise matrix transformations", subjectId: "sub_2", targetHours: 15, completedHours: 6 }, { id: "g3", title: "Review engineering cost models", subjectId: "sub_3", targetHours: 8, completedHours: 7 }, { id: "g4", title: "Design a resilient network", subjectId: "sub_4", targetHours: 10, completedHours: 2.5 }, { id: "g5", title: "Build Java application services", subjectId: "sub_7", targetHours: 12, completedHours: 4 },
];
export interface Task { id: string; title: string; subjectId: string; due: string; priority: "high" | "medium" | "low"; done: boolean; estimate: string; }
export const tasks: Task[] = [
  { id: "t1", title: "Summarise intelligent search methods", subjectId: "sub_1", due: "Today", priority: "high", done: false, estimate: "45 min" }, { id: "t2", title: "Solve matrix transformation exercises", subjectId: "sub_2", due: "Today", priority: "high", done: false, estimate: "2 h" }, { id: "t3", title: "Review engineering economics terms", subjectId: "sub_3", due: "Today", priority: "medium", done: true, estimate: "20 min" }, { id: "t4", title: "Practise IELTS academic writing", subjectId: "sub_6", due: "Tomorrow", priority: "low", done: false, estimate: "30 min" }, { id: "t5", title: "Prepare network design lab", subjectId: "sub_4", due: "Tomorrow", priority: "medium", done: false, estimate: "1 h" }, { id: "t6", title: "Review architecture instruction cycles", subjectId: "sub_5", due: "Wed", priority: "medium", done: false, estimate: "1 h" }, { id: "t7", title: "Implement Java service layer", subjectId: "sub_7", due: "Wed", priority: "low", done: true, estimate: "1.5 h" },
];
export const weeklyProductivity = [{ day: "Mon", hours: 3.5, focus: 78 }, { day: "Tue", hours: 2.2, focus: 64 }, { day: "Wed", hours: 4.6, focus: 88 }, { day: "Thu", hours: 3.1, focus: 71 }, { day: "Fri", hours: 5.2, focus: 92 }, { day: "Sat", hours: 1.4, focus: 52 }, { day: "Sun", hours: 2.8, focus: 69 }];
export const subjectMastery = [{ subject: "Artificial Intelligence", score: 82 }, { subject: "Linear Algebra", score: 91 }, { subject: "Management Principles and Engineering Economics", score: 78 }, { subject: "Network Design and Engineering", score: 74 }, { subject: "Computer Architecture and Organization", score: 86 }, { subject: "IELTS Academic Skills and Strategies", score: 88 }, { subject: "Enterprise Applications Development using Java", score: 80 }];
export const quizTrend = [{ week: "W1", average: 61 }, { week: "W2", average: 68 }, { week: "W3", average: 66 }, { week: "W4", average: 75 }, { week: "W5", average: 81 }, { week: "W6", average: 86 }];
export const studyStats = { streakDays: 18, hoursThisWeek: 22.8, quizAverage: 86, flashcardsCompleted: 412, focusScore: 79, materialsProcessed: 24 };
