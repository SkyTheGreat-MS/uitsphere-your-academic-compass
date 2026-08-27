# UitSphere: Your Academic Compass

Build a modern, premium-quality responsive web application called "UitSphere".

UitSphere is an AI-powered university student companion platform designed to help students organize academic life, study smarter, and access AI-assisted learning tools.

The application should look like a real SaaS productivity platform, similar in quality to Notion, Linear, GitHub, or NotebookLM.

This prompt is ONLY for the frontend/UI.

Do NOT implement backend logic, authentication, databases, or APIs.

The AI Tutor uses the authenticated backend chat and persisted conversation history.

----------------------------------------------------

Tech Stack

----------------------------------------------------

Use:

- React (Vite)

- Tailwind CSS

- TypeScript

- shadcn/ui components

- React Router

- Lucide React icons

- Recharts for analytics

- Framer Motion for subtle animations

The application must be fully responsive for desktop and tablet.

----------------------------------------------------

Design Style

----------------------------------------------------

Design a clean premium SaaS dashboard.

Theme:

Primary:

#057d89

Secondary:

White

Accent:

Soft Green

Text:

Dark Grey

Use rounded cards, generous spacing, smooth hover animations, glassmorphism where appropriate, and modern typography.

The application should feel calm, minimal, and designed specifically for university students.

Avoid clutter.

----------------------------------------------------

Navigation

----------------------------------------------------

Persistent left sidebar containing:

• Dashboard

• AI Learning Studio

• Timetable

• Study Planner

• Lost & Found

• Profile

Top navigation should include:

• Search

• Notifications

• Student Avatar

----------------------------------------------------

Authentication Pages

----------------------------------------------------

Create:

Login

Register

Student Profile Setup

Fields:

Name

Email

Password

University ID

Department

Academic Year

Use beautiful split-screen layouts with illustration placeholders.

----------------------------------------------------

Dashboard

----------------------------------------------------

Create a personalized dashboard.

Include:

Welcome card

Today's classes

Upcoming deadlines

Study progress

Weekly productivity chart

Quick action cards

Lost & Found preview

Recent AI activity

Display realistic sample university data.

----------------------------------------------------

AI Learning Studio

----------------------------------------------------

This is the flagship feature.

Design it inspired by NotebookLM and ChatGPT.

Layout:

Left sidebar

Uploaded learning materials

Chat history

Main workspace

Tabs:

AI Tutor

Summary

Smart Notes

Flashcards

Quiz Generator

Mock Exam

----------------------------------------------------

AI Tutor

----------------------------------------------------

Chat interface

Student messages

AI responses

Typing animation

Message timestamps

----------------------------------------------------

Summary

----------------------------------------------------

Display lecture summaries as elegant cards.

Each summary should include:

Title

Estimated reading time

Bullet summary

Key takeaways

----------------------------------------------------

Smart Notes

----------------------------------------------------

Generate structured note cards.

Each note should include:

Key Concepts

Definitions

Important Points

Exam Tips

Examples

----------------------------------------------------

Flashcards

----------------------------------------------------

Beautiful flashcard UI.

Flip animation

Previous / Next

Progress indicator

Mark as learned

Difficulty badge

----------------------------------------------------

Quiz Generator

----------------------------------------------------

Multiple choice interface.

Question card

Options

Next button

Progress bar

Score page

Explanation panel

----------------------------------------------------

Mock Exam

----------------------------------------------------

Professional exam interface.

Question navigator

Countdown timer

Question palette

Submit button

Results page

Performance analytics

----------------------------------------------------

Study Management

----------------------------------------------------

Timetable

Modern weekly calendar

Subject colors

Room numbers

Lecture time

Planner

Study goals

Task cards

Completion status

Priority labels

Progress

Analytics cards

Study streak

Hours studied

Quiz averages

Flashcards completed

Use Recharts for graphs.

----------------------------------------------------

Lost & Found

----------------------------------------------------

Create a modern campus Lost & Found experience.

Sections:

Lost Items

Found Items

Report Item

Each card should display:

Image

Title

Description

Location

Date

Status badge

Matching suggestion cards

Use placeholder images.

----------------------------------------------------

Profile

----------------------------------------------------

Student profile page.

Editable information.

Achievements

Study statistics

Learning streak

Recent activity

Settings cards

----------------------------------------------------

Microinteractions

----------------------------------------------------

Include:

Hover animations

Loading skeletons

Smooth transitions

Animated charts

Empty states

Toast notifications

Beautiful modals

Modern dropdowns

----------------------------------------------------

Mock Data

----------------------------------------------------

Populate every page with realistic university data.

Include fake subjects, deadlines, AI conversations, lost items, quizzes, and study statistics.

Nothing should appear empty.

----------------------------------------------------

Quality

----------------------------------------------------

This should feel like a startup-quality EdTech SaaS product.

Prioritize UI consistency, reusable components, accessibility, responsive layouts, and clean code.

Organize the project into reusable React components with a scalable folder structure.

No backend implementation is required.

No API calls.

No authentication logic.

Only frontend with realistic mock data.  Design every feature as if it will later connect to a REST API.

Separate UI components from data.

Use mock JSON objects or local data files instead of hardcoded values inside components.

Keep components reusable and backend-agnostic so they can easily be connected to a Spring Boot REST API in the future.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d18fe0c7-9806-40a6-9d7e-fcb8af97b02d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
