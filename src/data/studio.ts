export interface LearningMaterial {
  id: string;
  title: string;
  type: "PDF" | "Slides" | "Audio" | "Notes" | "Video";
  subjectId: string;
  pages: number;
  uploadedAt: string;
  status: "processed" | "processing";
}

export const learningMaterials: LearningMaterial[] = [
  { id: "m1", title: "Lecture 09 — Consensus & Raft.pdf", type: "PDF", subjectId: "sub_1", pages: 42, uploadedAt: "2 hours ago", status: "processed" },
  { id: "m2", title: "ML Week 6 — Optimisation.pptx", type: "Slides", subjectId: "sub_2", pages: 58, uploadedAt: "Yesterday", status: "processed" },
  { id: "m3", title: "Linear Algebra — SVD notes.md", type: "Notes", subjectId: "sub_3", pages: 12, uploadedAt: "2 days ago", status: "processed" },
  { id: "m4", title: "DB Engineering seminar recording", type: "Audio", subjectId: "sub_4", pages: 1, uploadedAt: "3 days ago", status: "processing" },
  { id: "m5", title: "Ethics case pack — AI in hiring.pdf", type: "PDF", subjectId: "sub_5", pages: 27, uploadedAt: "Last week", status: "processed" },
];

export interface StudioSession {
  id: string;
  title: string;
  tool: string;
  when: string;
}

export const recentSessions: StudioSession[] = [
  { id: "s1", title: "Raft leader election deep-dive", tool: "AI Tutor", when: "35 min ago" },
  { id: "s2", title: "Optimisation summary", tool: "Summary", when: "3 hours ago" },
  { id: "s3", title: "SVD flashcard set", tool: "Flashcards", when: "Yesterday" },
  { id: "s4", title: "Databases mock exam", tool: "Mock Exam", when: "2 days ago" },
  { id: "s5", title: "Ethics smart notes", tool: "Smart Notes", when: "4 days ago" },
];

export interface ChatMessage {
  id: string;
  role: "student" | "ai";
  content: string;
  time: string;
}

export const tutorConversation: ChatMessage[] = [
  {
    id: "cm1",
    role: "student",
    content: "Can you explain how Raft handles leader election when two nodes time out at once?",
    time: "10:12",
  },
  {
    id: "cm2",
    role: "ai",
    content:
      "When two followers time out simultaneously they both become candidates for the same term and request votes. Because each node grants only one vote per term, the split usually leaves nobody with a majority. Raft then relies on randomised election timeouts (typically 150–300 ms) so one candidate retries first on the next term and wins cleanly.",
    time: "10:12",
  },
  {
    id: "cm3",
    role: "student",
    content: "So randomisation is what prevents infinite split votes?",
    time: "10:14",
  },
  {
    id: "cm4",
    role: "ai",
    content:
      "Exactly. The randomised timeout makes repeated ties statistically unlikely. Two things to remember for your exam: (1) terms are monotonically increasing logical clocks, and (2) a candidate reverts to follower the moment it sees a higher term. Want me to turn this into flashcards?",
    time: "10:14",
  },
];

export const suggestedPrompts = [
  "Explain this lecture like I'm a first-year",
  "Give me 5 exam-style questions",
  "Compare Raft and Paxos in a table",
  "What did I likely miss in lecture 09?",
  "Build a 3-day revision plan",
];

export const exampleQuestions = [
  "Why does Raft require a majority quorum?",
  "How does log replication guarantee safety?",
  "What breaks if terms were not monotonic?",
];

export interface LectureSummary {
  id: string;
  title: string;
  subjectId: string;
  readingTime: string;
  bullets: string[];
  takeaways: string[];
}

