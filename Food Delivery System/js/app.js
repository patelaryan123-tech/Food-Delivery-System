function isLoggedIn() {
  const user = JSON.parse(sessionStorage.getItem("user"));
  return user && user.isLoggedIn;
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.querySelectorAll(".menu-card").forEach(card => {
  const btn = card.querySelector(".add-btn");
  const stockText = card.querySelector(".stock-status");

  const inStock = btn.dataset.stock === "true";

  if (!inStock) {
    stockText.textContent = "❌ Out of Stock";
    stockText.style.color = "red";
    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
  } else {
    stockText.textContent = "✅ In Stock";
    stockText.style.color = "green";
  }

  btn.addEventListener("click", () => {
    if (!isLoggedIn()) {
      alert("Please login first 🔐");
      window.location.href = "login.html";
      return;
    }

    if (!inStock) {
      alert("❌ Item is out of stock");
      return;
    }

    const item = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
      image: btn.dataset.image,
      qty: 1
    };

    const exists = cart.find(i => i.id === item.id);
    exists ? exists.qty++ : cart.push(item);

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${item.name} added 🛒`);
  });
});
