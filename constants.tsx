
import React from 'react';
import { ModuleType, ModuleData, QuizQuestion, GlossaryEntry } from './types';

const IconVision = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const IconCompose = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m7 15 5-5 5 5"/>
  </svg>
);

const IconCraft = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

export const GLOSSARY: GlossaryEntry[] = [
  { term: "API", definition: "A bridge that lets two different apps talk to each other (like a game getting your player stats from a server)." },
  { term: "Backend", definition: "The 'hidden' part of an app that handles data and rules behind the scenes." },
  { term: "CSS", definition: "The design rules that set colors, fonts, and layouts for a website." },
  { term: "Debugging", definition: "The detective work of finding and fixing mistakes in your logic or code." },
  { term: "Framer Motion", definition: "A special tool used with React to create smooth, professional animations like fading or sliding." },
  { term: "Framework", definition: "A set of pre-built tools that help you build apps faster, like using a LEGO kit instead of melting plastic yourself." },
  { term: "Frontend", definition: "The visual part of an app that you can see and click on." },
  { term: "HTML", definition: "The basic skeleton and structure of a webpage." },
  { term: "JavaScript", definition: "A language that makes websites interactive and alive (like buttons that actually do something)." },
  { term: "JSON", definition: "A simple way to package and send data between computers." },
  { term: "Logic Flow", definition: "The step-by-step path an app takes to complete a task (If this happens, then do that)." },
  { term: "Loop", definition: "A command that repeats a task until it's finished." },
  { term: "Python", definition: "A popular coding language known for being easy to read, often used for AI." },
  { term: "React", definition: "A tool used to build interactive websites using reusable parts." },
  { term: "State", definition: "The 'memory' of an app (like knowing if a menu is open or what your current score is)." },
  { term: "Tailwind", definition: "A design tool that makes it easy to style websites quickly." },
  { term: "UI", definition: "User Interface: The buttons, screens, and menus you interact with." },
  { term: "Variable", definition: "A container for a piece of information that might change." }
].sort((a, b) => a.term.localeCompare(b.term));

export const MODULES: ModuleData[] = [
  {
    id: ModuleType.CREATIVITY,
    title: "Design Studio",
    subtitle: "Step 1: Big Ideas",
    description: "Use your imagination to plan out your project. Focus on the 'Vibe' and the story before worrying about tech.",
    color: "#FFB703",
    icon: <IconVision />,
    lessons: ["Vision Stories", "Screen Mapping", "Feature Lists"],
    intro: "Welcome! Here, vibe-coding starts with your imagination. You will describe features like a storyteller and map out screens like an architect. Your ideas are the fuel!"
  },
  {
    id: ModuleType.PROMPTING,
    title: "Comm Studio",
    subtitle: "Step 2: Clear Talking",
    description: "Learn how to give AI better instructions. Turn fuzzy ideas into crystal clear directions.",
    color: "#0077B6",
    icon: <IconCompose />,
    lessons: ["Better Context", "Giving Rules", "Fixing Prompts"],
    intro: "Time to learn 'AI Language'! It’s about being super precise. You'll take basic prompts and refine them into master instructions."
  },
  {
    id: ModuleType.CODE_ONRAMP,
    title: "Logic Studio",
    subtitle: "Step 3: How it Works",
    description: "Learn the basic building blocks. See how apps think and learn how to spot simple logic mistakes.",
    color: "#2D6A4F",
    icon: <IconCraft />,
    lessons: ["Logic Paths", "Spotting Bugs", "Data Boxes"],
    intro: "Let's peek under the hood! You’ll learn how apps make decisions using Logic Flow. You don't need to be a pro coder—you just need to think like a builder."
  }
];

