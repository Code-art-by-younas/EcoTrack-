// EcoTrack — interactive carbon footprint tracker
// All data is stored locally in the browser. Emission factors are illustrative demo estimates.

const FACTORS = {
  Transport: [
    {name:"Car travel", unit:"km", factor:0.21},
    {name:"Motorbike travel", unit:"km", factor:0.10},
    {name:"Bus travel", unit:"km", factor:0.08},
    {name:"Train travel", unit:"km", factor:0.04},
    {name:"Flight travel", unit:"km", factor:0.25}
  ],
  Energy: [
    {name:"Electricity use", unit:"kWh", factor:0.45},
    {name:"Natural gas use", unit:"kWh", factor:0.20}
  ],
  Food: [
    {name:"Meat-based meal", unit:"meal", factor:3.0},
    {name:"Vegetarian meal", unit:"meal", factor:1.5},
    {name:"Plant-based meal", unit:"meal", factor:0.9}
  ],
  Shopping: [
    {name:"New clothing item", unit:"item", factor:8.0},
    {name:"Electronics purchase", unit:"item", factor:35.0},
    {name:"Reusable product", unit:"item", factor:1.2}
  ]
};
const COLORS = {Transport:"#7fac70",Energy:"#d8e58c",Food:"#91b9ae",Shopping:"#d4a77d"};
const ICONS = {Transport:"↗",Energy:"ϟ",Food:"♧",Shopping:"◇"};
const STORAGE_KEY = "ecotrack.activities.v1";
const GOAL_KEY = "ecotrack.goal.v1";
let activities = loadActivities();
let selectedCategory = "Transport";
let toastTimer;

