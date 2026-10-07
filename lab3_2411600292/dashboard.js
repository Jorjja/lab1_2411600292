document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("userName").textContent = username;
    updateGreeting();
    displayLoginTime();
    loadDailyStats();
    renderActivityTable();

    document.getElementById("activityForm").addEventListener("submit", handleAddActivity);
    document.getElementById("logoutBtn").addEventListener("click", logout);
});

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    if (hour < 12) greeting = "Good Morning, Admin! ☀️ Rise and shine!";
    else if (hour < 18) greeting = "Good Afternoon, Admin! 🌤️ Keep pushing!";
    else greeting = "Good Evening, Admin! 🌙 Great job today!";
    document.getElementById("greeting").textContent = greeting;
}

function displayLoginTime() {
    const time = localStorage.getItem("loginTime") || "Just now";
    document.getElementById("loginTime").textContent = `Last login: ${time}`;
}

function getDailyData() {
    const today = new Date().toDateString();
    let stored = localStorage.getItem("fitnessData");
    if (!stored) return { date: today, activities: [], streak: 1 };
    const parsed = JSON.parse(stored);
    if (parsed.date !== today) {
        parsed.date = today;
        parsed.activities = [];
        parsed.streak += 1;
    }
    return parsed;
}

function saveDailyData(data) {
    localStorage.setItem("fitnessData", JSON.stringify(data));
}

function calculateCalories(activity, minutes) {
    const rates = {
        "Walking": 4,
        "Running": 10,
        "Weight Training": 6,
        "Cycling": 8,
        "Home Workout": 5
    };
    return Math.round((rates[activity] || 4) * minutes);
}

function loadDailyStats() {
    const data = getDailyData();
    let totalSteps = 0, totalCalories = 0, totalMins = 0;
    data.activities.forEach(a => {
        totalSteps += a.steps || 0;
        totalCalories += a.calories;
        totalMins += a.duration;
    });

    document.getElementById("stepsCount").textContent = totalSteps.toLocaleString();
    document.getElementById("caloriesBurned").textContent = totalCalories;
    document.getElementById("workoutMins").textContent = totalMins;
    document.getElementById("streakDays").textContent = data.streak;

    const progress = Math.min((totalSteps / 10000) * 100, 100);
    document.getElementById("stepsProgress").style.width = progress + "%";
}

function handleAddActivity(e) {
    e.preventDefault();
    const type = document.getElementById("actType").value;
    const duration = parseInt(document.getElementById("actDuration").value);
    const steps = parseInt(document.getElementById("actSteps").value) || 0;
    const notes = document.getElementById("actNotes").value;

    const calories = calculateCalories(type, duration);
    const data = getDailyData();
    data.activities.unshift({
        time: new Date().toLocaleTimeString(),
        type,
        duration,
        steps,
        calories,
        notes
    });
    saveDailyData(data);

    document.getElementById("activityForm").reset();
    loadDailyStats();
    renderActivityTable();
}

function renderActivityTable() {
    const data = getDailyData();
    const tbody = document.getElementById("activityTable");
    tbody.innerHTML = "";

    if (data.activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No activities logged yet. Start your first workout above! 💪</td></tr>';
        return;
    }

    data.activities.forEach(a => {
        const goalMet = a.calories >= 200;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${a.time}</td>
            <td><strong>${a.type}</strong>${a.notes ? `<br><small class="text-muted">${a.notes}</small>` : ""}</td>
            <td>${a.duration} min</td>
            <td>${a.steps.toLocaleString()}</td>
            <td>${a.calories} kcal</td>
            <td><span class="badge ${goalMet ? 'bg-success' : 'bg-warning'}">${goalMet ? 'Goal Met ✅' : 'Keep Going 💪'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("loginTime");
    window.location.href = "index.html";
}