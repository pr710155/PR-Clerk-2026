# PR Clerk 2026 — Calculation Practice

A private Progressive Web App (PWA) for fast calculation practice.

## Main menu

- Easy — Calculation Foundation
- Moderate — Speed Maths
- Hard — Advanced Exam Practice

There is no Full Blind Test.

## Easy

Parent-style topic cards:
- Tables — choose any table from 6–30
- Squares — 1–60
- Cubes — 1–30
- Percentage Values — Percentage → Fraction and Fraction → Percentage
- Fractions — basic fraction practice
- Number Games — choose Addition, Subtraction, Multiplication, or Division
- Mixed Set — surprise mix of all Easy topics

Tables and Number Games use selection screens so the learner decides exactly what to practise.

## Answer input and feedback

Easy practice uses a numeric digital input pad with only:
- 0–9
- /
- .

There are no multiple-choice options for Easy topics.

Answers are not revealed while the test is in progress. There is no instant red/wrong or correct feedback. Answers are revealed only after the test is submitted or time expires.

## Results

After submission, the result includes:
- Marks / score
- Correct, wrong and unanswered counts
- Time used
- Average time per attempted question
- Time left
- Time-management assessment
- Question-by-question answer review
- Your answer and correct answer
- Time spent on each question

Section and topic labels are not displayed in the result review.

## PWA

The app includes a manifest and service worker for installable/offline-capable use when hosted as a static site.

## V9 Moderate AI Coach + compact review
Moderate results now include:
- detailed per-question solution and shortcut/approach guidance
- question-by-question time analysis
- personalised AI Coach + compact review-style time-management feedback
- slowest-attempt highlights that jump to the relevant review item

The coaching is computed locally from performance and timing data; no answer data is sent to a third-party AI service.

## V10 Easy Number Games Shortcut Coach
Easy Number Games now deliberately trains multiple mental-calculation patterns rather than only increasing number size. Addition, subtraction, multiplication and division questions carry a post-submission highlight, best approach, shortcut and quick-method library. The shortcut is never shown while the question is being attempted.

## V13 — Examiner-Level Clerk Prelims Generator
Moderate is focused on Clerk Prelims-style calculation patterns using recent pattern references from Guidely, Adda247 and Oliveboard. Quadratic Equations are removed from Moderate. Added Number Series (missing/wrong and common progression patterns) and Arithmetic calculation/application patterns alongside Simplification and Approximation. Questions remain original/generated, not copied from source material.


### V13 design target
Moderate is now generated to resemble the structure and calculation demand of SBI/IBPS Clerk Prelims Numerical Ability: Simplification, Approximation, Missing/Wrong Number Series, Arithmetic and Data Interpretation. Generator families are varied and controlled rather than simple arithmetic templates. DI includes table, bar-style and caselet-style calculations. No Quadratic Equations are used in Moderate.

The generator creates original questions; it does not copy source questions. Pattern references were checked against recent Clerk Prelims analyses and preparation material from Guidely, Adda247, Oliveboard and other exam-analysis sources.


## Moderate scope update
Moderate currently contains ONLY Simplification, Approximation, and Number Series (Missing + Wrong). DI and Arithmetic have been removed for now.


V24 CHANGE: Removed the app's stylus/Apple Pencil/Scribble feature and related UI. Answers use normal typing/keypad input; quadratic remains comparison-options based.


## V27 Hard Advanced

Hard now includes three independent subsections:
- Advanced Quadratic Equations — mains-level multi-step quadratic work
- Advanced Missing Number Series — layered operation, square/cube, alternating and interleaved patterns
- Advanced Wrong Number Series — Q110-style wrong-term detection followed by P/Q relationship questions

Hard wrong-number questions are constructed from a valid sequence first and then deliberately corrupted, so the pattern remains mathematically consistent.

Quadratic comparison questions use clean unlabelled relationship choices (no A/B/C/D/E labels). Other questions use the normal answer field.

The result-page back action is also fixed so submitting a test no longer triggers the "Leave this test?" confirmation.
