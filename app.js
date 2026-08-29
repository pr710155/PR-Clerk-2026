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
{id:"series",name:"Number Series",desc:"Missing & wrong number patterns"}]},
{id:3,name:"Hard",desc:"Calculation Foundation",topics:[
{id:"hardquad",name:"Mains-Level Quadratic",desc:"Advanced quadratic practice"}]}
];

const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,P=a=>a[R(0,a.length-1)],G=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a},F=(n,d)=>{let g=G(n,d);return`${n/g}/${d/g}`},sh=a=>a.sort(()=>Math.random()-.5);
function opts(ans,more=[]){let s=new Set([String(ans)]);more.forEach(x=>{if(x!==undefined)s.add(String(x))});let d=1;while(s.size<4){let n=Number(ans);s.add(Number.isFinite(n)?String(n+(d%2?-d:d)):String(d));d++}return sh([...s]).slice(0,4)}
function pctOpts(a){let x=["6.25","10","12.5","15","16.67","20","25","30","33.33","37.5","40","45","50","60","62.5","66.67","70","75","80","87.5","90"];return sh([a,...x.filter(v=>v!==a)]).slice(0,4)}
function fracOpts(a){let x=["1/2","1/3","1/4","1/5","1/6","1/8","1/10","3/4","2/3","3/5","4/5","5/8","7/8"];return sh([a,...x.filter(v=>v!==a)]).slice(0,4)}
function q(expr,ans,exp,skill,diff="Easy",options=null){return{expr,ans:String(ans),exp,skill,diff,options:options?options.map(String):null}}
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
 if(topic==="series")return moderateSeries();
 let a=R(4,25),b=R(4,25),x=Math.max(a,b);return q(`x² − ${a+b}x + ${a*b} = 0; larger root?`,x,`The roots are ${a} and ${b}.`,"Mains-Level Quadratic","Hard")
}

function home(){stop();S.view="home";back.classList.add("hidden");subtitle.textContent="Speed Maths";screen.innerHTML=`<section class="hero home-hero"><span class="pill">PR CLERK 2026</span><h1>PR CLERK <span>2026</span></h1><p>Fast calculation training for Clerk-level exams.</p></section><div class="grid">${levels.map(l=>`<button class="card" onclick="level(${l.id})"><h2>${l.name}</h2><div class="topic">${l.desc}</div></button>`).join("")}</div>`}
function level(id){stop();S.view="level";S.level=levels.find(x=>x.id===id);back.classList.remove("hidden");subtitle.textContent="Speed Maths";screen.innerHTML=`<div class="hero"><h1>${S.level.name}</h1><p>${S.level.desc}</p></div><div class="grid ${id===1?"easy-grid":""}">${S.level.topics.map((t,idx)=>`<button class="card section-card" onclick="openSection('${t.id}')"><div><h3>${t.name}</h3><div class="topic">${t.desc}</div></div><span class="pill start">${t.id==="tables"||t.id==="number"?"CHOOSE →":"START PRACTICE →"}</span></button>`).join("")}</div>`}
function openSection(topic){if(topic==="tables")return tablePicker();if(topic==="number")return numberPicker();setup(topic)}
function tablePicker(){S.view="tablePicker";subtitle.textContent="Tables • Choose a table";screen.innerHTML=`<div class="hero"><span class="pill">TABLES</span><h1>Choose your table</h1><p>Choose exactly which table you want to practise. You can change it anytime.</p></div><div class="picker-grid tables-picker">${Array.from({length:25},(_,i)=>i+6).map(n=>`<button class="card picker-card" onclick="setup('tables',${n})"><span class="pill">TABLE ${n}</span><h3>Table ${n}</h3><div class="topic">${n} × 2 to ${n} × 20</div><span class="pill start">PRACTISE →</span></button>`).join("")}</div>`}
function numberPicker(){S.view="numberPicker";subtitle.textContent="Number Games • Choose operation";screen.innerHTML=`<div class="hero"><span class="pill">NUMBER GAMES</span><h1>Choose an operation</h1><p>Choose what you want to practise now.</p></div><div class="grid picker-ops">${[["addition","Addition","Build speed with addition"],["subtraction","Subtraction","Build speed with subtraction"],["multiplication","Multiplication","Learn faster multiplication patterns"],["division","Division","Build fast division recall"]].map(([id,n,d])=>`<button class="card section-card" onclick="setup('number','${id}')"><div><h3>${n}</h3><div class="topic">${d}</div></div><span class="pill start">PRACTISE →</span></button>`).join("")}</div>`}

