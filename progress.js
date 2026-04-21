document.addEventListener("DOMContentLoaded", () => {

  // ── LOAD DATA ──────────────────────────────────────────
  const workouts  = JSON.parse(localStorage.getItem("workouts"))   || [];
  const sleepData = JSON.parse(localStorage.getItem("sleepData"))  || [];
  const bodyStats = JSON.parse(localStorage.getItem("bodyStats"))  || {};
  const steps     = Number(localStorage.getItem("steps"))          || 0;

  // Weight history (array of {date, weight} saved over time)
  const weightHistory = JSON.parse(localStorage.getItem("weightHistory")) || [];

  // If bodyStats has a weight, push it to history automatically (deduplicate by date)
  if (bodyStats.weight) {
    const today = new Date().toLocaleDateString();
    const alreadySaved = weightHistory.some(w => w.date === today);
    if (!alreadySaved) {
      weightHistory.push({ date: today, weight: Number(bodyStats.weight) });
      localStorage.setItem("weightHistory", JSON.stringify(weightHistory));
    }
  }

  // ── CHART DEFAULTS ─────────────────────────────────────
  const CHART_DEFAULTS = {
    color: "#fff",
    grid:  "rgba(255,255,255,0.1)",
    ticks: "#ccc"
  };

  function axisStyle() {
    return {
      ticks: { color: CHART_DEFAULTS.ticks },
      grid:  { color: CHART_DEFAULTS.grid }
    };
  }

  // ── SUMMARY STRIP ──────────────────────────────────────
  const totalCalories = workouts.reduce((s, w) => s + Number(w.calories), 0);
  const totalDuration = workouts.reduce((s, w) => s + Number(w.duration), 0);
  const avgSleep = sleepData.length
    ? (sleepData.reduce((s, d) => s + d.hours, 0) / sleepData.length).toFixed(1)
    : "-";

  document.getElementById("sumWorkouts").innerText  = workouts.length;
  document.getElementById("sumCalories").innerText  = totalCalories;
  document.getElementById("sumDuration").innerText  = totalDuration;
  document.getElementById("sumAvgSleep").innerText  = avgSleep;
  document.getElementById("sumSteps").innerText     = steps.toLocaleString();

  // ── HELPER: show empty state ───────────────────────────
  function showEmpty(emptyId, canvasId) {
    document.getElementById(emptyId).style.display  = "block";
    document.getElementById(canvasId).style.display = "none";
  }

  // ── CHART 1: Calories Burned (Line) ───────────────────
  if (workouts.length === 0) {
    showEmpty("emptyCalories", "caloriesChart");
  } else {
    new Chart(document.getElementById("caloriesChart"), {
      type: "line",
      data: {
        labels: workouts.map(w => w.date),
        datasets: [{
          label: "Calories Burned",
          data:  workouts.map(w => Number(w.calories)),
          borderColor: "#00e6a8",
          backgroundColor: "rgba(0,230,168,0.15)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#00e6a8",
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: { x: axisStyle(), y: axisStyle() }
      }
    });
  }

  // ── CHART 2: Workout Duration (Bar) ───────────────────
  if (workouts.length === 0) {
    showEmpty("emptyDuration", "durationChart");
  } else {
    new Chart(document.getElementById("durationChart"), {
      type: "bar",
      data: {
        labels: workouts.map(w => w.activity + " " + w.date),
        datasets: [{
          label: "Duration (mins)",
          data:  workouts.map(w => Number(w.duration)),
          backgroundColor: workouts.map((_, i) =>
            `hsl(${(i * 47) % 360}, 70%, 60%)`
          ),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: { x: axisStyle(), y: { ...axisStyle(), beginAtZero: true } }
      }
    });
  }

  // ── CHART 3: Activity Type Pie ─────────────────────────
  if (workouts.length === 0) {
    showEmpty("emptyActivity", "activityChart");
  } else {
    // Count each activity type
    const activityCount = {};
    workouts.forEach(w => {
      const key = w.activity.trim();
      activityCount[key] = (activityCount[key] || 0) + 1;
    });

    const actLabels = Object.keys(activityCount);
    const actData   = Object.values(activityCount);
    const pieColors = actLabels.map((_, i) =>
      `hsl(${(i * 60 + 160) % 360}, 65%, 55%)`
    );

    new Chart(document.getElementById("activityChart"), {
      type: "doughnut",
      data: {
        labels: actLabels,
        datasets: [{
          data: actData,
          backgroundColor: pieColors,
          borderColor: "rgba(0,0,0,0.3)",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#fff", padding: 12 }
          }
        }
      }
    });
  }

  // ── CHART 4: Weight Over Time (Line) ──────────────────
  if (weightHistory.length === 0) {
    showEmpty("emptyWeight", "weightChart");
  } else {
    new Chart(document.getElementById("weightChart"), {
      type: "line",
      data: {
        labels: weightHistory.map(w => w.date),
        datasets: [{
          label: "Weight (kg)",
          data:  weightHistory.map(w => w.weight),
          borderColor: "#f0c040",
          backgroundColor: "rgba(240,192,64,0.15)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#f0c040",
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: { x: axisStyle(), y: axisStyle() }
      }
    });
  }

  // ── CHART 5: Sleep Hours (Bar) ────────────────────────
  if (sleepData.length === 0) {
    showEmpty("emptySleep", "sleepChart");
  } else {
    const sleepColors = sleepData.map(s =>
      s.hours >= 7 && s.hours <= 9 ? "#00e6a8"
      : s.hours < 7                ? "#ff6b6b"
      :                              "#f0c040"
    );

    new Chart(document.getElementById("sleepChart"), {
      type: "bar",
      data: {
        labels: sleepData.map(s => s.date),
        datasets: [{
          label: "Hours of Sleep",
          data:  sleepData.map(s => s.hours),
          backgroundColor: sleepColors,
          borderRadius: 6
        },
        {
          // 7-hr goal line via a fake dataset
          label: "Recommended (7 hrs)",
          data:  sleepData.map(() => 7),
          type: "line",
          borderColor: "rgba(255,255,255,0.5)",
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          x: axisStyle(),
          y: { ...axisStyle(), beginAtZero: true, max: 12 }
        }
      }
    });
  }

  // ── CHART 6: Steps (Bar) ──────────────────────────────
  // Build steps history from localStorage (same approach as weight)
  const stepsHistory = JSON.parse(localStorage.getItem("stepsHistory")) || [];
  if (steps > 0) {
    const today2 = new Date().toLocaleDateString();
    const idx = stepsHistory.findIndex(s => s.date === today2);
    if (idx !== -1) stepsHistory[idx].steps = steps;
    else stepsHistory.push({ date: today2, steps });
    if (stepsHistory.length > 7) stepsHistory.splice(0, stepsHistory.length - 7);
    localStorage.setItem("stepsHistory", JSON.stringify(stepsHistory));
  }

  if (stepsHistory.length === 0) {
    showEmpty("emptySteps", "stepsChart");
  } else {
    const stepsColors = stepsHistory.map(s =>
      s.steps >= 10000 ? "#00e6a8"
      : s.steps >= 5000 ? "#f0c040"
      :                   "#ff6b6b"
    );

    new Chart(document.getElementById("stepsChart"), {
      type: "bar",
      data: {
        labels: stepsHistory.map(s => s.date),
        datasets: [{
          label: "Steps",
          data:  stepsHistory.map(s => s.steps),
          backgroundColor: stepsColors,
          borderRadius: 6
        },
        {
          label: "Goal (10,000)",
          data:  stepsHistory.map(() => 10000),
          type: "line",
          borderColor: "rgba(255,255,255,0.5)",
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          x: axisStyle(),
          y: { ...axisStyle(), beginAtZero: true }
        }
      }
    });
  }

});