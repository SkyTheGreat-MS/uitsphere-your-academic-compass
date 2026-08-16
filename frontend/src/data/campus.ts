export interface Announcement {
  id: string;
  category: "Academic" | "Events" | "Campus" | "Exams" | "Clubs";
  title: string;
  description: string;
  date: string;
  pinned: boolean;
  author: string;
}

export const announcements: Announcement[] = [
  {
    id: "an1",
    category: "Exams",
    title: "Semester 2 exam timetable published",
    description:
      "Provisional Semester IV exam dates for Second Year Section A are now available in the student portal. Clash reports must be submitted before 20 March.",
    date: "11 Mar 2025",
    pinned: true,
    author: "Registry Office",
  },
  {
    id: "an2",
    category: "Academic",
    title: "Semester IV coursework deadline extended",
    description: "The CST-4105 Enterprise Java milestone deadline moves to Friday 14 March, 17:00.",
    date: "10 Mar 2025",
    pinned: true,
    author: "Dr. H. Lindqvist",
  },
  {
    id: "an3",
    category: "Events",
    title: "Spring Innovation Fair — call for demos",
    description:
      "Showcase your project to 40+ industry partners. Applications close Sunday; teams of up to four students welcome.",
    date: "09 Mar 2025",
    pinned: false,
    author: "Careers & Enterprise",
  },
  {
    id: "an4",
    category: "Campus",
    title: "Library extended opening hours begin Monday",
    description:
      "Levels 2 and 3 will stay open until 02:00 throughout the revision period. Bring your student ID for after-hours access.",
    date: "08 Mar 2025",
    pinned: false,
    author: "Library Services",
  },
  {
    id: "an5",
    category: "Clubs",
    title: "AI Society: hands-on workshop on retrieval systems",
    description:
      "Thursday 18:00 in AI Lab 3. Bring a laptop — we'll build a small retrieval pipeline together. Free pizza afterwards.",
    date: "07 Mar 2025",
    pinned: false,
    author: "AI Society",
  },
  {
    id: "an6",
    category: "Academic",
    title: "New peer tutoring slots for Linear Algebra",
    description:
      "Six additional weekly slots have opened with senior students. Book through the study support page.",
    date: "05 Mar 2025",
    pinned: false,
    author: "Study Support",
  },
];

export const announcementCategories = ["All", "Academic", "Exams", "Events", "Campus", "Clubs"];

export const achievements = [
  {
    id: "ac1",
    title: "18-day streak",
    description: "Studied every day for 18 days",
    icon: "flame",
  },
  {
    id: "ac2",
    title: "Quiz master",
    description: "Scored above 85% on five quizzes",
    icon: "trophy",
  },
  {
    id: "ac3",
    title: "Deep focus",
    description: "Logged a 4-hour uninterrupted session",
    icon: "target",
  },
  {
    id: "ac4",
    title: "Note architect",
    description: "Generated 50 smart note cards",
    icon: "notebook",
  },
  {
    id: "ac5",
    title: "Early bird",
    description: "Ten sessions started before 08:00",
    icon: "sunrise",
  },
  {
    id: "ac6",
    title: "Helper",
    description: "Returned 3 lost items to their owners",
    icon: "heart",
  },
];

export const profileActivity = [
  {
    id: "pa1",
    label: "Completed mock exam — Enterprise Java",
    when: "Today, 09:40",
    detail: "84%",
  },
  { id: "pa2", label: "Reviewed 32 flashcards", when: "Today, 08:05", detail: "Linear Algebra" },
  {
    id: "pa3",
    label: "Uploaded AI search methods slides",
    when: "Yesterday, 19:22",
    detail: "58 pages",
  },
  { id: "pa4", label: "Reported a found item", when: "Yesterday, 13:10", detail: "Lost & Found" },
  {
    id: "pa5",
    label: "Finished study goal — matrix decompositions",
    when: "2 days ago",
    detail: "7 / 8 h",
  },
];