export const summaries: LectureSummary[] = [
  {
    id: "sum1",
    title: "Lecture 09 — Consensus & the Raft protocol",
    subjectId: "sub_1",
    readingTime: "4 min read",
    bullets: [
      "Consensus lets a replicated cluster agree on a single ordered log despite crashes.",
      "Raft decomposes consensus into leader election, log replication and safety.",
      "Randomised election timeouts avoid persistent split votes.",
      "A committed entry is one replicated on a majority of nodes.",
    ],
    takeaways: [
      "Majority quorums guarantee overlap between any two decisions.",
      "Terms act as logical clocks that resolve stale leaders.",
      "Raft trades theoretical minimality for understandability versus Paxos.",
    ],
  },
  {
    id: "sum2",
    title: "ML Week 6 — Optimisation & gradient methods",
    subjectId: "sub_2",
    readingTime: "6 min read",
    bullets: [
      "Gradient descent iteratively moves parameters against the loss gradient.",
      "Learning rate controls the trade-off between speed and stability.",
      "Momentum and Adam adapt step size using gradient history.",
      "Mini-batches balance gradient noise with hardware efficiency.",
    ],
    takeaways: [
      "Too large a learning rate diverges; too small stalls in plateaus.",
      "Adam is a strong default but can generalise worse than tuned SGD.",
      "Always normalise features before first-order optimisation.",
    ],
  },
  {
    id: "sum3",
    title: "Linear Algebra II — Singular value decomposition",
    subjectId: "sub_3",
    readingTime: "5 min read",
    bullets: [
      "Every real matrix factorises as U Σ Vᵀ with orthogonal U and V.",
      "Singular values rank directions by how much the map stretches space.",
      "Truncating Σ gives the best low-rank approximation (Eckart–Young).",
      "SVD underpins PCA, image compression and recommender systems.",
    ],
    takeaways: [
      "Singular values are always non-negative and ordered.",
      "Rank equals the number of non-zero singular values.",
      "PCA is SVD applied to a mean-centred data matrix.",
    ],
  },
];

export interface SmartNote {
  id: string;
  title: string;
  subjectId: string;
  keyConcepts: string[];
  definitions: { term: string; meaning: string }[];
  importantPoints: string[];
  examTips: string[];
  examples: string[];
}

export const smartNotes: SmartNote[] = [
  {
    id: "n1",
    title: "Consensus in distributed systems",
    subjectId: "sub_1",
    keyConcepts: ["Quorum", "Leader election", "Log replication", "Term numbers"],
    definitions: [
      { term: "Quorum", meaning: "The minimum number of nodes (⌊n/2⌋ + 1) that must agree for a decision to commit." },
      { term: "Term", meaning: "A monotonically increasing logical clock identifying one election cycle." },
      { term: "Commit index", meaning: "The highest log index known to be replicated on a majority." },
    ],
    importantPoints: [
      "Any two quorums intersect in at least one node — this is why safety holds.",
      "A leader never overwrites its own log entries; it only appends.",
      "Followers reject append requests from stale terms.",
    ],
    examTips: [
      "Draw the state machine (follower → candidate → leader) — it earns easy marks.",
      "Quote the randomised timeout range when asked about split votes.",
    ],
    examples: [
      "A 5-node cluster tolerates 2 failures because a quorum is 3.",
      "etcd and Consul both use Raft for cluster metadata.",
    ],
  },
  {
    id: "n2",
    title: "Gradient-based optimisation",
    subjectId: "sub_2",
    keyConcepts: ["Loss surface", "Learning rate", "Momentum", "Adaptive methods"],
    definitions: [
      { term: "Gradient", meaning: "Vector of partial derivatives pointing in the direction of steepest loss increase." },
      { term: "Momentum", meaning: "An exponentially weighted average of past gradients that damps oscillation." },
      { term: "Adam", meaning: "Adaptive optimiser combining momentum with per-parameter scaling of step size." },
    ],
    importantPoints: [
      "Convexity guarantees a global minimum; neural losses are non-convex.",
      "Batch size affects gradient variance, not the expected gradient.",
      "Learning-rate schedules usually beat a fixed rate.",
    ],
    examTips: [
      "Be able to derive the SGD update rule from first principles.",
      "Know why Adam's bias correction term exists.",
    ],
    examples: [
      "Cosine annealing restarts help escape sharp minima.",
      "Feature scaling turns an elongated loss valley into a rounder bowl.",
    ],
  },
];

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: "Easy" | "Medium" | "Hard";
  subjectId: string;
}

