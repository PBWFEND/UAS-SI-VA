// frontend/js/auth.js - PERBAIKAN LENGKAP
class Auth {
  constructor() {
    this.apiBaseUrl = "/api";
    this.initialize();
  }

  async initialize() {
    console.log("Auth system initialized");
    await this.checkAuth();
  }

  async checkAuth() {
    try {
      console.log("Checking authentication...");

      const response = await fetch(`${this.apiBaseUrl}/current-user`, {
        method: "GET",
        credentials: "include", // Penting untuk session cookies
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("Auth check response:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("User authenticated:", data.user);

        // Jika di halaman login, redirect ke dashboard
        if (
          window.location.pathname === "/" ||
          window.location.pathname === "/index.html" ||
          window.location.pathname === "/login.html"
        ) {
          console.log("Redirecting to dashboard...");
          window.location.href = "/dashboard";
        }

        // Store user data
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        return data.user;
      } else {
        console.log("Not authenticated");

        // Jika tidak authenticated dan bukan di halaman login, redirect
        if (
          window.location.pathname !== "/" &&
          window.location.pathname !== "/index.html" &&
          window.location.pathname !== "/login.html"
        ) {
          console.log("Redirecting to login...");
          window.location.href = "/";
        }

        return null;
      }
    } catch (error) {
      console.error("Auth check error:", error);

      // On network error, stay on current page
      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/index.html" &&
        window.location.pathname !== "/login.html"
      ) {
        console.log("Network error, showing message...");
        this.showAlert("Koneksi error. Coba refresh halaman.", "error");
      }

      return null;
    }
  }

  async login(username, password) {
    console.log("Login attempt for:", username);

    try {
      const response = await fetch(`${this.apiBaseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Penting untuk session
        body: JSON.stringify({ username, password }),
      });

      console.log("Login response:", response.status);

      const data = await response.json();
      console.log("Login response data:", data);

      if (response.ok && data.success) {
        console.log("Login successful");

        // Store user info
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("lastLogin", new Date().toISOString());

        // Show success message
        this.showAlert(
          "Login berhasil! Mengarahkan ke dashboard...",
          "success"
        );

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);

        return data.user;
      } else {
        console.log("Login failed:", data.error);
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${this.apiBaseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("lastLogin");

      // Redirect to login
      window.location.href = "/";
    }
  }

  getCurrentUser() {
    // Try to get from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  isAuthenticated() {
    return !!localStorage.getItem("user");
  }

  showAlert(message, type = "info") {
    // Remove existing alerts
    const existingAlert = document.querySelector(".global-alert");
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement("div");
    alert.className = `global-alert alert alert-${type}`;
    alert.innerHTML = `
            ${message}
            <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
        `;

    document.body.insertBefore(alert, document.body.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentElement) alert.remove();
    }, 5000);
  }
}

// Create global auth instance
const auth = new Auth();

// Login form handler
if (document.getElementById("loginForm")) {
  console.log("Login form detected, setting up handler...");

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginBtn = document.getElementById("loginBtn");
    const errorMsg = document.getElementById("errorMsg");

    console.log("Form submitted:", {
      username,
      passwordLength: password.length,
    });

    // Save button state
    const originalText = loginBtn.innerHTML;
    const originalDisabled = loginBtn.disabled;

    // Show loading
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';

    // Hide previous error
    if (errorMsg) {
      errorMsg.style.display = "none";
      errorMsg.textContent = "";
    }

    try {
      await auth.login(username, password);
    } catch (error) {
      console.error("Login catch error:", error);

      // Show error
      if (errorMsg) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = "block";
      }

      // Restore button
      loginBtn.disabled = false;
      loginBtn.innerHTML = originalText;
    }
  });
}

// Auto-fill demo credentials
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, setting up demo credentials...");

  // Auto-fill admin credentials for convenience
  setTimeout(() => {
    if (
      document.getElementById("username") &&
      document.getElementById("password")
    ) {
      document.getElementById("username").value = "admin";
      document.getElementById("password").value = "admin123";
      console.log("Demo credentials auto-filled");
    }
  }, 500);

  // Click handlers for demo credentials
  document.querySelectorAll(".demo-credential").forEach((el) => {
    el.addEventListener("click", function () {
      const username = this.dataset.username;
      const password = this.dataset.password;

      if (document.getElementById("username")) {
        document.getElementById("username").value = username;
      }
      if (document.getElementById("password")) {
        document.getElementById("password").value = password;
      }

      console.log("Demo credentials selected:", username);
    });
  });
});

// Logout button handler
document.addEventListener("click", function (e) {
  if (e.target.id === "logoutBtn" || e.target.closest("#logoutBtn")) {
    e.preventDefault();
    console.log("Logout clicked");
    auth.logout();
  }
});

// Make auth globally available
window.auth = auth;
