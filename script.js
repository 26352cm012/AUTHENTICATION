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

function moveButton(pointerX,pointerY){
  if(!active || completed)return;
  const now=performance.now();
  if(now-lastMove<18)return;
  lastMove=now;
  dodges++;

  if(round===1 && dodges>=7){
    active=false;
    button.style.left="0px";
    button.style.top="14px";
    button.style.transform="scale(1)";
    status.textContent=firstRoundMessages[firstRoundMessages.length-1];
    status.style.color="#151922";
    return;
  }

  const maxX=Math.max(0,zone.clientWidth-button.offsetWidth);
  const maxY=Math.max(0,zone.clientHeight-button.offsetHeight);
  const rect=zone.getBoundingClientRect();
  const px=pointerX==null?null:pointerX-rect.left;
  const py=pointerY==null?null:pointerY-rect.top;

  let x=0,y=0;
  for(let i=0;i<40;i++){
    const tx=Math.random()*maxX;
    const ty=Math.random()*maxY;
    if(px==null || Math.hypot(tx+button.offsetWidth/2-px,ty+button.offsetHeight/2-py)>165){
      x=tx;
      y=ty;
      break;
    }
  }

  button.style.left=x+"px";
  button.style.top=y+"px";
  button.style.transform="scale("+(.82+Math.random()*.12)+")";

  if(round===1){
    status.textContent=firstRoundMessages[Math.min(dodges,firstRoundMessages.length-2)];
  }else{
    status.textContent="Nope. Round 2 is impossible.";
  }
}

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

document.addEventListener("mousemove",(event)=>{
  if(!active || completed)return;
  const r=button.getBoundingClientRect();
  const distance=Math.hypot(
    event.clientX-(r.left+r.width/2),
    event.clientY-(r.top+r.height/2)
  );
  if(distance<190)moveButton(event.clientX,event.clientY);
});

button.addEventListener("mouseenter",(event)=>{
  if(round===1 && active)moveButton(event.clientX,event.clientY);
  if(round===2 && active)moveButton(event.clientX,event.clientY);
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

[userId,userPassword].forEach(input=>input.addEventListener("input",setReadyState));

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