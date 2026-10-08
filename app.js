const form=document.getElementById("loginForm");
const userId=document.getElementById("userId");
const userPassword=document.getElementById("userPassword");
const button=document.getElementById("loginButton");
const zone=document.getElementById("buttonZone");
const status=document.getElementById("status");
const challengeMessage=document.getElementById("challengeMessage");
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
let active=false;
let completed=false;
let lastMove=0;

const FIRST_ROUND_DODGES=120;
const SECOND_ROUND_DODGES=240;
const POINTER_MOVE_DELAY=500;
const POINTER_TRIGGER=240;

function fieldsReady(){
  return userId.value.trim()!==""&&userPassword.value.trim()!=="";
}

function targetCount(){
  return round===1?FIRST_ROUND_DODGES:SECOND_ROUND_DODGES;
}

function setReadyState(){
  if(completed)return;

  if(!fieldsReady()){
    active=false;
    challengeMessage.textContent="KEEP TRYING!";
    status.textContent=round===1
      ?"Fill in both fields to begin."
      :"Fill in both fields to begin round 2.";
    status.style.color="#687282";
    return;
  }

  // The button stays still until the pointer approaches it.
  active=true;
  challengeMessage.textContent="KEEP TRYING!";
  status.textContent=round===1
    ?"Round 1 started — move toward LOGIN."
    :"Round 2 started — catch LOGIN if you can.";
  status.style.color="#687282";
}

function getFarDestination(pointerX=null,pointerY=null){
  const maxX=Math.max(0,zone.clientWidth-button.offsetWidth);
  const maxY=Math.max(0,zone.clientHeight-button.offsetHeight);
  const rect=zone.getBoundingClientRect();

  const px=pointerX==null?zone.clientWidth/2:pointerX-rect.left;
  const py=pointerY==null?zone.clientHeight/2:pointerY-rect.top;

  const candidates=[
    [0,0],[maxX,0],[0,maxY],[maxX,maxY],
    [maxX*.05,maxY*.18],[maxX*.95,maxY*.18],
    [maxX*.05,maxY*.82],[maxX*.95,maxY*.82],
    [maxX*.25,0],[maxX*.75,0],
    [maxX*.25,maxY],[maxX*.75,maxY],
    [0,maxY*.5],[maxX,maxY*.5]
  ];

  // Prefer candidates far from the pointer, but randomize among the best
  // positions so the movement feels natural instead of predictable.
  const ranked=candidates
    .map(point=>({
      point,
      distance:Math.hypot(
        point[0]+button.offsetWidth/2-px,
        point[1]+button.offsetHeight/2-py
      )
    }))
    .sort((a,b)=>b.distance-a.distance);

  const choice=ranked[Math.floor(Math.random()*Math.min(4,ranked.length))];
  return choice.point;
}

function moveButton(pointerX=null,pointerY=null){
  if(!active||completed)return;

  const now=performance.now();
  if(now-lastMove<Math.min(AUTO_MOVE_DELAY,POINTER_MOVE_DELAY))return;
  lastMove=now;

  const target=targetCount();
  dodges++;

  if(dodges>target){
    active=false;
    button.style.left="0px";
    button.style.top="14px";
    challengeMessage.textContent="YOU'RE GONNA LOGIN!";
    status.textContent="Okay... LOGIN is yours.";
    status.style.color="#151922";
    return;
  }

  const [x,y]=getFarDestination(pointerX,pointerY);
  button.style.left=x+"px";
  button.style.top=y+"px";

  const encouragements=[
    "KEEP TRYING!",
    "YOU'RE GONNA LOGIN!",
    "YOUR TRYING EFFORTS ARE NOT REACHABLE!"
  ];
  challengeMessage.textContent=encouragements[(dodges-1)%encouragements.length];
}

function showSuccess(){
  completed=true;
  active=false;

  button.style.pointerEvents="none";
  button.style.left="0px";
  button.style.top="14px";

  const finalRound=round===2;

  successDetail.textContent=finalRound
    ?"Round 2 complete. Absolute patience."
    :"Round 1 complete. Patience level: impressive.";

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
  reviewMessage.classList.remove("thanks");
  submitReview.disabled=false;
  submitReview.hidden=false;
  burst.replaceChildren();

  round=2;
  dodges=0;
  completed=false;
  active=false;
  lastMove=0;

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

  const rect=button.getBoundingClientRect();
  const distance=Math.hypot(
    event.clientX-(rect.left+rect.width/2),
    event.clientY-(rect.top+rect.height/2)
  );

  if(distance<POINTER_TRIGGER){
    moveButton(event.clientX,event.clientY);
  }
});

button.addEventListener("pointerdown",(event)=>{
  event.preventDefault();
  event.stopPropagation();

  if(active){
    // Clicking/pressing while the challenge is active makes the button dodge.
    moveButton(event.clientX,event.clientY);
    return;
  }

  if(fieldsReady()){
    showSuccess();
  }
});

form.addEventListener("submit",(event)=>{
  event.preventDefault();

  if(!fieldsReady()){
    status.textContent="Please fill in both fields.";
    status.style.color="#687282";
    return;
  }

  if(active){
    moveButton();
  }else{
    showSuccess();
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
}

setReadyState();