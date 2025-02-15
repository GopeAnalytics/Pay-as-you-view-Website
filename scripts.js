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

const totalVideos = 1000; // Maximum number of videos
const videos = []; // Store all the video data for filtering
const BASE_URL = 'http://localhost:3000/comments'; // Change to your server's URL
const commentsData = JSON.parse(localStorage.getItem('commentsData')) || {}; // Load stored comments data

// Function to check if a video exists
async function checkVideoExists(url) {
    try {
        let response = await fetch(url, { method: 'HEAD' });
        return response.ok; // Returns true if the file exists
    } catch (error) {
        return false;
    }
}

// Function to load available videos
async function loadVideos() {
    const videoContainer = document.getElementById('videoContainer');
    for (let i = 1; i <= totalVideos; i++) {
        let videoId = `v${String(i).padStart(3, '0')}`;
        let videoSrc = `${videoId}.mp4`;

        if (await checkVideoExists(videoSrc)) {
            const videoBox = document.createElement('div');
            videoBox.className = 'video-box';
            videoBox.setAttribute('data-id', videoId);
            videoBox.innerHTML = `
                <video controls controlsList="nodownload" oncontextmenu="return false;">
                    <source src="${videoSrc}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <p class="description">${videoId}: Description for ${videoId}</p>
                <div class="comment-box">
                    <input type="text" placeholder="Add a comment..." onkeypress="handleComment(event, this, '${videoId}')">
                    <button onclick="handleCommentButton(this, '${videoId}')">➡️</button>
                </div>
                <div class="comments"></div>
            `;
            videoContainer.appendChild(videoBox);
            videos.push({ videoId, videoBox });

            // Load comments from the server
            await loadCommentsFromServer(videoId);
        }
    }
}

// Function to filter the video list based on search query
function filterResults() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    videos.forEach(video => {
        const videoBox = video.videoBox;
        const description = videoBox.querySelector('.description').textContent.toLowerCase();
        if (description.includes(searchQuery)) {
            videoBox.style.display = 'block';
        } else {
            videoBox.style.display = 'none';
        }
    });
}

// Function to load comments from the server for a specific video
async function loadCommentsFromServer(videoId) {
    try {
        const response = await fetch(`${BASE_URL}/${videoId}`);
        const commentsData = await response.json();

        const commentContainer = document.querySelector(`[data-id="${videoId}"] .comments`);
        commentsData.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            if (comment.deleted) {
                commentDiv.innerHTML = 'This comment has been deleted.';
            } else {
                commentDiv.innerHTML = `${comment.text} <button onclick="replyToComment(this)">↩️ Reply</button><button class="delete-btn" onclick="deleteComment(this, '${videoId}')">⋮</button>`;
            }
            commentContainer.appendChild(commentDiv);
            comment.replies.forEach(reply => {
                const replyDiv = document.createElement('div');
                replyDiv.className = 'comment reply-box';
                if (reply.deleted) {
                    replyDiv.innerHTML = 'This reply has been deleted.';
                } else {
                    replyDiv.innerHTML = `${reply.text} <button class="delete-btn" onclick="deleteReply(this, '${videoId}', '${comment._id}')">⋮</button>`;
                }
                commentContainer.appendChild(replyDiv);
            });
        });
    } catch (err) {
        console.error('Error loading comments', err);
    }
}

// Function to handle comment submission on "Enter"
function handleComment(event, inputElement, videoId) {
    if (event.key === "Enter") {
        postComment(inputElement, videoId);
    }
}

// Function to handle comment submission on button click
function handleCommentButton(buttonElement, videoId) {
    const inputElement = buttonElement.previousElementSibling;
    postComment(inputElement, videoId);
}

// Function to post a comment
async function postComment(inputElement, videoId) {
    const text = inputElement.value.trim();
    if (!text) return;

    const response = await fetch(`${BASE_URL}/${videoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    const commentData = await response.json();

    // Append the comment to the UI
    const commentContainer = inputElement.closest(".video-box").querySelector(".comments");
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    commentDiv.innerHTML = `${text} <button onclick="replyToComment(this)">↩️ Reply</button><button class="delete-btn" onclick="deleteComment(this, '${videoId}')">⋮</button>`;
    commentContainer.appendChild(commentDiv);

    inputElement.value = "";
}

// Function to delete a comment
function deleteComment(button, videoId) {
    if (confirm("Are you sure you want to delete this comment?")) {
        const commentDiv = button.closest('.comment');
        const commentText = commentDiv.innerText.split(" ⋮")[0];
        fetch(`${BASE_URL}/${videoId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: commentText })
        });

        commentDiv.innerHTML = "This comment has been deleted.";
    }
}

// Load videos on page load
window.onload = loadVideos;

