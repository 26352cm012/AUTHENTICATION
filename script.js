const form=document.getElementById("loginForm");
const userId=document.getElementById("userId");
const userPassword=document.getElementById("userPassword");
const button=document.getElementById("loginButton");
const zone=document.getElementById("buttonZone");
const status=document.getElementById("status");
const celebration=document.getElementById("celebration");
const burst=document.getElementById("celebrationBurst");
const successDetail=document.getElementById("successDetail");
const againButton=document.getElementById("againButton");
const reviewBox=document.getElementById("reviewBox");
const reviewText=document.getElementById("reviewText");
const submitReview=document.getElementById("submitReview");
const reviewMessage=document.getElementById("reviewMessage");

let round=1;
let dodges=0;
let lastMove=0;
let active=false;
let completed=false;

const FIRST_ROUND_DODGES=120;
const SECOND_ROUND_DODGES=240;
const DODGE_DELAY=180;
const DODGE_TRIGGER=280;

function fieldsReady(){
  return userId.value.trim()!==""&&userPassword.value.trim()!=="";
}

function setReadyState(){
  if(completed)return;
  active=fieldsReady();
  if(!active){
    status.textContent=round===1
      ?"Fill in both fields to begin."
      :"Fill in both fields to begin round 2.";
    status.style.color="#687282";
    return;
  }
  status.textContent=round===1
    ?"Round 1: catch LOGIN."
    :"Round 2: catch LOGIN. This is the patience test.";
  status.style.color="#687282";
}

function getFarDestination(pointerX,pointerY){
  const maxX=Math.max(0,zone.clientWidth-button.offsetWidth);
  const maxY=Math.max(0,zone.clientHeight-button.offsetHeight);
  const rect=zone.getBoundingClientRect();
  const px=pointerX==null?zone.clientWidth/2:pointerX-rect.left;
  const py=pointerY==null?zone.clientHeight/2:pointerY-rect.top;

  const candidates=[
    [0,0],[maxX,0],[0,maxY],[maxX,maxY],
    [maxX*.08,maxY*.42],[maxX*.92,maxY*.42],
    [maxX*.28,0],[maxX*.72,0],
    [maxX*.28,maxY],[maxX*.72,maxY],
    [0,maxY*.18],[0,maxY*.82],
    [maxX,maxY*.18],[maxX,maxY*.82]
  ];

  let best=candidates[0];
  let bestDistance=-1;

  for(const [x,y] of candidates){
    const distance=Math.hypot(
      x+button.offsetWidth/2-px,
      y+button.offsetHeight/2-py
    );
    if(distance>bestDistance){
      best=[x,y];
      bestDistance=distance;
    }
  }
  return best;
}

function moveButton(pointerX,pointerY){
  if(!active||completed)return;

  const now=performance.now();
  if(now-lastMove<DODGE_DELAY)return;
  lastMove=now;
  dodges++;

  const target=round===1?FIRST_ROUND_DODGES:SECOND_ROUND_DODGES;

  if(dodges>target){
    active=false;
    button.style.left="0px";
    button.style.top="14px";
    status.textContent="Okay... LOGIN is yours.";
    status.style.color="#151922";
    return;
  }

  const [x,y]=getFarDestination(pointerX,pointerY);
  button.style.left=x+"px";
  button.style.top=y+"px";
  status.textContent=round===1
    ?`Patience check: ${dodges}/${target}`
    :`Round 2 patience: ${dodges}/${target}`;
}

function showSuccess(){
  completed=true;
  active=false;
  button.style.pointerEvents="none";
  status.textContent="Success.";

  const finalRound=round===2;
  successDetail.textContent=finalRound
    ?"Round 2 complete. Absolute patience."
    :"Round 1 complete. Patience level: impressive.";

  // Retry is offered only after Round 1. Round 2 is the true ending.
  againButton.hidden=finalRound;
  reviewBox.hidden=!finalRound;
  celebration.hidden=false;
  createBalloonBlast();
}

