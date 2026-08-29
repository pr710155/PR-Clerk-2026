const $=s=>document.querySelector(s);
const screen=$("#screen"),back=$("#back"),subtitle=$("#subtitle");
let S={view:"home",level:null,topic:null,qs:[],i:0,answers:[],qTimes:[],qStartedAt:0,start:0,end:0,limit:0,timer:null};

const levels=[
{id:1,name:"Easy",desc:"Calculation Foundation",topics:[
{id:"tables",name:"Tables",desc:"Choose any table from 6–30"},
{id:"squares",name:"Squares",desc:"1–60"},
{id:"cubes",name:"Cubes",desc:"1–30"},
{id:"percent",name:"Percentage Values",desc:"Percentage ↔ fraction"},
{id:"fractions",name:"Fractions",desc:"Basic fraction practice"},
{id:"number",name:"Number Games",desc:"Addition • Subtraction • Multiplication • Division"},
{id:"mixed",name:"Mixed Set",desc:"Surprise mix of all Easy sections"}]},
{id:2,name:"Moderate",desc:"Speed Maths",topics:[
 {id:"simplification",name:"Simplification",desc:"Clerk Prelims exam-style calculation"},
 {id:"approximation",name:"Approximation",desc:"Fast rounding and option-based calculation"},
 {id:"quadratic",name:"Quadratic Equations",desc:"Clerk Prelims exam-level equations"},
 {id:"missingSeries",name:"Missing Number Series",desc:"Clerk Prelims missing-term patterns"},
 {id:"wrongSeries",name:"Wrong Number Series",desc:"Clerk Prelims wrong-term patterns"},
 {id:"blindfold",name:"Blind Fold",desc:"Surprise mix of all Moderate sections"}]},
{id:3,name:"Hard",desc:"Advanced Exam Practice",topics:[
{id:"hardquad",name:"Advanced Quadratic Equations",desc:"Advanced root, power and relationship problems"},
{id:"hardmissing",name:"Advanced Missing Number Series",desc:"Multi-layer mains-level missing-term patterns"},
{id:"hardwrong",name:"Advanced Wrong Number Series",desc:"Q110-style wrong-term and relationship problems"}]}
];

const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,P=a=>a[R(0,a.length-1)],G=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a},F=(n,d)=>{let g=G(n,d);return`${n/g}/${d/g}`},sh=a=>a.sort(()=>Math.random()-.5);
function opts(ans,more=[]){let s=new Set([String(ans)]);more.forEach(x=>{if(x!==undefined)s.add(String(x))});let d=1;while(s.size<4){let n=Number(ans);s.add(Number.isFinite(n)?String(n+(d%2?-d:d)):String(d));d++}return sh([...s]).slice(0,4)}
function pctOpts(a){let x=["6.25","10","12.5","15","16.67","20","25","30","33.33","37.5","40","45","50","60","62.5","66.67","70","75","80","87.5","90"];return sh([a,...x.filter(v=>v!==a)]).slice(0,4)}
function fracOpts(a){let x=["1/2","1/3","1/4","1/5","1/6","1/8","1/10","3/4","2/3","3/5","4/5","5/8","7/8"];return sh([a,...x.filter(v=>v!==a)]).slice(0,4)}
function q(expr,ans,exp,skill,diff="Easy",options=null){return{expr,ans:String(ans),exp,skill,diff,options:options?options.map(String):null}}
function actualSolution(expr, ans, skill) {
  const e = String(expr).replace(/−/g,"-").replace(/×/g,"*").replace(/÷/g,"/").trim();
  const A = String(ans);
  let steps = [];

  // Percentage + arithmetic patterns: show the actual intermediate values.
  const pctRe = /(\d+(?:\.\d+)?)%\s*of\s*(\d+(?:\.\d+)?)/i;
  const pm = e.match(pctRe);
  if (pm) {
    const p = Number(pm[1]), base = Number(pm[2]), value = p * base / 100;
    const known = ({"12.5":"1/8","16.6666666667":"1/6","20":"1/5","25":"1/4","33.3333333333":"1/3","37.5":"3/8","40":"2/5","50":"1/2","60":"3/5","62.5":"5/8","66.6666666667":"2/3","75":"3/4","80":"4/5"})[String(p)];
    if (known) steps.push(`${p}% = ${known}`, `${base} × ${known} = ${fmtCalc(value)}`);
    else steps.push(`${p}% of ${base} = (${p}/100) × ${base} = ${fmtCalc(value)}`);
  }

  // Fraction + decimal inside brackets, then multiplication/division.
  const fd = e.match(/\(\s*(\d+)\/(\d+)\s*([+\-])\s*(0?\.\d+|\d+\.\d+)\s*\)\s*([*\/])\s*(\d+(?:\.\d+)?)/);
  if (fd) {
    const n=Number(fd[1]), d=Number(fd[2]), dec=Number(fd[4]), op=fd[3], outer=Number(fd[6]);
    const f=n/d, inner=op==='+'?f+dec:f-dec, result=fd[5]==='*'?inner*outer:inner/outer;
    steps=[`${n}/${d} = ${fmtCalc(f)}`,`${fmtCalc(f)} ${op} ${fmtCalc(dec)} = ${fmtCalc(inner)}`,`${fmtCalc(inner)} ${fd[5]==='*'?'×':'÷'} ${fmtCalc(outer)} = ${fmtCalc(result)}`];
  }

  // Simple percentage-free arithmetic with BODMAS. Split into useful intermediate terms.
  if (!steps.length && /^[0-9.()\s+\-*/]+$/.test(e)) {
    let t=e.replace(/\s+/g,'');
    // Resolve parenthesised two-term expressions first.
    const par=t.match(/^\(([-+]?\d+(?:\.\d+)?)\/([-+]?\d+(?:\.\d+)?)\s*([+\-])\s*([-+]?\d+(?:\.\d+)?)\)\s*([*\/])\s*([-+]?\d+(?:\.\d+)?)$/);
    if(par){
      const left=Number(par[1])/Number(par[2]), right=Number(par[4]);
      const inner=par[3]==='+'?left+right:left-right, out=par[5]==='*'?inner*Number(par[6]):inner/Number(par[6]);
      steps=[`${par[1]}/${par[2]} = ${fmtCalc(left)}`,`${fmtCalc(left)} ${par[3]} ${fmtCalc(right)} = ${fmtCalc(inner)}`,`${fmtCalc(inner)} ${par[5]==='*'?'×':'÷'} ${par[6]} = ${fmtCalc(out)}`];
    } else {
      // Handle a ×/÷ b +/− c style expression.
      const m=t.match(/^([-+]?\d+(?:\.\d+)?)([*\/])([-+]?\d+(?:\.\d+)?)([+\-])([-+]?\d+(?:\.\d+)?)$/);
      if(m){
        const first=m[2]==='*'?Number(m[1])*Number(m[3]):Number(m[1])/Number(m[3]);
        const out=m[4]==='+'?first+Number(m[5]):first-Number(m[5]);
        steps=[`${m[1]} ${m[2]==='*'?'×':'÷'} ${m[3]} = ${fmtCalc(first)}`,`${fmtCalc(first)} ${m[4]} ${m[5]} = ${fmtCalc(out)}`];
      }
    }
  }

  // Roots and powers: expose the actual value before continuing.
  const root = e.match(/√(\d+)/);
  if (root && !steps.length) {
    const n=Number(root[1]), r=Math.sqrt(n);
    steps.push(`√${n} = ${fmtCalc(r)}`);
  }
  const power = e.match(/(\d+)\^(\d+)|(?<![A-Za-z])(?:(\d+))²/);
  if (power && !steps.length) {
    const base=Number(power[1]||power[3]), ex=Number(power[2]||2), v=Math.pow(base,ex);
    steps.push(`${base}${ex===2?'²':'^'+ex} = ${fmtCalc(v)}`);
  }

  if (steps.length) steps.push(`Answer = ${A}.`);
  return steps;
}
function fmtCalc(n){ return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(6))); }

function coachFor(skill,expr,ans,exp){
 const k=skill||""; let m;
 const arithmetic = [];
 if(/[+]/.test(expr)) arithmetic.push(
  "Left-to-right pairing: combine numbers that make round tens/hundreds first.",
  "Make-a-round-number: move a small amount mentally (e.g. +19 = +20−1; +98 = +100−2).",
  "Compensation: add/subtract from a nearby base such as 100, 500 or 1000, then correct."
 );
 if(/[−-]/.test(expr)) arithmetic.push(
  "Compensation subtraction: subtract a nearby round number, then add back the difference (e.g. −98 = −100+2).",
  "Count-up method for close numbers: from the smaller number, jump to the larger using tens/hundreds and add the jumps.",
  "Split by place value when borrowing is unnecessary; avoid column subtraction when a round-number adjustment is faster."
 );
 if(/[×]/.test(expr)) arithmetic.push(
  "×5 = ×10 ÷2; ×25 = ×100 ÷4; ×50 = ×100 ÷2; ×125 = ×1000 ÷8.",
  "×9 = ×10−1×; ×11 = ×10+1×; ×19 = ×20−1×; ×99 = ×100−1×.",
  "Distributive method: split a factor into friendly parts, e.g. ×48 = ×(50−2).",
  "Near-base multiplication: for numbers near 100, use deviations from 100 instead of full multiplication.",
  "Double-and-half: halve one factor and double the other whenever it makes the multiplication easier."
 );
 if(/[÷]/.test(expr)) arithmetic.push(
  "Divide by 5 = ×2 ÷10; divide by 25 = ×4 ÷100; divide by 50 = ×2 ÷100; divide by 125 = ×8 ÷1000.",
  "For ÷9, ÷11, ÷99 and similar friendly divisors, use the matching multiplication/check relationship rather than long division.",
  "Cancel common factors before dividing; reduce the numbers first whenever possible.",
  "Use the quotient × divisor = dividend check to verify quickly."
 );
 if(k==="Simplification"){
  if(expr.includes("% of")) m={approach:"Convert the percentage to a familiar fraction, cancel first, then multiply only what remains.",shortcut:"50%=1/2, 25%=1/4, 75%=3/4, 20%=1/5, 12.5%=1/8, 33⅓%=1/3, 66⅔%=2/3. For awkward percentages, split them into familiar pieces (e.g. 18%=20%−2%).",steps:[exp,`Final answer: ${ans}.`],highlight:"Convert to a familiar fraction or split the percentage before multiplying."};
  else if(expr.includes("√")) m={approach:"Recognise perfect squares or bracket the number between two nearby squares.",shortcut:"Memorise squares 1–60. For a non-perfect square, compare with the nearest square instead of calculating the root from scratch.",steps:[exp,`Final answer: ${ans}.`],highlight:"Recognise the square pattern first—don't calculate the root from scratch."};
  else if(expr.includes("^")||expr.includes("²")) m={approach:"Use exponent patterns and familiar powers instead of repeated long multiplication.",shortcut:"a²=(a+d)(a−d)+d²; numbers ending in 5 square as (n×(n+1))25; use powers you already know.",steps:[exp,`Final answer: ${ans}.`],highlight:"Use a known power or identity before expanding."};
  else if(expr.includes("of")) m={approach:"Treat 'of' as multiplication and cancel before multiplying.",shortcut:"For a/b of N, divide N by b first if possible, then multiply by a. If cancellation is possible across factors, cancel it first.",steps:[exp,`Final answer: ${ans}.`],highlight:"Cancel first; multiply last."};
  else if(/[×]/.test(expr)) m={approach:"Apply BODMAS, then use the fastest multiplication pattern visible in the factors.",shortcut:arithmetic.slice(2).join(" "),steps:[exp,`Final answer: ${ans}.`],highlight:"Before multiplying, check for ×5/25/50/125, ×9/11/19/99, near-100 or double-and-half shortcuts."};
  else if(/[÷]/.test(expr)) m={approach:"Apply BODMAS, simplify the division first, and cancel common factors before calculating.",shortcut:arithmetic.slice(-4).join(" "),steps:[exp,`Final answer: ${ans}.`],highlight:"Simplify or cancel before dividing; use friendly-divisor shortcuts when available."};
  else if(/[+]/.test(expr)||/[−-]/.test(expr)) m={approach:"Apply BODMAS and look for compensation or round-number pairing before doing column arithmetic.",shortcut:arithmetic.slice(0,3).join(" "),steps:[exp,`Final answer: ${ans}.`],highlight:"Make round numbers first—compensation is usually faster than raw column arithmetic."};
  else m={approach:"Follow BODMAS and scan the expression once for cancellation, friendly numbers and distributive opportunities.",shortcut:"Don't calculate every part in the order written. First identify the operation that can be simplified mentally.",steps:[exp,`Final answer: ${ans}.`],highlight:"Scan once for a shortcut before starting the calculation."};
 } else if(k==="Approximation") m={approach:"Do not calculate exactly. Round to values that preserve the correct option range, then perform the simplest arithmetic.",shortcut:"Use 10/100/1000-friendly values; for multiplication/division choose rounding that makes the mental operation easy, then check which option range it lands in.",steps:[exp,`Final answer: ${ans}.`],highlight:"Round for easy arithmetic, then use the options to confirm the range."};
 else if(k==="Quadratic Equations") m={approach:"Use relationships between roots and factorisation instead of the quadratic formula whenever roots are designed to be simple.",shortcut:"For ax²+bx+c=0, use sum of roots = −b/a and product = c/a. If possible, divide by the common coefficient and factor by inspection.",steps:[exp,`Final answer: ${ans}.`],highlight:"Look for factorisation and root relationships before using any formula."};
 else m={approach:"Use the shortest mental route rather than full written calculation.",shortcut:"Scan for compensation, distributive multiplication, friendly divisors, cancellation and known percentage/fraction values before calculating normally.",steps:[exp,`Final answer: ${ans}.`],highlight:"Recognise the number pattern before starting a long calculation."};
 m.quickMethods=arithmetic.length?arithmetic:["Scan for cancellation before multiplying or dividing.","Use compensation with nearby round numbers when adding or subtracting.","Prefer distributive multiplication and friendly-divisor conversions over long arithmetic."];
 return m;
}
function mcq(expr,ans,exp,skill,more=[]){let z=q(expr,ans,exp,skill,"Moderate",opts(ans,more));z.coach=coachFor(skill,expr,String(ans),exp);return z}
function cleanNum(n){return Number.isInteger(n)?String(n):String(Number(n.toFixed(4)))}
function dec(n,d=2){return Number(n.toFixed(d))}

