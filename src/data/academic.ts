/**
 * Mock domain data. Shaped like REST resources so these modules can be swapped
 * for a Spring Boot API client without touching any component.
 */

export interface Student {
  id: string;
  name: string;
  email: string;
  universityId: string;
  department: string;
  academicYear: string;
  university: string;
  avatarInitials: string;
  joinedAt: string;
  bio: string;
}

export const currentStudent: Student = {
  id: "stu_10294",
  name: "Amara Okonkwo",
  email: "amara.okonkwo@mahawthadar.edu",
  universityId: "TNT-2361",
  department: "Computer Science & Engineering",
  academicYear: "Year 3 · Semester 2",
  university: "University of Innovation & Technology",
  avatarInitials: "AO",
  joinedAt: "2023-09-04",
  bio: "Third-year CS student focused on distributed systems and machine learning. Campus AI society lead.",
};

export interface Subject {
  id: string;
  code: string;
  name: string;
  lecturer: string;
  colorToken: string;
}

export const subjects: Subject[] = [
  { id: "sub_1", code: "CST-4104", name: "Artificial Intelligence", lecturer: "Dr. Thet Thet Zin", colorToken: "chart-1" },
  { id: "sub_2", code: "CST-4204", name: "Linear Algebra", lecturer: "Daw Phyu Phyu Aung", colorToken: "chart-2" },
  { id: "sub_3", code: "CST-4306", name: "Management Principles & Engineering Economics", lecturer: "Daw Lay Myat Myat Thein", colorToken: "chart-3" },
  { id: "sub_4", code: "CST-4404", name: "Network Design and Engineering", lecturer: "Dr. Thiri Thitsar Khaing", colorToken: "chart-4" },
  { id: "sub_5", code: "CST-4405", name: "Computer Architecture and Organization", lecturer: "Daw Shwe Sin Myat Than", colorToken: "chart-5" },
  { id: "sub_6", code: "CST-4503", name: "IELTS Academic Skills and Strategies", lecturer: "Daw Khin Cho Latt", colorToken: "chart-1" },
  { id: "sub_7", code: "CST-4105", name: "Enterprise Applications Development using Java (Keystone Project)", lecturer: "Dr. Ei Moh Moh Aung", colorToken: "chart-3" },
];