export const flashcards: Flashcard[] = [
  { id: "f1", front: "What is a quorum in Raft?", back: "A majority of nodes, ⌊n/2⌋ + 1, required for any commit or election to succeed.", difficulty: "Easy", subjectId: "sub_1" },
  { id: "f2", front: "Why are election timeouts randomised?", back: "To make simultaneous candidacies statistically rare, preventing repeated split votes.", difficulty: "Medium", subjectId: "sub_1" },
  { id: "f3", front: "Define the commit index.", back: "The highest log index known to be replicated on a majority of servers and therefore safe to apply.", difficulty: "Medium", subjectId: "sub_1" },
  { id: "f4", front: "State the Eckart–Young theorem.", back: "The best rank-k approximation of a matrix in Frobenius norm is obtained by truncating its SVD to the k largest singular values.", difficulty: "Hard", subjectId: "sub_3" },
  { id: "f5", front: "What does momentum add to SGD?", back: "An exponentially decaying average of past gradients, accelerating consistent directions and damping oscillation.", difficulty: "Medium", subjectId: "sub_2" },
  { id: "f6", front: "When does gradient descent diverge?", back: "When the learning rate exceeds 2/L for an L-smooth loss, steps overshoot and error grows.", difficulty: "Hard", subjectId: "sub_2" },
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "In a 7-node Raft cluster, how many nodes may fail while the cluster stays available?",
    options: ["2", "3", "4", "6"],
    answerIndex: 1,
    explanation: "A quorum of 7 nodes is 4, so up to 3 failures still leave a majority able to elect a leader and commit entries.",
  },
  {
    id: "q2",
    question: "What happens when a Raft leader receives a message with a higher term?",
    options: [
      "It ignores the message",
      "It increments its own term and stays leader",
      "It steps down to follower",
      "It triggers a new election immediately",
    ],
    answerIndex: 2,
    explanation: "Any server seeing a higher term updates its term and reverts to follower — this is how stale leaders are removed.",
  },
  {
    id: "q3",
    question: "Which statement about singular values is TRUE?",
    options: [
      "They can be negative",
      "They equal the matrix eigenvalues",
      "They are non-negative and ordered descending",
      "There are always exactly n of them for any matrix",
    ],
    answerIndex: 2,
    explanation: "Singular values are the non-negative square roots of the eigenvalues of AᵀA, conventionally listed in descending order.",
  },
  {
    id: "q4",
    question: "Why do we normalise features before gradient descent?",
    options: [
      "To reduce the number of parameters",
      "To make the loss surface better conditioned",
      "To guarantee convexity",
      "To remove the need for a learning rate",
    ],
    answerIndex: 1,
    explanation: "Normalisation equalises curvature across dimensions, turning an elongated valley into a rounder bowl so a single learning rate works well.",
  },
  {
    id: "q5",
    question: "Mini-batch gradient descent primarily trades off…",
    options: [
      "Accuracy against interpretability",
      "Gradient noise against hardware efficiency",
      "Memory against model depth",
      "Bias against the number of epochs",
    ],
    answerIndex: 1,
    explanation: "Larger batches give lower-variance gradients and better GPU utilisation; smaller batches add noise that can aid generalisation.",
  },
];

export interface ExamQuestion extends QuizQuestion {
  marks: number;
}

export const mockExam: ExamQuestion[] = quizQuestions.map((q, i) => ({ ...q, marks: i % 2 === 0 ? 4 : 6 }));

export const examPerformance = [
  { topic: "Consensus", score: 88 },
  { topic: "Replication", score: 72 },
  { topic: "Optimisation", score: 65 },
  { topic: "Linear Algebra", score: 94 },
  { topic: "Databases", score: 70 },
];

export const recentAiActivity = [
  { id: "a1", label: "Summarised “Consensus & Raft”", tool: "Summary", when: "35 min ago" },
  { id: "a2", label: "Generated 24 flashcards on SVD", tool: "Flashcards", when: "3 h ago" },
  { id: "a3", label: "Completed Databases mock exam — 78%", tool: "Mock Exam", when: "Yesterday" },
  { id: "a4", label: "Asked 12 questions about optimisation", tool: "AI Tutor", when: "2 days ago" },
];
