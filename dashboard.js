document.addEventListener("DOMContentLoaded", () => {
  loadWorkouts();
  loadSteps();
  loadBodyStats();
  loadSleep();
  loadNotifStatus();
  loadReminderTime();
  updateProgress();
  generateAI();
});

// ---------------- PROGRESS BAR ----------------
function updateProgress() {
  const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  const weeklyGoal = 5;
  const percent = Math.min((workouts.length / weeklyGoal) * 100, 100);

  const fill = document.getElementById("progressFill");
  const text = document.getElementById("progressText");

  if (fill) fill.style.width = percent + "%";
  if (text) text.innerText = workouts.length + " / " + weeklyGoal + " workouts this week";
}

// ---------------- WORKOUT ----------------
function addWorkout() {
  const activity = document.getElementById("activity").value;
  const duration = document.getElementById("duration").value;
  const calories = document.getElementById("calories").value;

  if (activity === "" || duration === "" || calories === "") {
    alert("Please fill all fields");
    return;
  }

  const workout = {
    date: new Date().toLocaleDateString(),
    activity: activity,
    duration: duration,
    calories: calories
  };

  let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  workouts.push(workout);
  localStorage.setItem("workouts", JSON.stringify(workouts));

  document.getElementById("activity").value = "";
  document.getElementById("duration").value = "";
  document.getElementById("calories").value = "";

  loadWorkouts();
  updateProgress();
  generateAI();
}

// Display workouts with per-row delete button
function loadWorkouts() {
  const list = document.getElementById("workoutList");
  const workouts = JSON.parse(localStorage.getItem("workouts")) || [];

  list.innerHTML = "";

  if (workouts.length === 0) {
    list.innerHTML = "<p style='color:#aaa; font-size:13px; margin-top:8px;'>No workouts logged yet.</p>";
    return;
  }

  workouts.forEach((w, index) => {
    list.innerHTML += `
      <div class="row">
        <span>${w.date}</span>
        <span>${w.activity}</span>
        <span>${w.duration}</span>
        <span>${w.calories}</span>
        <button onclick="deleteWorkout(${index})" style="background:red; color:white; border:none; border-radius:5px; padding:2px 8px; cursor:pointer;">✕</button>
      </div>
    `;
  });
}

// Delete one workout row
function deleteWorkout(index) {
  if (!confirm("Delete this workout?")) return;
  let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  workouts.splice(index, 1);
  localStorage.setItem("workouts", JSON.stringify(workouts));
  loadWorkouts();
  updateProgress();
  generateAI();
}

// Delete ALL workouts
function clearWorkouts() {
  if (!confirm("Delete ALL workouts? This cannot be undone.")) return;
  localStorage.removeItem("workouts");
  loadWorkouts();
  updateProgress();
  generateAI();
}

// ---------------- STEPS ----------------
function saveSteps() {
  const steps = document.getElementById("stepsInput").value;

  if (steps === "") {
    alert("Enter steps");
    return;
  }

  localStorage.setItem("steps", steps);
  document.getElementById("stepsInput").value = "";
  loadSteps();
  generateAI();
}

function loadSteps() {
  const steps = localStorage.getItem("steps");
  document.getElementById("stepsDisplay").innerText =
    steps ? "Today Steps: " + steps : "No steps logged yet.";
}

// Clear Steps
function clearSteps() {
  if (!confirm("Clear today's steps?")) return;
  localStorage.removeItem("steps");
  loadSteps();
  generateAI();
}

// ---------------- BODY STATS ----------------
function saveBodyStats() {
  const weight = document.getElementById("weight").value;
  const bmi = document.getElementById("bmi").value;

  if (weight === "" || bmi === "") {
    alert("Enter all fields");
    return;
  }

  localStorage.setItem("bodyStats", JSON.stringify({ weight: weight, bmi: Number(bmi) }));

  document.getElementById("weight").value = "";
  document.getElementById("bmi").value = "";

  loadBodyStats();
  generateAI();
}

function loadBodyStats() {
  const stats = JSON.parse(localStorage.getItem("bodyStats")) || {};
  const weight = stats.weight || "-";
  const bmi = stats.bmi || "-";
  document.getElementById("bodyDisplay").innerText = "Weight: " + weight + " kg | BMI: " + bmi;
}

// Clear Body Stats
function clearBodyStats() {
  if (!confirm("Clear body stats?")) return;
  localStorage.removeItem("bodyStats");
  loadBodyStats();
  generateAI();
}

