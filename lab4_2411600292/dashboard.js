document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");
    if (!username) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("userName").textContent = username;
    updateGreeting(username);
    document.getElementById("loginTime").textContent = "Last login: " + (localStorage.getItem("loginTime") || "Just now");

    if (typeof initDataManager === "function") {
        initDataManager();
    }

    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("username");
        localStorage.removeItem("loginTime");
        window.location.href = "index.html";
    });
});

function updateGreeting(name) {
    const h = new Date().getHours();
    let greeting;
    if (h < 12) greeting = "Good Morning, Admin! ☀️ Let's check the inventory!";
    else if (h < 18) greeting = "Good Afternoon, Admin! 🏃 Keep the supplies moving!";
    else greeting = "Good Evening, Admin! 🌙 Great job today!";
    document.getElementById("greeting").textContent = greeting;
}