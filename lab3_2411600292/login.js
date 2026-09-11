document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("loginBtn");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorAlert = document.getElementById("errorAlert");

    loginBtn.addEventListener("click", handleLogin);

    passwordInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") handleLogin();
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username === "admin" && password === "password123") {
            localStorage.setItem("username", username);
            window.location.href = "dashboard.html";
        } else {
            errorAlert.classList.remove("d-none");
        }
    }
});