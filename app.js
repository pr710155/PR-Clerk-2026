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
function q(expr,ans,exp,skill,diff="Easy"){return{expr,ans:String(ans),exp,skill,diff}}

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
function make(topic,subtopic=null){
 if(topic==="tables")return table(Number(subtopic)||R(6,30));if(topic==="squares")return square();if(topic==="cubes")return cube();if(topic==="percent")return percent();if(topic==="fractions")return fraction();if(topic==="number")return ({addition:add,subtraction:sub,multiplication:mul,division:div}[subtopic]||number)();
 if(topic==="mixed")return make(P(["tables","squares","cubes","percent","fractions","number"]));
 if(topic==="simplification"){let a=R(10,80),b=R(2,15),c=R(2,9),x=a+b*c;return q(`${a} + ${b} × ${c} = ?`,x,`Multiply first, then add: ${x}.`,"Simplification","Moderate")}
 if(topic==="approximation"){let a=R(100,999),b=R(10,99),c=R(2,9),x=Math.round(a/b)*c;return q(`${a} ÷ ${b} × ${c} ≈ ?`,x,"Round to convenient values before calculating.","Approximation","Moderate")}
 if(topic==="quadratic"){let a=R(2,20),b=R(2,20),x=Math.min(a,b);return q(`x² − ${a+b}x + ${a*b} = 0; smaller root?`,x,`The roots are ${a} and ${b}.`,"Quadratic Equations","Moderate")}
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
function start(topic,subtopic=null,n=null,sec=null){if(n===null||sec===null){let c=cfg(topic);n=c[0];sec=c[1]}n=Math.max(1,Math.min(100,n));sec=Math.max(60,Math.min(10800,sec));S.view="quiz";S.topic=topic;S.subtopic=subtopic;S.qs=Array.from({length:n},()=>make(topic,subtopic));S.i=0;S.answers=Array(n).fill(null);S.qTimes=Array(n).fill(0);S.qStartedAt=Date.now();S.limit=sec;S.start=Date.now();S.end=S.start+sec*1000;back.classList.remove("hidden");subtitle.textContent="Test in progress";render();tick()}
function stop(){if(S.timer)clearInterval(S.timer);S.timer=null}
function remain(){return Math.max(0,Math.ceil((S.end-Date.now())/1000))}
function tick(){stop();S.timer=setInterval(()=>{let t=remain(),el=$("#clock"),el2=$("#clock2");if(el)el.textContent=fmt(t);if(el2)el2.textContent=fmt(t);if(t<=0){stop();submit(true)}},250)}
function fmt(s){s=Math.max(0,Math.round(Number(s)||0));return`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}
function render(){
 let q=S.qs[S.i],chosen=S.answers[S.i];
 if(!S.qStartedAt)S.qStartedAt=Date.now();
 screen.innerHTML=`<div class="topline"><span class="pill">QUESTION ${S.i+1}/${S.qs.length}</span><b id="clock">${fmt(remain())}</b></div><div class="bar"><i style="width:${S.i/S.qs.length*100}%"></i></div><section class="question"><div class="timer-note">⏱ <b id="clock2">${fmt(remain())}</b> remaining</div><div class="expr">${q.expr}</div><div class="answer-box">${chosen??""}<span class="cursor">|</span></div><div class="keypad">${["1","2","3","4","5","6","7","8","9","0","/","."].map(k=>`<button type="button" onclick="key('${k}')">${k}</button>`).join("")}</div><div class="pad-actions"><button type="button" class="secondary" onclick="clearAns()">Clear</button><button type="button" class="secondary" onclick="backspace()">⌫</button></div><div class="row"><button class="secondary" onclick="prev()" ${S.i===0?"disabled":""}>← Previous</button><button class="primary" onclick="${S.i===S.qs.length-1?"submit(false)":"next()"}">${S.i===S.qs.length-1?"SUBMIT TEST":"Next →"}</button></div><div class="small center">No options • No topic labels • No instant feedback</div></section>`}
function key(k){let a=S.answers[S.i]||"";if(k==="/"&&a.includes("/"))return;if(k==="."&&a.includes(".")&&a.includes("/"))return;S.answers[S.i]=a+k;render()}
function clearAns(){S.answers[S.i]=null;render()}
function backspace(){let a=S.answers[S.i]||"";S.answers[S.i]=a.slice(0,-1)||null;render()}
function recordQuestionTime(){if(S.view!=="quiz"||!S.qStartedAt)return;S.qTimes[S.i]=(S.qTimes[S.i]||0)+(Date.now()-S.qStartedAt)/1000;S.qStartedAt=Date.now()}
function next(){if(S.i<S.qs.length-1){recordQuestionTime();S.i++;render()}}
function prev(){if(S.i>0){recordQuestionTime();S.i--;render()}}
function numericEqual(a,b){return Math.abs(Number(a)-Number(b))<1e-9}
function answerCorrect(q,a){if(a===null)return false;if(q.skill.startsWith("Percentage →"))return a===q.ans;if(q.skill.startsWith("Fraction →"))return numericEqual(a,q.ans);return a===q.ans}
function submit(auto){if(S.view!=="quiz")return;recordQuestionTime();stop();let elapsed=Math.min(S.limit,(Date.now()-S.start)/1000),correct=0,wrong=0,un=0;S.qs.forEach((q,i)=>{if(S.answers[i]===null)un++;else if(answerCorrect(q,S.answers[i]))correct++;else wrong++});let marks=correct-wrong*.25;renderResult(elapsed,correct,wrong,un,marks,auto)}
function renderResult(elapsed,c,w,u,marks,auto){
 let avg=(c+w)?elapsed/(c+w):0,pace=elapsed/S.limit<.65?"Fast":elapsed/S.limit<.9?"Good":"Needs improvement";
 screen.innerHTML=`<section class="result-hero"><div class="result-top"><div><span class="pill">${auto?"TIME UP":"TEST SUBMITTED"}</span><h1>${marks.toFixed(2)} <span>/ ${S.qs.length}</span></h1><p>${c} correct <i>•</i> ${w} wrong <i>•</i> ${u} unanswered</p></div><div class="score-ring"><strong>${Math.round(c/S.qs.length*100)}%</strong><span>accuracy</span></div></div><div class="result-stats"><div class="result-stat"><strong>${fmt(elapsed)}</strong><span>Time used</span></div><div class="result-stat"><strong>${fmt(avg)}</strong><span>Avg / attempt</span></div><div class="result-stat"><strong>${fmt(Math.max(0,S.limit-elapsed))}</strong><span>Time left</span></div></div><div class="pace-card"><div><span class="pace-label">TIME MANAGEMENT</span><strong>${pace}</strong></div><div class="pace-track"><i style="width:${Math.min(100,Math.round(elapsed/S.limit*100))}%"></i></div><span class="pace-percent">${Math.round(elapsed/S.limit*100)}% of allotted time used</span></div></section><div class="review-heading"><div><h2>Answer Review</h2><p>Your answers, correct answers and time spent.</p></div><span>${S.qs.length} questions</span></div><div class="analysis">${S.qs.map((q,i)=>{let a=S.answers[i],ok=answerCorrect(q,a),status=ok?"Correct":a===null?"Unanswered":"Wrong";return`<article class="review ${ok?"ok":a===null?"skip":"bad"}"><div class="review-head"><strong>Q${i+1}</strong><span class="status ${ok?"ok":a===null?"skip":"bad"}">${status}</span><span class="review-time">${fmt(S.qTimes[i]||0)}</span></div><div class="review-expr">${q.expr}</div><div class="answer-line"><div><span>Your answer</span><b>${a??"—"}</b></div><div><span>Correct answer</span><b>${q.ans}</b></div></div><div class="time-line">Time spent <strong>${fmt(S.qTimes[i]||0)}</strong></div></article>`}).join("")}</div><div class="row end"><button class="primary" onclick="setup('${S.topic}',S.subtopic)">Practice Again</button><button class="secondary" onclick="level(${S.level?.id||1})">Back</button></div>`}

back.onclick=()=>{if(S.view==="quiz"){if(confirm("Leave this test? Your answers will be lost.")){stop();level(S.level.id)}return}if(S.view==="setup"||S.view==="tablePicker"||S.view==="numberPicker"){level(S.level.id);return}if(S.view==="level")home();else home()}
home();if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
