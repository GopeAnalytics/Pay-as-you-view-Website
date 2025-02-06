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
      const response = await fetch("http://localhost:5000/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
      });

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
    const response = await fetch("http://localhost:5000/api/signin", {
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
    const response = await fetch("http://localhost:5000/api/admin/login", {
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

//  Function to Handle Admin Password Reset Request
async function resetAdminPassword() {
  const email = document.getElementById("admin-email").value.trim();
  if (!email) {
    alert("Please enter your email to request a password reset.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/reset-password",
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
  const uploadButton = document.getElementById("uploadBtn");

  //  Check if admin is logged in
  const adminToken = sessionStorage.getItem("adminToken");

  if (adminToken) {
    uploadButton.style.display = "block"; // Show upload button for admin
  } else {
    uploadButton.style.display = "none"; // Hide upload button for users
  }

  //  Event listener for upload button
  uploadButton?.addEventListener("click", () => {
    document.getElementById("videoUpload").click();
  });

  // Handle file upload & send to Cloudflare
  document.getElementById("videoUpload")?.addEventListener("change", handleVideoUpload);

  //  Load videos on page load
  loadVideos();
});

//  Function to Upload Video to Cloudflare
async function handleVideoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  let title = prompt("Enter video title:");
  let description = prompt("Enter video description:");
  if (!title || !description) return alert("Title and description are required!");

  let formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  try {
    let response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
      },
      body: formData,
    });

    let result = await response.json();
    if (result.success) {
      saveVideoToDatabase(title, description, result.result.uid);
    } else {
      alert("Cloudflare Upload Failed!");
    }
  } catch (error) {
    console.error("Upload Error:", error);
  }
}

//  Function to Save Video to Database
async function saveVideoToDatabase(title, description, videoId) {
  try {
    let response = await fetch("http://localhost:5000/api/upload-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, video_url: `https://watch.cloudflarestream.com/${videoId}` }),
    });

    let result = await response.json();
    if (response.ok) {
      alert("Video uploaded successfully!");
      loadVideos();
    } else {
      alert("Database save failed.");
    }
  } catch (error) {
    console.error("Database Save Error:", error);
  }
}

//  Function to Load Videos
async function loadVideos() {
  try {
    const response = await fetch("http://localhost:5000/api/videos");
    const videos = await response.json();

    const container = document.getElementById("videoContainer");
    container.innerHTML = "";

    videos.forEach((video) => {
      const videoBox = document.createElement("div");
      videoBox.className = "video-box";
      videoBox.innerHTML = `
        <iframe src="${video.video_url}" frameborder="0" allowfullscreen></iframe>
        <p class="description">${video.description}</p>
        <div class="comment-box">
          <input type="text" placeholder="Add a comment..." onkeypress="handleComment(event, this, '${video.video_url}')">
          <button onclick="handleCommentButton(this, '${video.video_url}')">➡️</button>
        </div>
        <div class="comments"></div>
      `;
      container.appendChild(videoBox);
    });
  } catch (error) {
    console.error("Error loading videos:", error);
  }
}

//  Function to Handle Comments
function handleComment(event, inputElement, videoId) {
  if (event.key === "Enter") postComment(inputElement, videoId);
}

function handleCommentButton(buttonElement, videoId) {
  const inputElement = buttonElement.previousElementSibling;
  postComment(inputElement, videoId);
}

function postComment(inputElement, videoId) {
  const text = inputElement.value.trim();
  if (!text) return;

  const commentContainer = inputElement.closest(".video-box").querySelector(".comments");
  const commentDiv = document.createElement("div");
  commentDiv.className = "comment";
  commentDiv.textContent = text;
  commentContainer.appendChild(commentDiv);
  inputElement.value = "";
}