function cfg(topic){if(topic==="mixed")return[20,480];if(topic==="number")return[20,360];return[10,240]}
function setup(topic,subtopic=null){
 let [dn,ds]=cfg(topic);
 S.view="setup";S.topic=topic;S.subtopic=subtopic;
 back.classList.remove("hidden");subtitle.textContent="Test Setup";
 screen.innerHTML=`<section class="hero setup-hero"><span class="pill">TEST SETUP</span><h1>Set your practice</h1><p>You decide the number of questions and the time.</p><div class="setup-grid"><label class="setup-field"><span>Questions</span><input id="qcount" type="number" min="1" max="100" value="${dn}" inputmode="numeric"></label><label class="setup-field"><span>Time (minutes)</span><input id="qtime" type="number" min="1" max="180" value="${Math.max(1,Math.round(ds/60))}" inputmode="numeric"></label></div><div class="preset-row"><button type="button" class="secondary preset" data-n="10" data-t="4">10 Q • 4 min</button><button type="button" class="secondary preset" data-n="20" data-t="8">20 Q • 8 min</button><button type="button" class="secondary preset" data-n="30" data-t="12">30 Q • 12 min</button></div><button type="button" class="primary setup-start" onclick="beginSetup()">START PRACTICE →</button></section>`;
 document.querySelectorAll('.preset').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#qcount').value=b.dataset.n;document.querySelector('#qtime').value=b.dataset.t}));
}
function beginSetup(){let n=Math.max(1,Math.min(100,parseInt(document.querySelector('#qcount').value,10)||10));let min=Math.max(1,Math.min(180,parseInt(document.querySelector('#qtime').value,10)||1));start(S.topic,S.subtopic,n,min*60)}
function moderateQuality(qq,topic){
 if(topic==="series") return true;
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
 const isMC=S.level&&S.level.id>=2;
 const body=isMC
  ? `<div class="options">${q.options.map((o,j)=>`<button type="button" class="option ${chosen===o?"selected":""}" onclick="choose('${o.replace(/'/g,"\\'")}')"><span class="radio"></span><span>${String.fromCharCode(65+j)}</span><b>${o}</b></button>`).join("")}</div>`
  : `<div class="answer-box">${chosen??""}<span class="cursor">|</span></div><div class="keypad">${["1","2","3","4","5","6","7","8","9","0","/","."].map(k=>`<button type="button" onclick="key('${k}')">${k}</button>`).join("")}</div><div class="pad-actions"><button type="button" class="secondary" onclick="clearAns()">Clear</button><button type="button" class="secondary" onclick="backspace()">⌫</button></div>`;
 screen.innerHTML=`<div class="topline"><span class="pill">QUESTION ${S.i+1}/${S.qs.length}</span><b id="clock">${fmt(remain())}</b></div><div class="bar"><i style="width:${S.i/S.qs.length*100}%"></i></div><section class="question"><div class="timer-note">⏱ <b id="clock2">${fmt(remain())}</b> remaining</div><div class="expr">${q.expr}</div>${body}<div class="row"><button class="secondary" onclick="prev()" ${S.i===0?"disabled":""}>← Previous</button><button class="primary" onclick="${S.i===S.qs.length-1?"submit(false)":"next()"}">${S.i===S.qs.length-1?"SUBMIT TEST":"Next →"}</button></div><div class="small center">${isMC?"Choose one option • No instant feedback":"Enter your answer • No instant feedback"}</div></section>`}
