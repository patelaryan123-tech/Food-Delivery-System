const user = JSON.parse(sessionStorage.getItem("user"));

if (!user || !user.isLoggedIn) {
  alert("Please login to view cart 🔐");
  window.location.href = "login.html";
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItemsEl = document.querySelector(".cart-items");
const totalEl = document.querySelector(".cart-summary span");
const checkoutBtn = document.querySelector(".checkout-btn");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function calculateTotal() {
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
  });
  totalEl.textContent = `₹${total}`;
}

function renderCart() {
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<h3>Your cart is empty 😢</h3>";
    totalEl.textContent = "₹0";
    return;
  }

  cart.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "cart-card";

    card.innerHTML = `
      <div class="item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>

      <div class="item-info">
        <h3>${item.name}</h3>
        <p class="price">₹${item.price}</p>

        <div class="quantity">
          <button class="qty-btn minus">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn plus">+</button>
        </div>
      </div>

      <button class="remove-btn">Remove</button>
    `;

    card.querySelector(".minus").addEventListener("click", () => {
      if (item.qty > 1) {
        item.qty--;
      } else {
        cart.splice(index, 1);
      }
      saveCart();
      renderCart();
    });

    card.querySelector(".plus").addEventListener("click", () => {
      item.qty++;
      saveCart();
      renderCart();
    });

    card.querySelector(".remove-btn").addEventListener("click", () => {
      cart.splice(index, 1);
      saveCart();
      renderCart();
    });

    cartItemsEl.appendChild(card);
  });

  calculateTotal();
}

/* ✅ FIXED CHECKOUT */
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // ❌ cart clear mat karo
  // ✅ delivery page pe bhejo
  window.location.href = "delivery.html";
});

renderCart();
