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
{id:"simplification",name:"Simplification",desc:"BODMAS and observation"},
{id:"approximation",name:"Approximation",desc:"Fast approximation"},
{id:"quadratic",name:"Quadratic Equations",desc:"Roots and comparison"}]},
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
 if(k==="Simplification"){
  if(expr.includes("% of")) m={approach:"Convert the percentage to a familiar fraction first, then multiply.",shortcut:"Use 50%=1/2, 25%=1/4, 75%=3/4, 20%=1/5, 12.5%=1/8 wherever possible.",steps:[exp,`Final answer: ${ans}.`],highlight:"Spot the familiar percentage first; convert it to a fraction before calculating."};
  else if(expr.includes("√")) m={approach:"Recognise the nearby perfect squares instead of calculating the roots long-hand.",shortcut:"Memorise squares up to 30 so √(perfect square) is instant.",steps:[exp,`Final answer: ${ans}.`],highlight:"Recognise the perfect squares first—this should be almost instant."};
  else if(expr.includes("^")||expr.includes("²")) m={approach:"Use the exponent identity and avoid unnecessary expansion.",shortcut:"For small powers, square first and reuse the result; do not reach for a calculator.",steps:[exp,`Final answer: ${ans}.`],highlight:"Handle the power first and avoid expanding more than necessary."};
  else if(expr.includes("of")) m={approach:"Take the fraction of the number by cancelling before multiplying.",shortcut:"Divide by the denominator first when it divides cleanly, then multiply by the numerator.",steps:[exp,`Final answer: ${ans}.`],highlight:"Cancel/divide before multiplying—the fraction structure is the shortcut."};
  else m={approach:"Follow BODMAS: brackets → multiplication/division → addition/subtraction.",shortcut:"Look for cancellation or a familiar fraction before doing full arithmetic.",steps:[exp,`Final answer: ${ans}.`],highlight:"BODMAS first; look for a cancellation opportunity before doing full arithmetic."};
 } else if(k==="Approximation") m={approach:"Do not calculate the exact value. Round to convenient nearby numbers, then perform the simplest arithmetic.",shortcut:"Choose rounded values that make multiplication/division mentally friendly; preserve the correct magnitude.",steps:[exp,`Final answer: ${ans}.`],highlight:"Round to friendly numbers first—approximation is about speed, not exact calculation."};
 else if(k==="Quadratic Equations") m={approach:"Use the relationship between roots instead of solving with the quadratic formula.",shortcut:"For x²−Sx+P=0: sum of roots=S and product of roots=P. Factor by finding two numbers with that sum/product.",steps:[exp,`Final answer: ${ans}.`],highlight:"Use sum/product of roots and factor mentally; avoid the quadratic formula."};
 else m={approach:"Use the shortest mental route rather than full written calculation.",shortcut:"Look for cancellation, familiar values and number relationships first.",steps:[exp,`Final answer: ${ans}.`],highlight:"Recognise the number pattern before starting a long calculation."};
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
function add(){let t=R(1,7),a,b,label;if(t===1){a=R(1,9);b=R(1,9);label="1 digit + 1 digit"}else if(t===2){a=R(1,9);b=R(10,99);label="1 digit + 2 digit"}else if(t===3){a=R(10,99);b=R(10,99);label="2 digit + 2 digit"}else if(t===4){a=R(10,99);b=R(100,999);label="2 digit + 3 digit"}else if(t===5){a=R(100,999);b=R(100,999);label="3 digit + 3 digit"}else if(t===6){a=R(100,999);b=R(1000,9999);label="3 digit + 4 digit"}else{a=R(1000,9999);b=R(1000,9999);label="4 digit + 4 digit"}let x=a+b;return q(`${a} + ${b} = ?`,x,`${a} + ${b} = ${x}.`,`Addition • ${label}`)}
function sub(){let t=R(1,7),a,b,label;if(t===1){a=R(2,9);b=R(1,a-1);label="1 digit − 1 digit"}else if(t===2){a=R(10,99);b=R(1,9);label="2 digit − 1 digit"}else if(t===3){a=R(10,99);b=R(10,a-1);label="2 digit − 2 digit"}else if(t===4){a=R(100,999);b=R(10,99);label="3 digit − 2 digit"}else if(t===5){a=R(100,999);b=R(100,a-1);label="3 digit − 3 digit"}else if(t===6){a=R(1000,9999);b=R(100,999);label="4 digit − 3 digit"}else{a=R(1000,9999);b=R(1000,a-1);label="4 digit − 4 digit"}let x=a-b;return q(`${a} − ${b} = ?`,x,`${a} − ${b} = ${x}.`,`Subtraction • ${label}`)}
function mul(){let t=R(1,5),a,b,label;if(t===1){a=R(2,99);b=R(2,9);label="2 digit × 1 digit"}else if(t===2){a=R(10,99);b=R(10,99);label="2 digit × 2 digit"}else if(t===3){a=R(100,999);b=R(2,9);label="3 digit × 1 digit"}else if(t===4){a=R(100,999);b=R(10,99);label="3 digit × 2 digit"}else{a=R(1000,9999);b=R(2,25);label="4 digit × 1/2 digit"}let x=a*b;return q(`${a} × ${b} = ?`,x,`${a} × ${b} = ${x}.`,`Multiplication • ${label}`)}
function div(){let b=R(2,99),x=R(3,99),a=b*x;return q(`${a} ÷ ${b} = ?`,x,`${b} × ${x} = ${a}.`,"Division")}
function number(){return P([add,sub,mul,div])()}
function moderateSimplification(){
 const type=R(1,10);
 if(type===1){let a=R(20,90),b=R(2,12),c=R(2,9),d=R(2,8),x=a+b*c-d;return mcq(`${a} + ${b} × ${c} − ${d} = ?`,x,`Apply multiplication first: ${b} × ${c} = ${b*c}; then ${a+b*c} − ${d} = ${x}.`,`Simplification`,[x+2,x-2,x+4])}
 if(type===2){let n=P([[1,2],[1,4],[3,4],[2,5],[3,5],[5,8],[7,8],[2,3]]),p=R(20,80);let x=n[0]*p/n[1];return mcq(`${n[0]}/${n[1]} of ${p} = ?`,x,`Convert the fraction of ${p}: ${n[0]} × ${p} ÷ ${n[1]} = ${x}.`,`Simplification`,[x+1,x-1,x+2])}
 if(type===3){let a=R(12,40)/10,b=R(11,35)/10,c=R(2,8),x=dec(a+b*c);return mcq(`${a.toFixed(1)} + ${b.toFixed(1)} × ${c} = ?`,x,`Multiply first, then add.`,`Simplification`,[dec(x+.2),dec(x-.2),dec(x+.4)])}
 if(type===4){let a=R(3,12),b=R(2,9),x=F(a*b,1);return mcq(`${a}/${b} = ?`,dec(a/b,2),`Divide ${a} by ${b}.`,`Simplification`,[dec(a/b+.25,2),dec(a/b-.25,2),dec(a/b+.5,2)])}
 if(type===5){let n=P([[9,16],[25,36],[49,64],[81,100],[121,144]]),x=Math.sqrt(n[1])-Math.sqrt(n[0]);return mcq(`√${n[1]} − √${n[0]} = ?`,x,`√${n[1]} = ${Math.sqrt(n[1])} and √${n[0]} = ${Math.sqrt(n[0])}.`,`Simplification`,[x+1,x-1,x+2])}
 if(type===6){let a=R(2,9),b=R(2,5),x=Math.pow(a,b);return mcq(`${a}^${b} = ?`,x,`Use repeated multiplication: ${a} raised to ${b} = ${x}.`,`Simplification`,[x+a,x-a,x+2])}
 if(type===7){let a=R(2,9),b=R(2,9),c=R(2,9),x=(a+b)*c;return mcq(`(${a} + ${b}) × ${c} = ?`,x,`Bracket first: ${a+b}; then × ${c} = ${x}.`,`Simplification`,[x+c,x-c,x+2])}
 if(type===8){let a=R(20,80),p=P([[25,100],[50,100],[75,100],[20,100],[12.5,100]]),x=a*p[0]/p[1];return mcq(`${p[0]}% of ${a} = ?`,x,`${p[0]}% of ${a} = ${x}.`,`Simplification`,[x+2,x-2,x+5])}
 if(type===9){let a=R(20,80),b=R(2,9),c=R(2,9),x=a-(b+c);return mcq(`${a} − (${b} + ${c}) = ?`,x,`Bracket first: ${b+c}; then subtract from ${a}.`,`Simplification`,[x+2,x-2,x+3])}
 let a=R(10,40),b=R(2,9),c=R(2,9),x=a*b+c;return mcq(`${a} × ${b} + ${c} = ?`,x,`Multiply first: ${a*b}, then add ${c}.`,`Simplification`,[x+1,x-1,x+3])
}
function moderateApproximation(){
 const type=R(1,8);
 if(type===1){let a=R(100,999)/10,b=R(10,99)/10,x=Math.round(a)*Math.round(b);return mcq(`${a.toFixed(1)} × ${b.toFixed(1)} ≈ ?`,x,`Round to nearby whole numbers: ${Math.round(a)} × ${Math.round(b)} = ${x}.`,`Approximation`,[x+10,x-10,x+20])}
 if(type===2){let a=R(100,999)/10,b=R(10,99)/10,x=Math.round(a)/Math.round(b);return mcq(`${a.toFixed(1)} ÷ ${b.toFixed(1)} ≈ ?`,dec(x,1),`Round ${a.toFixed(1)} and ${b.toFixed(1)} to convenient values, then divide.`,`Approximation`,[dec(x+.5,1),dec(x-.5,1),dec(x+1,1)])}
 if(type===3){let a=R(100,999)/100,b=R(100,999)/100,c=R(20,90),x=Math.round(a)*Math.round(b)+Math.round(c);return mcq(`${a.toFixed(2)} × ${b.toFixed(2)} + ${c} ≈ ?`,x,`Round each term to a convenient value and follow BODMAS.`,`Approximation`,[x+5,x-5,x+10])}
 if(type===4){let a=R(10,99),b=R(10,99),x=Math.round(a/10)*Math.round(b/10);return mcq(`${a}% × ${b} ≈ ?`,x,`Use ${Math.round(a/10)*10}% as the nearby percentage.`,`Approximation`,[x+2,x-2,x+5])}
 if(type===5){let n=P([1020,1760,2025,2500,3605]),x=Math.round(Math.sqrt(n));return mcq(`√${n} ≈ ?`,x,`Use the nearest perfect square to estimate the root.`,`Approximation`,[x-1,x+1,x+2])}
 if(type===6){let a=R(90,999),b=R(10,99),c=R(10,99),x=Math.round(a/b)+c;return mcq(`${a} ÷ ${b} + ${c} ≈ ?`,x,`Round to convenient values before division and addition.`,`Approximation`,[x+1,x-1,x+2])}
 if(type===7){let a=R(10,99)/10,b=R(10,99)/10,c=R(10,99)/10,x=dec(a+b-c);return mcq(`${a.toFixed(1)} + ${b.toFixed(1)} − ${c.toFixed(1)} ≈ ?`,Math.round(x),`Round the decimals and then calculate.`,`Approximation`,[Math.round(x)+1,Math.round(x)-1,Math.round(x)+2])}
 let a=R(100,999),p=P([12.5,16.67,25,33.33,50,66.67,75]),x=Math.round(a*p/100);return mcq(`${p}% of ${a} ≈ ?`,x,`Replace the percentage with its nearest familiar fraction/value and estimate.`,`Approximation`,[x+3,x-3,x+6])
}
function moderateQuadratic(){
 const type=R(1,10); let r1,r2,s1,s2,p1,p2,A,B,C,x,y;
 if(type===1){
  r1=R(2,14);r2=R(2,14);while(r2===r1)r2=R(2,14);let sum=r1+r2,prod=r1*r2;
  return mcq(`x² − ${sum}x + ${prod} = 0. Smaller root?`,Math.min(r1,r2),`The roots are ${r1} and ${r2}.`,`Quadratic Equations`,[Math.max(r1,r2),sum,prod]);
 }
 if(type===2){
  r1=R(2,14);r2=R(2,14);let sum=r1+r2,prod=r1*r2;
  return mcq(`x² − ${sum}x + ${prod} = 0. Larger root?`,Math.max(r1,r2),`The roots are ${r1} and ${r2}.`,`Quadratic Equations`,[Math.min(r1,r2),sum,prod]);
 }
 if(type===3){
  r1=R(2,14);r2=R(2,14);while(r2===r1)r2=R(2,14);let sum=r1+r2,prod=r1*r2,x=Math.abs(r1-r2);
  return mcq(`x² − ${sum}x + ${prod} = 0. Difference between roots?`,x,`Difference = |${r1} − ${r2}| = ${x}.`,`Quadratic Equations`,[x+1,x+2,Math.abs(sum-prod)]);
 }
 if(type===4){
  r1=R(2,12);r2=R(2,12);while(r2===r1)r2=R(2,12);A=R(2,6);B=A*(r1+r2);C=A*r1*r2;
  return mcq(`${A}x² − ${B}x + ${C} = 0. Smaller root?`,Math.min(r1,r2),`Divide by ${A}; the roots are ${r1} and ${r2}.`,`Quadratic Equations`,[Math.max(r1,r2),r1+r2,r1*r2]);
 }
 if(type===5){
  r1=R(2,12);r2=R(2,12);let sum=r1+r2,prod=r1*r2;
  return mcq(`If x² − ${sum}x + ${prod} = 0, sum of roots = ?`,sum,`For x² − Sx + P = 0, the sum of roots is S = ${sum}.`,`Quadratic Equations`,[prod,sum-1,sum+1]);
 }
 if(type===6){
  r1=R(2,12);r2=R(2,12);let sum=r1+r2,prod=r1*r2;
  return mcq(`If x² − ${sum}x + ${prod} = 0, product of roots = ?`,prod,`Product of roots = ${prod}.`,`Quadratic Equations`,[sum,Math.max(1,prod-1),prod+1]);
 }
 if(type===7){
  r1=R(2,12);r2=R(2,12);while(r2===r1)r2=R(2,12);s1=r1+r2;p1=r1*r2;
  s2=R(5,20);p2=R(6,30);let rr1=Math.min(r1,r2),rr2=Math.max(r1,r2),ss1=s1;
  const rel=rr1>rr2?">":rr1<rr2?"<":"=";
  return mcq(`For x² − ${s1}x + ${p1} = 0, compare smaller root and larger root: smaller ? larger`,rel,`The smaller root is ${rr1}; the larger root is ${rr2}.`,`Quadratic Equations`,[">","<","="]);
 }
 if(type===8){
  r1=R(2,12);r2=R(2,12);s1=r1+r2;p1=r1*r2;
  s2=R(2,12);let t=R(2,12);while(s2===s1&&t===r2)t=R(2,12);p2=s2*t;
  const a=Math.min(r1,r2), b=Math.min(s2,t), rel=a>b?">":a<b?"<":"=";
  return mcq(`I. x² − ${s1}x + ${p1} = 0\nII. y² − ${s2+t}y + ${p2} = 0\nIf x and y are the smaller roots, then x ? y`,rel,`The smaller roots are ${a} and ${b}; compare them directly.`,`Quadratic Equations`,[">","<","=","Cannot be determined"]);
 }
 if(type===9){
  r1=R(2,12);r2=R(2,12);let sum=r1+r2,prod=r1*r2,x=Math.max(r1,r2);
  return mcq(`One root of x² − ${sum}x + ${prod} = 0 is ${r1}. The other root is ?`,r2,`Sum of roots is ${sum}; therefore the other root is ${sum} − ${r1} = ${r2}.`,`Quadratic Equations`,[x,sum,prod]);
 }
 r1=R(2,12);r2=R(2,12);while(r2===r1)r2=R(2,12);let sum=r1+r2,prod=r1*r2,A2=R(2,5),B2=A2*sum,C2=A2*prod;
 return mcq(`A larger root of ${A2}x² − ${B2}x + ${C2} = 0 is ?`,Math.max(r1,r2),`After dividing by ${A2}, the roots are ${r1} and ${r2}.`,`Quadratic Equations`,[Math.min(r1,r2),sum,prod]);
}