// ---------------- SLEEP TRACKER ----------------
function saveSleep() {
  const date = document.getElementById("sleepDate").value;
  const hours = parseFloat(document.getElementById("sleepHours").value);

  if (!date || isNaN(hours) || hours <= 0) {
    alert("Please enter a valid date and hours of sleep.");
    return;
  }

  let sleepData = JSON.parse(localStorage.getItem("sleepData")) || [];

  // Replace existing entry for same date
  const existingIndex = sleepData.findIndex(s => s.date === date);
  if (existingIndex !== -1) {
    sleepData[existingIndex].hours = hours;
  } else {
    sleepData.push({ date, hours });
  }

  // Keep only last 7 days
  sleepData.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sleepData.length > 7) sleepData = sleepData.slice(-7);

  localStorage.setItem("sleepData", JSON.stringify(sleepData));

  document.getElementById("sleepDate").value = "";
  document.getElementById("sleepHours").value = "";

  loadSleep();
}

function loadSleep() {
  const sleepData = JSON.parse(localStorage.getItem("sleepData")) || [];
  const list = document.getElementById("sleepList");
  const warning = document.getElementById("sleepWarning");
  const average = document.getElementById("sleepAverage");

  list.innerHTML = "";

  if (sleepData.length === 0) {
    warning.innerText = "";
    average.innerText = "No sleep data logged yet.";
    return;
  }

  // Calculate average
  const total = sleepData.reduce((sum, s) => sum + s.hours, 0);
  const avg = (total / sleepData.length).toFixed(1);

  average.innerText = "📊 Weekly Average: " + avg + " hrs / night";

  // Warn if average below 7
  if (parseFloat(avg) < 7) {
    warning.innerText = "⚠️ You're averaging less than 7 hours! Aim for 7–9 hrs for better recovery.";
  } else {
    warning.innerText = "✅ Great sleep average this week!";
  }

  // Render rows
  sleepData.slice().reverse().forEach((s, i) => {
    const realIndex = sleepData.length - 1 - i;
    let status = "";
    if (s.hours >= 7 && s.hours <= 9) {
      status = "<span style='color:#00e6a8;'>😴 Good</span>";
    } else if (s.hours < 7) {
      status = "<span style='color:#ff6b6b;'>⚠️ Low</span>";
    } else {
      status = "<span style='color:#f0c040;'>😪 Too much</span>";
    }

    list.innerHTML += `
      <div class="sleep-row">
        <span>${s.date}</span>
        <span>${s.hours} hrs</span>
        <span>${status}</span>
        <button onclick="deleteSleep(${realIndex})" style="background:red; color:white; border:none; border-radius:5px; padding:2px 8px; cursor:pointer;">✕</button>
      </div>
    `;
  });
}

function deleteSleep(index) {
  if (!confirm("Delete this sleep entry?")) return;
  let sleepData = JSON.parse(localStorage.getItem("sleepData")) || [];
  sleepData.splice(index, 1);
  localStorage.setItem("sleepData", JSON.stringify(sleepData));
  loadSleep();
}

function clearSleep() {
  if (!confirm("Clear all sleep data?")) return;
  localStorage.removeItem("sleepData");
  loadSleep();
}

// ---------------- AI SUGGESTION ----------------
function generateAI() {
  let workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  let steps = Number(localStorage.getItem("steps")) || 0;
  let stats = JSON.parse(localStorage.getItem("bodyStats")) || {};

  let aiMain = document.getElementById("aiMain");
  let aiTip = document.getElementById("aiTip");
  let aiVideo = document.getElementById("aiVideo");

  aiVideo.innerHTML = "";

  if (workouts.length === 0) {
    aiMain.innerText = "Start your fitness journey today 🚀";
    aiTip.innerText = "Try a beginner full-body workout.";
    aiVideo.innerHTML = `<iframe src="https://www.youtube.com/embed/ml6cT4AZdqI"></iframe>`;
  } else if (workouts.length < 3) {
    aiMain.innerText = "You're getting started 💪";
    aiTip.innerText = "Increase your workout frequency to 3–4 days/week.";
    aiVideo.innerHTML = `<iframe src="https://www.youtube.com/embed/UBMk30rjy0o"></iframe>`;
  } else {
    aiMain.innerText = "Great consistency! 🔥";
    aiTip.innerText = "Try HIIT or strength training for better results.";
    aiVideo.innerHTML = `<iframe src="https://www.youtube.com/embed/sTANio_2E0Q"></iframe>`;
  }

  if (steps < 5000) {
    aiTip.innerText += " Also, increase your daily steps 🚶";
  }

  if (stats.bmi) {
    if (stats.bmi > 25) {
      aiTip.innerText += " Focus on fat-burning workouts.";
    } else if (stats.bmi < 18) {
      aiTip.innerText += " Include strength training.";
    }
  }
}


