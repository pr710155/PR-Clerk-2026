/* =========================================================
   PR CLERK 2026 — MODERATE EXAM-LEVEL GENERATOR
   ---------------------------------------------------------
   Sections:
     1. Simplification
     2. Approximation
     3. Quadratic Equations
     4. Missing Number Series
     5. Wrong Number Series
     6. Blind Fold (mixed)

   Design goals:
     - Banking-prelims style, not generic school algebra.
     - No copied questions; templates generate fresh variants.
     - Valid answers are constructed before the question is shown.
     - Dynamic, question-specific approach/trick/steps.
     - Duplicate prevention through fingerprints.
     - No DI / Arithmetic in this Moderate package.
     - No "Sreedhar's" references.
   ========================================================= */

const PRModerateGenerator = (() => {
  // ---------- Core utilities ----------
  const G = {
    rnd(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },

    chance(p) {
      return Math.random() < p;
    },

    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },

    gcd(a, b) {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) [a, b] = [b, a % b];
      return a || 1;
    },

    lcm(a, b) {
      return Math.abs(a * b) / this.gcd(a, b);
    },

    isInt(x, eps = 1e-9) {
      return Math.abs(x - Math.round(x)) < eps;
    },

    clean(x) {
      if (this.isInt(x)) return String(Math.round(x));
      return String(Math.round(x * 1000000) / 1000000);
    },

    frac(n, d) {
      if (d < 0) [n, d] = [-n, -d];
      const g = this.gcd(n, d);
      return { n: n / g, d: d / g };
    },

    fracValue(f) {
      return f.n / f.d;
    },

    fracStr(f) {
      if (f.d === 1) return String(f.n);
      return `${f.n}/${f.d}`;
    },

    mixedStr(n, d) {
      if (d === 1) return String(n);
      const sign = n < 0 ? "-" : "";
      n = Math.abs(n);
      const w = Math.floor(n / d);
      const r = n % d;
      if (r === 0) return `${sign}${w}`;
      if (w === 0) return `${sign}${r}/${d}`;
      return `${sign}${w} ${r}/${d}`;
    },

    percentageFraction(p) {
      const f = this.frac(p, 100);
      return this.fracStr(f);
    },

    square(n) {
      return n * n;
    },

    // Familiar bank-exam percentages.
    pctOptions: [12.5, 16.6666666667, 20, 25, 30, 33.3333333333,
                 37.5, 40, 50, 60, 62.5, 66.6666666667, 75, 80],

    // ---------- Duplicate prevention ----------
    seen: new Set(),

    fingerprint(q) {
      return [
        q.type,
        q.question,
        q.answer,
        q.meta?.pattern || ""
      ].join("||").replace(/\s+/g, " ").trim();
    },

    accept(q) {
      const fp = this.fingerprint(q);
      if (this.seen.has(fp)) return false;
      this.seen.add(fp);
      q.id = `${q.type.replace(/\W/g, "").toLowerCase()}-${Date.now()}-${this.seen.size}`;
      return true;
    },

    resetHistory() {
      this.seen.clear();
    }
  };

  // =========================================================
  // SHORTCUT LIBRARY
  // =========================================================
  const Tricks = {
    multiplyBy5(a) {
      return {
        approach: "Turn ×5 into ×10 ÷2.",
        trick: "×5 = ×10 ÷ 2.",
        steps: [
          `5 = 10 ÷ 2`,
          `${a} ÷ 2 = ${G.clean(a / 2)}`,
          `${G.clean(a / 2)} × 10 = ${G.clean(a * 5)}`
        ]
      };
    },

    multiplyBy25(a) {
      return {
        approach: "Use ×25 = ×100 ÷4.",
        trick: "×25 = ×100 ÷ 4.",
        steps: [
          `25 = 100 ÷ 4`,
          `${a} ÷ 4 = ${G.clean(a / 4)}`,
          `${G.clean(a / 4)} × 100 = ${G.clean(a * 25)}`
        ]
      };
    },

    multiplyBy50(a) {
      return {
        approach: "Use ×50 = ×100 ÷2.",
        trick: "×50 = ×100 ÷ 2.",
        steps: [
          `50 = 100 ÷ 2`,
          `${a} ÷ 2 = ${G.clean(a / 2)}`,
          `${G.clean(a / 2)} × 100 = ${G.clean(a * 50)}`
        ]
      };
    },

    multiplyBy125(a) {
      return {
        approach: "Use ×125 = ×1000 ÷8.",
        trick: "×125 = ×1000 ÷ 8.",
        steps: [
          `125 = 1000 ÷ 8`,
          `${a} ÷ 8 = ${G.clean(a / 8)}`,
          `${G.clean(a / 8)} × 1000 = ${G.clean(a * 125)}`
        ]
      };
    },

    multiplyBy9(a) {
      return {
        approach: "Multiply by 10, then subtract the original number.",
        trick: "×9 = ×10 − ×1.",
        steps: [
          `${a} × 10 = ${a * 10}`,
          `${a * 10} − ${a} = ${a * 9}`
        ]
      };
    },

    multiplyBy11(a) {
      return {
        approach: "Multiply by 10 and add the original number.",
        trick: "×11 = ×10 + ×1.",
        steps: [
          `${a} × 10 = ${a * 10}`,
          `${a * 10} + ${a} = ${a * 11}`
        ]
      };
    },

    multiplyBy15(a) {
      return {
        approach: "Use 15 = 10 + 5.",
        trick: "×15 = ×10 + half of the number.",
        steps: [
          `${a} × 10 = ${a * 10}`,
          `${a} ÷ 2 = ${G.clean(a / 2)}`,
          `${a * 10} + ${G.clean(a / 2)} = ${G.clean(a * 15)}`
        ]
      };
    },

    multiplyBy99(a) {
      return {
        approach: "Use 99 as 100 − 1.",
        trick: "×99 = ×100 − original.",
        steps: [
          `${a} × 100 = ${a * 100}`,
          `${a * 100} − ${a} = ${a * 99}`
        ]
      };
    },

    subtractCompensation(a, b) {
      const rounded = Math.ceil(b / 10) * 10;
      const addBack = rounded - b;
      return {
        approach: "Round the number being subtracted, then compensate.",
        trick: `${b} = ${rounded} − ${addBack}.`,
        steps: [
          `${a} − ${rounded} = ${a - rounded}`,
          `${a - rounded} + ${addBack} = ${a - b}`
        ]
      };
    },

    percentage(p, base) {
      const map = {
        12.5: "1/8",
        20: "1/5",
        25: "1/4",
        30: "3/10",
        37.5: "3/8",
        40: "2/5",
        50: "1/2",
        60: "3/5",
        62.5: "5/8",
        75: "3/4",
        80: "4/5"
      };
      const f = map[p] || G.percentageFraction(p);
      return {
        approach: `${p}% is easier as ${f}; avoid decimal multiplication.`,
        trick: `${p}% = ${f}.`,
        steps: [
          `${p}% of ${base} = ${f} × ${base}`,
          `= ${G.clean((p / 100) * base)}`
        ]
      };
    }
  };

  // =========================================================
  // SIMPLIFICATION
  // =========================================================
  function simplification() {
    const pattern = G.rnd(1, 10);

    for (let attempt = 0; attempt < 80; attempt++) {
      let q;

      // 1: Mixed fractions + missing value
      if (pattern === 1) {
        const d1 = G.pick([2, 3, 4, 5, 6, 8]);
        const d2 = G.pick([2, 3, 4, 6, 8]);
        const w1 = G.rnd(2, 7), w2 = G.rnd(2, 7);
        const n1 = G.rnd(1, d1 - 1), n2 = G.rnd(1, d2 - 1);
        const f1 = n1 / d1, f2 = n2 / d2;
        const target = G.rnd(w1 + w2 + 2, w1 + w2 + 6);
        const ans = target - (w1 + f1 + w2 + f2);

        if (ans <= 0) continue;

        const l = G.lcm(d1, d2);
        const totalFrac = Math.round(ans * l);
        const af = G.frac(totalFrac, l);

        q = {
          type: "Simplification",
          question: `${w1} ${n1}/${d1} + ${w2} ${n2}/${d2} + ? = ${target}`,
          answer: G.mixedStr(af.n, af.d),
          meta: { pattern: "mixed-fraction-missing" },
          solution: {
            approach: "Separate the whole parts first; then handle the fractional remainder.",
            trick: `Use denominator LCM ${l}.`,
            steps: [
              `${target} − ${w1} − ${w2} = ${target - w1 - w2}`,
              `Subtract ${n1}/${d1} + ${n2}/${d2}`,
              `Missing value = ${G.mixedStr(af.n, af.d)}`
            ]
          }
        };
      }

      // 2: Decimal/division/square
      else if (pattern === 2) {
        const divisor = G.pick([1.5, 2.5, 3.5, 4.5, 5.5]);
        const quotient = G.rnd(8, 16);
        const dividend = divisor * quotient;
        const s = G.rnd(8, 14);
        const d = G.pick([12, 14, 16, 18, 20]);
        const e = G.rnd(8, 20);
        const term = d * e;
        const ans = quotient + s * s - term / d;

        q = {
          type: "Simplification",
          question: `${G.clean(dividend)} ÷ ${divisor} + ${s}² − ${term} ÷ ${d} = ?`,
          answer: G.clean(ans),
          meta: { pattern: "decimal-square-division" },
          solution: {
            approach: "Clear the easy division first, then use the known square.",
            trick: "Treat 1.5, 2.5, etc. as fractions rather than long decimals.",
            steps: [
              `${G.clean(dividend)} ÷ ${divisor} = ${quotient}`,
              `${s}² = ${s * s}`,
              `${term} ÷ ${d} = ${e}`,
              `Answer = ${G.clean(ans)}`
            ]
          }
        };
      }

      // 3: ?% + square
      else if (pattern === 3) {
        const p = G.pick([20, 25, 30, 40, 50, 60, 75, 80]);
        const base = G.pick([160, 180, 200, 240, 280, 320, 360, 400]);
        const sq = G.rnd(12, 20);
        const pv = p * base / 100;
        const b = sq * sq - pv;
        if (!G.isInt(b) || b <= 0) continue;

        q = {
          type: "Simplification",
          question: `?% of ${base} + ${b} = ${sq}²`,
          answer: String(p),
          meta: { pattern: "percentage-missing-square" },
          solution: {
            approach: `Calculate ${sq}² first; the remainder is the percentage part.`,
            trick: `${p}% = ${G.percentageFraction(p)}.`,
            steps: [
              `${sq}² = ${sq * sq}`,
              `${sq * sq} − ${b} = ${G.clean(pv)}`,
              `${G.clean(pv)} ÷ ${base} = ${p}%`
            ]
          }
        };
      }

      // 4: Percentage inside a bracket
      else if (pattern === 4) {
        const p = G.pick([20, 25, 40, 50, 60, 75]);
        const a = G.pick([240, 280, 320, 360, 400, 480, 540]);
        const d = G.pick([4, 5, 6, 8]);
        const mult = G.pick([0.5, 1.5, 2, 2.5]);
        const inner = a / d;
        if (!G.isInt(inner) || !G.isInt((p / 100) * inner * mult)) continue;

        const ans = (p / 100) * inner * mult;
        q = {
          type: "Simplification",
          question: `${p}% of (${a} ÷ ${d}) × ${mult} = ?`,
          answer: G.clean(ans),
          meta: { pattern: "percentage-bracket-multiplier" },
          solution: {
            approach: "Finish the bracket first; then use the percentage fraction.",
            trick: `${p}% = ${G.percentageFraction(p)}.`,
            steps: [
              `${a} ÷ ${d} = ${G.clean(inner)}`,
              `${p}% of ${G.clean(inner)} = ${G.clean((p / 100) * inner)}`,
              `× ${mult} = ${G.clean(ans)}`
            ]
          }
        };
      }

      // 5: Root + multiplication + division
      else if (pattern === 5) {
        const root = G.pick([24, 26, 28, 30, 32]);
        const sq = root * root;
        const add = G.rnd(15, 45);
        const mult = G.pick([18, 20, 21, 24, 25, 28]);
        const div = G.pick([6, 7, 8, 9, 10, 12]);
        const raw = (root + add) * mult / div;
        if (!G.isInt(raw)) continue;

        q = {
          type: "Simplification",
          question: `{(√${sq} + ${add}) × ${mult}} ÷ ${div} = ?`,
          answer: G.clean(raw),
          meta: { pattern: "root-multiply-divide" },
          solution: {
            approach: `Recognise √${sq} immediately, then cancel before multiplying.`,
            trick: `√${sq} = ${root}. Look for cancellation between ${mult} and ${div}.`,
            steps: [
              `√${sq} = ${root}`,
              `${root} + ${add} = ${root + add}`,
              `(${root + add} × ${mult}) ÷ ${div} = ${G.clean(raw)}`
            ]
          }
        };
      }

      // 6: decimal squares
      else if (pattern === 6) {
        const a = G.rnd(3, 9);
        const b = G.rnd(2, 6);
        if (a === b) continue;
        const target = G.pick([40, 50, 60, 80, 100]);
        const inside = (a * a + b * b) / 100;
        const ans = inside * target;

        q = {
          type: "Simplification",
          question: `? ÷ [(0.${a})² + (0.${b})²] = ${target}`,
          answer: G.clean(ans),
          meta: { pattern: "decimal-square-bracket" },
          solution: {
            approach: "Square the digits and keep the denominator 100 visible.",
            trick: `(0.a)² = a²/100.`,
            steps: [
              `(0.${a})² = ${a * a}/100`,
              `(0.${b})² = ${b * b}/100`,
              `Bracket = ${G.clean(inside)}`,
              `? = ${G.clean(inside)} × ${target} = ${G.clean(ans)}`
            ]
          }
        };
      }

      // 7: index law
      else if (pattern === 7) {
        const e16 = G.rnd(2, 4);
        const e4 = G.rnd(2, 5);
        const e64 = G.rnd(2, 3);
        const power = 2 * e16 + e4 - 3 * e64;
        if (power < 1 || power > 8) continue;

        q = {
          type: "Simplification",
          question: `(16^${e16} × 4^${e4}) ÷ 64^${e64} = 4^?`,
          answer: String(power),
          meta: { pattern: "index-law" },
          solution: {
            approach: "Put every number on base 4.",
            trick: `16 = 4² and 64 = 4³.`,
            steps: [
              `16^${e16} = 4^${2 * e16}`,
              `64^${e64} = 4^${3 * e64}`,
              `Power = ${2 * e16} + ${e4} − ${3 * e64} = ${power}`
            ]
          }
        };
      }

      // 8: decimal cancellation
      else if (pattern === 8) {
        const a = G.rnd(120, 240);
        const b = G.rnd(80, 180);
        const q1 = `${a}.27`;
        const q2 = `${b}.13`;
        const c = G.rnd(20, 60);
        const ans = a + b - c + 0.40;

        q = {
          type: "Simplification",
          question: `${q1} + ${q2} − ${c}.40 = ?`,
          answer: G.clean(ans),
          meta: { pattern: "decimal-cancellation" },
          solution: {
            approach: "Notice that .27 + .13 = .40; the decimal parts cancel.",
            trick: ".27 + .13 − .40 = 0.",
            steps: [
              `.27 + .13 = .40`,
              `.40 − .40 = 0`,
              `Answer = ${a} + ${b} − ${c} = ${a + b - c}`
            ]
          }
        };
      }

      // 9: multiply by familiar number + percentage
      else if (pattern === 9) {
        const mult = G.pick([5, 9, 11, 15, 25, 50, 99, 125]);
        const a = G.pick([16, 24, 32, 40, 48, 64, 72, 96]);
        const p = G.pick([12.5, 25, 37.5, 50, 62.5, 75]);
        const base = G.pick([160, 240, 320, 400, 480, 640]);
        const ans = a * mult + (p / 100) * base;
        if (!G.isInt(ans)) continue;

        let t;
        if (mult === 5) t = Tricks.multiplyBy5(a);
        else if (mult === 9) t = Tricks.multiplyBy9(a);
        else if (mult === 11) t = Tricks.multiplyBy11(a);
        else if (mult === 15) t = Tricks.multiplyBy15(a);
        else if (mult === 25) t = Tricks.multiplyBy25(a);
        else if (mult === 50) t = Tricks.multiplyBy50(a);
        else if (mult === 125) t = Tricks.multiplyBy125(a);
        else if (mult === 99) t = Tricks.multiplyBy99(a);

        const pt = Tricks.percentage(p, base);
        q = {
          type: "Simplification",
          question: `${a} × ${mult} + ${p}% of ${base} = ?`,
          answer: G.clean(ans),
          meta: { pattern: "familiar-multiplier-percentage" },
          solution: {
            approach: `${t.approach} Then convert ${p}% to a familiar fraction.`,
            trick: `${t.trick} ${pt.trick}`,
            steps: [
              ...t.steps,
              `${p}% of ${base} = ${G.clean((p / 100) * base)}`,
              `Total = ${G.clean(ans)}`
            ]
          }
        };
      }

      // 10: chained missing-value equation
      else {
        const p = G.pick([20, 25, 40, 50, 60, 75]);
        const base = G.pick([180, 240, 300, 360, 420, 480]);
        const d = G.pick([12, 15, 18, 20]);
        const quotient = G.rnd(8, 15);
        const total = d * quotient;
        const pv = p * base / 100;
        const miss = total - pv;
        if (miss <= 0 || !G.isInt(miss)) continue;

        q = {
          type: "Simplification",
          question: `(${p}% of ${base} + ?) ÷ ${d} = ${quotient}`,
          answer: G.clean(miss),
          meta: { pattern: "percentage-missing-dividend" },
          solution: {
            approach: "Work backwards from the division.",
            trick: `Multiply ${quotient} by ${d} first.`,
            steps: [
              `${quotient} × ${d} = ${total}`,
              `${p}% of ${base} = ${G.clean(pv)}`,
              `? = ${total} − ${G.clean(pv)} = ${G.clean(miss)}`
            ]
          }
        };
      }

      if (q && G.accept(q)) return q;
    }

    throw new Error("Could not generate a unique simplification question.");
  }

  // =========================================================
  // APPROXIMATION
  // =========================================================
  function approximation() {
    for (let attempt = 0; attempt < 100; attempt++) {
      const pattern = G.rnd(1, 5);
      let q;

      if (pattern === 1) {
        // Rounded decimal arithmetic
        const a = G.rnd(120, 980) + G.pick([0.12, 0.18, 0.24, 0.37, 0.49]);
        const b = G.rnd(80, 700) + G.pick([0.11, 0.21, 0.29, 0.42]);
        const c = G.rnd(10, 90) + G.pick([0.2, 0.4, 0.6, 0.8]);
        const approx = Math.round(a) + Math.round(b) - Math.round(c);

        q = {
          type: "Approximation",
          question: `${a.toFixed(2)} + ${b.toFixed(2)} − ${c.toFixed(1)} ≈ ?`,
          answer: String(approx),
          meta: { pattern: "rounding-arithmetic" },
          solution: {
            approach: "Round each value to the nearest convenient integer.",
            trick: "Use nearby integers; do not calculate the exact decimals.",
            steps: [
              `${a.toFixed(2)} ≈ ${Math.round(a)}`,
              `${b.toFixed(2)} ≈ ${Math.round(b)}`,
              `${c.toFixed(1)} ≈ ${Math.round(c)}`,
              `Answer ≈ ${approx}`
            ]
          }
        };
      }

      else if (pattern === 2) {
        const a = G.rnd(180, 900) + G.pick([0.1, 0.2, 0.4, 0.7]);
        const b = G.rnd(12, 38) + G.pick([0.1, 0.2, 0.3]);
        const approx = Math.round(a) * Math.round(b);

        q = {
          type: "Approximation",
          question: `${a.toFixed(1)} × ${b.toFixed(1)} ≈ ?`,
          answer: String(approx),
          meta: { pattern: "rounding-multiplication" },
          solution: {
            approach: "Round both factors to nearby whole numbers.",
            trick: `${a.toFixed(1)} ≈ ${Math.round(a)}, ${b.toFixed(1)} ≈ ${Math.round(b)}.`,
            steps: [
              `${a.toFixed(1)} ≈ ${Math.round(a)}`,
              `${b.toFixed(1)} ≈ ${Math.round(b)}`,
              `${Math.round(a)} × ${Math.round(b)} = ${approx}`
            ]
          }
        };
      }

      else if (pattern === 3) {
        const a = G.rnd(400, 950) + 0.2;
        const b = G.rnd(15, 39) + 0.4;
        const d = G.pick([4, 5, 8, 10, 20]);
        const approx = Math.round(a) / Math.round(b) + d;
        const answer = Math.round(approx);

        q = {
          type: "Approximation",
          question: `${a.toFixed(1)} ÷ ${b.toFixed(1)} + ${d} ≈ ?`,
          answer: String(answer),
          meta: { pattern: "rounding-division" },
          solution: {
            approach: "Round the divisor and dividend to easy nearby values.",
            trick: "Choose values that divide mentally.",
            steps: [
              `${a.toFixed(1)} ≈ ${Math.round(a)}`,
              `${b.toFixed(1)} ≈ ${Math.round(b)}`,
              `${Math.round(a)} ÷ ${Math.round(b)} + ${d} ≈ ${answer}`
            ]
          }
        };
      }

      else if (pattern === 4) {
        const p = G.pick([24.8, 31.2, 39.7, 49.6, 61.4, 74.8]);
        const base = G.rnd(180, 700) + G.pick([0.2, 0.5, 0.8]);
        const approx = Math.round(p) * Math.round(base) / 100;

        q = {
          type: "Approximation",
          question: `${p.toFixed(1)}% of ${base.toFixed(1)} ≈ ?`,
          answer: String(Math.round(approx)),
          meta: { pattern: "percentage-approximation" },
          solution: {
            approach: "Round the percentage and base before multiplying.",
            trick: `${p.toFixed(1)}% ≈ ${Math.round(p)}%.`,
            steps: [
              `${p.toFixed(1)}% ≈ ${Math.round(p)}%`,
              `${base.toFixed(1)} ≈ ${Math.round(base)}`,
              `${Math.round(p)}% of ${Math.round(base)} ≈ ${Math.round(approx)}`
            ]
          }
        };
      }

      else {
        const a = G.rnd(120, 900);
        const b = G.rnd(12, 40);
        const c = G.rnd(100, 800);
        const d = G.rnd(10, 35);
        const approx = Math.round(a / b) + Math.round(c / d);

        q = {
          type: "Approximation",
          question: `${a} ÷ ${b} + ${c} ÷ ${d} ≈ ?`,
          answer: String(approx),
          meta: { pattern: "two-division-approximation" },
          solution: {
            approach: "Estimate each division separately using nearby easy values.",
            trick: "Do not chase exact quotients.",
            steps: [
              `${a} ÷ ${b} ≈ ${Math.round(a / b)}`,
              `${c} ÷ ${d} ≈ ${Math.round(c / d)}`,
              `Total ≈ ${approx}`
            ]
          }
        };
      }

      if (G.accept(q)) return q;
    }
    throw new Error("Could not generate a unique approximation question.");
  }

  // =========================================================
  // QUADRATIC EQUATIONS
  // =========================================================

  // Build a monic quadratic from integer roots.
  function quadraticFromRoots(r1, r2, variable) {
    const b = -(r1 + r2);
    const c = r1 * r2;
    const bPart = b === 0 ? "" : `${b > 0 ? "+" : "−"} ${Math.abs(b)}${variable}`;
    const cPart = c === 0 ? "" : ` ${c > 0 ? "+" : "−"} ${Math.abs(c)}`;
    return `${variable}² ${bPart}${cPart} = 0`;
  }

  function relationFromRootSets(xRoots, yRoots) {
    const all = [];
    for (const x of xRoots) for (const y of yRoots) {
      if (x > y) all.push(">");
      else if (x < y) all.push("<");
      else all.push("=");
    }

    const set = new Set(all);
    if (set.size === 1) {
      const r = [...set][0];
      return r === ">" ? "x > y" : r === "<" ? "x < y" : "x = y";
    }

    // Exam convention: if every possible comparison supports >= / <=,
    // retain that relation; otherwise use cannot be determined.
    if (![...set].includes("<")) return "x ≥ y";
    if (![...set].includes(">")) return "x ≤ y";
    return "x = y or relationship cannot be determined";
  }

  function quadratic() {
    for (let attempt = 0; attempt < 150; attempt++) {
      const pattern = G.rnd(1, 9);
      let q;

      // 1: Classic two-equation comparison
      if (pattern === 1) {
        const xr = G.shuffle([G.rnd(2, 18), G.rnd(2, 18)]).sort((a,b)=>a-b);
        const yr = G.shuffle([G.rnd(2, 18), G.rnd(2, 18)]).sort((a,b)=>a-b);
        if (xr[0] === xr[1] || yr[0] === yr[1]) continue;

        const rel = relationFromRootSets(xr, yr);

        q = {
          type: "Quadratic Equations",
          question: `I. ${quadraticFromRoots(xr[0], xr[1], "x")}\nII. ${quadraticFromRoots(yr[0], yr[1], "y")}\nCompare x and y.`,
          answer: rel,
          meta: { pattern: "two-equation-root-comparison", rootsX: xr, rootsY: yr },
          solution: {
            approach: "Factor both equations and compare the possible roots.",
            trick: "Factor directly; never assume the positive root is the only root.",
            steps: [
              `x-roots: ${xr[0]}, ${xr[1]}`,
              `y-roots: ${yr[0]}, ${yr[1]}`,
              `Required relationship: ${rel}`
            ]
          }
        };
      }

      // 2: Different leading coefficients
      else if (pattern === 2) {
        const xr = [G.rnd(2, 18), G.rnd(2, 18)];
        const yr = [G.rnd(2, 18), G.rnd(2, 18)];
        if (xr[0] === xr[1] || yr[0] === yr[1]) continue;

        const ax = G.pick([2, 3, 4, 5]);
        const ay = G.pick([2, 3, 4, 5]);
        const rel = relationFromRootSets(xr, yr);

        const xb = -ax * (xr[0] + xr[1]);
        const xc = ax * xr[0] * xr[1];
        const yb = -ay * (yr[0] + yr[1]);
        const yc = ay * yr[0] * yr[1];

        q = {
          type: "Quadratic Equations",
          question: `I. ${ax}x² ${xb >= 0 ? "+" : "−"} ${Math.abs(xb)}x ${xc >= 0 ? "+" : "−"} ${Math.abs(xc)} = 0\nII. ${ay}y² ${yb >= 0 ? "+" : "−"} ${Math.abs(yb)}y ${yc >= 0 ? "+" : "−"} ${Math.abs(yc)} = 0\nCompare x and y.`,
          answer: rel,
          meta: { pattern: "non-monic-comparison" },
          solution: {
            approach: "Factor after taking out the leading coefficient structure.",
            trick: "The leading coefficient does not change the roots; compare the factor roots.",
            steps: [
              `x-roots: ${xr[0]}, ${xr[1]}`,
              `y-roots: ${yr[0]}, ${yr[1]}`,
              `Relationship: ${rel}`
            ]
          }
        };
      }

      // 3: Rearranged form
      else if (pattern === 3) {
        const xr = [G.rnd(2, 18), G.rnd(2, 18)];
        const yr = [G.rnd(2, 18), G.rnd(2, 18)];
        if (xr[0] === xr[1] || yr[0] === yr[1]) continue;

        const xb = -(xr[0] + xr[1]);
        const xc = xr[0] * xr[1];
        const yb = -(yr[0] + yr[1]);
        const yc = yr[0] * yr[1];
        const rel = relationFromRootSets(xr, yr);

        q = {
          type: "Quadratic Equations",
          question: `I. x² ${xb >= 0 ? "+" : "−"} ${Math.abs(xb)}x ${xc >= 0 ? "+" : "−"} ${Math.abs(xc)} = 0\nII. y² ${yb >= 0 ? "+" : "−"} ${Math.abs(yb)}y = ${-yc}\nCompare x and y.`,
          answer: rel,
          meta: { pattern: "rearranged-second-equation" },
          solution: {
            approach: "Bring both equations to zero before factoring.",
            trick: "Do not solve until the two equations are in the same standard form.",
            steps: [
              `x-roots: ${xr[0]}, ${xr[1]}`,
              `y-roots: ${yr[0]}, ${yr[1]}`,
              `Relationship: ${rel}`
            ]
          }
        };
      }

      // 4: One equation as a square-root form
      else if (pattern === 4) {
        const xRoot = G.pick([2, 3, 4, 5, 6, 7, 8, 9]);
        const yRoots = [G.rnd(1, 10), G.rnd(1, 10)];
        if (yRoots[0] === yRoots[1]) continue;

        const xEq = `x² = ${xRoot * xRoot}`;
        const yEq = quadraticFromRoots(yRoots[0], yRoots[1], "y");
        const rel = relationFromRootSets([-xRoot, xRoot], yRoots);

        q = {
          type: "Quadratic Equations",
          question: `I. ${xEq}\nII. ${yEq}\nCompare x and y.`,
          answer: rel,
          meta: { pattern: "square-root-comparison" },
          solution: {
            approach: "Remember that x² = k gives two possible roots, ±√k.",
            trick: `x = ±${xRoot}; do not discard the negative root.`,
            steps: [
              `x = ${xRoot} or −${xRoot}`,
              `y-roots: ${yRoots[0]}, ${yRoots[1]}`,
              `Relationship: ${rel}`
            ]
          }
        };
      }

      // 5: Same roots / equal relationship
      else if (pattern === 5) {
        const r1 = G.rnd(2, 12);
        const r2 = G.rnd(2, 12);
        if (r1 === r2) continue;

        q = {
          type: "Quadratic Equations",
          question: `I. ${quadraticFromRoots(r1, r2, "x")}\nII. ${quadraticFromRoots(r1, r2, "y")}\nCompare x and y.`,
          answer: "x = y",
          meta: { pattern: "identical-root-set" },
          solution: {
            approach: "Factor both equations and compare their root sets.",
            trick: "Identical factors mean identical roots.",
            steps: [
              `x-roots: ${r1}, ${r2}`,
              `y-roots: ${r1}, ${r2}`,
              `Therefore x = y`
            ]
          }
        };
      }

      // 6: One-root / coefficient question
      else if (pattern === 6) {
        const known = G.pick([1.5, 2, 2.5, 3, 4]);
        const other = G.pick([-6, -4, 5, 6, 8, 9]);
        const c = known * other;
        if (!G.isInt(c)) continue;
        const m = -(known + other);

        q = {
          type: "Quadratic Equations",
          question: `One root of x² ${m >= 0 ? "+" : "−"} ${Math.abs(m)}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)} = 0 is ${known}. Find the other root.`,
          answer: G.clean(other),
          meta: { pattern: "known-one-root" },
          solution: {
            approach: "Use product of roots = constant term for a monic equation.",
            trick: `αβ = ${G.clean(c)}; divide by the known root.`,
            steps: [
              `Product of roots = ${G.clean(c)}`,
              `Other root = ${G.clean(c)} ÷ ${known}`,
              `= ${G.clean(other)}`
            ]
          }
        };
      }

      // 7: Equal roots / discriminant
      else if (pattern === 7) {
        const a = G.pick([1, 2, 3, 4]);
        const r = G.rnd(2, 12);
        const b = -2 * a * r;
        const c = a * r * r;

        q = {
          type: "Quadratic Equations",
          question: `For what value of k will ${a}x² ${b >= 0 ? "+" : "−"} ${Math.abs(b)}x + k = 0 have equal roots?`,
          answer: String(c),
          meta: { pattern: "equal-roots" },
          solution: {
            approach: "Equal roots mean discriminant = 0.",
            trick: "Set b² − 4ac = 0.",
            steps: [
              `${b}² − 4(${a})k = 0`,
              `${b * b} = ${4 * a}k`,
              `k = ${c}`
            ]
          }
        };
      }

      // 8: Sum/product expression
      else if (pattern === 8) {
        const r1 = G.rnd(2, 10);
        const r2 = G.rnd(2, 10);
        if (r1 === r2) continue;
        const sum = r1 + r2;
        const product = r1 * r2;
        const expression = sum * sum - 2 * product;

        q = {
          type: "Quadratic Equations",
          question: `If α and β are roots of x² − ${sum}x + ${product} = 0, find α² + β².`,
          answer: String(expression),
          meta: { pattern: "root-expression" },
          solution: {
            approach: "Use α² + β² = (α + β)² − 2αβ.",
            trick: `α + β = ${sum}, αβ = ${product}.`,
            steps: [
              `α + β = ${sum}`,
              `αβ = ${product}`,
              `α² + β² = ${sum}² − 2(${product}) = ${expression}`
            ]
          }
        };
      }

      // 9: Deliberate "cannot determine" comparison
      else {
        const x1 = G.rnd(2, 7);
        const x2 = G.rnd(8, 14);
        const y1 = G.rnd(3, 7);
        const y2 = G.rnd(9, 14);

        // Make overlap: one x root can be above one y root and below another.
        const rel = relationFromRootSets([x1, x2], [y1, y2]);
        if (rel !== "x = y or relationship cannot be determined") continue;

        q = {
          type: "Quadratic Equations",
          question: `I. ${quadraticFromRoots(x1, x2, "x")}\nII. ${quadraticFromRoots(y1, y2, "y")}\nCompare x and y.`,
          answer: rel,
          meta: { pattern: "cannot-determine-comparison" },
          solution: {
            approach: "Check every possible root pair; one pair cannot support a fixed relation.",
            trick: "Never compare only the larger roots.",
            steps: [
              `x-roots: ${x1}, ${x2}`,
              `y-roots: ${y1}, ${y2}`,
              `Both greater and smaller comparisons are possible → cannot determine`
            ]
          }
        };
      }

      if (q && G.accept(q)) return q;
    }

    throw new Error("Could not generate a unique quadratic question.");
  }

  // =========================================================
  // NUMBER SERIES ENGINE
  // =========================================================
  function buildSeries() {
    const type = G.rnd(1, 10);

    // All returned objects contain a full correct series.
    if (type === 1) {
      // Multiplication + changing addition/subtraction
      const start = G.rnd(4, 18);
      const k = G.pick([2, 3]);
      const signs = G.chance(0.5) ? 1 : -1;
      const step = G.pick([1, 2, 3]);
      const s = [start];
      let cur = start;
      for (let i = 1; i < 6; i++) {
        cur = cur * k + signs * i * step;
        s.push(cur);
      }
      return {
        series: s,
        explanation: `×${k}, then add/subtract consecutive multiples of ${step}.`,
        pattern: "multiplication-changing-adjustment"
      };
    }

    if (type === 2) {
      // ×2, ×3, ×4 style
      const start = G.rnd(3, 12);
      const add = G.pick([0, 1, 2]);
      const s = [start];
      let cur = start;
      for (let i = 2; i <= 6; i++) {
        cur = cur * i + add;
        s.push(cur);
      }
      return {
        series: s,
        explanation: `Multiply successively by 2, 3, 4, 5, 6${add ? ` and add ${add}` : ""}.`,
        pattern: "successive-multipliers"
      };
    }

    if (type === 3) {
      // Alternating × and ±
      const start = G.rnd(8, 30);
      const s = [start];
      let cur = start;
      const mults = [2, 2, 3, 2, 3];
      const adds = [3, -2, 4, -3, 5];
      for (let i = 0; i < 5; i++) {
        cur = cur * mults[i] + adds[i];
        s.push(cur);
      }
      return {
        series: s,
        explanation: "Alternating multiplication with small changing adjustments.",
        pattern: "alternating-multiplication-adjustment"
      };
    }

    if (type === 4) {
      // Differences increasing by a constant
      const start = G.rnd(10, 50);
      const d = G.rnd(3, 12);
      const dd = G.pick([2, 3, 4, 5]);
      const s = [start];
      let cur = start;
      let diff = d;
      for (let i = 0; i < 5; i++) {
        cur += diff;
        s.push(cur);
        diff += dd;
      }
      return {
        series: s,
        explanation: `First differences increase by ${dd} each time.`,
        pattern: "second-difference"
      };
    }

    if (type === 5) {
      // Squares/cubes in differences
      const start = G.rnd(20, 80);
      const cube = G.chance(0.5);
      const s = [start];
      let cur = start;
      for (let i = 1; i <= 5; i++) {
        cur += cube ? i ** 3 : (i + 2) ** 2;
        s.push(cur);
      }
      return {
        series: s,
        explanation: cube
          ? "Successive differences are 1³, 2³, 3³, 4³, 5³."
          : "Successive differences are 3², 4², 5², 6², 7².",
        pattern: cube ? "cube-differences" : "square-differences"
      };
    }

    if (type === 6) {
      // Decimal multiplier pattern
      const start = G.pick([16, 24, 32, 40, 48, 64]);
      const factors = G.chance(0.5)
        ? [0.5, 1, 1.5, 2, 2.5]
        : [1.5, 2, 2.5, 3, 3.5];
      const s = [start];
      let cur = start;
      for (const f of factors) {
        cur *= f;
        s.push(cur);
      }
      return {
        series: s,
        explanation: `Multipliers move in steps of 0.5: ${factors.map(x => `×${x}`).join(", ")}.`,
        pattern: "decimal-multipliers"
      };
    }

    if (type === 7) {
      // Divide/multiply alternating
      const start = G.pick([48, 72, 96, 120, 144]);
      const s = [start];
      let cur = start;
      const ops = [[2, "+"], [3, "-"], [2, "+"], [4, "-"], [3, "+"]];
      for (let i = 0; i < ops.length; i++) {
        const [n, op] = ops[i];
        if (i === 0) cur = cur / n;
        else if (op === "+") cur = cur * n + (i + 1);
        else cur = cur * n - (i + 1);
        s.push(cur);
      }
      if (s.some(v => !G.isInt(v))) return buildSeries();
      return {
        series: s,
        explanation: "Alternating division/multiplication with a small adjustment.",
        pattern: "mixed-operations"
      };
    }

    if (type === 8) {
      // Prime differences
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
      const startIndex = G.rnd(0, 2);
      const start = G.rnd(20, 70);
      const s = [start];
      let cur = start;
      for (let i = 0; i < 5; i++) {
        cur += primes[startIndex + i];
        s.push(cur);
      }
      return {
        series: s,
        explanation: "Differences are consecutive prime numbers.",
        pattern: "prime-differences"
      };
    }

    if (type === 9) {
      // Alternate sequences
      const a = G.rnd(5, 20);
      const b = G.rnd(30, 60);
      const s = [a, b];
      let x = a, y = b;
      for (let i = 0; i < 3; i++) {
        x = x + G.pick([4, 6, 8]);
        y = y - G.pick([3, 5, 7]);
        s.push(x, y);
      }
      return {
        series: s.slice(0, 7),
        explanation: "Separate odd and even positions into two simpler sequences.",
        pattern: "alternate-series"
      };
    }

    // 10: Difference ×/± hybrid
    const start = G.rnd(10, 40);
    const s = [start];
    let cur = start;
    const factors = [2, 3, 2, 4, 3];
    const adds = [1, 2, -3, 4, -5];
    for (let i = 0; i < 5; i++) {
      cur = cur * factors[i] + adds[i];
      s.push(cur);
    }
    return {
      series: s,
      explanation: "Changing multiplication factors with small alternating adjustments.",
      pattern: "hybrid-multiplication"
    };
  }

  function missingNumberSeries() {
    for (let attempt = 0; attempt < 120; attempt++) {
      const data = buildSeries();
      const idx = G.rnd(2, 5);
      const answer = data.series[idx];
      const shown = [...data.series];
      shown[idx] = "?";

      const q = {
        type: "Missing Number Series",
        question: `Find the missing number:\n${shown.join(", ")}`,
        answer: String(answer),
        meta: { pattern: data.pattern, series: data.series },
        solution: {
          approach: "Check multiplication/division first; if that fails, inspect first differences and alternate positions.",
          trick: data.explanation,
          steps: [
            `Pattern: ${data.explanation}`,
            `Missing position = ${answer}`,
            `Answer = ${answer}`
          ]
        }
      };

      if (G.accept(q)) return q;
    }
    throw new Error("Could not generate a unique missing series.");
  }

  function wrongNumberSeries() {
    for (let attempt = 0; attempt < 120; attempt++) {
      const data = buildSeries();
      const idx = G.rnd(2, 5);
      const correct = data.series[idx];

      // Keep the injected wrong value plausible and non-negative.
      const offset = G.pick([-7, -5, -3, 3, 5, 7]);
      const wrong = correct + offset;
      if (wrong === correct || wrong < 0) continue;

      const shown = [...data.series];
      shown[idx] = wrong;

      const q = {
        type: "Wrong Number Series",
        question: `Find the wrong number:\n${shown.join(", ")}`,
        answer: String(wrong),
        meta: {
          pattern: data.pattern,
          original: data.series,
          wrongIndex: idx,
          correctValue: correct
        },
        solution: {
          approach: "Test the same pattern across every step; the broken term reveals itself.",
          trick: data.explanation,
          steps: [
            `Expected pattern: ${data.explanation}`,
            `At this position, expected ${correct} but got ${wrong}`,
            `Wrong number = ${wrong}`
          ]
        }
      };

      if (G.accept(q)) return q;
    }
    throw new Error("Could not generate a unique wrong series.");
  }

  // =========================================================
  // BLIND FOLD — MIXED MODERATE TEST
  // =========================================================
  function blindFold(count = 10) {
    const out = [];
    const local = new Set();
    const generators = [
      simplification,
      approximation,
      quadratic,
      missingNumberSeries,
      wrongNumberSeries
    ];

    // Balanced distribution, then shuffle.
    const plan = [];
    const base = Math.floor(count / generators.length);
    let remainder = count % generators.length;

    for (const gen of generators) {
      for (let i = 0; i < base; i++) plan.push(gen);
    }

    // Remainder favours the core bank-prelims topics.
    const priority = [simplification, quadratic, missingNumberSeries, wrongNumberSeries, approximation];
    let p = 0;
    while (remainder-- > 0) plan.push(priority[p++ % priority.length]);

    for (const gen of G.shuffle(plan)) {
      let q;
      let guard = 0;
      do {
        q = gen();
        guard++;
      } while (local.has(q.question) && guard < 20);

      if (!local.has(q.question)) {
        local.add(q.question);
        out.push(q);
      }
    }

    return {
      type: "Blind Fold",
      title: "Blind Fold",
      questions: out,
      distribution: out.reduce((m, q) => {
        m[q.type] = (m[q.type] || 0) + 1;
        return m;
      }, {})
    };
  }

  // =========================================================
  // PUBLIC API
  // =========================================================
  return {
    version: "Moderate-Exam-Generator-v1",

    resetHistory() {
      G.resetHistory();
    },

    generate(section) {
      switch (section) {
        case "simplification": return simplification();
        case "approximation": return approximation();
        case "quadratic": return quadratic();
        case "missing-series": return missingNumberSeries();
        case "wrong-series": return wrongNumberSeries();
        case "blind-fold": return blindFold();
        default:
          throw new Error(
            "Unknown section. Use: simplification, approximation, quadratic, missing-series, wrong-series, blind-fold"
          );
      }
    },

    generateSet(section, count = 10) {
      const result = [];
      let guard = 0;
      while (result.length < count && guard < count * 30) {
        guard++;
        const q = this.generate(section);
        if (!result.some(x => x.question === q.question)) result.push(q);
      }
      return result;
    },

    blindFold,

    // Expose only the useful public helpers.
    getSeenCount() {
      return G.seen.size;
    }
  };
})();