function make(topic,subtopic=null){
 if(topic==="tables")return table(Number(subtopic)||R(6,30));if(topic==="squares")return square();if(topic==="cubes")return cube();if(topic==="percent")return percent();if(topic==="fractions")return fraction();if(topic==="number")return ({addition:add,subtraction:sub,multiplication:mul,division:div}[subtopic]||number)();
 if(topic==="mixed")return make(P(["tables","squares","cubes","percent","fractions","number"]));
 if(topic==="simplification")return moderateSimplification();
 if(topic==="approximation")return moderateApproximation();
 if(topic==="quadratic")return moderateQuadratic();
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
function start(topic,subtopic=null,n=null,sec=null){if(n===null||sec===null){let c=cfg(topic);n=c[0];sec=c[1]}n=Math.max(1,Math.min(100,n));sec=Math.max(60,Math.min(10800,sec));S.view="quiz";S.topic=topic;S.subtopic=subtopic;S.qs=[];let seen=new Set(),tries=0;const storeKey=`prclerk_recent_${topic}_${subtopic||"all"}`;let recent=[];try{recent=JSON.parse(localStorage.getItem(storeKey)||"[]")}catch(e){}const blocked=new Set(recent);while(S.qs.length<n&&tries<n*120){let qq=make(topic,subtopic),key=(qq.expr||"").replace(/\s+/g," ").trim();tries++;if(!seen.has(key)&&!blocked.has(key)){seen.add(key);S.qs.push(qq)}}let emergency=0;while(S.qs.length<n&&emergency<n*120){let qq=make(topic,subtopic),key=(qq.expr||"").replace(/\s+/g," ").trim();emergency++;if(!seen.has(key)){seen.add(key);S.qs.push(qq)}}try{let updated=[...recent,...S.qs.map(x=>(x.expr||"").replace(/\s+/g," ").trim())];localStorage.setItem(storeKey,JSON.stringify(updated.slice(-5000)))}catch(e){}S.i=0;S.answers=Array(n).fill(null);S.qTimes=Array(n).fill(0);S.qStartedAt=Date.now();S.limit=sec;S.start=Date.now();S.end=S.start+sec*1000;back.classList.remove("hidden");subtitle.textContent="Test in progress";render();tick()}
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
 <div class="review-heading"><div><h2>Answer Review</h2><p>Answer, correct answer, time spent and the best approach.</p></div><span>${S.qs.length} questions</span></div><div class="analysis">${S.qs.map((q,i)=>{let a=S.answers[i],ok=answerCorrect(q,a),status=ok?"Correct":a===null?"Unanswered":"Wrong",m=q.coach||coachFor(q.skill,q.expr,q.ans,q.exp);return`<article id="review-${i}" class="review ${ok?"ok":a===null?"skip":"bad"}"><div class="review-head"><strong>Q${i+1}</strong><span class="status ${ok?"ok":a===null?"skip":"bad"}">${status}</span><span class="review-time">${fmt(S.qTimes[i]||0)}</span></div><div class="review-expr">${q.expr}</div><div class="answer-line"><div><span>Your answer</span><b>${a??"—"}</b></div><div><span>Correct answer</span><b>${q.ans}</b></div></div><div class="time-line">Time spent <strong>${fmt(S.qTimes[i]||0)}</strong></div><div class="highlight-line"><span>⚡ Highlight</span><p>${m.highlight||"Use the shortest pattern-based route."}</p></div><details class="solution"><summary>View solution, approach & shortcut</summary><div class="solution-body"><div><strong>Best approach</strong><p>${m.approach}</p></div><div><strong>Shortcut</strong><p>${m.shortcut}</p></div><div><strong>Detailed solution</strong>${m.steps.map(st=>`<p>${st}</p>`).join("")}</div></div></details></article>`}).join("")}</div><div class="row end"><button class="primary" onclick="setup('${S.topic}',S.subtopic)">Practice Again</button><button class="secondary" onclick="level(${S.level?.id||1})">Back</button></div>`}

back.onclick=()=>{if(S.view==="quiz"){if(confirm("Leave this test? Your answers will be lost.")){stop();level(S.level.id)}return}if(S.view==="setup"||S.view==="tablePicker"||S.view==="numberPicker"){level(S.level.id);return}if(S.view==="level")home();else home()}
home();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
