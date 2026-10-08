const form=document.getElementById("loginForm");
const userId=document.getElementById("userId");
const userPassword=document.getElementById("userPassword");
const button=document.getElementById("loginButton");
const zone=document.getElementById("buttonZone");
const status=document.getElementById("status");
const retryButton=document.getElementById("retryButton");

let round=1;
let dodges=0;
let lastMove=0;
let active=false;
let completed=false;

// Slower reaction, but each dodge travels a long distance.
const DODGE_DELAY=150;
const DODGE_TRIGGER=185;

const firstRoundMessages=[
  "Try to catch the login button.",
  "Too slow.",
  "Nice try.",
  "Almost.",
  "Keep going.",
  "You're getting closer.",
  "Okay... you can click it now."
];

function fieldsReady(){
  return userId.value.trim()!=="" && userPassword.value.trim()!=="";
}

function setReadyState(){
  if(completed)return;
  active=fieldsReady();

  if(round===1){
    if(active){
      status.textContent="Now try to catch LOGIN.";
      status.style.color="#687282";
    }else{
      status.textContent="Fill in both fields to begin.";
    }
  }else{
    if(active){
      status.textContent="Round 2. This one won't be easy.";
      status.style.color="#687282";
    }else{
      status.textContent="Fill in both fields to begin round 2.";
    }
  }
}

// Pick the destination farthest away from the pointer/current position.
// This makes each jump large instead of twitchy.
function getFarDestination(pointerX,pointerY){
  const maxX=Math.max(0,zone.clientWidth-button.offsetWidth);
  const maxY=Math.max(0,zone.clientHeight-button.offsetHeight);
  const rect=zone.getBoundingClientRect();

  const px=pointerX==null?zone.clientWidth/2:pointerX-rect.left;
  const py=pointerY==null?zone.clientHeight/2:pointerY-rect.top;

  const candidates=[
    [0,0],[maxX,0],[0,maxY],[maxX,maxY],
    [maxX/2,0],[maxX/2,maxY],[0,maxY/2],[maxX,maxY/2]
  ];

  let best=candidates[0];
  let bestDistance=-1;

  for(const [x,y] of candidates){
    const distance=Math.hypot(x+button.offsetWidth/2-px,y+button.offsetHeight/2-py);
    if(distance>bestDistance){
      best=[x,y];
      bestDistance=distance;
    }
  }

  return best;
}

function moveButton(pointerX,pointerY){
  if(!active || completed)return;

  const now=performance.now();
  if(now-lastMove<DODGE_DELAY)return;
  lastMove=now;
  dodges++;

  // In round 1, after several fair dodges, the player gets a chance to click.
  if(round===1 && dodges>=7){
    active=false;
    button.style.left="0px";
    button.style.top="14px";
    button.style.transform="scale(1)";
    status.textContent=firstRoundMessages[firstRoundMessages.length-1];
    status.style.color="#151922";
    return;
  }

  const [x,y]=getFarDestination(pointerX,pointerY);

  button.style.left=x+"px";
  button.style.top=y+"px";
  button.style.transform="scale(1)";

  if(round===1){
    status.textContent=firstRoundMessages[Math.min(dodges,firstRoundMessages.length-2)];
  }else{
    status.textContent="Nope. Round 2 is impossible.";
  }
}

document.addEventListener("mousemove",(event)=>{
  if(!active || completed)return;

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

  if(round===1 && fieldsReady() && !active){
    successfulLogin();
    return;
  }

  if(round===2 && fieldsReady()){
    moveButton(event.clientX,event.clientY);
  }
});

form.addEventListener("submit",(event)=>{
  event.preventDefault();

  if(round===1 && fieldsReady() && !active){
    successfulLogin();
  }else if(round===2 && fieldsReady()){
    moveButton();
  }
});

function successfulLogin(){
  if(round!==1 || completed)return;

  completed=true;
  active=false;
  button.style.pointerEvents="none";
  button.style.left="0px";
  button.style.top="14px";
  button.style.transform="scale(1)";

  status.textContent="you are successfully logined to the website in less attempts";
  status.style.color="#151922";
  retryButton.hidden=false;
}

[userId,userPassword].forEach(input=>{
  input.addEventListener("input",setReadyState);
});

retryButton.addEventListener("click",()=>{
  round=2;
  dodges=0;
  completed=false;
  active=false;
  retryButton.hidden=true;

  button.style.pointerEvents="auto";
  button.style.left="0px";
  button.style.top="14px";
  button.style.transform="scale(1)";

  form.reset();
  status.textContent="Round 2: fill in both fields.";
  status.style.color="#687282";
  userId.focus();
});

setReadyState();