function createBalloonBlast(){
  burst.replaceChildren();

  const colors=["#111827","#475569","#64748b","#94a3b8","#cbd5e1","#7c3aed","#06b6d4","#f59e0b"];

  for(let i=0;i<34;i++){
    const balloon=document.createElement("span");
    balloon.className="balloon";

    const angle=(Math.PI*2*i/34)+(Math.random()-.5)*.25;
    const distance=260+Math.random()*520;
    const x=Math.cos(angle)*distance;
    const y=-Math.abs(Math.sin(angle)*distance)-120-Math.random()*220;
    const rotation=(Math.random()*90)-45;

    balloon.style.setProperty("--x",x+"px");
    balloon.style.setProperty("--y",y+"px");
    balloon.style.setProperty("--r",rotation+"deg");

    const color=colors[i%colors.length];
    balloon.style.background=color;
    balloon.style.color=color;
    balloon.style.animationDelay=(Math.random()*.18)+"s";

    burst.appendChild(balloon);
  }

  for(let i=0;i<18;i++){
    const spark=document.createElement("span");
    spark.className="spark";
    const angle=Math.random()*Math.PI*2;
    const distance=120+Math.random()*260;

    spark.style.setProperty("--sx",Math.cos(angle)*distance+"px");
    spark.style.setProperty("--sy",Math.sin(angle)*distance+"px");
    spark.style.animationDelay=(Math.random()*.15)+"s";

    burst.appendChild(spark);
  }
}

function resetForRoundTwo(){
  celebration.hidden=true;
  reviewBox.hidden=true;
  reviewText.value="";
  reviewMessage.textContent="";
  submitReview.disabled=false;
  burst.replaceChildren();
  againButton.hidden=true;

  round=2;
  dodges=0;
  lastMove=0;
  completed=false;
  active=false;

  button.style.pointerEvents="auto";
  button.style.left="0px";
  button.style.top="14px";

  userId.value="";
  userPassword.value="";
  status.textContent="Round 2: fill in both fields.";
  status.style.color="#687282";
  userId.focus();
}

document.addEventListener("mousemove",(event)=>{
  if(!active||completed)return;

  const r=button.getBoundingClientRect();
  const distance=Math.hypot(
    event.clientX-(r.left+r.width/2),
    event.clientY-(r.top+r.height/2)
  );

  if(distance<DODGE_TRIGGER){
    moveButton(event.clientX,event.clientY);
  }
});

button.addEventListener("mouseenter",(event)=>{
  moveButton(event.clientX,event.clientY);
});

button.addEventListener("pointerdown",(event)=>{
  event.preventDefault();
  event.stopPropagation();

  if(fieldsReady()&&!active){
    showSuccess();
  }else if(active){
    moveButton(event.clientX,event.clientY);
  }
});

form.addEventListener("submit",(event)=>{
  event.preventDefault();

  if(!fieldsReady()){
    status.textContent="Please fill in both fields.";
    status.style.color="#687282";
    return;
  }

  if(!active){
    showSuccess();
  }else{
    moveButton();
  }
});

[userId,userPassword].forEach(input=>{
  input.addEventListener("input",setReadyState);
});

againButton.addEventListener("click",resetForRoundTwo);

submitReview.addEventListener("click",()=>{
  const review=reviewText.value.trim();

  if(!review){
    reviewMessage.textContent="Please write a review first.";
    reviewMessage.classList.remove("thanks");
    return;
  }

  reviewMessage.textContent="YOUR REVIEW SENT SUCCESSFULLY";
  reviewMessage.classList.add("thanks");
  submitReview.hidden=true;
  reviewText.disabled=true;
  createThankYouBlast();
});

function createThankYouBlast(){
  const old=document.querySelector(".thank-you-overlay");
  if(old)old.remove();

  const overlay=document.createElement("div");
  overlay.className="thank-you-overlay";
  overlay.setAttribute("aria-live","polite");

  const title=document.createElement("div");
  title.className="thank-you-title";
  title.textContent="THANK YOU";
  overlay.appendChild(title);

  document.body.appendChild(overlay);

  for(let i=0;i<44;i++){
    const balloon=document.createElement("span");
    balloon.className="balloon thank-balloon";

    const angle=(Math.PI*2*i/44)+(Math.random()-.5)*.3;
    const distance=240+Math.random()*600;
    const x=Math.cos(angle)*distance;
    const y=Math.sin(angle)*distance-40-Math.random()*220;
    const rotation=(Math.random()*100)-50;

    balloon.style.setProperty("--x",x+"px");
    balloon.style.setProperty("--y",y+"px");
    balloon.style.setProperty("--r",rotation+"deg");

    const colors=["#111827","#475569","#64748b","#94a3b8","#7c3aed","#06b6d4","#f59e0b","#ec4899"];
    const color=colors[i%colors.length];
    balloon.style.background=color;
    balloon.style.color=color;
    balloon.style.animationDelay=(Math.random()*.25)+"s";

    overlay.appendChild(balloon);
  }

  setTimeout(()=>overlay.remove(),3600);
});

setReadyState();
