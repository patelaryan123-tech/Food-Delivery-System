document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Fill all fields");
    return;
  }

  sessionStorage.setItem("user", JSON.stringify({
    username,
    isLoggedIn: true
  }));

  alert("Login Successful ✅");
  window.location.href = "index.html";
});
