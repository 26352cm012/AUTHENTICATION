const form=document.getElementById("loginForm");
const button=document.getElementById("loginButton");
const zone=document.getElementById("buttonZone");
const status=document.getElementById("status");

let attempts=0;
let lastMove=0;
let lockedMessage=false;

const messages=["Nice try.","Too slow.","Nope.","Almost.","Not even close.","Catch me.","AUTHENTICATION says no."];

function moveButton(pointerX,pointerY){
  if(lockedMessage)return;
  const now=performance.now();
  if(now-lastMove<30)return;
  lastMove=now;
  attempts++;

  const maxX=Math.max(0,zone.clientWidth-button.offsetWidth);
  const maxY=Math.max(0,zone.clientHeight-button.offsetHeight);

  const rect=zone.getBoundingClientRect();
  const localX=pointerX==null?null:pointerX-rect.left;
  const localY=pointerY==null?null:pointerY-rect.top;

  let x=0,y=0;
  for(let i=0;i<30;i++){
    const tx=Math.random()*maxX;
    const ty=Math.random()*maxY;
    if(localX==null || Math.hypot(tx+button.offsetWidth/2-localX,ty+button.offsetHeight/2-localY)>190){
      x=tx;y=ty;break;
    }
  }
  button.style.left=x+"px";
  button.style.top=y+"px";
  button.style.transform="scale("+(.82+Math.random()*.14)+")";
  status.textContent=messages[Math.min(attempts-1,messages.length-1)];
}

document.addEventListener("mousemove",(event)=>{
  if(lockedMessage)return;
  const r=button.getBoundingClientRect();
  const distance=Math.hypot(event.clientX-(r.left+r.width/2),event.clientY-(r.top+r.height/2));
  if(distance<210)moveButton(event.clientX,event.clientY);
});

button.addEventListener("mouseenter",(event)=>moveButton(event.clientX,event.clientY));
button.addEventListener("pointerdown",(event)=>{
  event.preventDefault();
  event.stopPropagation();
  lockedMessage=true;
  button.style.pointerEvents="none";
  status.textContent="you are logined in less attempts wanna try again?";
  status.style.color="#151922";
});

form.addEventListener("submit",(event)=>{
  event.preventDefault();
  lockedMessage=true;
  button.style.pointerEvents="none";
  status.textContent="you are logined in less attempts wanna try again?";
  status.style.color="#151922";
});