export const INITIAL_ASSESSMENT_POOL: QuizQuestion[] = [
  {
    id: "a1",
    question: "If you have a great idea for an app, what's the best first step?",
    options: ["Write 100 lines of code immediately", "Describe the 'vibe' and features in simple words", "Ask a computer to 'make something cool'", "Give up if you don't know Python"],
    correctAnswer: 1,
    explanation: "Vibe coding starts with your story. If you can describe it, you can build it!"
  },
  {
    id: "a2",
    question: "Which of these is like a 'map' for an app?",
    options: ["A list of colors you like", "A drawing of what the screens look like", "The computer's power cord", "Your internet password"],
    correctAnswer: 1,
    explanation: "Mapping out your UI helps the AI understand where buttons and text should go."
  },
  {
    id: "a3",
    question: "What makes an AI prompt 'better'?",
    options: ["Using all CAPITAL letters", "Adding specific details and rules", "Typing as fast as possible", "Using very few words"],
    correctAnswer: 1,
    explanation: "Being specific is key. Tell the AI exactly what you want it to build."
  },
  {
    id: "a4",
    question: "If the AI gives you code that doesn't work, what should you do?",
    options: ["Delete it and cry", "Tell the AI about the error and ask it to fix it", "Turn off the computer", "Copy-paste it again and again"],
    correctAnswer: 1,
    explanation: "Refining is part of the fun! Fixing mistakes with AI is a master skill."
  },
  {
    id: "a5",
    question: "What is 'Logic Flow' in an app?",
    options: ["How fast the screen moves", "The step-by-step rules that decide what happens next", "The color of the buttons", "The weight of the phone"],
    correctAnswer: 1,
    explanation: "Logic flow is the brain of your app. It’s the sequence of events that makes things happen."
  },
  {
    id: "a6",
    question: "Why would you use a 'Framework' like React?",
    options: ["To make the computer look fancy", "To use a toolkit of pre-made parts to save time", "Because it is required by law", "To hide your work from others"],
    correctAnswer: 1,
    explanation: "Frameworks are like specialized LEGO kits that help you build complex apps faster."
  },
  {
    id: "a7",
    question: "What does a 'Variable' do in a game?",
    options: ["It makes the music louder", "It stores a value that can change, like a high score", "It's the name of the company", "It makes the screen 3D"],
    correctAnswer: 1,
    explanation: "Variables are like boxes that hold information your app needs to remember."
  },
  {
    id: "a8",
    question: "When you want an app to do the same thing 10 times, what do you use?",
    options: ["A Loop", "A Variable", "A Button", "A Screen"],
    correctAnswer: 0,
    explanation: "Loops tell the app to repeat a task until it is finished."
  }
];

export const QUIZZES: Record<string, QuizQuestion[]> = {
  INITIAL_ASSESSMENT: INITIAL_ASSESSMENT_POOL,
  [ModuleType.CREATIVITY]: [
    {
      id: "q_c1",
      question: "What is an 'MVP' in the Design Studio?",
      options: ["Most Valuable Player", "Minimum Viable Product", "Main Visual Piece"],
      correctAnswer: 1,
      explanation: "The MVP is the simplest version of your idea that actually works."
    },
    {
      id: "q_c2",
      question: "Which studio focus is solely on big ideas and imagination?",
      options: ["Design Studio", "Comm Studio", "Logic Studio"],
      correctAnswer: 0,
      explanation: "Design Studio is all about being an architect and dreamer."
    }
  ],
  [ModuleType.PROMPTING]: [
    {
      id: "q_p1",
      question: "What is 'Refining a prompt'?",
      options: ["Making it more specific and clear", "Typing the same thing twice", "Using a robot voice"],
      correctAnswer: 0,
      explanation: "Refining helps the AI understand exactly what you are thinking."
    }
  ],
  [ModuleType.CODE_ONRAMP]: [
    {
      id: "q_f1",
      question: "What is Debugging?",
      options: ["Catching bugs in a jar", "Finding and fixing logic mistakes", "Buying a new keyboard"],
      correctAnswer: 1,
      explanation: "Debugging is the detective work of building software."
    }
  ]
};
