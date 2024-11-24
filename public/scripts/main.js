const API_BASE_URL = 'http://localhost/project/api';

const formContainer = document.getElementById('form-container');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');

function showLoginForm() {
    formContainer.innerHTML = `
        <form id="login-form" class="form">
            <h2>Login</h2>
            <input type="email" id="login-email" placeholder="Email" required>
            <input type="password" id="login-password" placeholder="Password" required>
            <div id="login-error" class="error-message"></div>
            <button type="submit" class="btn btn-primary">Login</button>
        </form>
    `;
    handleLoginForm();
}

function showRegisterForm() {
    formContainer.innerHTML = `
        <form id="register-form" class="form">
            <h2>Register</h2>
            <input type="text" id="register-username" placeholder="Username" required>
            <input type="email" id="register-email" placeholder="Email" required>
            <input type="password" id="register-password" placeholder="Password" required>
            <div id="register-error" class="error-message"></div>
            <button type="submit" class="btn btn-secondary">Register</button>
        </form>
    `;
    handleRegisterForm();
}

function handleLoginForm() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const errorDiv = document.getElementById('login-error');

        if (!validateEmail(email)) {
            errorDiv.textContent = 'Invalid email address.';
            return;
        }
        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters long.';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('userId', result.userId); // Збереження userId
                alert('Login successful!');
                window.location.href = 'dashboard.html';
            } else {
                errorDiv.textContent = 'Login failed: ' + result.error;
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred while logging in.';
        }
    });
}

function handleRegisterForm() {
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const errorDiv = document.getElementById('register-error');

        if (username === '') {
            errorDiv.textContent = 'Username cannot be empty.';
            return;
        }
        if (!validateEmail(email)) {
            errorDiv.textContent = 'Invalid email address.';
            return;
        }
        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters long.';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth.php?action=register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('userId', result.userId); // Збереження userId
                alert('Registration successful!');
                window.location.href = 'dashboard.html';
            } else {
                errorDiv.textContent = 'Registration failed: ' + result.error;
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred while registering.';
        }
    });
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

loginButton.addEventListener('click', showLoginForm);
registerButton.addEventListener('click', showRegisterForm);



