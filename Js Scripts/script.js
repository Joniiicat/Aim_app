//VARIABLES————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————

//game loop-------------------------------------------------------------------------------------------------------------
const FIXED_TIME_STEP = 20; //20 milliseconds per step
let Accumulator = 0;
let LastTime = 0;
let ElapsedTime = 0;

let GamePaused = false;

//spawning timer--------------------------------------------------------------------------------------------------------
let Interval ; //milliseconds
let SpawningCurrTime = 0;

//timer text------------------------------------------------------------------------------------------------------------
const TextElement = document.getElementById("time");

//button----------------------------------------------------------------------------------------------------------------
const PauseButtonElement = document.getElementById("restart");

//target speed up-------------------------------------------------------------------------------------------------------
const MinSpeed = 750;
const MaxSpeed = 200;
const MaxTime = 1000 * 120;

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

    PauseButtonElement.addEventListener('click', OnRestartClick);
}

function FixedUpdate(fixedDeltaTime){
    if(!GamePaused){
        //Elapsed time per round
        ElapsedTime += fixedDeltaTime;

        //target spawner
        TargetGenTimer();

        //spawn speed up
        const t = Math.min(ElapsedTime / MaxTime, 1);
        Interval = Lerp(MinSpeed, MaxSpeed, t);

        //text update
        TextElement.textContent = String(Math.round(ElapsedTime / 1000));
    }
    //game reset trigger
    if(TargetPoints.length > MaxTargets){
        OnPause();
    }
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

function ClearTargets(){
    for(let i = 0; i < TargetPoints.length; i++){TargetPoints[i].remove();}
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

//menu functions--------------------------------------------------------------------------------------------------------
function OnPause(){
    GamePaused = true;
    PauseButtonElement.style.opacity = "1";
    ClearTargets();
}

function OnRestartClick(){
    ResetGame();
}

//game loop functions---------------------------------------------------------------------------------------------------
function ResetGame(){
    PauseButtonElement.style.opacity = "0";
    TextElement.textContent = "0";

    ClearTargets();
    
    TargetPoints = [];
    SpawningCurrTime = 0;
    ElapsedTime = 0;

    GamePaused = false;
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