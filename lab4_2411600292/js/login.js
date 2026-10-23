document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const user = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();

        if (user === "admin" && pass === "password123") {
            localStorage.setItem("username", user);
            localStorage.setItem("loginTime", new Date().toLocaleString());
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("errorAlert").classList.remove("d-none");
        }
    });
});