// ============================================================
// NOTIFICATIONS / REMINDERS
// ============================================================

function requestNotificationPermission() {
  const status = document.getElementById("notifStatus");

  if (!("Notification" in window)) {
    status.innerText = "❌ Your browser does not support notifications.";
    status.style.color = "#ff6b6b";
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      status.innerText = "✅ Notifications enabled! You'll get daily reminders.";
      status.style.color = "#00e6a8";
      scheduleReminders(); // start checking
    } else if (permission === "denied") {
      status.innerText = "❌ Notifications blocked. Please allow them in browser settings.";
      status.style.color = "#ff6b6b";
    } else {
      status.innerText = "⚠️ Permission dismissed. Try again.";
      status.style.color = "#f0c040";
    }
  });
}

function sendTestNotification() {
  const status = document.getElementById("notifStatus");

  if (Notification.permission !== "granted") {
    status.innerText = "⚠️ Please enable notifications first.";
    status.style.color = "#f0c040";
    return;
  }

  // Check what user hasn't logged today
  const messages = buildReminderMessages();

  if (messages.length === 0) {
    new Notification("🏋️ FitTrack", {
      body: "Great job! You've logged everything today. Keep it up! 💪",
      icon: "https://cdn-icons-png.flaticon.com/512/2964/2964514.png"
    });
  } else {
    messages.forEach(msg => {
      new Notification("🏋️ FitTrack Reminder", {
        body: msg,
        icon: "https://cdn-icons-png.flaticon.com/512/2964/2964514.png"
      });
    });
  }

  status.innerText = "🧪 Test notification sent!";
  status.style.color = "#00e6a8";
}

function buildReminderMessages() {
  const messages = [];
  const today = new Date().toLocaleDateString();

  // Check workouts
  const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  const loggedToday = workouts.some(w => w.date === today);
  if (!loggedToday) {
    messages.push("🏋️ You haven't logged a workout today! Stay active.");
  }

  // Check steps
  const steps = localStorage.getItem("steps");
  if (!steps || Number(steps) === 0) {
    messages.push("👟 You haven't logged steps today! Try to reach 10,000 steps.");
  } else if (Number(steps) < 5000) {
    messages.push("👟 Only " + steps + " steps today. Keep walking!");
  }

  // Check sleep
  const sleepData = JSON.parse(localStorage.getItem("sleepData")) || [];
  const sleptToday = sleepData.some(s => s.date === today);
  if (!sleptToday) {
    messages.push("🌙 Don't forget to log your sleep tonight!");
  }

  return messages;
}

function saveReminderTime() {
  const time = document.getElementById("reminderTime").value;
  if (!time) return;

  localStorage.setItem("reminderTime", time);
  document.getElementById("reminderDisplay").innerText = "⏰ Reminder set for " + time + " daily.";

  scheduleReminders();
}

function loadReminderTime() {
  const time = localStorage.getItem("reminderTime");
  if (time) {
    document.getElementById("reminderTime").value = time;
    document.getElementById("reminderDisplay").innerText = "⏰ Reminder set for " + time + " daily.";
  }
}

function scheduleReminders() {
  // Clear any existing interval
  if (window._reminderInterval) clearInterval(window._reminderInterval);

  // Check every 60 seconds if it's time to remind
  window._reminderInterval = setInterval(() => {
    if (Notification.permission !== "granted") return;

    const savedTime = localStorage.getItem("reminderTime");
    if (!savedTime) return;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, "0") + ":" +
                        now.getMinutes().toString().padStart(2, "0");

    if (currentTime === savedTime) {
      const messages = buildReminderMessages();
      if (messages.length > 0) {
        messages.forEach(msg => {
          new Notification("🏋️ FitTrack Daily Reminder", {
            body: msg,
            icon: "https://cdn-icons-png.flaticon.com/512/2964/2964514.png"
          });
        });
      }
    }
  }, 60000); // check every minute
}

