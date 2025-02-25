document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleForm = document.getElementById('toggleForm');
    const formTitle = document.getElementById('formTitle');
    const formSubtitle = document.getElementById('formSubtitle');
    const loginMessage = document.getElementById('loginMessage');
    const signupMessage = document.getElementById('signupMessage');

    // Always start on login page
    localStorage.removeItem('loggedInUser');

    // Toggle between login and signup forms
    toggleForm.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.toggle('hidden');
        signupForm.classList.toggle('hidden');
        formTitle.textContent = loginForm.classList.contains('hidden') ? "Sign Up" : "Login";
        formSubtitle.textContent = loginForm.classList.contains('hidden') ? "Create an account" : "Sign in to continue";
        toggleForm.innerHTML = loginForm.classList.contains('hidden') ? "Already have an account? <a href='#'>Login</a>" : "Don't have an account? <a href='#'>Sign Up</a>";
    });

    // Handle Signup (Username & Password only)
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value.trim();

        if (username && password.length >= 6) {
            let users = JSON.parse(localStorage.getItem('users')) || {};

            if (users[username]) {
                signupMessage.style.color = "red";
                signupMessage.textContent = "❌ Username already exists!";
            } else {
                users[username] = { password };
                localStorage.setItem('users', JSON.stringify(users));
                signupMessage.style.color = "green";
                signupMessage.textContent = "✅ Signup successful! Redirecting to login...";

                // Auto-switch to login form after 2 seconds
                setTimeout(() => {
                    signupForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                    formTitle.textContent = "Login";
                    formSubtitle.textContent = "Sign in to continue";
                    toggleForm.innerHTML = "Don't have an account? <a href='#'>Sign Up</a>";
                    signupForm.reset(); // Clear signup form
                    signupMessage.textContent = "";
                }, 2000);
            }
        } else {
            signupMessage.style.color = "red";
            signupMessage.textContent = "❌ Password must be at least 6 characters!";
        }
    });

    // Handle Login
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        let users = JSON.parse(localStorage.getItem('users')) || {};

        if (users[username] && users[username].password === password) {
            localStorage.setItem('loggedInUser', username);
            window.location.href = "dashboard.html"; // Redirect after successful login
        } else {
            loginMessage.style.color = "red";
            loginMessage.textContent = "❌ Invalid username or password! Please Sign up";
        }
    });

    // Show/Hide Password
    document.querySelectorAll('.togglePassword').forEach(toggle => {
        toggle.addEventListener('click', function () {
            let passwordInput = this.previousElementSibling;
            passwordInput.type = passwordInput.type === "password" ? "text" : "password";
        });
    });
});
