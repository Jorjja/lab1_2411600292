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
    const greeting = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
    document.getElementById("greeting").textContent = `${greeting}, ${name}!`;
}