/** Times are stored in 24h for layout maths; use formatTime() for display. */
export const formatTime = (t: string) => {
  const h = Number(t.slice(0, 2));
  const m = t.slice(3);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m}`;
};

export interface ClassSession {
  id: string;
  subjectId: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  start: string;
  end: string;
  room: string;
  type: "Lecture" | "Lab" | "Seminar" | "Tutorial";
}

/** Second Year (Section A) · 2025-2026 Academic Year · Semester IV */
export const timetable: ClassSession[] = [
  // Monday
  { id: "c1", subjectId: "sub_5", day: "Mon", start: "08:30", end: "09:30", room: "Room 235", type: "Tutorial" },
  { id: "c2", subjectId: "sub_6", day: "Mon", start: "09:40", end: "10:40", room: "Room 244 · E-Lab", type: "Lab" },
  { id: "c3", subjectId: "sub_2", day: "Mon", start: "10:50", end: "11:50", room: "Room 322", type: "Lecture" },
  { id: "c4", subjectId: "sub_1", day: "Mon", start: "12:40", end: "13:40", room: "Room 321", type: "Lecture" },
  { id: "c5", subjectId: "sub_3", day: "Mon", start: "13:50", end: "14:50", room: "Room 321", type: "Lecture" },
  { id: "c6", subjectId: "sub_4", day: "Mon", start: "15:00", end: "16:00", room: "Room 321", type: "Lecture" },
  // Tuesday
  { id: "c7", subjectId: "sub_7", day: "Tue", start: "08:30", end: "09:30", room: "Room 231", type: "Tutorial" },
  { id: "c8", subjectId: "sub_6", day: "Tue", start: "09:40", end: "10:40", room: "Room 421", type: "Tutorial" },
  { id: "c9", subjectId: "sub_4", day: "Tue", start: "10:50", end: "11:50", room: "Room 421", type: "Tutorial" },
  { id: "c10", subjectId: "sub_6", day: "Tue", start: "12:40", end: "13:40", room: "Room 321", type: "Lecture" },
  { id: "c11", subjectId: "sub_5", day: "Tue", start: "13:50", end: "14:50", room: "Room 321", type: "Lecture" },
  { id: "c12", subjectId: "sub_1", day: "Tue", start: "15:00", end: "16:00", room: "Room 321", type: "Lecture" },
  // Wednesday
  { id: "c13", subjectId: "sub_3", day: "Wed", start: "09:40", end: "10:40", room: "Room 421", type: "Tutorial" },
  { id: "c14", subjectId: "sub_5", day: "Wed", start: "10:50", end: "11:50", room: "Room 421", type: "Tutorial" },
  { id: "c15", subjectId: "sub_2", day: "Wed", start: "12:40", end: "13:40", room: "Room 425", type: "Tutorial" },
  { id: "c16", subjectId: "sub_7", day: "Wed", start: "13:50", end: "14:50", room: "Room 232", type: "Tutorial" },
  // Thursday
  { id: "c17", subjectId: "sub_2", day: "Thu", start: "08:30", end: "09:30", room: "Room 421", type: "Tutorial" },
  { id: "c18", subjectId: "sub_4", day: "Thu", start: "09:40", end: "10:40", room: "Room 421", type: "Tutorial" },
  { id: "c19", subjectId: "sub_1", day: "Thu", start: "10:50", end: "11:50", room: "Room 421", type: "Tutorial" },
  { id: "c20", subjectId: "sub_3", day: "Thu", start: "12:40", end: "13:40", room: "Room 321", type: "Lecture" },
  { id: "c21", subjectId: "sub_6", day: "Thu", start: "13:50", end: "14:50", room: "Room 321", type: "Lecture" },
  { id: "c22", subjectId: "sub_5", day: "Thu", start: "15:00", end: "16:00", room: "Room 336", type: "Lecture" },
  // Friday
  { id: "c23", subjectId: "sub_7", day: "Fri", start: "08:30", end: "09:30", room: "Room 233", type: "Lecture" },
  { id: "c24", subjectId: "sub_3", day: "Fri", start: "09:40", end: "10:40", room: "Room 421", type: "Tutorial" },
  { id: "c25", subjectId: "sub_1", day: "Fri", start: "10:50", end: "11:50", room: "Room 421", type: "Tutorial" },
  { id: "c26", subjectId: "sub_2", day: "Fri", start: "12:40", end: "13:40", room: "Room 321", type: "Lecture" },
  { id: "c27", subjectId: "sub_4", day: "Fri", start: "13:50", end: "14:50", room: "Room 321", type: "Lecture" },
  { id: "c28", subjectId: "sub_7", day: "Fri", start: "15:00", end: "16:00", room: "Room 233", type: "Lecture" },
];

export const todayClasses = timetable.filter((c) => c.day === "Mon");


export interface Deadline {
  id: string;
  title: string;
  subjectId: string;
  dueIn: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  progress: number;
}

export const deadlines: Deadline[] = [
  { id: "d1", title: "Consensus Protocols Report", subjectId: "sub_1", dueIn: "in 2 days", dueDate: "12 Mar", priority: "high", progress: 65 },
  { id: "d2", title: "Gradient Descent Notebook", subjectId: "sub_2", dueIn: "in 4 days", dueDate: "14 Mar", priority: "high", progress: 30 },
  { id: "d3", title: "Eigenvalue Problem Set 6", subjectId: "sub_3", dueIn: "in 6 days", dueDate: "16 Mar", priority: "medium", progress: 80 },
  { id: "d4", title: "Normalisation Case Study", subjectId: "sub_4", dueIn: "in 9 days", dueDate: "19 Mar", priority: "medium", progress: 15 },
  { id: "d5", title: "Ethics Reflection Essay", subjectId: "sub_5", dueIn: "in 12 days", dueDate: "22 Mar", priority: "low", progress: 0 },
];

export interface StudyGoal {
  id: string;
  title: string;
  subjectId: string;
  targetHours: number;
  completedHours: number;
}

export const studyGoals: StudyGoal[] = [
  { id: "g1", title: "Master Raft & Paxos", subjectId: "sub_1", targetHours: 12, completedHours: 8.5 },
  { id: "g2", title: "Finish ML coursework prep", subjectId: "sub_2", targetHours: 15, completedHours: 6 },
  { id: "g3", title: "Revise matrix decompositions", subjectId: "sub_3", targetHours: 8, completedHours: 7 },
  { id: "g4", title: "SQL tuning practice", subjectId: "sub_4", targetHours: 10, completedHours: 2.5 },
];

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  due: string;
  priority: "high" | "medium" | "low";
  done: boolean;
  estimate: string;
}

export const tasks: Task[] = [
  { id: "t1", title: "Read Chapter 7 — Fault tolerance", subjectId: "sub_1", due: "Today", priority: "high", done: false, estimate: "45 min" },
  { id: "t2", title: "Implement k-means from scratch", subjectId: "sub_2", due: "Today", priority: "high", done: false, estimate: "2 h" },
  { id: "t3", title: "Flashcard review — eigenvectors", subjectId: "sub_3", due: "Today", priority: "medium", done: true, estimate: "20 min" },
  { id: "t4", title: "Draft essay outline", subjectId: "sub_5", due: "Tomorrow", priority: "low", done: false, estimate: "30 min" },
  { id: "t5", title: "Index tuning lab prep", subjectId: "sub_4", due: "Tomorrow", priority: "medium", done: false, estimate: "1 h" },
  { id: "t6", title: "Group sync — systems project", subjectId: "sub_1", due: "Wed", priority: "medium", done: false, estimate: "1 h" },
  { id: "t7", title: "Summarise lecture 09 with AI", subjectId: "sub_2", due: "Wed", priority: "low", done: true, estimate: "15 min" },
];

export const weeklyProductivity = [
  { day: "Mon", hours: 3.5, focus: 78 },
  { day: "Tue", hours: 2.2, focus: 64 },
  { day: "Wed", hours: 4.6, focus: 88 },
  { day: "Thu", hours: 3.1, focus: 71 },
  { day: "Fri", hours: 5.2, focus: 92 },
  { day: "Sat", hours: 1.4, focus: 52 },
  { day: "Sun", hours: 2.8, focus: 69 },
];

export const subjectMastery = [
  { subject: "Distributed", score: 82 },
  { subject: "ML", score: 74 },
  { subject: "Algebra", score: 91 },
  { subject: "Databases", score: 63 },
  { subject: "Ethics", score: 88 },
];

export const quizTrend = [
  { week: "W1", average: 61 },
  { week: "W2", average: 68 },
  { week: "W3", average: 66 },
  { week: "W4", average: 75 },
  { week: "W5", average: 81 },
  { week: "W6", average: 86 },
];

export const studyStats = {
  streakDays: 18,
  hoursThisWeek: 22.8,
  quizAverage: 86,
  flashcardsCompleted: 412,
  focusScore: 79,
  materialsProcessed: 24,
};
