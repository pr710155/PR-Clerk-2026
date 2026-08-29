const $=s=>document.querySelector(s);
const screen=$("#screen"), back=$("#back"), subtitle=$("#subtitle");
let state={view:"home",level:null,topic:null,questions:[],i:0,score:0,answered:false};

const levels=[
 {id:1,name:"Easy",desc:"Build instant calculation ability",topics:["Tables","Squares","Cubes","Percentage Values"]},
 {id:2,name:"Moderate",desc:"Main calculation-training level",topics:["Simplification","Approximation","Quadratic Equations"]},
 {id:3,name:"Hard",desc:"Mains-level quadratic practice",topics:["Mains-Level Quadratic"]}
];

function save(){localStorage.setItem("prclerk-progress",JSON.stringify({attempts:(+localStorage.getItem("attempts")||0)+0}));}
function home(){
 state.view="home"; back.classList.add("hidden"); subtitle.textContent="Calculation Practice";
 screen.innerHTML=`<section class="hero"><span class="pill">PRIVATE PRACTICE APP</span><h1>PR Clerk 2026</h1><p>Fast calculation training for Clerk-level exams.</p><div class="stats"><div class="stat"><b>${localStorage.getItem("attempts")||0}</b><span class="small">Questions answered</span></div><div class="stat"><b>${localStorage.getItem("best")||0}%</b><span class="small">Best accuracy</span></div></div></section>
 <div class="grid">${levels.map(l=>`<button class="card" onclick="level(${l.id})"><span class="pill">LEVEL ${l.id}</span><h2>${l.name}</h2><div class="topic">${l.desc}</div><div class="small">${l.topics.length} topic${l.topics.length>1?"s":""}</div></button>`).join("")}</div>`;
}
function level(id){
 state.view="level";state.level=levels.find(x=>x.id===id);back.classList.remove("hidden");subtitle.textContent=`Level ${id} • ${state.level.name}`;
 screen.innerHTML=`<div class="hero"><span class="pill">LEVEL ${id}</span><h1>${state.level.name}</h1><p>${state.level.desc}.</p></div><div class="grid">${state.level.topics.map(t=>`<button class="card" onclick="start('${t.replaceAll("'","\\'")}')"><h3>${t}</h3><div class="topic">${topicDesc(t)}</div><br><span class="pill">START PRACTICE →</span></button>`).join("")}</div>`;
}
function topicDesc(t){
 const d={Tables:"Multiplication recall and speed.",Squares:"Square values and recognition.",Cubes:"Cube values and recognition.","Percentage Values":"Common percentage ↔ fraction values.",Simplification:"BODMAS, fractions, decimals, roots, powers, divisibility and observation.",Approximation:"Fast option-based approximation and range elimination.","Quadratic Equations":"Clerk-style equations, roots and comparison.","Mains-Level Quadratic":"Harder manipulation, comparison and traps."};return d[t]||"Practice set.";
}
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return Math.abs(a)}
function frac(n,d){let g=gcd(n,d);return `${n/g}/${d/g}`}
function makeQuestion(topic){
 let a,b,c,ans,exp,expr,opts;
 if(topic==="Tables"){a=rand(2,25);b=rand(2,20);ans=a*b;expr=`${a} × ${b}`;exp=`Multiply ${a} by ${b}.`}
 else if(topic==="Squares"){a=rand(11,40);ans=a*a;expr=`${a}²`;exp=`${a} × ${a} = ${ans}.`}
 else if(topic==="Cubes"){a=rand(2,15);ans=a*a*a;expr=`${a}³`;exp=`${a} × ${a} × ${a} = ${ans}.`}
 else if(topic==="Percentage Values"){let pairs=[[1,2,"50%"],[1,4,"25%"],[3,4,"75%"],[1,5,"20%"],[3,5,"60%"],[1,8,"12.5%"],[1,10,"10%"],[3,20,"15%"],[7,20,"35%"],[9,20,"45%"]];let p=pairs[rand(0,pairs.length-1)]; if(Math.random()<.5){expr=`${p[0]}/${p[1]} = ?`;ans=p[2];exp=`Recognise the fraction as a common percentage.`}else{expr=`${p[2]} = ?`;ans=frac(p[0],p[1]);exp=`Convert the percentage to its simplest fraction.`}}
 else if(topic==="Simplification"){a=rand(10,80);b=rand(2,15);c=rand(2,9);ans=a+b*c;expr=`${a} + ${b} × ${c}`;exp=`Apply multiplication first: ${b} × ${c} = ${b*c}; then add ${a}.`}
 else if(topic==="Approximation"){a=rand(100,999);b=rand(10,99);c=rand(2,9);ans=Math.round(a/b)*c;expr=`${a} ÷ ${b} × ${c} ≈ ?`;exp=`Round ${a} ÷ ${b} to a convenient value, then multiply by ${c}.`}
 else {a=rand(2,20);b=rand(2,20);ans=a;expr=`x² − ${a+b}x + ${a*b} = 0; smaller root?`;exp=`Factors are ${a} and ${b}; the smaller root is ${Math.min(a,b)}.`}
 let set=new Set([String(ans)]);while(set.size<4){let d=rand(-9,9);if(d) set.add(String(typeof ans==="number"?ans+d:ans))}
 opts=[...set].sort(()=>Math.random()-.5);return {expr,ans:String(ans),exp,opts};
}
function start(topic){
 state.view="quiz";state.topic=topic;state.questions=Array.from({length:10},()=>makeQuestion(topic));state.i=0;state.score=0;state.answered=false;back.classList.remove("hidden");subtitle.textContent=topic;renderQ();
}
function renderQ(){
 const q=state.questions[state.i];state.answered=false;
 screen.innerHTML=`<div class="topline"><span class="pill">QUESTION ${state.i+1}/10</span><b>Score: ${state.score}</b></div><div class="bar" style="margin:12px 0 18px"><i style="width:${state.i*10}%"></i></div><section class="question"><div class="small">${state.level.name} • ${state.topic}</div><div class="expr">${q.expr}</div><div class="answers">${q.opts.map((o,j)=>`<button class="answer" onclick="answer(${j})">${o}</button>`).join("")}</div><div id="feedback"></div></section>`;
}
function answer(j){
 if(state.answered)return;state.answered=true;
 const q=state.questions[state.i], buttons=[...document.querySelectorAll(".answer")];let correct=buttons.findIndex(b=>b.textContent===q.ans);
 buttons[correct]?.classList.add("correct");if(j!==correct)buttons[j]?.classList.add("wrong");else state.score++;
 buttons.forEach(b=>b.disabled=true);
 $("#feedback").innerHTML=`<div class="explain"><b>${j===correct?"Correct!":"Not quite."}</b><br>${q.exp}<br><br><span class="small">Answer: ${q.ans}</span></div><div class="row" style="margin-top:16px"><button class="primary" onclick="nextQ()">${state.i===9?"Finish":"Next Question"}</button></div>`;
}
function nextQ(){if(state.i===9){finish();return}state.i++;renderQ()}
function finish(){
 let pct=state.score*10, old=+localStorage.getItem("best")||0;localStorage.setItem("best",Math.max(old,pct));localStorage.setItem("attempts",(+localStorage.getItem("attempts")||0)+10);
 screen.innerHTML=`<section class="hero" style="text-align:center"><span class="pill">SET COMPLETE</span><h1>${state.score}/10</h1><p>Accuracy: <b>${pct}%</b></p><div class="row"><button class="primary" onclick="start('${state.topic.replaceAll("'","\\'")}')">Practice Again</button><button class="secondary" onclick="level(${state.level.id})">Choose Topic</button></div></section>`;
}
back.onclick=()=>{if(state.view==="quiz")level(state.level.id);else if(state.view==="level")home();else home()};
home();
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});