function choose(v){S.answers[S.i]=v;render()}
function key(k){let a=S.answers[S.i]||"";if(k==="/"&&a.includes("/"))return;if(k==="."&&a.includes(".")&&a.includes("/"))return;S.answers[S.i]=a+k;render()}
function clearAns(){S.answers[S.i]=null;render()}
function backspace(){let a=S.answers[S.i]||"";S.answers[S.i]=a.slice(0,-1)||null;render()}
function recordQuestionTime(){if(S.view!=="quiz"||!S.qStartedAt)return;S.qTimes[S.i]=(S.qTimes[S.i]||0)+(Date.now()-S.qStartedAt)/1000;S.qStartedAt=Date.now()}
function next(){if(S.i<S.qs.length-1){recordQuestionTime();S.i++;render()}}
function prev(){if(S.i>0){recordQuestionTime();S.i--;render()}}
function numericEqual(a,b){return Math.abs(Number(a)-Number(b))<1e-9}
function answerCorrect(q,a){if(a===null)return false;if(q.skill.startsWith("Percentage →"))return a===q.ans;if(q.skill.startsWith("Fraction →"))return numericEqual(a,q.ans);return a===q.ans}
function submit(auto){if(S.view!=="quiz")return;recordQuestionTime();stop();let elapsed=Math.min(S.limit,(Date.now()-S.start)/1000),correct=0,wrong=0,un=0;S.qs.forEach((q,i)=>{if(S.answers[i]===null)un++;else if(answerCorrect(q,S.answers[i]))correct++;else wrong++});let marks=correct-wrong*.25;renderResult(elapsed,correct,wrong,un,marks,auto)}
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
function renderResult(elapsed,c,w,u,marks,auto){
 const attempted=c+w, avg=attempted?elapsed/attempted:0, pace=elapsed/S.limit<.65?"Fast":elapsed/S.limit<.9?"Good":"Needs improvement";
 const coach=aiCoach(elapsed);
 screen.innerHTML=`<section class="result-hero"><div class="result-top"><div><span class="pill">${auto?"TIME UP":"TEST SUBMITTED"}</span><h1>${marks.toFixed(2)} <span>/ ${S.qs.length}</span></h1><p>${c} correct <i>•</i> ${w} wrong <i>•</i> ${u} unanswered</p></div><div class="score-ring"><strong>${Math.round(c/S.qs.length*100)}%</strong><span>accuracy</span></div></div><div class="result-stats"><div class="result-stat"><strong>${fmt(elapsed)}</strong><span>Time used</span></div><div class="result-stat"><strong>${fmt(avg)}</strong><span>Avg / attempt</span></div><div class="result-stat"><strong>${fmt(Math.max(0,S.limit-elapsed))}</strong><span>Time left</span></div></div><div class="pace-card"><div><span class="pace-label">TIME MANAGEMENT</span><strong>${pace}</strong></div><div class="pace-track"><i style="width:${Math.min(100,Math.round(elapsed/S.limit*100))}%"></i></div><span class="pace-percent">${Math.round(elapsed/S.limit*100)}% of allotted time used</span></div></section>
 <section class="ai-coach"><div class="ai-head"><div><span class="pill">AI COACH</span><h2>How you spent your time</h2><p>Personalised feedback from your accuracy and question-by-question timing.</p></div><span class="coach-badge">SMART REVIEW</span></div><div class="coach-insights">${coach.insights.map((x,i)=>`<div class="coach-insight"><span>${i+1}</span><p>${x}</p></div>`).join("")}</div>${coach.slow.length?`<div class="slowest"><h3>Slowest attempts</h3><div class="slow-grid">${coach.slow.map(x=>`<button class="slow-card" onclick="document.getElementById('review-${x.i}').scrollIntoView({behavior:'smooth',block:'center'})"><b>Q${x.i+1}</b><span>${fmt(x.t)}</span><small>${x.ok?"Correct":x.a===null?"Unanswered":"Wrong"}</small></button>`).join("")}</div></div>`:""}</section>
 <div class="review-heading"><div><h2>Answer Review</h2><p>Answer, correct answer, time spent and the best approach.</p></div><span>${S.qs.length} questions</span></div><div class="analysis">${S.qs.map((q,i)=>{let a=S.answers[i],ok=answerCorrect(q,a),status=ok?"Correct":a===null?"Unanswered":"Wrong",m=q.coach||coachFor(q.skill,q.expr,q.ans,q.exp);return`<article id="review-${i}" class="review ${ok?"ok":a===null?"skip":"bad"}"><div class="review-head"><strong>Q${i+1}</strong><span class="status ${ok?"ok":a===null?"skip":"bad"}">${status}</span><span class="review-time">${fmt(S.qTimes[i]||0)}</span></div><div class="review-expr">${q.expr}</div><div class="answer-line"><div><span>Your answer</span><b>${a??"—"}</b></div><div><span>Correct answer</span><b>${q.ans}</b></div></div><div class="time-line">Time spent <strong>${fmt(S.qTimes[i]||0)}</strong></div><div class="highlight-line"><span>⚡ Highlight</span><p>${m.highlight||"Use the shortest pattern-based route."}</p></div><details class="solution"><summary>View solution, approach & shortcut</summary><div class="solution-body"><div><strong>Best approach</strong><p>${m.approach}</p></div><div><strong>Shortcut</strong><p>${m.shortcut}</p></div><div><strong>Quick methods</strong><ul class="quick-methods">${(m.quickMethods||[]).map(st=>`<li>${st}</li>`).join("")}</ul></div><div><strong>Detailed solution</strong>${m.steps.map(st=>`<p>${st}</p>`).join("")}</div></div></details></article>`}).join("")}</div><div class="row end"><button class="primary" onclick="setup('${S.topic}',S.subtopic)">Practice Again</button><button class="secondary" onclick="level(${S.level?.id||1})">Back</button></div>`}

back.onclick=()=>{if(S.view==="quiz"){if(confirm("Leave this test? Your answers will be lost.")){stop();level(S.level.id)}return}if(S.view==="setup"||S.view==="tablePicker"||S.view==="numberPicker"){level(S.level.id);return}if(S.view==="level")home();else home()}
home();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
