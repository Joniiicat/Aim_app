//VARIABLES————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

//game loop-------------------------------------------------------------------------------------------------------------
const FIXED_TIME_STEP = 20; //20 milliseconds per step
let Accumulator = 0;
let LastTime = 0;

//spawning timer--------------------------------------------------------------------------------------------------------
const Interval = 750; //milliseconds
let CurrTime = 0;

//target----------------------------------------------------------------------------------------------------------------
const MaxTargets = 200;
let TargetPoints = [];

const TargetElement = document.getElementById("target");

const TargetWidth = TargetElement.offsetWidth;
const TargetHeight = TargetElement.offsetHeight;

//screen dimentions-----------------------------------------------------------------------------------------------------
const ScreenElement = document.getElementById("game");

const ScreenWidth = ScreenElement.offsetWidth - (TargetWidth / 2);
const ScreenHeight = ScreenElement.offsetHeight - (TargetHeight / 2);

//mouse-----------------------------------------------------------------------------------------------------------------
let MX;
let MY;

//FUNCTIONS————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

//runtime functions-----------------------------------------------------------------------------------------------------
function OnStart(){
    GenerateTarget(RandomPosition());
}

function Update(deltaTime){
    UpdateMouse();

    document.addEventListener('click', function(event){
        OnClick();
    });
}

function FixedUpdate(fixedDeltaTime){
    TargetGenTimer();
    if(TargetPoints.length > MaxTargets){ResetGame();}
    console.log(TargetPoints.length);
}

//hit detection---------------------------------------------------------------------------------------------------------
function UpdateMouse(){
    document.addEventListener('mousemove', (event) => {
        MX = event.clientX;
        MY = event.clientY;
    });
}

function OnClick(){
    for(let i = 0; i < TargetPoints.length; i++){
        const t = TargetPoints[i].getBoundingClientRect();
        
        const hitTarget = 
            MX < t.right &&
            MX > t.left &&
            MY < t.bottom &&
            MY > t.top;
        
        if(hitTarget){
            OnHit();
            return;
        }
    }
}

function OnHit(){  
    for(let i = 0; i < TargetPoints.length; i++){
        const t = TargetPoints[i].getBoundingClientRect();
        
        const targetHit =
            MX >= t.left &&
            MX <= t.right &&
            MY >= t.top &&
            MY <= t.bottom;
        
        if(targetHit){
            TargetPoints[i].remove();
            TargetPoints.splice(i, 1);
            return;
        }
    }
}

//target functions------------------------------------------------------------------------------------------------------
function TargetGenTimer(){
    if(CurrTime >= Interval){
        GenerateTarget(RandomPosition());
        CurrTime = 0;
    }
    else{
        CurrTime += FIXED_TIME_STEP;
    }
}

function RandomPosition(){
    if (TargetPoints.length === 0) {
        return {
            x: Math.random() * (ScreenWidth - TargetWidth),
            y: Math.random() * (ScreenHeight - TargetHeight)
        };
    }

    let conditionMet = false;
    let x, y;

    while (!conditionMet) {
        x = Math.random() * (ScreenWidth - TargetWidth);
        y = Math.random() * (ScreenHeight - TargetHeight);

        conditionMet = true;

        for (let i = 0; i < TargetPoints.length; i++) {
            const t = TargetPoints[i].getBoundingClientRect();
            const b = ScreenElement.getBoundingClientRect();

            const targetOverlap =
                x < t.right &&
                x + TargetWidth > t.left &&
                y < t.bottom &&
                y + TargetHeight > t.top;
            
            const borderOverlap =
                x >= b.left &&
                x <= b.right &&
                y >= b.top &&
                y <= b.bottom;

            if(targetOverlap || !borderOverlap) {
                conditionMet = false;
                break;
            }
        }
    }
    
    return { x, y };
}


function GenerateTarget(pos){
    let clone = TargetElement.cloneNode(true);

    clone.style.top = `${pos.y}px`;
    clone.style.left = `${pos.x}px`;
    clone.style.opacity = "1";
    clone.removeAttribute("id");
    
    TargetPoints.push(clone);

    document.body.appendChild(clone);
}

//game loop functions---------------------------------------------------------------------------------------------------
function ResetGame(){
    for(let i = 0; i < TargetPoints.length; i++){TargetPoints[i].remove();}
    
    TargetPoints = [];
    CurrTime = 0;
}


function GameLoop(timestamp) {
    if (LastTime === 0) {
        LastTime = timestamp;
        requestAnimationFrame(GameLoop);
        return;
    }

    let deltaTime = timestamp - LastTime;
    LastTime = timestamp;

    deltaTime = Math.min(deltaTime, 250);

    Accumulator += deltaTime;
    
    while (Accumulator >= FIXED_TIME_STEP) {
        FixedUpdate(FIXED_TIME_STEP);
        Accumulator -= FIXED_TIME_STEP;
    }
    
    Update(deltaTime);

    requestAnimationFrame(GameLoop);
}

//INITIALIZE———————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

OnStart();
requestAnimationFrame(GameLoop);