// Show notification permission status on load
function loadNotifStatus() {
  const status = document.getElementById("notifStatus");
  if (!("Notification" in window)) {
    status.innerText = "❌ Notifications not supported in this browser.";
    status.style.color = "#ff6b6b";
  } else if (Notification.permission === "granted") {
    status.innerText = "✅ Notifications are enabled.";
    status.style.color = "#00e6a8";
    scheduleReminders();
  } else if (Notification.permission === "denied") {
    status.innerText = "❌ Notifications are blocked. Allow them in browser settings.";
    status.style.color = "#ff6b6b";
  } else {
    status.innerText = "🔕 Notifications not enabled yet.";
    status.style.color = "#f0c040";
  }
}


// ============================================================
// EXPORT DATA AS CSV
// ============================================================

function downloadCSV(filename, csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  document.getElementById("exportStatus").innerText = "✅ " + filename + " downloaded!";
  setTimeout(() => {
    document.getElementById("exportStatus").innerText = "";
  }, 3000);
}

function exportWorkoutsCSV() {
  const workouts = JSON.parse(localStorage.getItem("workouts")) || [];

  if (workouts.length === 0) {
    document.getElementById("exportStatus").innerText = "⚠️ No workout data to export.";
    document.getElementById("exportStatus").style.color = "#f0c040";
    return;
  }

  let csv = "Date,Activity,Duration (mins),Calories Burned\n";
  workouts.forEach(w => {
    csv += `${w.date},${w.activity},${w.duration},${w.calories}\n`;
  });

  downloadCSV("fittrack_workouts.csv", csv);
}

function exportStepsCSV() {
  const steps = localStorage.getItem("steps");

  if (!steps) {
    document.getElementById("exportStatus").innerText = "⚠️ No steps data to export.";
    document.getElementById("exportStatus").style.color = "#f0c040";
    return;
  }

  const today = new Date().toLocaleDateString();
  let csv = "Date,Steps\n";
  csv += `${today},${steps}\n`;

  downloadCSV("fittrack_steps.csv", csv);
}

function exportSleepCSV() {
  const sleepData = JSON.parse(localStorage.getItem("sleepData")) || [];

  if (sleepData.length === 0) {
    document.getElementById("exportStatus").innerText = "⚠️ No sleep data to export.";
    document.getElementById("exportStatus").style.color = "#f0c040";
    return;
  }

  let csv = "Date,Hours of Sleep,Status\n";
  sleepData.forEach(s => {
    let status = s.hours >= 7 && s.hours <= 9 ? "Good" : s.hours < 7 ? "Low" : "Too Much";
    csv += `${s.date},${s.hours},${status}\n`;
  });

  downloadCSV("fittrack_sleep.csv", csv);
}

function exportAllCSV() {
  const workouts = JSON.parse(localStorage.getItem("workouts")) || [];
  const sleepData = JSON.parse(localStorage.getItem("sleepData")) || [];
  const steps = localStorage.getItem("steps") || "0";
  const bodyStats = JSON.parse(localStorage.getItem("bodyStats")) || {};
  const today = new Date().toLocaleDateString();

  let csv = "";

  // Workouts section
  csv += "=== WORKOUTS ===\n";
  csv += "Date,Activity,Duration (mins),Calories Burned\n";
  if (workouts.length > 0) {
    workouts.forEach(w => {
      csv += `${w.date},${w.activity},${w.duration},${w.calories}\n`;
    });
  } else {
    csv += "No workouts logged\n";
  }

  // Steps section
  csv += "\n=== STEPS ===\n";
  csv += "Date,Steps\n";
  csv += `${today},${steps}\n`;

  // Sleep section
  csv += "\n=== SLEEP DATA ===\n";
  csv += "Date,Hours of Sleep,Status\n";
  if (sleepData.length > 0) {
    sleepData.forEach(s => {
      let status = s.hours >= 7 && s.hours <= 9 ? "Good" : s.hours < 7 ? "Low" : "Too Much";
      csv += `${s.date},${s.hours},${status}\n`;
    });
  } else {
    csv += "No sleep data logged\n";
  }

  // Body stats section
  csv += "\n=== BODY STATS ===\n";
  csv += "Weight (kg),BMI\n";
  csv += `${bodyStats.weight || "-"},${bodyStats.bmi || "-"}\n`;

  downloadCSV("fittrack_all_data.csv", csv);
}