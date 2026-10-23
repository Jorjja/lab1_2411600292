document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorAlert = document.getElementById("errorAlert");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        handleLogin();
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username === "admin" && password === "password123") {
            localStorage.setItem("username", username);
            localStorage.setItem("loginTime", new Date().toLocaleString());
            window.location.href = "dashboard.html";
        } else {
            errorAlert.classList.remove("d-none");
        }
    }
});