function table(n=R(6,30)){let b=R(2,20),x=n*b;return q(`${n} × ${b} = ?`,x,`${n} × ${b} = ${x}.`,`Table ${n}`)}
function square(){let n=R(1,60),x=n*n;return q(`${n}² = ?`,x,`${n} × ${n} = ${x}.`,"Squares")}
function cube(){let n=R(1,30),x=n*n*n;return q(`${n}³ = ?`,x,`${n} × ${n} × ${n} = ${x}.`,"Cubes")}
function percent(){
 let a=P([[1,2,"50"],[1,3,"33.33"],[1,4,"25"],[3,4,"75"],[1,5,"20"],[2,5,"40"],[3,5,"60"],[4,5,"80"],[1,6,"16.67"],[5,6,"83.33"],[1,8,"12.5"],[3,8,"37.5"],[5,8,"62.5"],[7,8,"87.5"],[1,10,"10"],[3,10,"30"],[7,10,"70"],[9,10,"90"],[1,16,"6.25"],[3,20,"15"],[7,20,"35"],[9,20,"45"],[17,20,"85"]]);
 if(Math.random()<.5)return q(`${a[2]}% = ?`,F(a[0],a[1]),`${a[2]}% = ${F(a[0],a[1])}.`,"Percentage → Fraction");
 return q(`${a[0]}/${a[1]} = ? %`,a[2],`${a[0]}/${a[1]} = ${a[2]}%.`,"Fraction → Percentage");
}
function fraction(){
 let d=R(4,20),a=R(1,d-1),b=R(1,d-1);
 if(Math.random()<.5){let x=G(a,d);return q(`${a}/${d}  ?  ${b}/${d}`,a>b?">":a<b?"<":"=",`Same denominator: compare ${a} and ${b}.`,"Fractions")}
 let n=a*b,den=d*d,ans=F(n,den);return q(`${a}/${d} × ${b}/${d} = ?`,ans,`Multiply and simplify: ${ans}.`,"Fractions")
}
function easyNumberQ(expr,ans,exp,skill,pattern,approach,shortcut,methods){
 let z=q(expr,ans,exp,skill,"Easy");
 z.coach={
  highlight:pattern,
  approach:approach,
  shortcut:shortcut,
  quickMethods:methods,
  steps:[exp,`Final answer: ${ans}.`]
 };
 return z;
}
function add(){
 const type=R(1,10);let a,b,x,pattern,approach,shortcut,methods;
 if(type===1){a=R(1,9);b=R(1,9);x=a+b;pattern="Pair to 10 or use instant single-digit recall.";approach="Add from left to right and look for a pair that makes 10.";shortcut="If the pair is close to 10, complete 10 and adjust.";methods=["Single-digit instant recall.","Make 10: 7+3=10.","For 8+6, think 8+2+4=14."]}
 else if(type===2){a=R(1,9);b=R(10,99);x=a+b;pattern="Break the two-digit number into tens and ones.";approach="Add the small number to the tens first, then the units.";shortcut=`${b}+${a} → ${Math.floor(b/10)*10}+${b%10+a}; avoid column addition.`;methods=["Left-to-right addition.","Add tens first, then ones.","If the units cross 10, carry mentally."]}
 else if(type===3){a=R(10,99);b=R(10,99);x=a+b;pattern="Look for a round-number compensation opportunity.";approach="Move one addend to the nearest multiple of 10 and compensate.";let r=10-(b%10);shortcut=`Add ${r} to ${b}, then subtract ${r}: ${a}+${b} = ${a}+${b+r}−${r}.`;methods=["Compensation near 10/100.","Pair tens and units separately.","Left-to-right addition."]}
 else if(type===4){a=R(10,99);b=R(100,999);x=a+b;pattern="Split by place value instead of writing a column calculation.";approach="Add hundreds first, then the remaining tens and units.";shortcut=`${a}+${b} = ${a}+${Math.floor(b/100)*100}+${b%100}.`;methods=["Hundreds first.","Split tens and units.","Compensate if a number is near 100/500/1000."]}
 else if(type===5){a=R(100,999);b=R(100,999);x=a+b;pattern="Pair place values and exploit a round-number carry.";approach="Combine hundreds, then tens and units; use compensation when one number is near a round hundred.";shortcut="Turn 298 into 300−2, or 497 into 500−3, then correct.";methods=["Near-100/500 compensation.","Hundreds + tens + units.","Pair numbers that create 1000."]}
 else if(type===6){a=R(100,999);b=R(1000,9999);x=a+b;pattern="Use the nearest thousand/hundred as a base.";approach="Round the larger number to a friendly base, add, then compensate.";shortcut=`If ${b} is near a thousand, use ${Math.round(b/1000)*1000} and correct the difference.`;methods=["Base-1000 compensation.","Add hundreds/tens/units in chunks.","Keep the correction separate."]}
 else if(type===7){a=R(1000,9999);b=R(1000,9999);x=a+b;pattern="Use base-1000/10000 compensation for four-digit addition.";approach="Move the number nearest a round thousand or ten-thousand to the base, then correct.";shortcut="Example: +3998 = +4000−2; +5997 = +6000−3.";methods=["Round to 1000/10000.","Compensation.","Pair thousands before lower places."]}
 else if(type===8){a=R(20,999);b=pick([9,19,29,39,49,99,199,999]);x=a+b;pattern="Numbers ending in 9 are built for compensation.";approach="Add the next round number and subtract 1 (or the required correction).";shortcut=`+${b}: add ${b+1} then subtract 1.`;methods=["+9 = +10−1.","+19 = +20−1.","+99 = +100−1.","+999 = +1000−1."]}
 else if(type===9){a=R(50,900);b=R(50,900);x=a+b;pattern="Look for complementary parts that make 1000 or another round base.";approach="Rearrange mentally into convenient pairs before adding.";shortcut="Example: 460+540=1000; 280+720=1000.";methods=["Complement-to-100/1000.","Pair hundreds first.","Rearrange before calculating."]}
 else{a=R(10,99);b=R(10,99);let c=R(10,99);x=a+b+c;pattern="Three-number addition rewards pairing first.";approach="Pair the two numbers that create the easiest round total, then add the third.";shortcut="Find a pair making 10, 50, 100 or 200 before adding the remaining number.";methods=["Pair to 100.","Pair to 50.","Left-to-right only after the easiest pair is formed."]}
 return easyNumberQ(type===10?`${a} + ${b} + ${c} = ?`:`${a} + ${b} = ?`,x,`Add using the recommended mental pattern. The answer is ${x}.`,`Addition`,pattern,approach,shortcut,methods);
}
function sub(){
 const type=R(1,10);let a,b,x,pattern,approach,shortcut,methods;
 if(type===1){a=R(2,9);b=R(1,a-1);x=a-b;pattern="Use instant single-digit subtraction.";approach="Recall the difference directly or count up from the smaller number.";shortcut="For close numbers, think in terms of the gap rather than performing subtraction.";methods=["Direct recall.","Count-up for close numbers.","Use complements to 10."]}
 else if(type===2){a=R(10,99);b=R(1,9);x=a-b;pattern="Subtract the small number by adjusting the units first.";approach="If the units are awkward, subtract a round 10 and add back the correction.";shortcut=`−${b} = −10 + ${10-b}.`;methods=["Subtract 10 then compensate.","Direct units subtraction.","Use complement to 10."]}
 else if(type===3){a=R(10,99);b=R(10,a-1);x=a-b;pattern="For close two-digit numbers, use the count-up gap method.";approach="Count from the smaller number to the larger in convenient jumps.";shortcut=`From ${b} to ${a}, jump to the next 10, then to ${a}.`;methods=["Count-up method.","Compensation.","Place-value subtraction."]}
 else if(type===4){a=R(100,999);b=R(10,99);x=a-b;pattern="Round the subtrahend when it is close to 10/20/50/100.";approach="Subtract the nearby round number and correct the small difference.";shortcut=`If the subtrahend is near 100, subtract 100 and add back the difference.`;methods=["Near-100 compensation.","Subtract tens first.","Avoid unnecessary borrowing."]}
 else if(type===5){a=R(100,999);b=R(100,a-1);x=a-b;pattern="Use the distance between the two numbers when they are close.";approach="Count upward from the smaller number or use a nearby round base.";shortcut="For 603−598, think 5; don't perform full subtraction.";methods=["Count-up.","Near-100/1000 compensation.","Compare place values first."]}
 else if(type===6){a=R(1000,9999);b=R(100,999);x=a-b;pattern="Subtract a round hundred/thousand and correct.";approach="Replace a difficult subtrahend by the nearest convenient base.";shortcut="Example: −998 = −1000 + 2; −497 = −500 + 3.";methods=["−99 = −100+1.","−999 = −1000+1.","Round-and-correct."]}
 else if(type===7){a=R(1000,9999);b=R(1000,a-1);x=a-b;pattern="For four-digit subtraction, compare the gap before calculating.";approach="If numbers are close, use count-up; otherwise use a round-thousand adjustment.";shortcut="Close numbers: find the gap; far numbers: subtract by thousands then correct.";methods=["Count-up for close values.","Base-1000 compensation.","Left-to-right subtraction."]}
 else if(type===8){a=R(200,9000);b=pick([9,19,29,49,99,199,999]);if(b>=a)b=Math.max(9,Math.floor(a/10)*10-1);x=a-b;pattern="Subtraction by 9/19/99/999 is a compensation shortcut.";approach="Subtract the next round number, then add the correction.";shortcut=`−${b}: use −${b+1}+1.`;methods=["−9 = −10+1.","−19 = −20+1.","−99 = −100+1.","−999 = −1000+1."]}
 else if(type===9){a=R(500,9500);let base=pick([100,500,1000,5000,10000]);b=Math.max(1,base-R(1,80));if(b>=a)b=a-1;x=a-b;pattern="Use a round base and the small difference from it.";approach="Subtract the round base, then add back the gap.";shortcut=`If b is ${base-12}, calculate −${base}+12.`;methods=["Base-100 compensation.","Base-1000 compensation.","Keep the correction mental."]}
 else{a=R(200,900);b=R(20,99);let c=R(10,99);x=a-b-c;pattern="Combine the two subtractions into one convenient amount when possible.";approach="Add the subtracted numbers first if that creates a round total, then subtract once.";shortcut=`Instead of −${b}−${c}, calculate −${b+c} when that is simpler.`;methods=["Combine subtractions.","Compensation.","Use a round intermediate total."]}
 return easyNumberQ(type===10?`${a} − ${b} − ${c} = ?`:`${a} − ${b} = ?`,x,`Use the fastest subtraction pattern. The answer is ${x}.`,`Subtraction`,pattern,approach,shortcut,methods);
}
function mul(){
 const type=R(1,12);let a,b,x,pattern,approach,shortcut,methods;
 if(type===1){a=R(2,99);b=5;x=a*b;pattern="×5 is ×10 ÷2.";approach="Double the result of multiplying by 5? Better: multiply by 10 and halve.";shortcut=`${a}×5 = ${a}×10÷2.`;methods=["×5 = ×10÷2.","×50 = ×100÷2.","Use halving when the number is even."]}
 else if(type===2){a=R(2,99);b=25;x=a*b;pattern="×25 is ×100 ÷4.";approach="Multiply by 100 and divide by 4.";shortcut=`${a}×25 = ${a}×100÷4.`;methods=["×25 = ×100÷4.","×125 = ×1000÷8.","Quarter the number after ×100."]}
 else if(type===3){a=R(2,99);b=50;x=a*b;pattern="×50 is ×100 ÷2.";approach="Multiply by 100 and halve.";shortcut=`${a}×50 = ${a}×100÷2.`;methods=["×50 = ×100÷2.","Append two zeros then halve."]}
 else if(type===4){a=R(2,99);b=125;x=a*b;pattern="×125 is ×1000 ÷8.";approach="Multiply by 1000 and divide by 8.";shortcut=`${a}×125 = ${a}×1000÷8.`;methods=["×125 = ×1000÷8.","If convenient, use ×100 + ×25."]}
 else if(type===5){a=R(12,99);b=9;x=a*b;pattern="×9 is ×10 − the original number.";approach="Multiply by 10, then subtract the original number once.";shortcut=`${a}×9 = ${a}×10−${a}.`;methods=["×9 = ×10−×1.","×19 = ×20−×1.","×99 = ×100−×1."]}
 else if(type===6){a=R(12,99);b=11;x=a*b;pattern="×11 often collapses into a place-value pattern.";approach="For a two-digit number, add its digits and place the sum between them when there is no carry; otherwise handle the carry.";shortcut=`${a}×11: insert the digit sum between the digits, carrying if needed.`;methods=["×11 digit-sum pattern.","×11 = ×10 + original.","Use place-value addition when carry occurs."]}
 else if(type===7){a=R(12,99);b=19;x=a*b;pattern="×19 is ×20 − the original number.";approach="Multiply by 20, then subtract the original number.";shortcut=`${a}×19 = ${a}×20−${a}.`;methods=["×19 = ×20−×1.","×29 = ×30−×1.","Use a nearby round multiple."]}
 else if(type===8){a=R(12,99);b=99;x=a*b;pattern="×99 is ×100 − the original number.";approach="Multiply by 100 and subtract the number once.";shortcut=`${a}×99 = ${a}×100−${a}.`;methods=["×99 = ×100−×1.","×999 = ×1000−×1.","Near-base multiplication."]}
 else if(type===9){a=R(20,99);b=R(2,9);if(a%2){[a,b]=[a*2,Math.floor(b/2)];if(b<2)b=2}x=a*b;pattern="Double-and-half when one factor is even.";approach="Halve the even factor and double the other factor to keep the product unchanged.";shortcut=`a×b = (a÷2)×(b×2) when that creates easier numbers.`;methods=["Double-and-half.","Move factors toward round numbers.","Avoid carrying large intermediate products."]}
 else if(type===10){a=R(20,99);b=R(20,99);x=a*b;let base=100,da=a-base,db=b-base;pattern="Numbers near 100 can use the base-100 method.";approach="Find each deviation from 100, cross-adjust for the first part, then multiply deviations for the last two digits.";shortcut=`For ${a}×${b}, use deviations from 100 instead of full multiplication.`;methods=["Base-100 method.","Cross subtraction/addition.","Deviation product for the final two digits."]}
 else if(type===11){a=R(20,99);b=R(10,49);x=a*b;pattern="Use distributive splitting into friendly tens.";approach=`Split ${b} into a round part plus/minus a small part.`;let t=Math.round(b/10)*10,d=b-t;shortcut=`${a}×${b} = ${a}×${t} ${d>=0?'+':'−'} ${a}×${Math.abs(d)}.`;methods=["Distributive property.","Split ×48 as ×50−×2.","Split ×21 as ×20+×1."]}
 else{a=R(11,99);b=R(11,99);x=a*b;pattern="Choose the easier factorisation before multiplying.";approach="Look for a factor 2, 4, 5, 10 or 25 and rearrange the multiplication mentally.";shortcut="Factor-split the easier side instead of doing a full two-digit multiplication.";methods=["Factor splitting.","Double-and-half.","Distributive multiplication."]}
 return easyNumberQ(`${a} × ${b} = ?`,x,`Use the highlighted mental-multiplication pattern. The answer is ${x}.`,`Multiplication`,pattern,approach,shortcut,methods);
}
function div(){
 const type=R(1,11);let b,x,a,pattern,approach,shortcut,methods;
 if(type===1){b=5;x=R(2,99)*2;a=b*x;pattern="÷5 is ×2 ÷10.";approach="Double the dividend, then divide by 10.";shortcut=`${a}÷5 = ${a}×2÷10.`;methods=["÷5 = ×2÷10.","÷50 = ×2÷100."]}
 else if(type===2){b=25;x=R(2,50)*4;a=b*x;pattern="÷25 is ×4 ÷100.";approach="Multiply the dividend by 4, then divide by 100.";shortcut=`${a}÷25 = ${a}×4÷100.`;methods=["÷25 = ×4÷100.","÷50 = ×2÷100."]}
 else if(type===3){b=50;x=R(2,50)*2;a=b*x;pattern="÷50 is ×2 ÷100.";approach="Double the dividend and shift by two decimal places conceptually.";shortcut=`${a}÷50 = ${a}×2÷100.`;methods=["÷50 = ×2÷100.","÷5 = ×2÷10."]}
 else if(type===4){b=125;x=R(2,50)*8;a=b*x;pattern="÷125 is ×8 ÷1000.";approach="Multiply by 8, then divide by 1000.";shortcut=`${a}÷125 = ${a}×8÷1000.`;methods=["÷125 = ×8÷1000.","Use ×1000 relationship."]}
 else if(type===5){b=10;x=R(20,999);a=b*x;pattern="Division by 10/100/1000 is place-value movement.";approach="Move the decimal point one place for ÷10; two for ÷100; three for ÷1000.";shortcut="Think in place values, not long division.";methods=["÷10: one place.","÷100: two places.","÷1000: three places."]}
 else if(type===6){b=R(2,9);x=R(10,99);a=b*x;pattern="Use the multiplication relationship to recognise the quotient instantly.";approach=`Ask: ${b} × what = ${a}?`;shortcut=`Reverse multiplication: divisor × quotient = dividend.`;methods=["Use known tables.","Estimate then check.","Reverse multiplication."]}
 else if(type===7){b=R(11,25);x=R(10,80);a=b*x;pattern="Cancel or factor before dividing when possible.";approach="Look for common factors in the dividend and divisor before doing the division.";shortcut="Reduce the dividend/divisor relationship first; then use a smaller multiplication table.";methods=["Factor cancellation.","Reverse multiplication.","Estimate quotient range first."]}
 else if(type===8){b=R(2,9)*10;x=R(5,80);a=b*x;pattern="Use ÷20/30/40... by factoring the divisor.";approach="Break the divisor into a small factor and 10.";shortcut=`÷${b} = ÷${b/10} ÷10.`;methods=["Factor divisor.","Divide by 10 last.","Use known small tables."]}
 else if(type===9){b=R(12,99);x=R(5,60);a=b*x;pattern="Estimate the quotient first, then verify with multiplication.";approach="Get the approximate quotient range before exact calculation so you know what answer to expect.";shortcut="Quotient × divisor should recreate the dividend; use that as a fast check.";methods=["Estimate first.","Reverse multiplication.","Eliminate impossible quotient ranges."]}
 else if(type===10){b=R(2,20);x=R(10,80);a=b*x;pattern="Look for a divisor that is a factor of a friendly base.";approach="Rewrite the division through a convenient factorisation of the divisor.";shortcut="If the divisor is 12, think ÷3 then ÷4 only when both steps are easier.";methods=["Factor the divisor.","Use known tables.","Cancel common factors."]}
 else{b=R(21,99);x=R(10,70);a=b*x;pattern="Use quotient estimation plus reverse multiplication instead of long division.";approach="Estimate the quotient from the leading digits, then confirm with multiplication.";shortcut="Approximate first; exact verification is multiplication.";methods=["Leading-digit estimate.","Reverse multiplication check.","Use nearby multiples of the divisor."]}
 return easyNumberQ(`${a} ÷ ${b} = ?`,x,`Use the highlighted mental-division pattern. The answer is ${x}.`,`Division`,pattern,approach,shortcut,methods);
}
function number(){return P([add,sub,mul,div])()}
function moderateSeries(){
 const type=R(1,18); let seq=[],ans,expr,exp,pat,more=[];
 const mk=(vals,answer,pattern,explanation,opts2=[])=>mcq(vals,answer,explanation,"Number Series",opts2);
 if(type===1){let n=R(8,25),d=R(3,9);seq=[n];for(let i=1;i<6;i++)seq.push(seq[i-1]+d+i*2);ans=seq.pop()+d+12;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Increasing differences",`Differences rise by 2 each time: ${seq.slice(1).map((v,i)=>v-seq[i]).join(", ")}; next difference is ${ans-seq[seq.length-1]}.`,[ans-2,ans+2,ans+4])}
 if(type===2){let n=R(3,9),k=R(2,4);seq=[n];for(let i=1;i<5;i++)seq.push(seq[i-1]*k+i);ans=seq[4]*k+5;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Multiplication with progressive addition",`Each term is multiplied by ${k}, then +1,+2,+3... is added. Continue with ×${k}+5.`,[ans-k,ans+k,ans+5])}
 if(type===3){let a=R(3,12),d=R(2,7);seq=Array.from({length:5},(_,i)=>(a+i)*(a+i+d));ans=(a+5)*(a+5+d);expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Consecutive-product pattern",`Terms follow n(n+${d}) with n increasing by 1. For the next term n=${a+5}, giving ${ans}.`,[ans-1,ans+1,ans+d])}
 if(type===4){let a=R(2,9),d=R(2,6);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+i*i*d);let idx=R(1,4);ans=seq[idx];let shown=seq.slice();shown[idx]="?";expr=shown.join(", ");return mk(expr,ans,"Square-number increments",`The increments are ${d}×1², ${d}×2², ${d}×3²... The missing term is ${ans}.`,[ans-d,ans+d,ans+2*d])}
 if(type===5){let a=R(3,10),d=R(2,5);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+(i%2?d:-d*2));ans=seq[5]+d;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Alternating increasing movement",`The sequence alternates +${d}, −${d*2}, +${d}, −${d*2}...; next move is +${d}.`,[ans-d,ans+d*2,ans+1])}
 if(type===6){let a=R(2,8),d=R(2,5);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+d*i);let idx=R(1,4),correct=seq[idx],wrong=correct+P([-3,-2,2,3]);seq[idx]=wrong;expr=`Find the wrong number: ${seq.join(", ")}`;return mk(expr,wrong,"Wrong term in increasing-difference series",`The intended differences increase by ${d}: ${seq.map((v,i)=>i? v-seq[i-1]:"—").slice(1).join(", ")}. The term that breaks the pattern is ${wrong}.`,[correct,wrong-d,wrong+d])}
 if(type===7){let a=R(2,7),b=R(3,8);seq=[a,a+b,a*b,(a+b)*b,a*b*b];ans=(a+b)*b*b;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Alternating construction",`Observe the alternating terms built from a, a+b, a×b, (a+b)×b, a×b²... Continue the same paired structure.`,[ans-b,ans+b,ans+a])}
 if(type===8){let a=R(4,12),d=R(2,5);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+d*i);ans=seq[5]+d*6;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Triangular increments",`Successive additions are ${d}, ${d*2}, ${d*3}, ${d*4}, ${d*5}; next is ${d*6}.`,[ans-d,ans+d,ans+2*d])}
 if(type===9){let a=R(2,6),b=R(2,4);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]*b-(i-1));ans=seq[5]*b-5;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Multiplication with progressive subtraction",`Multiply by ${b}, then subtract 0,1,2,3,4...; next step is ×${b}−5.`,[ans-b,ans+b,ans+5])}
 if(type===10){let a=R(5,15),d=R(2,7);seq=Array.from({length:6},(_,i)=>a+i*d+i*(i-1));let idx=R(1,4),correct=seq[idx];seq[idx]=correct+P([-4,-2,2,4]);expr=`Find the wrong number: ${seq.join(", ")}`;return mk(expr,seq[idx],"Polynomial-difference wrong term",`First differences should themselves increase by 2. Checking the sequence exposes ${seq[idx]} as the wrong term; the intended value is ${correct}.`,[correct,seq[idx]-2,seq[idx]+2])}
 if(type===11){let a=R(3,9),b=R(2,6);seq=[a,b];for(let i=2;i<6;i++)seq.push(seq[i-1]+seq[i-2]+b);ans=seq[5]+seq[4]+b;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Modified Fibonacci",`Each term equals the previous two terms plus ${b}. Therefore next = ${seq[5]} + ${seq[4]} + ${b} = ${ans}.`,[ans-b,ans+b,ans+seq[0]])}
 if(type===12){let a=R(3,9),b=R(2,5);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+b*i*(i+1)/2);ans=seq[5]+b*21;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Triangular additions",`The additions are b×1, b×3, b×6, b×10, b×15; next addition is b×21.`,[ans-b*15,ans+b,ans+b*2])}
 if(type===13){let a=R(2,8),b=R(2,5);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]*(b+i-1));ans=seq[5]*(b+5);expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Successive changing multipliers",`Multipliers are ${b}, ${b+1}, ${b+2}, ${b+3}, ${b+4}; next multiplier is ${b+5}.`,[ans-(b+5),ans+(b+5),ans+b])}
 if(type===14){let a=R(4,12),d=R(2,6);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+(i%2?d*i:-d*i));ans=seq[5]+d*6;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Alternating signed increments",`The signed increments are +${d}, −${d*2}, +${d*3}, −${d*4}, +${d*5}; next is −${d*6}.`,[seq[5]-d*6,seq[5]+d*6,seq[5]-d])}
 if(type===15){let a=R(2,6),b=R(3,7);seq=Array.from({length:6},(_,i)=>(a+i)*(b+i));ans=(a+6)*(b+6);expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Product of two consecutive progressions",`Terms are (a+i)(b+i). Increase both factors by 1 for the next term.`,[ans-1,ans+1,ans+(a+b)])}
 if(type===16){let a=R(2,8),b=R(2,5);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+b**i);ans=seq[5]+b**6;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"Powers as increments",`Add successive powers of ${b}: ${b}, ${b}², ${b}³... The next increment is ${b}⁶.`,[ans-b**5,ans+b**5,ans+b])}
 if(type===17){let a=R(4,12),b=R(2,6);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]*2+b*i);ans=seq[5]*2+b*6;expr=`${seq.join(", ")}, ?`;return mk(expr,ans,"×2 with increasing addition",`Each term is previous term ×2 plus b, 2b, 3b... Continue with ×2+6b.`,[ans-b,ans+b,ans+2*b])}
 let a=R(3,10),b=R(2,6);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+b*i*i);let idx=R(1,4),correct=seq[idx];seq[idx]=correct+P([-6,-3,3,6]);expr=`Find the wrong number: ${seq.join(", ")}`;return mk(expr,seq[idx],"Wrong term in square-difference series",`The differences should be ${b}×1², ${b}×2², ${b}×3²... The displayed value ${seq[idx]} breaks that rule; intended value is ${correct}.`,[correct,seq[idx]-3,seq[idx]+3]);
}

