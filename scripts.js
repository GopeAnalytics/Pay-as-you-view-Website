document.addEventListener("DOMContentLoaded", () => {
  //  Payment Button Click
  const payButton = document.getElementById("pay-btn");
  if (payButton) {
    payButton.addEventListener("click", () => processPayment());
  }

  //  Sign-In Button Click
  const signInButton = document.getElementById("user-sign-in-btn");
  if (signInButton) {
    signInButton.addEventListener("click", () => verifySignIn());
  }

  //  Video Page - Load Videos
  if (window.location.pathname.includes("video.html")) {
    loadVideos();
  }
});

//  Function to Process Payment with Stripe
async function processPayment() {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Please enter your email to proceed with the payment.");
    return;
  }

  try {
    const response = await fetch(
      "https://track260.onrender.com/api/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();

    if (result.url) {
      window.location.href = result.url;
    } else {
      alert("Payment session creation failed.");
    }
  } catch (error) {
    console.error("Payment Error:", error);
    alert("Payment failed. Please try again.");
  }
}

//**Signing in Funcionalities */

//  Function to Verify Sign-In (User)
async function verifySignIn() {
  const email = document.getElementById("user-email").value.trim();
  const otp = document.getElementById("user-otp").value.trim();

  console.log("Sign-In Attempt:", email, otp);
  if (!email || !otp) {
    alert("Please enter your email and See Code.");
    return;
  }

  try {
    const response = await fetch("https://track260.onrender.com/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const result = await response.json();
    console.log("Server Response:", result);
    if (response.ok) {
      sessionStorage.setItem("userEmail", email);
      window.location.href = "video.html";
    } else {
      alert("Invalid See Code or Email.");
    }
  } catch (error) {
    console.error("Sign-In Error:", error);
    alert("Error signing in.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("admin-sign-in-btn")
    .addEventListener("click", adminLogin);
  document
    .getElementById("forgot-password-link")
    .addEventListener("click", resetAdminPassword);
  //  Secret Key to Reveal Admin Login (Ctrl + Shift + A)
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === "A") {
      document.getElementById("admin-login").style.display = "block";
    }
  });

  //  Secret Text Input to Reveal Admin Login
  let triggerInput = document.createElement("input");
  triggerInput.setAttribute("type", "text");
  triggerInput.setAttribute("placeholder", "Enter secret code...");
  triggerInput.style.position = "absolute";
  triggerInput.style.top = "-50px";
  document.body.appendChild(triggerInput);

  triggerInput.addEventListener("change", () => {
    if (triggerInput.value === "admin260") {
      document.getElementById("admin-login").style.display = "block";
    }
  });
});

// Function to Handle Admin Login via Authentication Server
async function adminLogin() {
  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value.trim();

  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  try {
    const response = await fetch("https://track260.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (response.ok) {
      sessionStorage.setItem("adminToken", result.token);
      window.location.href = "video.html";
    } else {
      alert("Invalid admin credentials.");
    }
  } catch (error) {
    console.error("Admin Login Error:", error);
    alert("Error logging in.");
  }
}
//**Password Reset Functionalities */

//  Function to Handle Admin Password Reset Request
async function resetAdminPassword() {
  const email = document.getElementById("admin-email").value.trim();
  if (!email) {
    alert("Please enter your email to request a password reset.");
    return;
  }

  try {
    const response = await fetch(
      "https://track260.onrender.com/api/admin/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const result = await response.json();
    if (response.ok) {
      alert("Password reset request sent! Check your email.");
    } else {
      alert("Failed to send password reset request.");
    }
  } catch (error) {
    console.error("Password Reset Error:", error);
    alert("Error requesting password reset.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const matchMessage = document.getElementById("match-message");
    const updateButton = document.querySelector(".update-button");

    const requirements = {
        length: document.getElementById("length"),
        uppercase: document.getElementById("uppercase"),
        lowercase: document.getElementById("lowercase"),
        number: document.getElementById("number"),
        symbol: document.getElementById("symbol"),
        previousCheck: document.getElementById("previous-check")
    };

    function validatePassword() {
        const password = passwordInput.value;
        let valid = true;

        if (password.length >= 12) {
            requirements.length.classList.add("valid");
        } else {
            requirements.length.classList.remove("valid");
            valid = false;
        }

        if (/[A-Z]/.test(password)) {
            requirements.uppercase.classList.add("valid");
        } else {
            requirements.uppercase.classList.remove("valid");
            valid = false;
        }

        if (/[a-z]/.test(password)) {
            requirements.lowercase.classList.add("valid");
        } else {
            requirements.lowercase.classList.remove("valid");
            valid = false;
        }

        if (/\d/.test(password)) {
            requirements.number.classList.add("valid");
        } else {
            requirements.number.classList.remove("valid");
            valid = false;
        }

        if (/[\W_]/.test(password)) {
            requirements.symbol.classList.add("valid");
        } else {
            requirements.symbol.classList.remove("valid");
            valid = false;
        }

        return valid;
    }

    function checkMatch() {
        if (confirmPasswordInput.value === passwordInput.value && passwordInput.value.length > 0) {
            matchMessage.textContent = "Passwords match";
            matchMessage.classList.add("valid");
            matchMessage.classList.remove("invalid");
            return true;
        } else {
            matchMessage.textContent = "Passwords must match";
            matchMessage.classList.add("invalid");
            matchMessage.classList.remove("valid");
            return false;
        }
    }

    function updateButtonState() {
        if (validatePassword() && checkMatch()) {
            updateButton.disabled = false;
        } else {
            updateButton.disabled = true;
        }
    }

    passwordInput.addEventListener("input", updateButtonState);
    confirmPasswordInput.addEventListener("input", updateButtonState);

    document.getElementById("reset-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const newPassword = passwordInput.value;

        // Extract token from URL
        const token = window.location.pathname.split("/").pop();

        const response = await fetch(`https://track260.onrender.com/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword })
        });

        const result = await response.text();
        alert(result);
        if (response.ok) {
            window.location.href = "https://trucksimply.com//sign.html";
        }
    });
});

