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

// Deliberately slower reaction, but with a much larger dodge area.
const DODGE_DELAY=110;
const DODGE_TRIGGER=270;
const FIRST_ROUND_DODGES=12;

const firstRoundMessages=[
  "Try to catch the login button.",
  "Too slow.",
  "Nice try.",
  "Almost.",
  "Keep going.",
  "You're getting closer.",
  "Not yet.",
  "Still chasing?",
  "That was close.",
  "One more try.",
  "Almost there.",
  "Okay... you can click it now."
];

function fieldsReady(){
  return userId.value.trim()!=="" && userPassword.value.trim()!=="";
}

function setReadyState(){
  if(completed)return;
  active=fieldsReady();

  if(round===1){
    status.textContent=active
      ?"Now try to catch LOGIN."
      :"Fill in both fields to begin.";
  }else{
    status.textContent=active
      ?"Round 2. Catch it if you can."
      :"Fill in both fields to begin round 2.";
  }
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
    [maxX*.15,maxY*.15],[maxX*.85,maxY*.15],
    [maxX*.15,maxY*.85],[maxX*.85,maxY*.85],
    [maxX*.5,0],[maxX*.5,maxY],[0,maxY*.5],[maxX,maxY*.5]
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

  // First round becomes clickable only after a substantial number of dodges.
  if(round===1&&dodges>FIRST_ROUND_DODGES){
    active=false;
    button.style.left="0px";
    button.style.top="14px";
    button.style.transform="scale(1)";
    status.textContent="Okay... you can click it now.";
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
    status.textContent="Nope. Round 2 keeps escaping.";
  }
}

function successfulLogin(){
  if(round!==1||completed)return;

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

document.addEventListener("mousemove",(event)=>{
  if(!active||completed)return;

  const r=button.getBoundingClientRect();
  const distance=Math.hypot(
    event.clientX-(r.left+r.width/2),
    event.clientY-(r.top+r.height/2)
  );

  // Detect the pointer well before it reaches the button.
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

  if(round===1&&fieldsReady()&&!active){
    successfulLogin();
    return;
  }

  if(round===2&&fieldsReady()){
    moveButton(event.clientX,event.clientY);
  }
});

form.addEventListener("submit",(event)=>{
  event.preventDefault();

  if(round===1&&fieldsReady()&&!active){
    successfulLogin();
  }else if(round===2&&fieldsReady()){
    moveButton();
  }
});

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