function moderateSimplification(){
 const type=R(1,24); let a,b,c,d,e,x,exp,more;
 const ret=(expr,ans,ex,extra=[])=>mcq(expr,ans,ex,"Simplification",extra);
 if(type===1){b=R(3,9);c=R(4,12);let e=R(2,6),k=R(1,4);d=e*k;a=R(40,120);x=a+b*c-k;return ret(`${a} + ${b} × ${c} − ${d}/${e} = ?`,x,`Apply BODMAS: ${b}×${c}=${b*c} and ${d}/${e}=${k}; then combine the terms to get ${x}.`,[x-2,x+2,x+4])}
 if(type===2){a=R(25,90);b=R(12,30);c=R(2,9);d=P([10,20,25,50]);let e=R(2,8);x=a+b*c-d/e;return ret(`${a} + ${b} × ${c} − ${d}/${e} = ?`,dec(x,2),`Multiply and divide before the final addition/subtraction: ${b}×${c}=${b*c}, ${d}÷${e}=${dec(d/e,2)}.`,[dec(x-2,2),dec(x+2,2),dec(x+5,2)])}
 if(type===3){let f=P([[1,2],[1,3],[1,4],[2,3],[3,4],[2,5],[3,5],[5,8]]);b=R(80,480);x=dec(f[0]*b/f[1],2);return ret(`${f[0]}/${f[1]} of ${b} = ?`,x,`Use the fraction directly: divide ${b} by ${f[1]} and multiply by ${f[0]}.`,[dec(x+5,2),dec(x-5,2),dec(x+10,2)])}
 if(type===4){let f=P([[3,4],[5,6],[7,8],[5,8],[7,10],[9,10]]);b=R(120,600);c=P([10,20,25,50]);x=dec(f[0]*b/f[1]+c,2);return ret(`${f[0]}/${f[1]} of ${b} + ${c} = ?`,x,`Find the fractional part first, then add ${c}; result = ${x}.`,[dec(x-5,2),dec(x+5,2),dec(x+10,2)])}
 if(type===5){b=R(4,12);let q=R(20,80),a=b*q;c=R(2,9);d=P([5,10,20,25]);e=R(2,8);x=a/b+c*d-e;return ret(`${a} ÷ ${b} + ${c} × ${d} − ${e} = ?`,x,`Divide ${a} by ${b}, multiply ${c}×${d}, then subtract ${e}; result = ${x}.`,[x-2,x+2,x+5])}
 if(type===6){b=R(3,9);c=R(2,8);d=R(2,8);e=R(2,6);let q=R(5,20),a=q*e+b*c; x=a-b*c+q;return ret(`${a} − ${b} × ${c} + ${q} = ?`,x,`Multiply first: ${b}×${c}=${b*c}; then ${a}−${b*c}+${q}=${x}.`,[x-2,x+2,x+4])}
 if(type===7){a=R(15,60);b=R(15,60);c=P([5,10,20,25,50]);x=(a+b)*c;return ret(`(${a} + ${b}) × ${c} = ?`,x,`Add inside the bracket, then use the friendly multiplier ${c}; result = ${x}.`,[x-10,x+10,x+20])}
 if(type===8){a=R(20,80);b=R(20,80);c=P([5,10,20,25,50]);x=dec((a+b)/c,2);return ret(`(${a} + ${b}) ÷ ${c} = ?`,x,`Add first: ${a+b}; then divide by ${c}.`,[dec(x-2,2),dec(x+2,2),dec(x+5,2)])}
 if(type===9){a=R(30,90);b=R(2,9);c=R(2,9);x=a*(b+c);return ret(`${a} × (${b} + ${c}) = ?`,x,`Add the bracket first (${b+c}), then multiply ${a}×${b+c}=${x}.`,[x-b,x+b,x+10])}
 if(type===10){a=R(200,900);b=P([12.5,16.6667,20,25,33.3333,37.5,62.5,75]);c=P([10,20,25,50]);x=a*b/100+c;return ret(`${b}% of ${a} + ${c} = ?`,dec(x,2),`Convert ${b}% to a familiar fraction, calculate the percentage part, then add ${c}.`,[dec(x-5,2),dec(x+5,2),dec(x+10,2)])}
 if(type===11){a=R(200,900);b=P([12.5,16.6667,20,25,33.3333,37.5,62.5,75]);c=P([5,10,20,25]);x=a*b/100-c;return ret(`${b}% of ${a} − ${c} = ?`,dec(x,2),`Calculate the familiar percentage first, then subtract ${c}.`,[dec(x-5,2),dec(x+5,2),dec(x+10,2)])}
 if(type===12){a=R(200,900);b=P([12.5,16.6667,20,25,33.3333,37.5,62.5,75]);c=P([2,4,5,8,10]);x=a*b/100/c;return ret(`${b}% of ${a} ÷ ${c} = ?`,dec(x,2),`Convert the percentage to a fraction, cancel/divide by ${c}, then calculate.`,[dec(x-2,2),dec(x+2,2),dec(x+5,2)])}
 if(type===13){a=P([36,49,64,81,100,121,144,169,196,225,256,289,324,361,400,441,484,529,576,625,676,729,784,841,900]);b=R(10,80);x=Math.sqrt(a)+b;return ret(`√${a} + ${b} = ?`,x,`Recognise √${a}=${Math.sqrt(a)}, then add ${b}.`,[x-2,x+2,x+5])}
 if(type===14){a=P([36,49,64,81,100,121,144,169,196,225,256,289,324,361,400]);b=P([4,9,16,25,36,49]);x=Math.sqrt(a)*Math.sqrt(b);return ret(`√${a} × √${b} = ?`,x,`Recognise both roots: ${Math.sqrt(a)}×${Math.sqrt(b)}=${x}.`,[x-2,x+2,x+4])}
 if(type===15){a=R(12,35);b=R(12,35);c=P([5,10,20,25,50]);d=P([2,4,5,8,10]);x=(a+b)*c/d;return ret(`(${a} + ${b}) × ${c} ÷ ${d} = ?`,dec(x,2),`Combine the bracket, then use cancellation before multiplying/dividing; result = ${dec(x,2)}.`,[dec(x-2,2),dec(x+2,2),dec(x+5,2)])}
 if(type===16){a=R(100,600);b=P([25,50,75]);c=P([4,8,16]);x=dec(a*b/100*c,2);return ret(`${b}% of ${a} × ${c} = ?`,x,`Use ${b}% as a fraction first, then multiply by ${c}; result = ${x}.`,[dec(x-10,2),dec(x+10,2),dec(x+20,2)])}
 if(type===17){a=R(20,90);b=P([9,11,19,21,25,50,99,101,125]);x=a*b;return ret(`${a} × ${b} = ?`,x,`Use the friendly-factor shortcut for ×${b}; avoid long multiplication.`,[x-10,x+10,x+20])}
 if(type===18){a=R(200,900);b=P([5,25,50,125]);x=dec(a/b,2);return ret(`${a} ÷ ${b} = ?`,x,`Use the matching division shortcut for ÷${b} rather than long division.`,[dec(x-5,2),dec(x+5,2),dec(x+10,2)])}
 if(type===19){a=R(100,900);b=P([9,11,19,21,99,101]);c=R(10,80);x=a*b+c;return ret(`${a} × ${b} + ${c} = ?`,x,`Use the near-10/near-100 multiplication identity first, then add ${c}.`,[x-10,x+10,x+20])}
 if(type===20){a=R(100,900);b=P([9,11,19,21,99,101]);c=R(10,80);x=a*b-c;return ret(`${a} × ${b} − ${c} = ?`,x,`Use the multiplication shortcut for ×${b}, then subtract ${c}.`,[x-10,x+10,x+20])}
 if(type===21){a=R(20,80);b=P([25,50,75]);c=R(20,80);d=P([5,10,20,25,50]);x=dec(a+b*c/100-d,2);return ret(`${a} + ${b}% of ${c} − ${d} = ?`,x,`Find the percentage part first (${b}% of ${c}), then add/subtract the remaining terms.`,[dec(x-2,2),dec(x+2,2),dec(x+5,2)])}
 if(type===22){a=R(10,60);b=R(10,60);c=R(2,8);d=R(2,8);x=(a+b*c)/d;return ret(`(${a} + ${b} × ${c}) ÷ ${d} = ?`,dec(x,2),`Inside the bracket multiply first, add, then divide by ${d}.`,[dec(x-1,2),dec(x+1,2),dec(x+2,2)])}
 if(type===23){let f1=P([[1,2],[2,3],[3,4],[3,5],[5,6]]),f2=P([[1,2],[2,5],[3,4],[4,5]]);a=R(60,360);x=a*f1[0]/f1[1]*f2[0]/f2[1];return ret(`${f1[0]}/${f1[1]} × ${a} × ${f2[0]}/${f2[1]} = ?`,dec(x,2),`Cancel common factors before multiplying the remaining numerators and denominators.`,[dec(x-5,2),dec(x+5,2),dec(x+10,2)])}
 a=R(100,900);b=P([10,20,25,50]);c=P([2,4,5,10]);d=P([5,10,20,25]);x=dec(a*b/100+c*d,2);return ret(`${b}% of ${a} + ${c} × ${d} = ?`,x,`Calculate the percentage part and multiplication separately, then combine them.`,[dec(x-10,2),dec(x+10,2),dec(x+20,2)]);
}

function moderateApproximation(){
 const type=R(1,16); let a,b,c,d,x;
 const ret=(expr,ans,ex,extra=[])=>mcq(expr,ans,ex,"Approximation",extra);
 if(type===1){a=R(180,980)/10;b=R(20,98)/10;x=Math.round(a)*Math.round(b);return ret(`${a.toFixed(1)} × ${b.toFixed(1)} ≈ ?`,x,`Round ${a.toFixed(1)} and ${b.toFixed(1)} to nearby convenient values, then multiply.`,[x-10,x+10,x+20])}
 if(type===2){a=R(300,990)/10;b=R(20,98)/10;let ra=Math.round(a/10)*10,rb=Math.max(1,Math.round(b));x=Math.round(ra/rb);return ret(`${a.toFixed(1)} ÷ ${b.toFixed(1)} ≈ ?`,x,`Round to ${ra} and ${rb}; ${ra}÷${rb}≈${x}.`,[x-1,x+1,x+2])}
 if(type===3){a=R(180,980);b=R(80,480);c=R(80,480);x=Math.round(a/100)*100+Math.round(b/10)*10-Math.round(c/10)*10;return ret(`${a} + ${b} − ${c} ≈ ?`,x,`Round each term sensibly: ${Math.round(a/100)*100} + ${Math.round(b/10)*10} − ${Math.round(c/10)*10}.`,[x-20,x+20,x+40])}
 if(type===4){a=R(180,980);b=P([12.5,16.67,20,25,33.33,37.5,62.5,66.67,75]);x=Math.round(a*b/100);return ret(`${b}% of ${a} ≈ ?`,x,`Use the familiar fraction behind ${b}% and estimate to the nearest practical value.`,[x-10,x+10,x+20])}
 if(type===5){a=R(400,980);b=R(20,90);c=R(10,80);x=Math.round(a/b)+c;return ret(`${a} ÷ ${b} + ${c} ≈ ?`,x,`Round the quotient using nearby convenient multiples, then add ${c}.`,[x-2,x+2,x+5])}
 if(type===6){a=R(400,980);b=R(20,90);c=R(10,80);x=Math.round(a/(b+c));return ret(`${a} ÷ (${b} + ${c}) ≈ ?`,x,`Round the bracket to a convenient divisor, then estimate the quotient.`,[x-1,x+1,x+2])}
 if(type===7){a=R(100,900);b=R(10,40);c=R(10,40);x=Math.round(a*(100+b)/100);return ret(`${a} × (1 + ${b}%) ≈ ?`,x,`Estimate the percentage increase using a nearby familiar percentage, then calculate.`,[x-10,x+10,x+20])}
 if(type===8){a=R(100,900);b=R(10,40);c=R(10,40);x=Math.round(a*(100-b)/100);return ret(`${a} × (1 − ${b}%) ≈ ?`,x,`Estimate the percentage decrease with a convenient fraction.`,[x-10,x+10,x+20])}
 if(type===9){a=R(90,990);b=R(90,990);c=R(20,80);x=Math.round(a/100)*100+Math.round(b/100)*100+Math.round(c/10)*10;return ret(`${a} + ${b} + ${c} ≈ ?`,x,`Round each term to a convenient place value before adding.`,[x-20,x+20,x+40])}
 if(type===10){a=R(90,990);b=R(90,990);c=R(20,80);x=Math.round(a/100)*100-Math.round(b/100)*100+Math.round(c/10)*10;return ret(`${a} − ${b} + ${c} ≈ ?`,x,`Round the large terms to hundreds and the small term to tens.`,[x-20,x+20,x+40])}
 if(type===11){a=R(180,980);b=R(10,90);c=R(10,90);x=Math.round(a*b/100)+c;return ret(`${a} × ${b}% + ${c} ≈ ?`,x,`Use a nearby familiar percentage for ${b}% and then add ${c}.`,[x-10,x+10,x+20])}
 if(type===12){a=R(180,980);b=R(10,90);c=R(10,90);x=Math.round(a*b/100)-c;return ret(`${a} × ${b}% − ${c} ≈ ?`,x,`Estimate the percentage part first, then subtract ${c}.`,[x-10,x+10,x+20])}
 if(type===13){a=R(180,980);b=R(20,90);c=R(2,9);x=Math.round(a/b)*c;return ret(`${a} ÷ ${b} × ${c} ≈ ?`,x,`Round the quotient to a convenient value before multiplying by ${c}.`,[x-5,x+5,x+10])}
 if(type===14){a=R(900,9900);b=R(90,990);x=Math.round(a/b);return ret(`${a} ÷ ${b} ≈ ?`,x,`Use nearby multiples of the divisor to bracket the quotient quickly.`,[x-1,x+1,x+2])}
 if(type===15){a=R(90,490);b=R(10,90);c=R(10,90);d=R(2,9);x=Math.round((a+b)*c/d);return ret(`(${a} + ${b}) × ${c} ÷ ${d} ≈ ?`,x,`Round the bracket and use cancellation before estimating the final product/division.`,[x-10,x+10,x+20])}
 a=R(100,900);b=R(10,40);c=R(10,40);d=R(10,40);x=Math.round(a*(100+b)/100)-d;return ret(`${a} × (1 + ${b}%) − ${d} ≈ ?`,x,`Estimate the percentage increase first, then subtract ${d}.`,[x-10,x+10,x+20]);
}

function make(topic,subtopic=null){
 if(topic==="tables")return table(Number(subtopic)||R(6,30));if(topic==="squares")return square();if(topic==="cubes")return cube();if(topic==="percent")return percent();if(topic==="fractions")return fraction();if(topic==="number")return ({addition:add,subtraction:sub,multiplication:mul,division:div}[subtopic]||number)();
 if(topic==="mixed")return make(P(["tables","squares","cubes","percent","fractions","number"]));
 if(topic==="simplification")return moderateSimplification();
 if(topic==="approximation")return moderateApproximation();
 if(topic==="quadratic")return moderateQuadratic();
 if(topic==="missingSeries")return moderateSeries(false);
 if(topic==="wrongSeries")return moderateSeries(true);
 if(topic==="hardquad")return advancedQuadratic();
 if(topic==="hardmissing")return advancedMissingSeries();
 if(topic==="hardwrong")return advancedWrongSeries();
 if(topic==="blindfold")return moderateBlindfold();
 return q("Choose a Moderate topic to begin.","","Moderate practice.");
}

function home(){stop();S.view="home";back.classList.add("hidden");subtitle.textContent="Speed Maths";screen.innerHTML=`<section class="hero home-hero"><span class="pill">PR CLERK 2026</span><h1>PR CLERK <span>2026</span></h1><p>Fast calculation training for Clerk-level exams.</p><button class="insights-home" onclick="renderInsights()">📊 View Daily Insights →</button></section><div class="grid">${levels.map(l=>`<button class="card" onclick="level(${l.id})"><h2>${l.name}</h2><div class="topic">${l.desc}</div></button>`).join("")}</div>`}
function level(id){stop();S.view="level";S.level=levels.find(x=>x.id===id);back.classList.remove("hidden");subtitle.textContent="Speed Maths";screen.innerHTML=`<div class="hero"><h1>${S.level.name}</h1><p>${S.level.desc}</p></div><div class="grid ${id===1?"easy-grid":""}">${S.level.topics.map((t,idx)=>`<button class="card section-card" onclick="openSection('${t.id}')"><div><h3>${t.name}</h3><div class="topic">${t.desc}</div></div><span class="pill start">${t.id==="tables"||t.id==="number"?"CHOOSE →":"START PRACTICE →"}</span></button>`).join("")}</div>`}
function openSection(topic){if(topic==="tables")return tablePicker();if(topic==="number")return numberPicker();setup(topic)}
function tablePicker(){S.view="tablePicker";subtitle.textContent="Tables • Choose a table";screen.innerHTML=`<div class="hero"><span class="pill">TABLES</span><h1>Choose your table</h1><p>Choose exactly which table you want to practise. You can change it anytime.</p></div><div class="picker-grid tables-picker">${Array.from({length:25},(_,i)=>i+6).map(n=>`<button class="card picker-card" onclick="setup('tables',${n})"><span class="pill">TABLE ${n}</span><h3>Table ${n}</h3><div class="topic">${n} × 2 to ${n} × 20</div><span class="pill start">PRACTISE →</span></button>`).join("")}</div>`}
function numberPicker(){S.view="numberPicker";subtitle.textContent="Number Games • Choose operation";screen.innerHTML=`<div class="hero"><span class="pill">NUMBER GAMES</span><h1>Choose an operation</h1><p>Choose what you want to practise now.</p></div><div class="grid picker-ops">${[["addition","Addition","Build speed with addition"],["subtraction","Subtraction","Build speed with subtraction"],["multiplication","Multiplication","Learn faster multiplication patterns"],["division","Division","Build fast division recall"]].map(([id,n,d])=>`<button class="card section-card" onclick="setup('number','${id}')"><div><h3>${n}</h3><div class="topic">${d}</div></div><span class="pill start">PRACTISE →</span></button>`).join("")}</div>`}

