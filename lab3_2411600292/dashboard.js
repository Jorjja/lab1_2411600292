document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");

    if (!username) {
        window.location.href = "index.html";
        return;
    }

    updateGreeting(username);
    updateStatistics();
    populateActivityTable();

    document.getElementById("logoutBtn").addEventListener("click", logout);
});

function updateGreeting(username) {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 18) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }

    document.getElementById("greeting").textContent = `${greeting}, ${username}!`;
}

function updateStatistics() {
    const stats = [
        { title: "Total Users", value: "1,248" },
        { title: "Active Sessions", value: "86" },
        { title: "System Status", value: "Online" },
        { title: "Notifications", value: "5" }
    ];

    stats.forEach((stat, index) => {
        document.getElementById(`stat${index + 1}-title`).textContent = stat.title;
        document.getElementById(`stat${index + 1}-value`).textContent = stat.value;
    });
}

function populateActivityTable() {
    const activities = [
        { action: "Login", details: "User admin signed in", time: "2026-09-11 08:30:00" },
        { action: "Update", details: "System configuration updated", time: "2026-09-11 09:15:00" },
        { action: "Backup", details: "Database backup completed", time: "2026-09-11 00:00:00" },
        { action: "Report", details: "Monthly report generated", time: "2026-09-10 14:45:00" }
    ];

    const tbody = document.getElementById("activityTable");
    tbody.innerHTML = "";

    activities.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.action}</td>
            <td>${item.details}</td>
            <td>${item.time}</td>
        `;
        tbody.appendChild(row);
    });
}

function logout() {
    localStorage.removeItem("username");
    window.location.href = "index.html";
}