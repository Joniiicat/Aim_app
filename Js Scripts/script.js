//VARIABLES————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

//game loop-------------------------------------------------------------------------------------------------------------
const FIXED_TIME_STEP = 20; //20 milliseconds per step
let Accumulator = 0;
let LastTime = 0;
let ElapsedTime = 0;

//spawning timer--------------------------------------------------------------------------------------------------------
let Interval ; //milliseconds
let SpawningCurrTime = 0;

//timer text------------------------------------------------------------------------------------------------------------
let TimerTime;
const TextBox = document.getElementById("time");

//target speed up-------------------------------------------------------------------------------------------------------
const MinSpeed = 750;
const MaxSpeed = 200;
const MaxTime = 1000 * 120;

let CurrStep

//target----------------------------------------------------------------------------------------------------------------
const MaxTargets = 20;
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
    //target spawner
    TargetGenTimer();
    
    //game reset trigger
    if(TargetPoints.length > MaxTargets){ResetGame();}

    //spawn speed up
    ElapsedTime += fixedDeltaTime;
    const t = Math.min(ElapsedTime / MaxTime, 1);
    Interval = Lerp(MinSpeed, MaxSpeed, t);
    
    //text update
    TextBox.textContent = String(Math.round(ElapsedTime / 1000));
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
    if(SpawningCurrTime >= Interval){
        GenerateTarget(RandomPosition());
        SpawningCurrTime = 0;
    }
    else{
        SpawningCurrTime += FIXED_TIME_STEP;
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
    SpawningCurrTime = 0;
    ElapsedTime = 0;
}

function Lerp(a, b, t) {
    return a + (b - a) * t;
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