//Set a default Timer Object
const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
};
let interval;

//Get the tag that stores the buttons
const modeButtons = document.querySelector('#js-mode-buttons');
//Event listenr to listen for clicking event
modeButtons.addEventListener('click', handleMode);

//Set a Audio Sound file
const buttonSound = new Audio('button-sound.mp3');
//Event listener to start the timer
const mainButton = document.querySelector('#js-btn');
mainButton.addEventListener('click', ()=>{
    buttonSound.play();
    const { action } = mainButton.dataset;
    if(action == 'start')
    {
        startTimer();
    }
    else
    {
        stopTimer();
    }
});

//Event listener to switch to a default mode once page is loaded
document.addEventListener('DOMContentLoaded' , () => {
    //Check if brower support notifications
    if('Notification' in window)
    {
        if(Notification.permission != 'granted' && Notification.permission != 'denied')
        {
            Notification.requestPermission().then(function(permission)
            {
                if(permission == 'greanted')
                {
                    new Notification("Awesome! You will be notified at the start of each session");
                }
            });
        }
    }

    switchMode('pomodoro');
    document.querySelector("#js-sessionTotal").textContent = timer.longBreakInterval;
});

//Get the difference in time and return a object
function getRemainingTime(endTime)
{
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference/1000, 10);
    const minutes =  Number.parseInt((total/60) % 60, 10);
    const seconds =  Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}

function stopTimer()
{
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = "START";
    mainButton.classList.remove('active');
}

//Start the count down timer
function startTimer()
{
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if(timer.mode == 'pomodoro') 
    {
        timer.sessions++;
        document.querySelector('#js-sessionCount').textContent = timer.sessions;
    }

    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'STOP';
    mainButton.classList.add('active');
    
    interval = setInterval(() => {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if(total <= 0 )
        {
            clearInterval(interval);

            switch(timer.mode)
            {
                case 'pomodoro':
                    if(timer.sessions % timer.longBreakInterval === 0)
                    {
                        switchMode('longBreak');
                        timer.sessions = 0;
                        startTimer();
                    }
                    else
                    {
                        switchMode('shortBreak');
                        startTimer();
                    }
                    break;
                default:
                    switchMode('pomodoro');
                    startTimer();
                    break;
            }
            document.querySelector('[data-sound="${tiemr.mode}"]').play();
        }
    }, 1000);
}

//update the display of the timer
function updateClock()
{
    /*
        padStart method is a method that pads the number with '0' for this instances
        Example: remaining time is '8' seconds instead it will be shown as '08' seconds
                 this keeps the displayed number more consistance
    */

    //Timer display
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2,'0');
    const seconds = `${remainingTime.seconds}`.padStart(2,'0');

    const min = document.querySelector('#js-minutes');
    const sec = document.querySelector('#js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    //progress bar
    const progress = document.querySelector('#js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;

    //Timer Shown on <title> tag
    const titleText = (timer.mode == 'pomodoro') ? "Get back to work!": "Take a break!";
    document.title = `${minutes}:${seconds} -${titleText}`

}

//switch modes between the buttons
function switchMode(mode)
{
    //Add 2 new properties into timer Object (mode and remainingTime)
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    /*
        Logic
        -----
        * Select all the buttons with data-mode
        * Run through them and remove the class name 'active'
        * Select the one that was choosen and add class name 'active'
        * Update the Timer value
    */
    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document
        .querySelector('#js-progress')
        .setAttribute('max', timer.remainingTime.total);

    updateClock();
}

//get the Mode once the buttons are clicked
function handleMode(event)
{
    const { mode } = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
    stopTimer();
}