function loadActivities(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveActivities(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(activities)); }
function fmt(n){ return Number(n).toLocaleString(undefined,{maximumFractionDigits:1,minimumFractionDigits:1}); }
function escapeHTML(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function showToast(message){
  const el=document.getElementById("toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
}
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function getTotal(list=activities){ return list.reduce((sum,a)=>sum+a.co2,0); }
function getCategoryTotals(list=activities){
  const totals={Transport:0,Energy:0,Food:0,Shopping:0};
  list.forEach(a=>totals[a.category]=(totals[a.category]||0)+a.co2); return totals;
}
function init(){
  document.getElementById("todayDate").textContent=new Intl.DateTimeFormat("en",{weekday:"short",month:"short",day:"numeric"}).format(new Date());
  document.getElementById("activityForm").addEventListener("submit",addActivity);
  document.querySelectorAll(".category-option").forEach(btn=>btn.addEventListener("click",()=>selectCategory(btn.dataset.category)));
  document.getElementById("activityType").addEventListener("change",updateEstimate);
  document.getElementById("activityAmount").addEventListener("input",updateEstimate);
  document.getElementById("chartPeriod").addEventListener("change",renderChart);
  document.querySelectorAll("[data-goto]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.goto)));
  document.querySelectorAll(".side-link").forEach(link=>link.addEventListener("click",e=>{e.preventDefault();navigate(link.dataset.page);}));
  document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
  document.getElementById("goalSlider").addEventListener("input",e=>document.getElementById("goalSliderValue").textContent=e.target.value);
  document.getElementById("saveGoal").addEventListener("click",()=>{localStorage.setItem(GOAL_KEY,document.getElementById("goalSlider").value);renderDashboard();showToast("Your reduction goal has been saved.");});
  document.getElementById("goalSlider").value=localStorage.getItem(GOAL_KEY)||20;
  document.getElementById("goalSliderValue").textContent=document.getElementById("goalSlider").value;
  selectCategory("Transport"); renderDashboard(); renderTips();
  window.addEventListener("resize",()=>{if(!document.getElementById("overview").classList.contains("hidden"))renderChart();});
}
function navigate(page){
  document.querySelectorAll(".page-section").forEach(s=>s.classList.toggle("hidden",s.id!==page));
  document.querySelectorAll(".side-link").forEach(a=>a.classList.toggle("active",a.dataset.page===page));
  const titles={overview:"Your impact, at a glance",calculator:"Understand your everyday footprint",insights:"Ideas for a lighter footprint"};
  document.getElementById("pageTitle").textContent=titles[page]||titles.overview;
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  if(page==="overview")renderDashboard();
}
function selectCategory(category){
  selectedCategory=category; document.getElementById("activityCategory").value=category;
  document.querySelectorAll(".category-option").forEach(b=>b.classList.toggle("chosen",b.dataset.category===category));
  const select=document.getElementById("activityType"); select.innerHTML="";
  FACTORS[category].forEach((item,i)=>{const opt=document.createElement("option");opt.value=i;opt.textContent=item.name;select.appendChild(opt);});
  document.getElementById("activityAmount").value=category==="Food"||category==="Shopping"?1:5;
  updateEstimate();
}
function currentFactor(){
  const item=FACTORS[selectedCategory][Number(document.getElementById("activityType").value)||0];
  return item;
}
function updateEstimate(){
  const item=currentFactor(); if(!item)return;
  const amount=Math.max(0,Number(document.getElementById("activityAmount").value)||0);
  document.getElementById("activityUnit").value=item.unit;
  document.getElementById("estimateValue").textContent=fmt(amount*item.factor);
}
function addActivity(e){
  e.preventDefault();
  const amount=Number(document.getElementById("activityAmount").value);
  if(!Number.isFinite(amount)||amount<=0){showToast("Please enter an amount greater than zero.");return;}
  const item=currentFactor();
  activities.unshift({id:Date.now(),category:selectedCategory,type:item.name,amount,unit:item.unit,co2:amount*item.factor,date:todayISO()});
  saveActivities(); renderDashboard(); showToast("Activity saved — nice work!");
  document.getElementById("activityAmount").value=selectedCategory==="Food"||selectedCategory==="Shopping"?1:5;
  updateEstimate();
}
function renderDashboard(){
  const total=getTotal(), count=activities.length, daily=total/30;
  document.getElementById("monthlyTotal").textContent=fmt(total);
  document.getElementById("dailyAverage").textContent=fmt(daily);
  document.getElementById("activityCount").textContent=count;
  const goal=Number(localStorage.getItem(GOAL_KEY)||20);
  document.getElementById("goalValue").textContent=goal;
  // Progress is a visual goal-setting indicator, not a verified reduction measurement.
  document.getElementById("goalProgress").style.width=(count?Math.min(100,Math.max(8,count*8)):0)+"%";
  document.getElementById("goalCaption").textContent=count?"Keep logging to build your baseline":"Set a baseline to track progress";
  document.getElementById("goalSlider").value=goal; document.getElementById("goalSliderValue").textContent=goal;
  document.getElementById("monthlyNote").textContent=count?"Sum of activities you've logged":"Add your first activity to get started";
  document.getElementById("donutTotal").textContent=fmt(total);
  renderLegend(); renderRecent(); renderChart();
}
function renderLegend(){
  const totals=getCategoryTotals(), grand=getTotal();
  const entries=Object.entries(totals);
  document.getElementById("categoryLegend").innerHTML=entries.map(([cat,val])=>`<div class="legend-item"><span style="--c:${COLORS[cat]}">${cat}</span><b>${grand?Math.round(val/grand*100):0}%</b></div>`).join("");
  const stops=[];let cursor=0;
  entries.forEach(([cat,val])=>{const pct=grand?val/grand*100:25;stops.push(`${COLORS[cat]} ${cursor}% ${cursor+pct}%`);cursor+=pct;});
  document.getElementById("donut").style.background=`conic-gradient(${stops.join(",")})`;
}
function renderRecent(){
  const box=document.getElementById("recentActivities");
  if(!activities.length){box.innerHTML='<div class="empty-list">No activities yet. Add your first entry to see it here.</div>';return;}
  box.innerHTML=activities.slice(0,4).map(a=>`<div class="recent-item"><div class="recent-icon">${ICONS[a.category]}</div><div class="recent-copy"><b>${escapeHTML(a.type)}</b><span>${escapeHTML(a.category)} · ${a.amount} ${escapeHTML(a.unit)} · ${a.date}</span></div><div class="recent-value">${fmt(a.co2)} kg</div></div>`).join("");
}
function groupByDate(list){
  const result={}; list.forEach(a=>result[a.date]=(result[a.date]||0)+a.co2); return result;
}
function renderChart(){
  const canvas=document.getElementById("impactChart"),ctx=canvas.getContext("2d");
  const rect=canvas.getBoundingClientRect(),dpr=window.devicePixelRatio||1;
  canvas.width=Math.max(1,rect.width*dpr);canvas.height=Math.max(1,rect.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const w=rect.width,h=rect.height,period=document.getElementById("chartPeriod").value;
  const days=period==="week"?7:30, points=[];
  for(let i=days-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;points.push({label:period==="week"?d.toLocaleDateString("en",{weekday:"short"}):String(d.getDate()),value:activities.filter(a=>a.date===key).reduce((s,a)=>s+a.co2,0)});}
  const sum=points.reduce((s,p)=>s+p.value,0);document.getElementById("chartTotal").textContent=`${fmt(sum)} kg total`;
  const empty=document.getElementById("chartEmpty");empty.style.display=sum===0?"flex":"none";
  const pad={l:8,r:8,t:12,b:24},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b,max=Math.max(5,...points.map(p=>p.value))*1.2;
  ctx.clearRect(0,0,w,h);ctx.font="9px DM Sans";ctx.textAlign="center";
  for(let i=0;i<4;i++){const y=pad.t+ch*i/3;ctx.strokeStyle="#edf1eb";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();}
  const step=cw/points.length;
  points.forEach((p,i)=>{const bh=p.value/max*(ch-5),x=pad.l+i*step+step*.22,y=pad.t+ch-bh;ctx.fillStyle=p.value?"#83ad76":"#edf2e9";const bw=Math.max(3,step*.56);roundRect(ctx,x,y,bw,Math.max(2,bh),4);ctx.fill();ctx.fillStyle="#98a398";ctx.fillText(p.label,x+bw/2,h-5);});
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
const TIPS=[
  ["Choose a lighter commute","Walking, cycling or sharing a ride can reduce transport emissions and make your daily routine healthier."],
  ["Give devices a real break","Switch off unused lights and devices, and enable energy-saving settings where possible."],
  ["Plan meals, waste less","A little meal planning helps avoid food waste and the resources that go with it."],
  ["Make purchases count","Repair, reuse or borrow before buying new. Durable choices can reduce the impact of consumption."]
];
function renderTips(){const tip=TIPS[new Date().getDate()%TIPS.length];document.getElementById("dailyTipTitle").textContent=tip[0];document.getElementById("dailyTipText").textContent=tip[1];}
document.addEventListener("DOMContentLoaded",init);