function cfg(topic){if(topic==="mixed")return[20,480];if(topic==="number")return[20,360];if(topic==="blindfold")return[20,480];return[10,240]}
function setup(topic,subtopic=null){
 let [dn,ds]=cfg(topic);
 S.view="setup";S.topic=topic;S.subtopic=subtopic;
 back.classList.remove("hidden");subtitle.textContent="Test Setup";
 screen.innerHTML=`<section class="hero setup-hero"><span class="pill">TEST SETUP</span><h1>Set your practice</h1><p>You decide the number of questions and the time.</p><div class="setup-grid"><label class="setup-field"><span>Questions</span><input id="qcount" type="number" min="1" max="100" value="${dn}" inputmode="numeric"></label><label class="setup-field"><span>Time (minutes)</span><input id="qtime" type="number" min="1" max="180" value="${Math.max(1,Math.round(ds/60))}" inputmode="numeric"></label></div><div class="preset-row"><button type="button" class="secondary preset" data-n="10" data-t="4">10 Q • 4 min</button><button type="button" class="secondary preset" data-n="20" data-t="8">20 Q • 8 min</button><button type="button" class="secondary preset" data-n="30" data-t="12">30 Q • 12 min</button></div><button type="button" class="primary setup-start" onclick="beginSetup()">START PRACTICE →</button></section>`;
 document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#qcount').value=b.dataset.n;document.querySelector('#qtime').value=b.dataset.t}));
}
function beginSetup(){let n=Math.max(1,Math.min(100,parseInt(document.querySelector('#qcount').value,10)||10));let min=Math.max(1,Math.min(180,parseInt(document.querySelector('#qtime').value,10)||1));start(S.topic,S.subtopic,n,min*60)}
function moderateQuality(qq,topic){
 if(topic==="missingSeries"||topic==="wrongSeries") return true;
 if(topic==="hardmissing"||topic==="hardwrong") return true;
 if(topic==="blindfold") return true;
 const e=qq.expr||"";
 const nums=(e.match(/\d+(?:\.\d+)?/g)||[]).length;
 const ops=(e.match(/[+−×÷%]/g)||[]).length;
 if(topic==="simplification") return ops>=1 && nums>=2 && e.length>=8;
 if(topic==="approximation") return (ops>=1 && nums>=2 && e.length>=12);
 return true;
}
function start(topic,subtopic=null,n=null,sec=null){if(n===null||sec===null){let c=cfg(topic);n=c[0];sec=c[1]}n=Math.max(1,Math.min(100,n));sec=Math.max(60,Math.min(10800,sec));S.view="quiz";S.topic=topic;S.subtopic=subtopic;S.qs=[];let seen=new Set(),tries=0;const storeKey=`prclerk_recent_${topic}_${subtopic||"all"}`;let recent=[];try{recent=JSON.parse(localStorage.getItem(storeKey)||"[]")}catch(e){}const blocked=new Set(recent);while(S.qs.length<n&&tries<n*120){let qq=make(topic,subtopic),key=(qq.expr||"").replace(/\s+/g," ").trim();tries++;if(moderateQuality(qq,topic)&&!seen.has(key)&&!blocked.has(key)){seen.add(key);S.qs.push(qq)}}let emergency=0;while(S.qs.length<n&&emergency<n*120){let qq=make(topic,subtopic),key=(qq.expr||"").replace(/\s+/g," ").trim();emergency++;if(moderateQuality(qq,topic)&&!seen.has(key)){seen.add(key);S.qs.push(qq)}}try{let updated=[...recent,...S.qs.map(x=>(x.expr||"").replace(/\s+/g," ").trim())];localStorage.setItem(storeKey,JSON.stringify(updated.slice(-5000)))}catch(e){}S.i=0;S.answers=Array(n).fill(null);S.qTimes=Array(n).fill(0);S.qStartedAt=Date.now();S.limit=sec;S.start=Date.now();S.end=S.start+sec*1000;back.classList.remove("hidden");subtitle.textContent="Test in progress";render();tick()}
function stop(){if(S.timer)clearInterval(S.timer);S.timer=null}
function remain(){return Math.max(0,Math.ceil((S.end-Date.now())/1000))}
function tick(){stop();S.timer=setInterval(()=>{let t=remain(),el=$("#clock"),el2=$("#clock2");if(el)el.textContent=fmt(t);if(el2)el2.textContent=fmt(t);if(t<=0){stop();submit(true)}},250)}
function fmt(s){s=Math.max(0,Math.round(Number(s)||0));return`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}
function render(){
 let q=S.qs[S.i],chosen=S.answers[S.i];
 if(!S.qStartedAt)S.qStartedAt=Date.now();
 const isMC=Array.isArray(q.options)&&q.options.length>0;
 const safeValue=String(chosen??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");
 const optionBody=isMC?`<div class="options">${q.options.map(v=>{const sv=String(v);const sel=String(chosen??"")===sv;const safe=sv.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;");return `<button type="button" class="option ${sel?"selected":""}" onclick="choose(${JSON.stringify(sv).replace(/</g,"\u003c")})"><span class="radio"></span><b>${safe}</b></button>`}).join("")}</div>`:
 `<div class="answer-input-wrap"><label for="answerInput" class="answer-input-label">Your answer</label><textarea id="answerInput" class="answer-input" rows="1" inputmode="text" enterkeyhint="done" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Enter your answer" placeholder="Enter your answer">${safeValue}</textarea><div class="input-help">Type your answer or use the keypad.</div></div><div class="keypad">${["1","2","3","4","5","6","7","8","9","0","/","."].map(k=>`<button type="button" onclick="key('${k}')">${k}</button>`).join("")}</div><div class="pad-actions"><button type="button" class="secondary" onclick="clearAns()">Clear</button><button type="button" class="secondary" onclick="backspace()">⌫</button></div>`;
 const body=optionBody;
 screen.innerHTML=`<div class="topline"><span class="pill">QUESTION ${S.i+1}/${S.qs.length}</span><b id="clock">${fmt(remain())}</b></div><div class="bar"><i style="width:${S.i/S.qs.length*100}%"></i></div><section class="question"><div class="timer-note">⏱ <b id="clock2">${fmt(remain())}</b> remaining</div><div class="expr">${q.expr}</div>${body}<div class="row"><button class="secondary" onclick="prev()" ${S.i===0?"disabled":""}>← Previous</button><button class="primary" onclick="${S.i===S.qs.length-1?"submit(false)":"next()"}">${S.i===S.qs.length-1?"SUBMIT TEST":"Next →"}</button></div><div class="small center">${isMC?"Choose one option • No instant feedback":"Enter your answer • No instant feedback"}</div></section>`}
function choose(v){S.answers[S.i]=v;render()}
function typedAnswer(v){
  v=String(v??"").replace(/[^0-9.\/-xX<>=≤≥\s]/g,"");
  const slash=v.indexOf("/");
  if(slash!==-1)v=v.slice(0,slash+1)+v.slice(slash+1).replace(/\//g,"");
  let dots=(v.match(/\./g)||[]).length;
  if(dots>1){let first=v.indexOf(".");v=v.slice(0,first+1)+v.slice(first+1).replace(/\./g,"");}
  S.answers[S.i]=v.trim()||null;
  const el=document.getElementById("answerInput");
  if(el&&el.value!==v)el.value=v;
}
function key(k){
  const el=document.getElementById("answerInput");
  let a=el?el.value:(S.answers[S.i]||"");
  if(k==="/"&&a.includes("/"))return;
  if(k==="."&&a.includes("."))return;
  const v=a+k; typedAnswer(v);
  if(el){el.focus();try{el.setSelectionRange(el.value.length,el.value.length)}catch(e){}}
}
function clearAns(){typedAnswer("");let el=document.getElementById("answerInput");if(el)el.focus()}
function backspace(){let el=document.getElementById("answerInput"),a=el?el.value:(S.answers[S.i]||"");typedAnswer(a.slice(0,-1));if(el){el.focus();try{el.setSelectionRange(el.value.length,el.value.length)}catch(e){}}}
function recordQuestionTime(){if(S.view!=="quiz"||!S.qStartedAt)return;S.qTimes[S.i]=(S.qTimes[S.i]||0)+(Date.now()-S.qStartedAt)/1000;S.qStartedAt=Date.now()}
function next(){if(S.i<S.qs.length-1){recordQuestionTime();S.i++;render()}}
function prev(){if(S.i>0){recordQuestionTime();S.i--;render()}}
function numericEqual(a,b){return Math.abs(Number(a)-Number(b))<1e-9}
function answerCorrect(q,a){
 if(a===null)return false;
 const norm=v=>String(v??"").trim().replace(/\s+/g," ").replace(/≥/g,">=").replace(/≤/g,"<=").replace(/−/g,"-").toLowerCase();
 const aa=norm(a),bb=norm(q.ans);
 if(q.skill.startsWith("Percentage →"))return aa===bb;
 if(q.skill.startsWith("Fraction →"))return numericEqual(aa,bb);
 if(q.skill==="Quadratic Equations")return aa===bb;
 return aa===bb || numericEqual(aa,bb);
}
function submit(auto){if(S.view!=="quiz")return;recordQuestionTime();stop();let elapsed=Math.min(S.limit,(Date.now()-S.start)/1000),correct=0,wrong=0,un=0;S.qs.forEach((q,i)=>{if(S.answers[i]===null)un++;else if(answerCorrect(q,S.answers[i]))correct++;else wrong++});let marks=correct-wrong*.25;S.view="result";renderResult(elapsed,correct,wrong,un,marks,auto)}
function aiCoach(elapsed){
 const rows=S.qs.map((q,i)=>({q,i,t:S.qTimes[i]||0,a:S.answers[i],ok:answerCorrect(q,S.answers[i])}));
 const attempted=rows.filter(x=>x.a!==null), wrong=attempted.filter(x=>!x.ok), correct=attempted.filter(x=>x.ok);
 const avg=attempted.length?attempted.reduce((z,x)=>z+x.t,0)/attempted.length:0;
 const slow=[...rows].sort((a,b)=>b.t-a.t).slice(0,3).filter(x=>x.t>0);
 const slowThreshold=Math.max(12,avg*1.45);
 const slowAttempted=attempted.filter(x=>x.t>slowThreshold).sort((a,b)=>b.t-a.t);
 const slowWrong=wrong.filter(x=>x.t>slowThreshold).sort((a,b)=>b.t-a.t);
 const fastWrong=wrong.filter(x=>x.t<Math.max(8,avg*.75));
 const insights=[];
 if(slowWrong.length) insights.push(`You lost the most time on ${slowWrong.slice(0,2).map(x=>`Q${x.i+1}`).join(" and ")} and still missed them. The main correction is to recognise the pattern earlier and switch to the shortcut instead of forcing a long calculation.`);
 if(slowAttempted.length&&!slowWrong.length) insights.push(`You are spending too long even when you are getting the answers right. ${slowAttempted.slice(0,2).map(x=>`Q${x.i+1} (${fmt(x.t)})`).join(" and ")} are good examples: your accuracy is fine, but the route can be shortened.`);
 if(fastWrong.length) insights.push(`You have a speed-before-accuracy issue on ${fastWrong.slice(0,2).map(x=>`Q${x.i+1}`).join(" and ")}. Slow down for 2–3 seconds, identify the operation/pattern, then calculate.`);
 if(wrong.length===0&&attempted.length) insights.push(`Excellent accuracy. Your next gain is pure speed: keep the same method, but aim to recognise the shortcut one step earlier.`);
 if(rows.some(x=>x.a===null)) insights.push(`You left ${rows.filter(x=>x.a===null).length} question(s) unanswered. In a timed exam, use a skip rule: if the route is not clear within about 5–8 seconds, move on and return later.`);
 if(elapsed/S.limit>.9) insights.push(`You used ${Math.round(elapsed/S.limit*100)}% of the allotted time. Build a hard stop: do not let one calculation consume the time budget for several easier questions.`);
 else if(elapsed/S.limit<.55&&wrong.length>0) insights.push(`You finished with plenty of time but made ${wrong.length} mistake(s). That suggests accuracy—not speed—is currently the bigger opportunity.`);
 if(!insights.length) insights.push(`Your performance is balanced. Keep using pattern recognition first, then calculation. The fastest improvement now will come from reducing the time on your slowest questions without sacrificing accuracy.`);
 return {avg,slow,insights};
}
const DAILY_KEY="prclerk_daily_v1";
function dayKey(d=new Date()){
  const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function readDaily(){try{return JSON.parse(localStorage.getItem(DAILY_KEY)||"{}")||{}}catch(e){return{}}}
function saveDaily(d){try{localStorage.setItem(DAILY_KEY,JSON.stringify(d))}catch(e){}}
function recordDailyResult(elapsed,c,w,u,marks){
  const all=readDaily(),k=dayKey(), old=all[k]||{tests:0,questions:0,attempted:0,correct:0,wrong:0,unanswered:0,time:0,marks:0,topics:{}};
  old.tests++; old.questions+=S.qs.length; old.attempted+=c+w; old.correct+=c; old.wrong+=w; old.unanswered+=u; old.time+=elapsed; old.marks+=marks;
  S.qs.forEach((q,i)=>{
    const topic=q.skill||"Mixed"; const t=old.topics[topic]||{questions:0,attempted:0,correct:0,time:0};
    const a=S.answers[i]; t.questions++; if(a!==null)t.attempted++; if(answerCorrect(q,a))t.correct++; t.time+=Number(S.qTimes[i]||0); old.topics[topic]=t;
  });
  all[k]=old;
  const keys=Object.keys(all).sort(); keys.slice(0,Math.max(0,keys.length-120)).forEach(x=>delete all[x]);
  saveDaily(all);
}
function dailyHistory(days=14){
  const all=readDaily(),out=[],now=new Date();
  for(let i=days-1;i>=0;i--){const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()-i);const k=dayKey(d),x=all[k]||{};const attempted=x.attempted||0;out.push({key:k,label:d.toLocaleDateString(undefined,{day:"numeric",month:"short"}),tests:x.tests||0,questions:x.questions||0,attempted,correct:x.correct||0,accuracy:attempted?Math.round((x.correct||0)/attempted*100):0,time:x.time||0});}
  return out;
}
function fmtHours(seconds){seconds=Math.max(0,Math.round(seconds||0));if(seconds<3600)return fmt(seconds);return `${Math.floor(seconds/3600)}h ${Math.floor((seconds%3600)/60)}m`;}
function currentTopicStats(){
  const map={}; S.qs.forEach((q,i)=>{const k=q.skill||"Mixed";const x=map[k]||{questions:0,attempted:0,correct:0,time:0};const a=S.answers[i];x.questions++;if(a!==null)x.attempted++;if(answerCorrect(q,a))x.correct++;x.time+=Number(S.qTimes[i]||0);map[k]=x;});return Object.entries(map).map(([topic,x])=>({...x,topic,accuracy:x.attempted?Math.round(x.correct/x.attempted*100):0}));
}
function insightText(elapsed,c,w,u){
  const attempted=c+w,acc=attempted?c/attempted:0,avg=attempted?elapsed/attempted:0;
  if(!attempted)return "No answers were attempted. Next time, aim to build momentum by answering the quickest questions first.";
  if(acc>=.9&&avg<=10)return "Excellent balance: high accuracy with strong pace. Your next gain is consistency across longer sets.";
  if(acc>=.9)return "Accuracy is strong. The clearest opportunity is speed—look for the shortcut one step earlier.";
  if(acc<.7&&elapsed/S.limit<.75)return "You are moving quickly, but accuracy is costing marks. Pause briefly to identify the pattern before calculating.";
  if(u>0)return `You left ${u} question${u>1?"s":""} unanswered. Use a firm skip rule and return only when the route is clear.`;
  return "Your performance is developing. Focus on reducing avoidable mistakes first, then push the pace.";
}
function miniLineSvg(data){
  const vals=data.map(x=>x.accuracy), W=640,H=190,p=24; const max=100,min=0;
  const pts=vals.map((v,i)=>{const x=p+i*(W-2*p)/Math.max(1,vals.length-1),y=H-p-(v-min)/(max-min)*(H-2*p);return [x,y]});
  const poly=pts.map(a=>a.join(",")).join(" ");
  const dots=pts.map((a,i)=>`<circle cx="${a[0]}" cy="${a[1]}" r="3.5" class="chart-dot"><title>${data[i].label}: ${vals[i]}%</title></circle>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="insight-svg" role="img" aria-label="Daily accuracy trend"><line x1="${p}" y1="${H-p}" x2="${W-p}" y2="${H-p}" class="axis"/><line x1="${p}" y1="${p}" x2="${p}" y2="${H-p}" class="axis"/><polyline points="${poly}" class="trend-line" fill="none"/>${dots}<text x="${p}" y="${H-5}" class="axis-label">${data[0]?.label||""}</text><text x="${W-p}" y="${H-5}" text-anchor="end" class="axis-label">${data[data.length-1]?.label||""}</text><text x="${p+5}" y="${p+8}" class="axis-label">100%</text></svg>`;
}
function miniBars(data){const max=Math.max(1,...data.map(x=>x.questions));return `<div class="daily-bars">${data.map(x=>`<div class="daily-bar-col"><span>${x.questions?x.questions:""}</span><i style="height:${Math.max(4,Math.round(x.questions/max*100))}%"></i><small>${x.label}</small></div>`).join("")}</div>`}
function pieMarkup(c,w,u){const total=Math.max(1,c+w+u),cp=c/total*100,wp=w/total*100;return `<div class="pie-wrap"><div class="pie" style="background:conic-gradient(#3aaa7a 0 ${cp}%,#d85b68 ${cp}% ${cp+wp}%,#a8b0bf ${cp+wp}% 100%)"></div><div class="pie-legend"><span><i class="dot correct"></i>Correct <b>${c}</b></span><span><i class="dot wrong"></i>Wrong <b>${w}</b></span><span><i class="dot unanswered"></i>Unanswered <b>${u}</b></span></div></div>`}
function renderInsights(){
  stop(); S.view="insights"; back.classList.remove("hidden"); subtitle.textContent="Daily Insights";
  const data=dailyHistory(14),today=data[data.length-1],attempted=today.attempted||0,acc=today.accuracy||0,totalQ=data.reduce((a,x)=>a+x.questions,0),totalTests=data.reduce((a,x)=>a+x.tests,0),totalTime=data.reduce((a,x)=>a+x.time,0);
  let streak=0; const all=readDaily(),d=new Date(); for(let i=0;i<120;i++){const k=dayKey(d);if(all[k]&&all[k].tests){streak++;d.setDate(d.getDate()-1)}else break;}
  const peak=data.reduce((a,b)=>b.accuracy>a.accuracy?b:a,data[0]);
  screen.innerHTML=`<section class="insights-hero"><div><span class="pill">PR CLERK 2026</span><h1>Your Progress</h1><p>Daily performance, pace and consistency — all saved on this device.</p></div><div class="streak-badge"><strong>${streak}</strong><span>day streak</span></div></section>
  <div class="insight-kpis"><div><strong>${acc}%</strong><span>Today accuracy</span></div><div><strong>${today.questions||0}</strong><span>Questions today</span></div><div><strong>${fmtHours(today.time||0)}</strong><span>Practice today</span></div><div><strong>${totalTests}</strong><span>Tests • 14 days</span></div></div>
  <section class="insight-card"><div class="insight-card-head"><div><h2>Accuracy trend</h2><p>Daily accuracy from your actual completed attempts.</p></div><span>${peak.accuracy||0}% best</span></div>${miniLineSvg(data)}</section>
  <section class="insight-grid"><div class="insight-card"><div class="insight-card-head"><div><h2>Practice volume</h2><p>Questions completed each day.</p></div></div>${miniBars(data)}</div><div class="insight-card"><div class="insight-card-head"><div><h2>Today’s answer split</h2><p>Correct, wrong and unanswered.</p></div></div>${pieMarkup(today.correct||0,today.wrong||0,today.unanswered||0)}</div></section>
  <section class="insight-card"><div class="insight-card-head"><div><h2>What this tells you</h2><p>Simple signals from your actual data.</p></div></div><div class="insight-callouts"><div><b>${today.correct||0}/${attempted}</b><span>correct attempts today</span></div><div><b>${attempted?fmt((today.time||0)/attempted):"0:00"}</b><span>average time per attempt</span></div><div><b>${totalQ}</b><span>questions in 14 days</span></div></div><p class="insight-note">${attempted?"Keep the streak alive. Accuracy is more valuable than rushing, then build speed once the method is reliable.":"Start a practice set today and this page will begin building your personal baseline."}</p></section>
  <div class="row end"><button class="primary" onclick="home()">Back Home</button></div>`;
}

function renderResult(elapsed,c,w,u,marks,auto){
  recordDailyResult(elapsed,c,w,u,marks);
 const attempted=c+w, avg=attempted?elapsed/attempted:0, pace=elapsed/S.limit<.65?"Fast":elapsed/S.limit<.9?"Good":"Needs improvement";
 const coach=aiCoach(elapsed);
 screen.innerHTML=`<section class="result-hero"><div class="result-top"><div><span class="pill">${auto?"TIME UP":"TEST SUBMITTED"}</span><h1>${marks.toFixed(2)} <span>/ ${S.qs.length}</span></h1><p>${c} correct <i>•</i> ${w} wrong <i>•</i> ${u} unanswered</p></div><div class="score-ring"><strong>${Math.round(c/S.qs.length*100)}%</strong><span>accuracy</span></div></div><div class="result-stats"><div class="result-stat"><strong>${fmt(elapsed)}</strong><span>Time used</span></div><div class="result-stat"><strong>${fmt(avg)}</strong><span>Avg / attempt</span></div><div class="result-stat"><strong>${fmt(Math.max(0,S.limit-elapsed))}</strong><span>Time left</span></div></div><div class="pace-card"><div><span class="pace-label">TIME MANAGEMENT</span><strong>${pace}</strong></div><div class="pace-track"><i style="width:${Math.min(100,Math.round(elapsed/S.limit*100))}%"></i></div><span class="pace-percent">${Math.round(elapsed/S.limit*100)}% of allotted time used</span></div></section>
 <section class="test-insights"><div class="insight-card-head"><div><span class="pill">PERFORMANCE INSIGHTS</span><h2>This test at a glance</h2><p>A visual report of accuracy, attempts and where your marks came from.</p></div><strong class="insight-score">${Math.round(c/S.qs.length*100)}%</strong></div><div class="test-insight-grid"><div class="test-pie">${pieMarkup(c,w,u)}</div><div><div class="mini-metric"><span>Accuracy</span><b>${Math.round(c/S.qs.length*100)}%</b></div><div class="mini-metric"><span>Attempt rate</span><b>${Math.round(attempted/S.qs.length*100)}%</b></div><div class="mini-metric"><span>Correct / minute</span><b>${elapsed>0?(c/(elapsed/60)).toFixed(1):"0.0"}</b></div><div class="mini-metric"><span>Avg time / attempt</span><b>${fmt(avg)}</b></div></div></div><div class="topic-performance"><h3>Section performance</h3>${currentTopicStats().map(t=>`<div class="topic-row"><span>${t.topic}</span><div><i style="width:${t.accuracy}%"></i></div><b>${t.accuracy}%</b></div>`).join("")}</div></section>
 <section class="ai-coach"><div class="ai-head"><div><span class="pill">AI COACH</span><h2>How you spent your time</h2><p>Personalised feedback from your accuracy and question-by-question timing.</p></div><span class="coach-badge">SMART REVIEW</span></div><div class="coach-insights">${coach.insights.map((x,i)=>`<div class="coach-insight"><span>${i+1}</span><p>${x}</p></div>`).join("")}</div>${coach.slow.length?`<div class="slowest"><h3>Slowest attempts</h3><div class="slow-grid">${coach.slow.map(x=>`<button class="slow-card" onclick="document.getElementById('review-${x.i}').scrollIntoView({behavior:'smooth',block:'center'})"><b>Q${x.i+1}</b><span>${fmt(x.t)}</span><small>${x.ok?"Correct":x.a===null?"Unanswered":"Wrong"}</small></button>`).join("")}</div></div>`:""}</section>
 <div class="review-heading"><div><h2>Answer Review</h2><p>Answer, correct answer, time spent and the best approach.</p></div><span>${S.qs.length} questions</span></div><div class="analysis">${S.qs.map((q,i)=>{let a=S.answers[i],ok=answerCorrect(q,a),status=ok?"Correct":a===null?"Unanswered":"Wrong",m=q.coach||coachFor(q.skill,q.expr,q.ans,q.exp);m={...m,steps:actualSolution(q.expr,q.ans,q.skill).length?actualSolution(q.expr,q.ans,q.skill):m.steps};return`<article id="review-${i}" class="review ${ok?"ok":a===null?"skip":"bad"}"><div class="review-head"><strong>Q${i+1}</strong><span class="status ${ok?"ok":a===null?"skip":"bad"}">${status}</span><span class="review-time">${fmt(S.qTimes[i]||0)}</span></div><div class="review-expr">${q.expr}</div><div class="answer-line"><div><span>Your answer</span><b>${a??"—"}</b></div><div><span>Correct answer</span><b>${q.ans}</b></div></div><div class="time-line">Time spent <strong>${fmt(S.qTimes[i]||0)}</strong></div><div class="highlight-line"><span>⚡ Highlight</span><p>${m.highlight||"Use the shortest pattern-based route."}</p></div><details class="solution"><summary>View solution, approach & shortcut</summary><div class="solution-body"><div class="solution-panel approach-panel"><div class="solution-label">⚡ BEST APPROACH</div><p>${m.approach}</p></div><div class="solution-panel shortcut-panel"><div class="solution-label">🚀 SHORTCUT</div><p>${m.shortcut}</p></div><div class="solution-panel working-panel"><div class="solution-label">🧮 ACTUAL WORKING</div><div class="step-stack">${(m.steps||[]).map((st,idx)=>`<div class="step-card"><span>${idx+1}</span><p>${st}</p></div>`).join("")}</div></div>${(m.quickMethods||[]).length?`<div class="solution-panel methods-panel"><div class="solution-label">💡 QUICK METHODS</div><div class="method-chips">${(m.quickMethods||[]).slice(0,4).map(st=>`<span>${st}</span>`).join("")}</div></div>`:""}</div></details></article>`}).join("")}</div><div class="row end"><button class="primary" onclick="setup('${S.topic}',S.subtopic)">Practice Again</button><button class="secondary" onclick="level(${S.level?.id||1})">Back</button></div>`}

back.onclick=()=>{if(S.view==="quiz"){if(confirm("Leave this test? Your answers will be lost.")){stop();level(S.level.id)}return}if(S.view==="setup"||S.view==="tablePicker"||S.view==="numberPicker"){level(S.level.id);return}if(S.view==="level"||S.view==="insights")home();else home()}
home();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});

// ==================================================
// PR CLERK 2026 - CLERK PRELIMS EXAM-LEVEL MODERATE GENERATOR
// ==================================================
// Fresh, original questions inspired by the calculation structures
// and difficulty profile of Clerk Prelims exams.
// No DI, no Arithmetic word problems, no Quadratic Equations.
// ==================================================

const ModerateGenerator = {
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  getRandomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a || 1;
  },

  lcm(a, b) {
    return Math.abs(a * b) / this.gcd(a, b);
  },

  round(n, places = 6) {
    const p = 10 ** places;
    return Math.round((n + Number.EPSILON) * p) / p;
  },

  clean(n) {
    const x = this.round(n);
    return Number.isInteger(x) ? String(x) : String(x);
  },

  fraction(num, den) {
    if (den < 0) { num = -num; den = -den; }
    const g = this.gcd(num, den);
    return { num: num / g, den: den / g };
  },

  mixed(num, den) {
    const f = this.fraction(num, den);
    const whole = Math.floor(Math.abs(f.num) / f.den) * Math.sign(f.num || 1);
    const rem = Math.abs(f.num) % f.den;
    if (!rem) return String(whole);
    if (!whole) return `${f.num}/${f.den}`;
    return `${whole} ${rem}/${f.den}`;
  },

  pct(value, base) {
    return this.round((value / 100) * base);
  },

  // --------------------------------------------------
  // QUALITY / UNIQUENESS
  // --------------------------------------------------

  _used: new Set(),

  normalize(text) {
    return String(text)
      .replace(/\s+/g, "")
      .replace(/[×x]/g, "*")
      .replace(/[÷]/g, "/")
      .toLowerCase();
  },

  isNew(question) {
    const key = this.normalize(question);
    if (this._used.has(key)) return false;
    this._used.add(key);

    // Prevent unbounded memory growth in a long browser session.
    if (this._used.size > 5000) {
      const first = this._used.values().next().value;
      this._used.delete(first);
    }
    return true;
  },

  quality(question, answer, meta = {}) {
    if (!question || answer === "" || answer == null) return false;
    const answerText = String(answer).trim();
    const numericAnswer = Number(answerText);
    const fractionAnswer = /^-?\d+(?:\s+\d+\/\d+|\/\d+)$/.test(answerText);
    if (!Number.isFinite(numericAnswer) && !fractionAnswer) return false;
    if (!this.isNew(question)) return false;

    // Moderate questions should involve meaningful calculation,
    // but must remain practical for Clerk Prelims speed practice.
    const ops = (question.match(/[+−\-×÷*/%]/g) || []).length;
    const digits = (question.match(/\d/g) || []).length;

    if (meta.requireMultiStep && ops < 2) return false;
    if (meta.minDigits && digits < meta.minDigits) return false;
    if (meta.maxOps && ops > meta.maxOps) return false;

    return true;
  },

  package(type, question, answer, highlight, approach, shortcut, steps, quickMethods = []) {
    return {
      type,
      question,
      answer: String(answer),
      expr: question,
      ans: String(answer),
      skill: type,
      highlight,
      coach: {
        highlight,
        approach,
        shortcut,
        steps,
        quickMethods
      }
    };
  },

  // --------------------------------------------------
  // SIMPLIFICATION
  // --------------------------------------------------

  generateSimplification() {
    const generators = [
      () => this._mixedFractionMissing(),
      () => this._decimalChain(),
      () => this._percentageMissing(),
      () => this._percentageTwoTerm(),
      () => this._rootChain(),
      () => this._fractionReciprocal(),
      () => this._powerCancellation(),
      () => this._mixedFractionDivision(),
      () => this._percentageRootMix(),
      () => this._decimalPercentageMix(),
      () => this._fractionDecimalMix(),
      () => this._nestedBodmas()
    ];

    for (let attempt = 0; attempt < 150; attempt++) {
      const result = this.getRandomChoice(generators)();
      if (result && this.quality(result.question, result.answer, {
        requireMultiStep: true,
        minDigits: 8,
        maxOps: 8
      })) return result;
    }

    return this._decimalChain();
  },

  _mixedFractionMissing() {
    const d1 = this.getRandomChoice([3, 4, 5, 6, 8]);
    const d2 = this.getRandomChoice([3, 4, 5, 6, 8, 10]);
    const w1 = this.getRandomInt(2, 6);
    const w2 = this.getRandomInt(2, 7);
    const n1 = this.getRandomInt(1, d1 - 1);
    const n2 = this.getRandomInt(1, d2 - 1);

    const target = this.getRandomInt(w1 + w2 + 2, w1 + w2 + 7);
    const missing = target - (w1 + n1 / d1) - (w2 + n2 / d2);

    if (missing <= 0) return null;

    const den = this.lcm(d1, d2);
    const num = Math.round(missing * den);
    const answer = this.mixed(num, den);

    return this.package(
      "Simplification",
      `${w1} ${n1}/${d1} + ${w2} ${n2}/${d2} + ? = ${target}`,
      answer,
      "Convert the mixed fractions mentally, then use the target to work backwards.",
      "Find the integer part first and handle the fractional remainder with the smallest common denominator.",
      "Do not add everything blindly. Subtract the known whole-number parts from the target first, then solve only the remaining fraction.",
      [
        `Known values = ${this.round(w1 + n1 / d1)} + ${this.round(w2 + n2 / d2)}.`,
        `Missing value = target − known values.`,
        `Final answer = ${answer}.`
      ],
      [
        "Separate whole numbers and fractional parts.",
        "Use the LCM only for the fractional remainder.",
        "Work backwards from the target."
      ]
    );
  },

  _decimalChain() {
    const a = this.getRandomChoice([198.27, 216.35, 248.45, 312.64, 396.27, 428.35, 512.48, 625.75]);
    const b = this.getRandomChoice([102.13, 114.65, 137.35, 208.52, 246.13, 318.65]);
    const c = this.getRandomChoice([20.4, 30.4, 40.4, 50.4, 60.4]);
    const d = this.getRandomChoice([12.5, 15.5, 18.5, 20.5]);

    const answer = this.round(a + b - c - d);

    return this.package(
      "Simplification",
      `${a} + ${b} − ${c} − ${d} = ?`,
      answer,
      "Look at the decimal parts before doing the whole-number arithmetic.",
      "Pair decimal parts that make a clean tenth or whole number, then finish the integer calculation.",
      "For example, .27 + .13 = .40. Look for cancellation or completion before adding large parts.",
      [
        `Combine decimal parts strategically.`,
        `Combine the integer parts.`,
        `Final answer = ${answer}.`
      ],
      [
        "Pair hundredths/tenths first.",
        "Avoid carrying through every column if decimals cancel.",
        "Estimate the answer before finalising."
      ]
    );
  },

  _percentageMissing() {
    const pct = this.getRandomChoice([12.5, 15, 18, 20, 22.5, 25, 30, 32, 37.5, 40, 45, 60, 62.5, 75]);
    const base = this.getRandomChoice([160, 200, 240, 280, 320, 360, 400, 480, 560, 640]);
    const add = this.getRandomInt(20, 120);
    const target = this.pct(pct, base) + add;

    if (!Number.isFinite(target) || !Number.isInteger(target)) return null;

    return this.package(
      "Simplification",
      `?% of ${base} + ${add} = ${target}`,
      pct,
      "Find the percentage amount first by subtracting the fixed term from the target.",
      `Target − ${add} gives the required percentage value. Compare that value with ${base}.`,
      "Use standard fraction equivalents: 12.5%=1/8, 25%=1/4, 37.5%=3/8, 62.5%=5/8, 75%=3/4.",
      [
        `Required percentage amount = ${target} − ${add}.`,
        `That amount is ${pct}% of ${base}.`,
        `Answer = ${pct}%.`
      ],
      [
        "Convert familiar percentages to fractions.",
        "Subtract the known term first.",
        "Check by multiplying the percentage back."
      ]
    );
  },

  _percentageTwoTerm() {
    const p1 = this.getRandomChoice([15, 20, 25, 30, 35, 40, 45, 60]);
    const p2 = this.getRandomChoice([12.5, 20, 25, 30, 37.5, 40, 50]);
    const a = this.getRandomChoice([160, 200, 240, 280, 320, 360, 400]);
    const b = this.getRandomChoice([240, 300, 360, 400, 480, 600]);

    const v1 = this.pct(p1, a);
    const v2 = this.pct(p2, b);
    const target = v1 + v2;

    if (!Number.isInteger(target)) return null;

    return this.package(
      "Simplification",
      `${p1}% of ${a} + ${p2}% of ${b} = ?`,
      target,
      "Convert the percentages into familiar fractions before multiplying.",
      "Evaluate each percentage independently and add the two clean results.",
      "Use 25%=1/4, 20%=1/5, 12.5%=1/8, 37.5%=3/8, 50%=1/2.",
      [
        `${p1}% of ${a} = ${v1}.`,
        `${p2}% of ${b} = ${v2}.`,
        `Answer = ${target}.`
      ],
      [
        "Use fraction equivalents.",
        "Calculate the easier percentage first.",
        "Add only after both terms are simplified."
      ]
    );
  },

  _rootChain() {
    const root = this.getRandomInt(18, 36);
    const square = root * root;
    const add = this.getRandomInt(18, 60);
    const mult = this.getRandomChoice([18, 20, 22, 24, 25, 28]);
    const div = this.getRandomChoice([12, 14, 16, 18, 20, 21, 24, 28]);

    const raw = ((root + add) * mult) / div;
    if (!Number.isInteger(raw)) return null;

    return this.package(
      "Simplification",
      `{(√${square} + ${add}) × ${mult}} ÷ ${div} = ?`,
      raw,
      `Recognise √${square} immediately, then look for cancellation before multiplying fully.`,
      `Evaluate the root first. Combine it with ${add}, then cancel common factors between the numerator and ${div}.`,
      "Cancel before multiplication whenever possible. This prevents a large intermediate product.",
      [
        `√${square} = ${root}.`,
        `${root} + ${add} = ${root + add}.`,
        `(${root + add} × ${mult}) ÷ ${div} = ${raw}.`
      ],
      [
        "Know common square roots quickly.",
        "Cancel common factors before multiplying.",
        "Keep the intermediate number small."
      ]
    );
  },

  _fractionReciprocal() {
    const x = this.getRandomInt(2, 6);
    const n1 = this.getRandomInt(1, 3);
    const d1 = this.getRandomChoice([4, 5, 6, 8]);
    const n2 = this.getRandomInt(1, 3);
    const d2 = this.getRandomChoice([4, 5, 6, 8]);
    const multiplier = this.getRandomChoice([12, 16, 20, 24]);

    const v = x + n1 / d1 + n2 / d2;
    const answer = this.round(v * multiplier);

    if (!Number.isInteger(answer)) return null;

    return this.package(
      "Simplification",
      `(${x} ${n1}/${d1} + ${n2}/${d2}) ÷ 1/${multiplier} = ?`,
      answer,
      "Dividing by a unit fraction means multiplying by its denominator.",
      `First simplify the mixed/fractional expression, then multiply by ${multiplier}.`,
      `Replace ÷ 1/${multiplier} with × ${multiplier}; cancel or distribute before doing a large multiplication.`,
      [
        `÷ 1/${multiplier} = × ${multiplier}.`,
        `Simplify the bracket.`,
        `Final answer = ${answer}.`
      ],
      [
        "Never divide by a unit fraction directly.",
        "Convert it to multiplication.",
        "Simplify fractions before multiplying."
      ]
    );
  },

  _powerCancellation() {
    const base = this.getRandomChoice([2, 4]);
    const a = this.getRandomInt(2, 4);
    const b = this.getRandomInt(2, 4);
    const c = this.getRandomInt(1, 3);

    const left = base ** a;
    const middle = base ** b;
    const divisor = base ** c;
    const answer = base ** (a + b - c);

    if (answer <= 0 || !Number.isInteger(answer)) return null;

    return this.package(
      "Simplification",
      `(${left} × ${middle}) ÷ ${divisor} = ${base}^?`,
      a + b - c,
      "Rewrite every number using the same base instead of calculating the large powers.",
      `Use ${left}=${base}^${a}, ${middle}=${base}^${b}, and ${divisor}=${base}^${c}; then add/subtract exponents.`,
      "Same-base multiplication adds exponents; division subtracts exponents.",
      [
        `${left} = ${base}^${a}.`,
        `${middle} = ${base}^${b}.`,
        `${divisor} = ${base}^${c}.`,
        `Exponent = ${a}+${b}−${c} = ${a + b - c}.`
      ],
      [
        "Do not calculate the large powers.",
        "Convert to a common base.",
        "Apply index laws directly."
      ]
    );
  },

  _mixedFractionDivision() {
    const d = this.getRandomChoice([3, 4, 5, 6, 8]);
    const n = this.getRandomInt(1, d - 1);
    const whole = this.getRandomInt(3, 7);
    const divisor = this.getRandomChoice([2, 4, 5, 8, 10]);

    const numerator = whole * d + n;
    const resultNum = numerator;
    const resultDen = d * divisor;
    const reduced = this.fraction(resultNum, resultDen);
    const answer = this.mixed(reduced.num, reduced.den);

    if (!Number.isFinite(reduced.num) || reduced.num <= 0) return null;

    return this.package(
      "Simplification",
      `${whole} ${n}/${d} ÷ ${divisor} = ?`,
      answer,
      "Turn the mixed number into a fraction only when it makes division cleaner.",
      "Convert to an improper fraction, cancel the divisor if possible, then simplify.",
      "Cancellation before division is faster than converting everything into decimals.",
      [
        `${whole} ${n}/${d} = ${(whole * d + n)}/${d}.`,
        `Divide the fraction by ${divisor} and reduce.`,
        `Final answer = ${answer}.`
      ],
      [
        "Use cancellation before multiplying.",
        "Keep fractions exact.",
        "Avoid decimal conversion."
      ]
    );
  },

  _percentageRootMix() {
    const root = this.getRandomInt(12, 30);
    const square = root * root;
    const pct = this.getRandomChoice([20, 25, 40, 50, 75]);
    const add = this.getRandomInt(20, 80);
    const mult = this.getRandomChoice([2, 3, 4]);

    const answer = this.pct(pct, root + add) * mult;

    if (!Number.isInteger(answer)) return null;

    return this.package(
      "Simplification",
      `${pct}% of (√${square} + ${add}) × ${mult} = ?`,
      answer,
      "Take the square root first, then convert the percentage to a fraction.",
      `√${square} = ${root}; add ${add}; apply ${pct}% as a simple fraction; multiply by ${mult}.`,
      "25%=1/4, 50%=1/2, 75%=3/4. Apply the fraction before the final multiplication.",
      [
        `√${square} = ${root}.`,
        `${root} + ${add} = ${root + add}.`,
        `${pct}% of ${root + add} × ${mult} = ${answer}.`
      ],
      [
        "Recognise the square root immediately.",
        "Use fraction equivalents for percentages.",
        "Multiply last."
      ]
    );
  },

  _decimalPercentageMix() {
    const decimal = this.getRandomChoice([0.25, 0.4, 0.5, 0.75, 1.25, 1.5, 2.5]);
    const base = this.getRandomChoice([160, 200, 240, 320, 400, 480]);
    const pct = this.getRandomChoice([12.5, 25, 37.5, 50, 75]);
    const pctBase = this.getRandomChoice([160, 240, 320, 400, 640]);

    const answer = this.round(decimal * base + this.pct(pct, pctBase));
    if (!Number.isInteger(answer)) return null;

    return this.package(
      "Simplification",
      `${decimal} × ${base} + ${pct}% of ${pctBase} = ?`,
      answer,
      "Convert the decimal multiplier and percentage into simple fractions before calculating.",
      `Treat ${decimal} as a familiar fraction and ${pct}% as a fraction; calculate both terms separately.`,
      "0.25=1/4, 0.5=1/2, 0.75=3/4, 1.25=5/4, 2.5=5/2.",
      [
        `${decimal} × ${base} = ${this.round(decimal * base)}.`,
        `${pct}% of ${pctBase} = ${this.pct(pct, pctBase)}.`,
        `Answer = ${answer}.`
      ],
      [
        "Convert decimals to fractions.",
        "Use percentage equivalents.",
        "Avoid long decimal multiplication."
      ]
    );
  },

  _fractionDecimalMix() {
    const d = this.getRandomChoice([4, 5, 8, 10]);
    const n = this.getRandomInt(1, d - 1);
    const decimal = this.getRandomChoice([0.25, 0.5, 0.75, 1.25, 1.5, 2.5]);
    const base = this.getRandomChoice([80, 120, 160, 200, 240]);
    const answer = this.round(n / d * base + decimal * base);

    if (!Number.isInteger(answer)) return null;

    return this.package(
      "Simplification",
      `(${n}/${d} + ${decimal}) × ${base} = ?`,
      answer,
      "Combine the fraction and decimal as equivalent fractions before multiplying.",
      `Convert ${decimal} to a fraction, add it to ${n}/${d}, then multiply by ${base}.`,
      "If the denominator matches a factor of the base, cancel before multiplying.",
      [
        `Convert ${decimal} to a fraction.`,
        `Combine the fractions.`,
        `Multiply by ${base} after cancellation.`,
        `Answer = ${answer}.`
      ],
      [
        "Convert decimals to fractions.",
        "Look for denominator/base cancellation.",
        "Multiply only after simplification."
      ]
    );
  },

  _nestedBodmas() {
    const a = this.getRandomInt(12, 40);
    const b = this.getRandomInt(6, 18);
    const c = this.getRandomInt(8, 24);
    const d = this.getRandomChoice([4, 5, 6, 8]);
    const e = this.getRandomChoice([3, 4, 5]);

    const inner = a + b * c;
    const answer = inner / d - e;

    if (!Number.isInteger(answer) || answer <= 0) return null;

    return this.package(
      "Simplification",
      `(${a} + ${b} × ${c}) ÷ ${d} − ${e} = ?`,
      answer,
      "Apply multiplication inside the bracket first, then look for exact division.",
      `Calculate ${b}×${c}, add ${a}, divide by ${d}, then subtract ${e}.`,
      "Check whether the bracket total is divisible by the denominator before doing unnecessary decimal work.",
      [
        `${b} × ${c} = ${b * c}.`,
        `${a} + ${b * c} = ${inner}.`,
        `${inner} ÷ ${d} − ${e} = ${answer}.`
      ],
      [
        "Follow BODMAS.",
        "Check divisibility before dividing.",
        "Keep intermediate values exact."
      ]
    );
  },

  // --------------------------------------------------
  // APPROXIMATION
  // --------------------------------------------------

  generateApproximation() {
    const generators = [
      () => this._approxMixed(),
      () => this._approxDecimal(),
      () => this._approxPercentage(),
      () => this._approxDivision(),
      () => this._approxRoot()
    ];

    for (let i = 0; i < 100; i++) {
      const r = this.getRandomChoice(generators)();
      if (r && this.quality(r.question, r.answer, { requireMultiStep: true, minDigits: 8, maxOps: 7 })) return r;
    }
    return this._approxMixed();
  },

  _approxMixed() {
    const a = this.getRandomInt(190, 890);
    const b = this.getRandomInt(20, 90);
    const c = this.getRandomInt(10, 90);
    const d = this.getRandomChoice([4, 5, 8, 10, 12]);

    const answer = Math.round((a + b) * c / d);

    return this.package(
      "Approximation",
      `(${a} + ${b}) × ${c} ÷ ${d} ≈ ?`,
      answer,
      "Round only where it keeps the option range safe, then simplify before multiplying.",
      "Combine the bracket, choose a nearby easy value, and use cancellation before the final multiplication.",
      "Use the options as a range check; don't chase an exact value when approximation is enough.",
      [`Approximate the bracket.`, `Simplify the multiplication/division.`, `Nearest answer ≈ ${answer}.`],
      ["Round to friendly values.", "Cancel before multiplying.", "Use options to verify the range."]
    );
  },

  _approxDecimal() {
    const a = (this.getRandomInt(120, 850) + this.getRandomChoice([0.24, 0.39, 0.51, 0.68, 0.81])).toFixed(2);
    const b = this.getRandomChoice([1.98, 2.02, 3.01, 4.99, 5.02, 9.98]);
    const c = this.getRandomInt(20, 90);

    const answer = Math.round((Number(a) * Number(b)) / c);

    return this.package(
      "Approximation",
      `${a} × ${b} ÷ ${c} ≈ ?`,
      answer,
      "Replace decimals such as 1.98, 2.02, 4.99 and 9.98 with their nearest convenient values.",
      `Use ${b} ≈ ${Math.round(Number(b))}, then divide after the multiplication estimate.`,
      "The aim is not exact decimal multiplication; recognise near-integer values immediately.",
      [`${b} is close to ${Math.round(Number(b))}.`, `Estimate the product and divide by ${c}.`, `Nearest answer ≈ ${answer}.`],
      ["Round near-integer decimals.", "Estimate before calculating.", "Check the answer range."]
    );
  },

  _approxPercentage() {
    const a = this.getRandomInt(180, 920);
    const pct = this.getRandomChoice([19.8, 24.9, 33.3, 49.8, 50.2, 74.9]);
    const b = this.getRandomInt(20, 80);
    const answer = Math.round((a * pct / 100) + b);

    return this.package(
      "Approximation",
      `${a} × ${pct}% + ${b} ≈ ?`,
      answer,
      "Round the percentage to a nearby simple percentage, then use the options to confirm.",
      `Treat ${pct}% as approximately ${Math.round(pct)}% and calculate the main term quickly.`,
      "Near 20%, 25%, 33⅓%, 50% and 75% values are designed to be recognised instantly.",
      [`Approximate ${pct}% using a nearby familiar percentage.`, `Add ${b}.`, `Nearest answer ≈ ${answer}.`],
      ["Use familiar percentage fractions.", "Don't calculate unnecessary decimal precision.", "Confirm against the options."]
    );
  },

  _approxDivision() {
    const divisor = this.getRandomChoice([19.8, 24.9, 49.8, 50.2, 99.5]);
    const multiplier = this.getRandomChoice([20, 25, 50, 100]);
    const dividend = Math.round(Number(divisor) * multiplier);
    const add = this.getRandomInt(15, 80);
    const answer = Math.round(dividend / Number(divisor) + add);

    return this.package(
      "Approximation",
      `${dividend} ÷ ${divisor} + ${add} ≈ ?`,
      answer,
      "Recognise the divisor as a near-friendly number and estimate the quotient first.",
      `Treat ${divisor} as its nearby round value, find the quotient, then add ${add}.`,
      "Near 20/25/50/100 divisors are usually faster to handle as friendly numbers.",
      [`Approximate the divisor.`, `Estimate the quotient ≈ ${Math.round(dividend / Number(divisor))}.`, `Add ${add}.`],
      ["Use a friendly divisor.", "Estimate the quotient before exact division.", "Use answer choices as a safety check."]
    );
  },

  _approxRoot() {
    const n = this.getRandomInt(18, 42);
    const near = n * n + this.getRandomChoice([-3, -2, -1, 1, 2, 3]);
    const a = this.getRandomInt(20, 80);
    const answer = Math.round(Math.sqrt(near) * a);

    return this.package(
      "Approximation",
      `√${near} × ${a} ≈ ?`,
      answer,
      "Identify the nearest perfect square before estimating the root.",
      `√${near} is close to ${n}; multiply that estimate by ${a}.`,
      "For approximation, the nearest perfect square is usually all you need.",
      [`${near} is close to ${n}² = ${n * n}.`, `So √${near} ≈ ${n}.`, `Multiply by ${a} → ≈ ${answer}.`],
      ["Locate the nearest square.", "Use the root as the estimate.", "Check which option range fits."]
    );
  },

  // --------------------------------------------------
  // NUMBER SERIES
  // --------------------------------------------------

  generateNumberSeries(isWrongSeries = false) {
    const generators = [
      () => this._seriesAltMultiplyAdd(),
      () => this._seriesIncreasingDifference(),
      () => this._seriesSquareDifference(),
      () => this._seriesMultiplyAdjust(),
      () => this._seriesFractionMultiply(),
      () => this._seriesAlternating(),
      () => this._seriesSecondDifference(),
      () => this._seriesConsecutiveProduct()
    ];

    for (let attempt = 0; attempt < 150; attempt++) {
      const generated = this.getRandomChoice(generators)();
      if (!generated) continue;

      const series = generated.series.slice();
      const pattern = generated.pattern;
      const answerIndex = this.getRandomInt(2, 4);

      if (!isWrongSeries) {
        const answer = series[answerIndex];
        series[answerIndex] = "?";

        const question = `Find the missing term: ${series.join(", ")}`;
        if (!this.isNew(question)) continue;

        return this.package(
          "Missing Number Series",
          question,
          answer,
          "Check the relationship between consecutive terms before calculating every possibility.",
          pattern.approach,
          pattern.shortcut,
          pattern.steps,
          pattern.quickMethods
        );
      }

      // Wrong-series construction: create a valid series first, then alter
      // one displayed term. The answer is the ACTUAL wrong displayed term.
      const wrongIndex = this.getRandomInt(2, 5);
      const correctValue = series[wrongIndex];

      let wrongValue;
      const offsets = [
        Math.max(1, Math.round(Math.abs(correctValue) * 0.04)),
        Math.max(2, Math.round(Math.abs(correctValue) * 0.06)),
        Math.max(3, Math.round(Math.abs(correctValue) * 0.08))
      ];
      const offset = this.getRandomChoice(offsets);
      wrongValue = correctValue + (Math.random() < 0.5 ? offset : -offset);

      if (wrongValue === correctValue || wrongValue <= 0) continue;

      series[wrongIndex] = wrongValue;
      const question = `Find the wrong term: ${series.join(", ")}`;
      if (!this.isNew(question)) continue;

      return this.package(
        "Wrong Number Series",
        question,
        wrongValue,
        "Check the series rule across all terms; the wrong displayed value should break the established relationship.",
        pattern.approach,
        pattern.shortcut,
        [
          ...pattern.steps,
          `The displayed wrong term is ${wrongValue}; the value required by the pattern is ${correctValue}.`
        ],
        pattern.quickMethods
      );
    }

    return this._fallbackSeries(isWrongSeries);
  },

  _seriesAltMultiplyAdd() {
    const start = this.getRandomInt(6, 15);
    const m = this.getRandomChoice([2, 3]);
    const adj = this.getRandomInt(1, 5);
    const s = [start];

    for (let i = 0; i < 6; i++) {
      s.push(s[s.length - 1] * m + (i % 2 === 0 ? adj : -adj));
    }

    return {
      series: s,
      pattern: {
        approach: `Test multiplication first, then check the small alternating adjustment: ×${m} ± ${adj}.`,
        shortcut: "Compare each term with the previous term; the multiplier is more stable than the raw differences.",
        steps: [`Apply ×${m} and alternate +${adj}/−${adj}.`, "The same rule continues through the series."],
        quickMethods: ["Check ratios first.", "Look for a small repeating adjustment.", "Verify the rule with at least three transitions."]
      }
    };
  },

  _seriesIncreasingDifference() {
    const start = this.getRandomInt(20, 80);
    const first = this.getRandomInt(5, 15);
    const increment = this.getRandomChoice([2, 3, 4, 5]);
    const s = [start];
    let d = first;

    for (let i = 0; i < 6; i++) {
      s.push(s[s.length - 1] + d);
      d += increment;
    }

    return {
      series: s,
      pattern: {
        approach: "Write the first differences. If those differences themselves form a simple progression, use the second layer.",
        shortcut: `Differences increase by ${increment} each time.`,
        steps: [`First difference starts at ${first}.`, `Each following difference increases by ${increment}.`, "Continue the difference pattern."],
        quickMethods: ["Use a difference column.", "Check second differences.", "Don't search for multiplication if the differences are clearly structured."]
      }
    };
  },

  _seriesSquareDifference() {
    const start = this.getRandomInt(20, 70);
    const shift = this.getRandomChoice([1, 2, 3]);
    const s = [start];

    for (let i = 1; i <= 6; i++) {
      s.push(s[s.length - 1] + (i + shift) ** 2);
    }

    return {
      series: s,
      pattern: {
        approach: "Calculate consecutive differences and compare them with square numbers.",
        shortcut: `The differences follow consecutive squares beginning from ${1 + shift}².`,
        steps: ["Find successive differences.", `Match them to ${1 + shift}², ${2 + shift}², ${3 + shift}²...`, "Continue the square-difference pattern."],
        quickMethods: ["Check differences.", "Know small squares instantly.", "Confirm with two or three differences."]
      }
    };
  },

  _seriesMultiplyAdjust() {
    const start = this.getRandomInt(5, 12);
    const m = this.getRandomChoice([2, 3, 4]);
    const startAdj = this.getRandomInt(1, 4);
    const s = [start];

    for (let i = 0; i < 6; i++) {
      s.push(s[s.length - 1] * m + startAdj * (i + 1));
    }

    return {
      series: s,
      pattern: {
        approach: `Look for ×${m}, then examine the increasing added values.`,
        shortcut: `Each step is ×${m} + ${startAdj}×(step number).`,
        steps: [`Multiply each term by ${m}.`, "The required adjustment increases regularly.", "Continue the combined rule."],
        quickMethods: ["Estimate the multiplier first.", "Subtract the multiplied value to reveal the adjustment.", "Check the adjustment progression."]
      }
    };
  },

  _seriesFractionMultiply() {
    const start = this.getRandomChoice([8, 12, 16, 20, 24, 32]);
    const factors = this.getRandomChoice([
      [1.5, 2, 2.5, 3, 3.5, 4],
      [0.5, 1, 1.5, 2, 2.5, 3]
    ]);
    const s = [start];

    for (const f of factors) s.push(Math.round(s[s.length - 1] * f));

    return {
      series: s,
      pattern: {
        approach: "Compare consecutive terms as multiplication factors rather than only looking at differences.",
        shortcut: `The multipliers progress in a regular sequence: ${factors.join(", ")}.`,
        steps: ["Divide each term by the previous term.", "Identify the multiplier progression.", "Continue it for the missing/wrong position."],
        quickMethods: ["Check ratios.", "Recognise halves and halves-plus-one patterns.", "Use exact multiplication rather than decimals where possible."]
      }
    };
  },

  _seriesAlternating() {
    const start = this.getRandomInt(10, 40);
    const s = [start];
    const a = this.getRandomChoice([3, 5, 7]);
    const b = this.getRandomChoice([2, 4, 6]);

    for (let i = 0; i < 6; i++) {
      s.push(s[s.length - 1] + (i % 2 === 0 ? a : b));
    }

    return {
      series: s,
      pattern: {
        approach: "Separate odd-to-even and even-to-odd transitions.",
        shortcut: `Two additions alternate: +${a}, +${b}.`,
        steps: [`Odd transition uses +${a}.`, `Even transition uses +${b}.`, "Repeat the alternating pair."],
        quickMethods: ["Split the sequence into two transitions.", "Don't force one difference rule.", "Check positions rather than only values."]
      }
    };
  },

  _seriesSecondDifference() {
    const start = this.getRandomInt(15, 60);
    const d1 = this.getRandomInt(3, 10);
    const dd = this.getRandomChoice([2, 3, 4]);
    const s = [start];
    let d = d1;

    for (let i = 0; i < 6; i++) {
      s.push(s[s.length - 1] + d);
      d += dd;
    }

    return {
      series: s,
      pattern: {
        approach: "Use the difference-of-differences method.",
        shortcut: `The second difference is constant at ${dd}.`,
        steps: ["Find the first differences.", `Their differences remain +${dd}.`, "Continue the first-difference sequence."],
        quickMethods: ["Write two rows of differences mentally.", "Look for a constant second difference.", "Verify across several terms."]
      }
    };
  },

  _seriesConsecutiveProduct() {
    const start = this.getRandomInt(2, 8);
    const add = this.getRandomInt(1, 5);
    const s = [start];

    for (let i = 1; i <= 6; i++) {
      s.push(s[s.length - 1] + (i * (i + add)));
    }

    return {
      series: s,
      pattern: {
        approach: "Check whether the differences themselves are products of consecutive or near-consecutive integers.",
        shortcut: `Differences follow i × (i + ${add}).`,
        steps: ["Find consecutive differences.", `Match them to products with a fixed gap of ${add}.`, "Continue the product-difference pattern."],
        quickMethods: ["Inspect differences first.", "Look for n(n+k).", "Avoid guessing from the raw terms."]
      }
    };
  },

  _fallbackSeries(isWrong) {
    const series = [12, 18, 26, 36, 48, 62, 78];
    if (!isWrong) {
      series[3] = "?";
      return this.package(
        "Missing Number Series",
        `Find the missing term: ${series.join(", ")}`,
        36,
        "Use the increasing difference pattern.",
        "Differences are +6, +8, +10, +12, +14, +16.",
        "The differences increase by 2.",
        ["Find the differences.", "Continue the +2 increase in differences.", "Missing term = 36."],
        ["Check differences first.", "Look for a constant second difference."]
      );
    }

    series[3] = 35;
    return this.package(
      "Wrong Number Series",
      `Find the wrong term: ${series.join(", ")}`,
      35,
      "The displayed term 35 breaks the increasing-difference pattern.",
      "Check the differences: they should increase by 2.",
      "Use the difference row to identify the broken transition.",
      ["Expected sequence has +6, +8, +10, +12...", "The displayed 35 breaks that rule.", "Wrong term = 35."],
      ["Use differences.", "Check the pattern across all terms."]
    );
  }
};


// ==================================================
// PR CLERK 2026 - MODERATE GENERATOR INTEGRATION
// ==================================================

function moderateIntegratedOptions(ans, extra=[]) {
  const out = [];
  const add = v => {
    const s = String(v);
    if (s !== String(ans) && !out.includes(s)) out.push(s);
  };

  if (String(ans).includes("/")) {
    const s = String(ans);
    const parts = s.split(" ");
    if (parts.length === 2) {
      const whole = Number(parts[0]);
      const f = parts[1].split("/");
      const num = Number(f[0]), den = Number(f[1]);
      if (Number.isFinite(whole) && Number.isFinite(num) && Number.isFinite(den)) {
        add(`${whole + 1} ${num}/${den}`);
        add(`${Math.max(0, whole - 1)} ${num}/${den}`);
        add(`${whole} ${Math.max(1, num + 1)}/${den}`);
        add(`${whole} ${Math.max(1, num)}/${den + 1}`);
      }
    }
    extra.forEach(add);
    while (out.length < 3) add(`0/${out.length + 2}`);
    return [String(ans), ...out.slice(0, 3)].sort(() => Math.random() - 0.5);
  }

  const n = Number(ans);
  if (Number.isFinite(n)) {
    extra.forEach(add);
    const candidates = [
      n - 1, n + 1, n - 2, n + 2, n - 5, n + 5,
      n - 10, n + 10, n * 0.9, n * 1.1
    ];
    candidates.forEach(add);
    while (out.length < 3) add(n + out.length + 1);
  } else {
    extra.forEach(add);
    while (out.length < 3) add(`Option ${out.length + 1}`);
  }
  return [String(ans), ...out.slice(0, 3)].sort(() => Math.random() - 0.5);
}

function moderateIntegrated(result) {
  if (!result) return null;
  const z = {
    expr: String(result.question || result.expr || ""),
    ans: String(result.answer ?? result.ans ?? ""),
    exp: result.coach?.steps?.join(" ") || "",
    skill: String(result.type || result.skill || "Moderate"),
    diff: "Moderate",
    options: null
  };

  const c = result.coach || {};
  z.coach = {
    highlight: c.highlight || result.highlight || "Recognise the calculation pattern before starting.",
    approach: c.approach || "Use the shortest pattern-based route.",
    shortcut: c.shortcut || "Look for cancellation, friendly numbers and familiar percentage/fraction equivalents.",
    quickMethods: c.quickMethods || [],
    steps: c.steps || [z.exp, `Final answer: ${z.ans}.`]
  };

  z.options = moderateIntegratedOptions(z.ans);
  return z;
}

// Replace the old Moderate generators without touching Easy.
function moderateSimplification() {
  return moderateIntegrated(ModerateGenerator.generateSimplification());
}

function moderateApproximation() {
  return moderateIntegrated(ModerateGenerator.generateApproximation());
}

function moderateSeries() {
  return moderateIntegrated(ModerateGenerator.generateNumberSeries(Math.random() < 0.5));
}

// ==================================================
// PR CLERK 2026 - MODERATE TOPIC EXPANSION
// ==================================================
// Based on PYQ/shift-trend analysis: Clerk Prelims has repeatedly used
// Simplification/Approximation, Missing/Wrong Number Series and,
// in many earlier cycles/shifts, Quadratic Equations. Recent shifts vary,
// so this app trains each pattern independently rather than assuming a
// fixed paper distribution.
// ==================================================

function moderateQuadratic() {
  // Quadratic bank: deliberately varied. This is NOT a single
  // "x² − ax + b" / larger-root drill.  Each family tests a different
  // root relation or quadratic property commonly useful in clerk exams.
  const type=R(1,16);
  const rel=(a,b)=>a>b?"x > y":a<b?"x < y":"x = y";
  const qout=(expr,ans,highlight,approach,shortcut,steps,methods=[],meta={})=>{
    const z=q(expr,ans,"", "Quadratic Equations", "Moderate", null);
    z.coach={highlight,approach,shortcut,steps,quickMethods:methods};
    z.meta={...(z.meta||{}),...meta};
    z.options=(typeof ans==="string" && /^x\s*(>|<|=|>=|<=|≥|≤)\s*y$/i.test(ans))?["x > y","x ≥ y","x = y","x < y","x ≤ y"]:null;
    return z;
  };
  const factor=(a,b)=>`(${a>0?a:`− ${Math.abs(a)}`})(${b>0?b:`− ${Math.abs(b)}`})`;
  const eq=(A,B,C,v)=>{
    const ap=A===1?`${v}²`:`${A}${v}²`;
    const bp=B===0?"":` ${B>0?"+":"−"} ${Math.abs(B)}${v}`;
    const cp=C===0?"":` ${C>0?"+":"−"} ${Math.abs(C)}`;
    return `${ap}${bp}${cp} = 0`;
  };

  // 1–4: direct root-comparison families, but with different target relations.
  if(type<=4){
    const r1a=R(2,16), r1b=R(3,22), r2a=R(2,16), r2b=R(3,22);
    if(r1a===r1b||r2a===r2b) return moderateQuadratic();
    const s1=r1a+r1b,p1=r1a*r1b,s2=r2a+r2b,p2=r2a*r2b;
    const big1=Math.max(r1a,r1b), big2=Math.max(r2a,r2b), small1=Math.min(r1a,r1b), small2=Math.min(r2a,r2b);
    if(type===1){
      const ans=rel(big1,big2);
      return qout(`I. x² − ${s1}x + ${p1} = 0\nII. y² − ${s2}y + ${p2} = 0\nCompare the larger roots of x and y.`,ans,
        "Compare the required roots; do not solve both with the formula.",
        "Factor each equation and identify the larger root.",
        "For x² − Sx + P = 0, look for two factors with sum S and product P.",
        [`I: roots are ${r1a}, ${r1b} → larger root = ${big1}.`,`II: roots are ${r2a}, ${r2b} → larger root = ${big2}.`,`Therefore ${ans}.`],
        ["Factor by inspection first.","Read the question carefully: larger root, not either root."]);
    }
    if(type===2){
      const ans=rel(small1,small2);
      return qout(`I. x² − ${s1}x + ${p1} = 0\nII. y² − ${s2}y + ${p2} = 0\nCompare the smaller roots of x and y.`,ans,
        "Same equations, different target: compare the smaller roots.",
        "Factor and take the smaller factor from each equation.",
        "Once factored, you need only the requested root.",
        [`I: roots ${r1a}, ${r1b} → smaller = ${small1}.`,`II: roots ${r2a}, ${r2b} → smaller = ${small2}.`,`Therefore ${ans}.`],
        ["Do not automatically take the larger root.","Use the exact relation asked."]);
    }
    if(type===3){
      const A1=P([2,3,4,5]),A2=P([2,3,4,5]);
      const B1=-A1*s1,C1=A1*p1,B2=-A2*s2,C2=A2*p2;
      const sum1=-B1/A1,sum2=-B2/A2,ans=rel(sum1,sum2);
      return qout(`I. ${eq(A1,B1,C1,"x")}\nII. ${eq(A2,B2,C2,"y")}\nCompare the sum of roots of x and y.`,ans,
        "The coefficients already give the sum of roots.",
        "Use α + β = −b/a instead of finding either root.",
        "For ax² + bx + c = 0, sum of roots = −b/a.",
        [`I: sum of x-roots = −(${B1})/${A1} = ${sum1}.`,`II: sum of y-roots = −(${B2})/${A2} = ${sum2}.`,`Therefore ${ans}.`],
        ["Never factor if the required value is directly available from coefficients.","Watch the sign of b."]);
    }
    const A1=P([2,3,4,5]),A2=P([2,3,4,5]);
    const B1=-A1*s1,C1=A1*p1,B2=-A2*s2,C2=A2*p2;
    const prod1=C1/A1,prod2=C2/A2,ans=rel(prod1,prod2);
    return qout(`I. ${eq(A1,B1,C1,"x")}\nII. ${eq(A2,B2,C2,"y")}\nCompare the product of roots of x and y.`,ans,
      "The constant/coefficient ratio gives the product immediately.",
      "Use αβ = c/a; no root calculation is required.",
      "For ax² + bx + c = 0, product of roots = c/a.",
      [`I: product = ${C1}/${A1} = ${prod1}.`,`II: product = ${C2}/${A2} = ${prod2}.`,`Therefore ${ans}.`],
      ["Look at c/a before factoring.","Coefficient relationships can be faster than solving."]);
  }

  // 5–7: relations derived from roots, not individual root-taking.
  if(type===5){
    const a=R(3,15),b=R(2,18),s=a+b,p=a*b;
    const A=P([2,3,4]);
    const B=-A*s,C=A*p;
    const value=s*s-2*p;
    return qout(`${eq(A,B,C,"x")}\nIf the roots are α and β, find α² + β².`,value,
      "Use (α+β)² − 2αβ; do not find α and β separately.",
      "Take sum and product from the coefficients, then apply the identity.",
      "α²+β² = (α+β)² − 2αβ.",
      [`α+β = −(${B})/${A} = ${s}.`,`αβ = ${C}/${A} = ${p}.`,`α²+β² = ${s}² − 2(${p}) = ${value}.`],
      ["Coefficient → sum/product → identity.","Avoid solving roots when only a relation is asked."]);
  }
  if(type===6){
    const a=R(2,14),b=R(2,16),s=a+b,p=a*b,A=P([2,3,5]);
    const B=-A*s,C=A*p,value=s/p;
    return qout(`${eq(A,B,C,"x")}\nIf the roots are α and β, find 1/α + 1/β.`,F(s,p),
      "Reverse the roots using (α+β)/αβ.",
      "Use sum/product of roots directly.",
      "1/α + 1/β = (α+β)/αβ.",
      [`α+β = ${s}.`,`αβ = ${p}.`,`1/α + 1/β = ${s}/${p} = ${F(s,p)}.`],
      ["Use the coefficient relationships first.","Keep the answer as a fraction when appropriate."]);
  }
  if(type===7){
    const r=R(3,18),other=R(2,16),A=P([2,3,4,5]);
    const B=-A*(r+other),C=A*r*other;
    const target=r*r+other*other;
    return qout(`${eq(A,B,C,"x")}\nOne root is ${r}. Find the sum of the squares of the two roots.`,target,
      "You can identify the second root from the sum, then use the square relation.",
      "Find the other root from α+β, then calculate α²+β².",
      "Use α+β = −b/a first; avoid the quadratic formula.",
      [`α+β = ${r+other}, so the other root = ${other}.`,`α²+β² = ${r}² + ${other}² = ${target}.`],
      ["A known root is a shortcut.","Use coefficient relations before formula."]);
  }

  // 8–10: parameter / repeated-root / root-difference questions.
  if(type===8){
    const a=P([2,3,4,5]),b=R(6,18); // ax² + bx + k = 0 has equal roots
    const k=(b*b)/(4*a);
    return qout(`${a}x² − ${b}x + k = 0 has equal roots. Find k.`,F(b*b,4*a),
      "Equal roots means discriminant = 0.",
      "Set b² − 4ac = 0 and solve for k.",
      "For ax²+bx+c=0 with equal roots: c = b²/(4a).",
      [`b² − 4a k = 0`,`k = ${b}²/(4×${a}) = ${F(b*b,4*a)}.`],
      ["Repeated/equal roots → D = 0.","Do not solve the quadratic itself."]);
  }
  if(type===9){
    const r=R(4,14),d=R(2,7),s=2*r+d,p=r*(r+d),A=P([2,3,4]);
    const B=-A*s,C=A*p;
    return qout(`${eq(A,B,C,"x")}\nThe difference between the roots is ${d}. Find the larger root.`,r+d,
      "Difference + sum lets you recover the roots quickly.",
      "Let larger = smaller + d; combine with the root sum.",
      "Larger root = (sum + difference)/2.",
      [`Sum of roots = −(${B})/${A} = ${s}.`,`Larger root = (${s} + ${d})/2 = ${r+d}.`],
      ["When root difference is given, use half-sum/half-difference."]);
  }
  if(type===10){
    const r=R(3,14),d=R(2,6),s=2*r+d,p=r*(r+d),A=P([2,3,4]);
    const B=-A*s,C=A*p;
    return qout(`${eq(A,B,C,"x")}\nThe roots differ by ${d}. Find the smaller root.`,r,
      "Use smaller root = (sum − difference)/2.",
      "Get the root sum from coefficients, then subtract the difference.",
      "Smaller root = (sum − difference)/2.",
      [`Sum = −(${B})/${A} = ${s}.`,`Smaller root = (${s} − ${d})/2 = ${r}.`],
      ["Do not factor unless needed."]);
  }

  // 11–13: equation from root conditions / transformed-root values.
  if(type===11){
    const a=R(2,12),b=R(3,14),A=P([2,3,4]);
    const s=a+b,p=a*b,B=-A*s,C=A*p;
    const value=(a-b)*(a-b);
    return qout(`${eq(A,B,C,"x")}\nIf roots are α and β, find (α − β)².`,value,
      "Use (α−β)² = (α+β)² − 4αβ.",
      "Read sum and product from coefficients, then apply the identity.",
      "(α−β)² = (α+β)² − 4αβ.",
      [`α+β = ${s}.`,`αβ = ${p}.`,`(α−β)² = ${s}² − 4(${p}) = ${value}.`],
      ["This avoids finding either root."]);
  }
  if(type===12){
    const a=R(2,12),b=R(3,16),s=a+b,p=a*b,A=P([2,3,5]);
    const B=-A*s,C=A*p;
    const value=s*s/p;
    return qout(`${eq(A,B,C,"x")}\nIf roots are α and β, find (α+β)²/(αβ).`,F(s*s,p),
      "The expression is simply (sum of roots)² ÷ product.",
      "Read sum and product directly from coefficients.",
      "Use α+β = −b/a and αβ = c/a.",
      [`α+β = ${s}.`,`αβ = ${p}.`,`(${s})²/${p} = ${F(s*s,p)}.`],
      ["Simplify the expression before calculating."]);
  }
  if(type===13){
    const r1=R(2,12),r2=R(3,15),A=P([2,3,4]);
    const s=r1+r2,p=r1*r2,B=-A*s,C=A*p;
    const value=s-p;
    return qout(`${eq(A,B,C,"x")}\nIf the roots are α and β, find (α+β) − αβ.`,value,
      "Both required quantities come directly from the coefficients.",
      "Find sum = −b/a and product = c/a, then subtract.",
      "Do not find the roots individually.",
      [`α+β = ${s}.`,`αβ = ${p}.`,`(${s}) − (${p}) = ${value}.`],
      ["Coefficient relationships are the fastest route."]);
  }

  // 14–16: genuine two-equation relationships using different root properties.
  const a1=R(2,12),b1=R(3,15),a2=R(2,12),b2=R(3,15);
  const A1=P([2,3,4]),A2=P([2,3,4]);
  const s1=a1+b1,p1=a1*b1,s2=a2+b2,p2=a2*b2;
  const B1=-A1*s1,C1=A1*p1,B2=-A2*s2,C2=A2*p2;
  if(type===14){
    const v1=s1*s1-2*p1,v2=s2*s2-2*p2,ans=rel(v1,v2);
    return qout(`I. ${eq(A1,B1,C1,"x")}\nII. ${eq(A2,B2,C2,"y")}\nCompare (sum of squares of roots) for x and y.`,ans,
      "Convert each quadratic into α²+β² using sum and product.",
      "For each equation, calculate S²−2P, then compare.",
      "α²+β² = (α+β)²−2αβ.",
      [`I: S=${s1}, P=${p1} → S²−2P = ${v1}.`,`II: S=${s2}, P=${p2} → S²−2P = ${v2}.`,`Therefore ${ans}.`],
      ["Compare the requested relation, not the individual roots."]);
  }
  if(type===15){
    const v1=(s1*s1)/p1,v2=(s2*s2)/p2,ans=rel(v1,v2);
    return qout(`I. ${eq(A1,B1,C1,"x")}\nII. ${eq(A2,B2,C2,"y")}\nCompare (sum of roots)²/(product of roots) for x and y.`,ans,
      "The requested expression needs only S and P.",
      "Compute S²/P for each equation from coefficients.",
      "S=−b/a and P=c/a.",
      [`I: S²/P = ${F(s1*s1,p1)}.`,`II: S²/P = ${F(s2*s2,p2)}.`,`Therefore ${ans}.`],
      ["Do not solve the equations."]);
  }
  const v1=Math.abs(a1-b1),v2=Math.abs(a2-b2),ans=rel(v1,v2);
  return qout(`I. ${eq(A1,B1,C1,"x")}\nII. ${eq(A2,B2,C2,"y")}\nCompare the absolute difference between the roots of x and y.`,ans,
    "The root difference can be obtained without explicitly solving both roots.",
    "Use (α−β)² = S²−4P, then compare the positive differences.",
    "Calculate the squared difference first; compare squares instead of taking roots.",
    [`I: S²−4P = ${s1*s1-4*p1} → difference = ${v1}.`,`II: S²−4P = ${s2*s2-4*p2} → difference = ${v2}.`,`Therefore ${ans}.`],
    ["Compare squared values when both are non-negative.","Avoid unnecessary root calculation."]);
}

function advancedQuadratic(){
  // HARD QUADRATIC: advanced quadratic problems, NOT x/y root comparison.
  // MCQ only. Uses root relationships, powers, reciprocals and conditions.

  const type=R(1,8);

  const qout=(expr,ans,extra,highlight,approach,shortcut,steps)=>{
    const all=[String(ans),...extra.map(String).filter(v=>String(v)!==String(ans))];
    const options=sh([...new Set(all)]).slice(0,5);
    const z=q(expr,ans,"","Quadratic Equations","Hard",options);
    z.coach={
      highlight,approach,shortcut,steps,
      quickMethods:[
        "Use root relationships before the quadratic formula.",
        "Translate the condition into sum/product of roots first."
      ]
    };
    return z;
  };

  const A=R(1,5);
  const r1=R(2,12), r2=R(2,12);
  const S=r1+r2, P0=r1*r2;
  const B=-A*S, C=A*P0;
  const equation=`${A===1?"":A+" "}x² ${B<0?"−":"+"} ${Math.abs(B)}x ${C<0?"−":"+"} ${Math.abs(C)} = 0`;

  if(type===1){
    const ans=S*S-2*P0;
    return qout(`${equation}\nIf α and β are the roots, find α² + β².`,ans,
      [ans+2,ans-2,ans+4,Math.max(1,ans-4)],
      "The target is a power of the roots, so do not solve the roots separately.",
      "Find α+β and αβ from the coefficients, then use α²+β²=(α+β)²−2αβ.",
      "Use S²−2P directly.",
      [`α+β = −b/a = ${S}.`,`αβ = c/a = ${P0}.`,`α²+β² = ${S}² − 2(${P0}) = ${ans}.`]);
  }

  if(type===2){
    const ans=S*S*S-3*P0*S;
    return qout(`${equation}\nIf α and β are the roots, find α³ + β³.`,ans,
      [ans+S,ans-S,ans+2*P0,ans-2*P0],
      "Cube sums can be obtained directly from the sum and product of roots.",
      "Use α³+β³=(α+β)³−3αβ(α+β).",
      "Take S and P once, then substitute.",
      [`S = ${S}, P = ${P0}.`,`α³+β³ = S³ − 3PS.`,`= ${S}³ − 3(${P0})(${S}) = ${ans}.`]);
  }

  if(type===3){
    const ans=F(S,P0);
    return qout(`${equation}\nIf α and β are the roots, find 1/α + 1/β.`,ans,
      [F(S+1,P0),F(Math.max(1,S-1),P0),F(S,P0+1),F(S+2,P0)],
      "For reciprocals, interchange the usual root sum/product relationship.",
      "Use 1/α+1/β=(α+β)/(αβ).",
      "Use S/P instead of finding either root.",
      [`α+β = ${S}.`,`αβ = ${P0}.`,`1/α+1/β = ${S}/${P0} = ${ans}.`]);
  }

  if(type===4){
    const numerator=S*S-2*P0, denominator=P0*P0, ans=F(numerator,denominator);
    return qout(`${equation}\nIf α and β are the roots, find 1/α² + 1/β².`,ans,
      [F(numerator+1,denominator),F(Math.max(1,numerator-2),denominator),F(numerator,denominator+1),F(numerator+2,denominator)],
      "First obtain α²+β², then divide by (αβ)².",
      "Use 1/α²+1/β²=(α²+β²)/(αβ)².",
      "Calculate the numerator from S²−2P.",
      [`α²+β² = ${numerator}.`,`(αβ)² = ${P0}² = ${denominator}.`,`Therefore = ${numerator}/${denominator} = ${ans}.`]);
  }

  if(type===5){
    const ans=S*S-4*P0;
    return qout(`${equation}\nIf α and β are the roots, find (α − β)².`,ans,
      [ans+4,Math.max(0,ans-4),ans+S,Math.max(0,ans-P0)],
      "The square of the root difference can be obtained without finding either root.",
      "Use (α−β)²=(α+β)²−4αβ.",
      "Compare S² and 4P directly.",
      [`S = ${S}, P = ${P0}.`,`(α−β)² = ${S}² − 4(${P0}) = ${ans}.`]);
  }

  if(type===6){
    const known=r1, other=r2;
    return qout(`${equation}\nOne root is ${known}. Find the other root.`,other,
      [other+1,Math.max(1,other-1),S+1,Math.max(1,S-known+2)],
      "Once one root is known, the sum of roots gives the other immediately.",
      "Use α+β=−b/a.",
      "Other root = S − known root.",
      [`α+β = ${S}.`,`Other root = ${S} − ${known} = ${other}.`]);
  }

  if(type===7){
    const known=R(2,9), a=R(1,4), b=R(-10,10);
    const k=-(a*known*known+b*known);
    return qout(`${a===1?"":a+" "}x² ${b<0?"−":"+"} ${Math.abs(b)}x + k = 0 has a root x = ${known}. Find k.`,k,
      [k+known,k-known,k+2*known,k-2*known],
      "A known root lets you substitute directly; no quadratic formula is needed.",
      "Put x equal to the known root and isolate k.",
      "Calculate ax²+bx first, then change its sign.",
      [`${a}(${known})² ${b<0?"−":"+"} ${Math.abs(b)}(${known}) + k = 0.`,`k = ${k}.`]);
  }

  const ans=S*S+P0;
  return qout(`${equation}\nIf α and β are the roots, find α² + β² + αβ.`,ans,
    [ans+S,ans-P0,ans+2,Math.max(1,ans-2)],
    "Combine the standard root identities instead of solving for α and β.",
    "Use α²+β²+αβ=(α+β)²−αβ.",
    "Use S²−P in one line.",
    [`S = ${S}, P = ${P0}.`,`S² − P = ${S}² − ${P0} = ${ans}.`]);
}

function hardSeriesMCQOptions(ans){
  const n=Number(ans);
  const candidates=[n,n+2,n-2,n+5,n-5,n+10,n-10];
  const out=[];
  for(const v of candidates){
    if(Number.isFinite(v) && !out.includes(String(v))) out.push(String(v));
    if(out.length===5) break;
  }
  return sh(out);
}
function hardRelationMCQOptions(ans){
  const base=["P > Q","P ≥ Q","P = Q","P < Q","P ≤ Q","P = √Q","P = 2Q","P = Q/2","P = √Q + 16","P = √Q − 16"];
  const out=[String(ans)];
  for(const v of base) if(!out.includes(v)) out.push(v);
  return sh(out.slice(0,5));
}

// ============================================================
// HARD → ADVANCED MISSING NUMBER SERIES
// ============================================================
function advancedMissingSeries(){
  const type=R(1,6);
  const clean=(arr)=>arr.map(v=>Number.isInteger(v)?String(v):String(Number(v.toFixed(2))));
  const out=(series,answer,approach,shortcut,steps,highlight)=>{
    return q(`Find the missing term: ${clean(series).join(", ")}`,answer,"","Missing Number Series","Hard",hardSeriesMCQOptions(answer));
  };

  if(type===1){
    // Alternating ×2 and increasing addition.
    const a=R(5,15), add=R(3,9), s=[a];
    for(let i=1;i<7;i++) s.push(i%2===1?s[i-1]*2+s[i-1]*0+s[0]*0+s[i-1]-s[i-1]+s[i-1]*2+s[0]*0+s[i-1]*0:s[i-1]+add+i);
    // Rebuild cleanly to avoid accidental dependence on the expression above.
    const z=[a];
    for(let i=1;i<7;i++) z.push(i%2===1?z[i-1]*2:z[i-1]+add+i);
    const idx=R(2,5),ans=z[idx],shown=z.slice();shown[idx]="?";
    return {expr:`Find the missing term: ${shown.join(", ")}`,ans:String(ans),exp:"","skill":"Missing Number Series","diff":"Hard",coach:{highlight:"The operations alternate; don't force one rule across the whole series.",approach:"Separate odd and even transitions, then continue each operation.",shortcut:"Check alternating multiplication/addition before using differences.",steps:[`Odd transitions use ×2.`,`Even transitions add ${add}+step number.`,`The missing term is ${ans}.`],quickMethods:["Split alternating operations.","Verify the rule on both sides of the gap."]}};
  }

  if(type===2){
    // Differences are consecutive squares multiplied by a coefficient.
    const k=R(1,3),start=R(10,40),z=[start];
    for(let i=1;i<7;i++) z.push(z[i-1]+k*i*i);
    const idx=R(2,5),ans=z[idx],shown=z.slice();shown[idx]="?";
    return {expr:`Find the missing term: ${shown.join(", ")}`,ans:String(ans),exp:"","skill":"Missing Number Series","diff":"Hard",coach:{highlight:`Successive differences follow ${k}×1², ${k}×2², ${k}×3²...`,approach:"Write the first differences and compare them with consecutive squares.",shortcut:"If differences grow quickly, test squares before second differences.",steps:[`Differences begin ${k}×1², ${k}×2², ${k}×3²...`,`The required difference at the gap gives ${ans}.`],quickMethods:["Check first differences.","Compare differences with square numbers."]}};
  }

  if(type===3){
    // ×2−n, ×3−n, ×4−n ...
    const start=R(8,20),n=R(1,5),z=[start];
    for(let i=1;i<7;i++) z.push(z[i-1]*(i+1)-n);
    const idx=R(2,5),ans=z[idx],shown=z.slice();shown[idx]="?";
    return {expr:`Find the missing term: ${shown.join(", ")}`,ans:String(ans),exp:"","skill":"Missing Number Series","diff":"Hard",coach:{highlight:"The multiplier increases by 1 while the subtraction stays fixed.",approach:"Inspect the multiplier from one transition to the next.",shortcut:"Try ×2−n, ×3−n, ×4−n... when terms rise sharply.",steps:[`Multipliers are ×2, ×3, ×4...`,`Subtract ${n} after each multiplication.`,`Missing term = ${ans}.`],quickMethods:["Check changing multipliers.","Keep the adjustment constant."]}};
  }

  if(type===4){
    // Alternating squares/cubes added.
    const start=R(5,20),z=[start];
    for(let i=1;i<7;i++) z.push(z[i-1]+(i%2?i*i:i*i*i));
    const idx=R(2,5),ans=z[idx],shown=z.slice();shown[idx]="?";
    return {expr:`Find the missing term: ${shown.join(", ")}`,ans:String(ans),exp:"","skill":"Missing Number Series","diff":"Hard",coach:{highlight:"The increments alternate between a square and a cube.",approach:"Take differences and classify each increment as n² or n³.",shortcut:"When differences jump irregularly, test alternating square/cube additions.",steps:[`Differences alternate: 1², 2³, 3², 4³...`,`Continue the alternating rule to get ${ans}.`],quickMethods:["Check differences first.","Test square/cube alternation."]}};
  }

  if(type===5){
    // Two interleaved sequences.
    const a=R(5,15),b=R(20,40),z=[a,b];
    for(let i=2;i<8;i++){
      if(i%2===0){const n=i/2;z.push(z[i-2]+n*3);}
      else {const n=(i-1)/2;z.push(z[i-2]+n*5+5);}
    }
    const idx=R(2,5),ans=z[idx],shown=z.slice();shown[idx]="?";
    return {expr:`Find the missing term: ${shown.join(", ")}`,ans:String(ans),exp:"","skill":"Missing Number Series","diff":"Hard",coach:{highlight:"There are two interleaved sequences hidden in the single row.",approach:"Separate odd-position and even-position terms, then continue each sequence.",shortcut:"If consecutive differences look messy, split odd and even positions.",steps:[`Odd-position terms follow one progression.`,`Even-position terms follow another progression.`,`The missing term is ${ans}.`],quickMethods:["Split odd/even positions.","Solve each mini-series separately."]}};
  }

  // Product/sum transformation: ×n + n².
  const start=R(4,10),z=[start];
  for(let i=1;i<7;i++) z.push(z[i-1]*(i+1)+(i+1)*(i+1));
  const idx=R(2,5),ans=z[idx],shown=z.slice();shown[idx]="?";
  return {expr:`Find the missing term: ${shown.join(", ")}`,ans:String(ans),exp:"","skill":"Missing Number Series","diff":"Hard",coach:{highlight:"Each step combines a changing multiplier with the square of that multiplier.",approach:"Look for ×n followed by +n² rather than only differences.",shortcut:"For rapidly growing terms, test ×n ± n² patterns.",steps:[`Step multipliers increase: ×2, ×3, ×4...`,`The adjustment is the square of the multiplier.`,`Missing term = ${ans}.`],quickMethods:["Check ×n with a linked adjustment.","Use the operation sequence, not raw differences."]}};
}

// ============================================================
// HARD → ADVANCED WRONG NUMBER SERIES
// Q110-STYLE: wrong term + P/Q relationship
// ============================================================
function advancedWrongSeries(){
  const type=R(1,4);

  // Exact Q110-style multiplier chain: ÷4, ÷2, ×1, ×2, ×4, ×8, ×16.
  // Start values are chosen so every term is integral and Q is a square.
  if(type===1){
    const start=P([8,32,128,512]);
    const mult=[1/4,1/2,1,2,4,8,16];
    const clean=[start];
    for(const m of mult) clean.push(clean[clean.length-1]*m);
    const Q=clean[7], root=Math.sqrt(Q);
    const wrongIndex=P([2,3,4,5]);
    const correct=clean[wrongIndex];
    const Pval=root;
    if(Pval===correct) return advancedWrongSeries();
    const shown=clean.slice(0,7);shown[wrongIndex]=Pval;
    const answer="P = √Q";
    const options=[answer,"P = √Q + 16","P = 2√Q","P = Q/2","P = √Q − 16"];
    return {expr:`A series is given with one wrong term. ${shown.join(", ")}, Q. If P is the wrong displayed term and Q is the next term of the corrected series, find the relation between P and Q.`,ans:answer,exp:"","skill":"Wrong Number Series","diff":"Hard",coach:{highlight:"The multipliers form ÷4, ÷2, ×1, ×2, ×4, ×8, ×16.",approach:"First identify the changing multiplier. Correct the broken term, then continue the clean sequence to Q.",shortcut:"Think in powers of 2: the multiplier doubles at every step after ÷4, ÷2, ×1.",steps:[`The multiplier pattern is ÷4, ÷2, ×1, ×2, ×4, ×8, ×16.`,`The displayed wrong term P = ${Pval}; the correct term there is ${correct}.`,`Continue the corrected pattern: Q = ${Q}.`,`√Q = √${Q} = ${root} = P.`,`Therefore P = √Q.`],quickMethods:["Find the operation pattern first.","Correct the term before finding Q.","Only then compare P and Q."]}};
  }

  if(type===2){
    // Square-difference wrong term, but final question still uses P/Q.
    const start=R(8,30),k=P([1,2,3]),clean=[start];
    for(let i=1;i<7;i++) clean.push(clean[i-1]+k*i*i);
    const wrongIndex=R(2,5),correct=clean[wrongIndex],Q=clean[6],Pval=correct+ k*4;
    if(Pval===correct||Pval<=0) return advancedWrongSeries();
    const shown=clean.slice(0,7);shown[wrongIndex]=Pval;
    const answer=Pval>Q?"P > Q":"P < Q";
    const options=["P > Q","P ≥ Q","P = Q","P < Q","P ≤ Q"];
    return {expr:`A series is given with one wrong term. ${shown.join(", ")}. If P is the wrong term and Q is the final term of the corrected series, compare P and Q.`,ans:answer,exp:"","skill":"Wrong Number Series","diff":"Hard",coach:{highlight:`The differences follow ${k}×1², ${k}×2², ${k}×3²...`,approach:"Use first differences to identify the broken term, then compare the displayed wrong term with the corrected final term.",shortcut:"For square-difference series, compare the wrong value with the corrected continuation instead of rebuilding everything.",steps:[`Expected difference pattern: ${k}×1², ${k}×2², ${k}×3²...`,`Wrong displayed term P = ${Pval}; correct value = ${correct}.`,`Corrected final term Q = ${Q}.`,`Therefore ${answer}.`],quickMethods:["Check square differences.","Separate wrong value from corrected value."]}};
  }

  if(type===3){
    // ×2, ×3, ×4... with a wrong term and relationship.
    const start=R(2,6),clean=[start];
    for(let i=1;i<7;i++) clean.push(clean[i-1]*(i+1));
    const wrongIndex=R(2,5),correct=clean[wrongIndex],Q=clean[6],Pval=correct*2;
    if(Pval===correct) return advancedWrongSeries();
    const shown=clean.slice(0,7);shown[wrongIndex]=Pval;
    const answer=Pval===2*Q?"P = 2Q":Pval<Q?"P < Q":"P > Q";
    const options=answer==="P = 2Q"?["P = 2Q","P = Q","P = Q/2","P > Q","P < Q"]:["P > Q","P = Q","P < Q","P = 2Q","P = Q/2"];
    return {expr:`A series is given with one wrong term. ${shown.join(", ")}. If P is the wrong term and Q is the final corrected term, find the relation between P and Q.`,ans:answer,exp:"","skill":"Wrong Number Series","diff":"Hard",coach:{highlight:"The clean sequence uses ×2, ×3, ×4, ×5...",approach:"Read the changing multiplier, locate the term that violates it, then compare P with Q.",shortcut:"When numbers grow fast, inspect multipliers before differences.",steps:[`Expected multipliers: ×2, ×3, ×4, ×5...`,`P = ${Pval}; corrected value = ${correct}.`,`Q = ${Q}.`,`Therefore ${answer}.`],quickMethods:["Check changing multipliers.","Correct before comparing."]}};
  }

  // Alternating ×2 and +n; final relation is numeric comparison.
  const start=R(5,15),add=R(3,8),clean=[start];
  for(let i=1;i<7;i++) clean.push(i%2?clean[i-1]*2:clean[i-1]+add+i);
  const wrongIndex=R(2,5),correct=clean[wrongIndex],Pval=correct+add,Q=clean[6];
  const shown=clean.slice(0,7);shown[wrongIndex]=Pval;
  const answer=Pval>Q?"P > Q":Pval<Q?"P < Q":"P = Q";
  const options=["P > Q","P ≥ Q","P = Q","P < Q","P ≤ Q"];
  return {expr:`A series is given with one wrong term. ${shown.join(", ")}. If P is the wrong term and Q is the final corrected term, compare P and Q.`,ans:answer,exp:"","skill":"Wrong Number Series","diff":"Hard",coach:{highlight:"The sequence alternates between multiplication and addition.",approach:"Separate the alternating operations, correct P, then compare it with Q.",shortcut:"Split odd and even transitions instead of forcing a single difference pattern.",steps:[`Odd transitions use ×2; even transitions add a growing adjustment.`,`P = ${Pval}; correct value = ${correct}.`,`Q = ${Q}.`,`Therefore ${answer}.`],quickMethods:["Split alternating operations.","Correct P before comparing with Q."]}};
}

function moderateBlindfold() {
  const type=R(1,5);
  if(type===1) return moderateSimplification();
  if(type===2) return moderateApproximation();
  if(type===3) return moderateQuadratic();
  if(type===4) return moderateSeries(false);
  return moderateSeries(true);
}

// Ensure the independent series topics remain separate even though the
// underlying generator is shared.
function moderateSeries(isWrong=false) {
  const r=ModerateGenerator.generateNumberSeries(isWrong);
  // Series are typed-answer questions, never MCQ.
  return {
    expr:String(r.question||r.expr||""),
    ans:String(r.answer??r.ans??""),
    exp:"",
    skill:isWrong ? "Wrong Number Series" : "Missing Number Series",
    diff:"Moderate",
    options:null,
    coach:{
      highlight:r.highlight||"Find the pattern before calculating.",
      approach:r.approach||r.shortcut||"Check differences, multipliers and alternating operations.",
      shortcut:r.shortcut||"Verify the same rule across the full series.",
      steps:r.steps||[],
      quickMethods:r.quickMethods||["Check differences first.","Test multiplication or alternating patterns."]
    }
  };
}

