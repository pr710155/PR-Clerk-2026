# PR Clerk 2026 — v2 (Level 1)

This is a working private Progressive Web App (PWA) starter.

## Run it
The simplest option is to serve this folder with any local web server, for example:
- Python: `python -m http.server 8000`
- Then open `http://localhost:8000`

For phone/tablet use, the app can later be hosted on a free static host and installed from the browser.

## Current v1
- Level 1: Tables, Squares, Cubes, Percentage Values
- Level 2: Simplification, Approximation, Quadratic Equations
- Level 3: Mains-Level Quadratic
- 10-question practice sets
- Answer feedback and explanations
- Score and best-accuracy saved locally
- Responsive layout
- PWA service worker

## Important
The current question generator is deliberately a first working engine, not the final exam-grade question bank. The next development pass should replace/add generators for the exact PR Clerk patterns and difficulty rules we finalized.


## v1.2 visual update
- More colorful but restrained visual design
- Gradient header and progress bar
- Subtle topic accent colors
- Improved cards, buttons, borders and shadows
- Level 2 back button now returns to the main menu

## V2 — Level 1 Easy complete
Six Easy sections:
1. Tables — 2–25
2. Squares — 1–60
3. Cubes — 1–30
4. Percentage Values — common fraction ↔ percentage values
5. Number Games — Addition, Subtraction, Multiplication, Division
6. Mixed Set — random questions from all five content sections

There is deliberately **no timer or time-management feature** in Level 1.

Each practice set contains 10 questions, gives immediate feedback/explanation, and saves overall question count and best accuracy locally.


## V2.1 — Blind test behavior
- No immediate answer feedback during a test.
- No topic, skill, Easy/Moderate/Hard label shown while answering.
- Submit the test first; only then are answers, explanations and difficulty/topic classifications revealed.
- Added a 20-question Full Blind Test mixing Easy, Moderate and Hard generators.
- Level-specific tests also reveal analysis only after submission.
- No timer.


## V2.2 — Easy expansion + real test mode
- Easy now has Tables, Squares (1–60), Cubes (1–30), Percentage Values, Fractions, Number Games, and Mixed Set.
- Number Games trains progressively varied addition/subtraction sizes plus mental multiplication and division.
- Mixed Set randomly surprises the learner with all Easy subsections.
- During a test there is NO instant right/wrong feedback and NO topic/difficulty disclosure.
- Timer is active during tests; time used, average time, remaining time and pace are shown after submission.
- Results show marks, correct/wrong/unanswered, answer review, topic and difficulty only after submission.
- Scoring is +1 correct, -0.25 wrong, 0 unanswered.
- Easy Mixed Set: 20 questions / 8 minutes.
- Number Games: 20 questions / 6 minutes.
- Other topic tests: 10 questions / 4 minutes.
- Full Blind Test: 30 questions / 15 minutes, mixed across all levels.


## V3 — Final Easy input and timed testing
- Easy sections use typed/digital-pad answers, not multiple choice.
- Virtual keypad contains ONLY 0–9, `/`, and `.`.
- Percentage Values has two modes: Percentage → Fraction and Fraction → Percentage.
- Number Games covers progressively varied addition/subtraction digit sizes plus multiplication/division practice.
- Mixed Set surprises the learner with all Easy subsections.
- No answer/topic/difficulty feedback during the test.
- Timed tests report marks, correct/wrong/unanswered, time used, average time, time left and time-management assessment after submission.
