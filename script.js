


const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".section");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        sections.forEach(s => s.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.section)
            .classList.add("active");
    });
});




function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    let period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    const time =
        String(hours).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");

    document.getElementById("time").textContent = time;
    document.getElementById("period").textContent = period;

    document.getElementById("day").textContent =
        now.toLocaleDateString("en-IN", { weekday: "long" });

    document.getElementById("date").textContent =
        now.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
}

setInterval(updateClock, 1000);
updateClock();




let watchTime = 0;
let watchInterval = null;
let watchRunning = false;

const watchDisplay = document.getElementById("stopwatchDisplay");

function showWatch() {
    let minutes = Math.floor(watchTime / 60000);
    let seconds = Math.floor((watchTime % 60000) / 1000);
    let milliseconds = Math.floor((watchTime % 1000) / 10);

    watchDisplay.textContent =
        String(Math.floor(minutes / 60)).padStart(2, "0") + ":" +
        String(minutes % 60).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + "." +
        String(milliseconds).padStart(2, "0");
}

document.getElementById("startWatch").addEventListener("click", () => {
    if (watchRunning) return;

    watchRunning = true;
    let startTime = Date.now() - watchTime;

    watchInterval = setInterval(() => {
        watchTime = Date.now() - startTime;
        showWatch();
    }, 10);
});

document.getElementById("pauseWatch").addEventListener("click", () => {
    clearInterval(watchInterval);
    watchRunning = false;
});

document.getElementById("resetWatch").addEventListener("click", () => {
    clearInterval(watchInterval);
    watchRunning = false;
    watchTime = 0;
    showWatch();
    document.getElementById("lapList").innerHTML = "";
});

document.getElementById("lapWatch").addEventListener("click", () => {
    if (!watchRunning) return;

    const lap = document.createElement("li");
    lap.textContent = "Lap: " + watchDisplay.textContent;

    document.getElementById("lapList").prepend(lap);
});



let timerInterval = null;
let timerRemaining = 0;
let timerEnd = 0;
let timerRunning = false;

const timerDisplay = document.getElementById("timerDisplay");

function showTimer() {
    let h = Math.floor(timerRemaining / 3600);
    let m = Math.floor((timerRemaining % 3600) / 60);
    let s = timerRemaining % 60;

    timerDisplay.textContent =
        String(h).padStart(2, "0") + ":" +
        String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0");
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
}

function startTimer() {
    if (timerRunning) return;

    if (timerRemaining <= 0) {
        const h = Number(document.getElementById("hours").value) || 0;
        const m = Number(document.getElementById("minutes").value) || 0;
        const s = Number(document.getElementById("seconds").value) || 0;

        if (
            !Number.isInteger(h) || !Number.isInteger(m) ||
            !Number.isInteger(s) || h < 0 || h > 99 ||
            m < 0 || m > 59 || s < 0 || s > 59
        ) {
            alert("Enter valid timer values.");
            return;
        }

        timerRemaining = h * 3600 + m * 60 + s;
    }

    if (timerRemaining <= 0) {
        alert("Please set a timer first.");
        return;
    }

    timerRunning = true;
    timerEnd = Date.now() + timerRemaining * 1000;

    timerInterval = setInterval(() => {
        timerRemaining = Math.max(
            0,
            Math.ceil((timerEnd - Date.now()) / 1000)
        );

        showTimer();

        if (timerRemaining <= 0) {
            stopTimer();
            playRingtone("bell");
            alert("Timer completed!");
        }
    }, 200);
}

document.getElementById("startTimer").addEventListener("click", startTimer);

document.getElementById("pauseTimer").addEventListener("click", () => {
    if (timerRunning) {
        timerRemaining = Math.max(
            0,
            Math.ceil((timerEnd - Date.now()) / 1000)
        );
    }

    stopTimer();
    showTimer();
});

document.getElementById("resetTimer").addEventListener("click", () => {
    stopTimer();
    timerRemaining = 0;
    showTimer();
});




let alarms = [];
let ringing = false;
let alarmSoundInterval = null;
let audioContext = null;
let ringingAlarmId = null;

function playRingtone(type) {
    stopRingtone();

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            alert("Audio is not supported in this browser.");
            return;
        }

        audioContext = new AudioContextClass();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const patterns = {
            classic: [880, 660, 880, 660],
            beep: [1000, 1000, 1000, 1000],
            bell: [523, 659, 784, 1047]
        };

        const notes = patterns[type] || patterns.classic;
        let index = 0;

        function playNote() {
            if (!audioContext || audioContext.state === "closed") return;

            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = notes[index % notes.length];

            gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.2, audioContext.currentTime + 0.03
            );
            gain.gain.exponentialRampToValueAtTime(
                0.0001, audioContext.currentTime + 0.3
            );

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.32);

            index++;
        }

        playNote();
        alarmSoundInterval = setInterval(playNote, 450);

    } catch (error) {
        console.error("Audio error:", error);
    }
}

function stopRingtone() {
    clearInterval(alarmSoundInterval);
    alarmSoundInterval = null;

    if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
    }

    audioContext = null;
}

document.getElementById("setAlarm").addEventListener("click", () => {
    const time = document.getElementById("alarmTime").value;
    const ringtone = document.getElementById("ringtone").value;

    if (!time) {
        alert("Please select an alarm time.");
        return;
    }

    const [hour, minute] = time.split(":").map(Number);
    const now = new Date();

    const alarmDate = new Date();
    alarmDate.setHours(hour, minute, 0, 0);

    if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const alarm = {
        id: Date.now() + Math.random(),
        time,
        ringtone,
        timestamp: alarmDate.getTime()
    };

    alarms.push(alarm);
    displayAlarms();
});

function displayAlarms() {
    const list = document.getElementById("alarmList");
    list.innerHTML = "";

    alarms.forEach(alarm => {
        const li = document.createElement("li");

        const text = document.createElement("span");
        text.textContent = alarm.time + " - " + alarm.ringtone;

        const remove = document.createElement("button");
        remove.textContent = "Delete";

        remove.addEventListener("click", () => {
            alarms = alarms.filter(a => a.id !== alarm.id);
            displayAlarms();
        });

        li.append(text, remove);
        list.appendChild(li);
    });
}




setInterval(() => {
    const now = Date.now();

    if (ringing) return;

    const dueAlarm = alarms.find(a => now >= a.timestamp);

    if (dueAlarm) {
        ringing = true;
        ringingAlarmId = dueAlarm.id;

        alarms = alarms.filter(a => a.id !== dueAlarm.id);

        displayAlarms();

        document.getElementById("ringingBox").hidden = false;

        playRingtone(dueAlarm.ringtone);
    }
}, 1000);




document.getElementById("stopAlarm").addEventListener("click", () => {
    stopRingtone();

    ringing = false;
    ringingAlarmId = null;

    document.getElementById("ringingBox").hidden = true;
});




document.getElementById("snoozeAlarm").addEventListener("click", () => {
    const oldAlarm = alarms.find(a => a.id === ringingAlarmId);

  
    const ringtone = oldAlarm ? oldAlarm.ringtone : "classic";

    stopRingtone();

    alarms.push({
        id: Date.now() + Math.random(),
        time: "Snoozed (5 min)",
        ringtone,
        timestamp: Date.now() + 5 * 60 * 1000
    });

    displayAlarms();

    ringing = false;
    ringingAlarmId = null;

    document.getElementById("ringingBox").hidden = true;
});
