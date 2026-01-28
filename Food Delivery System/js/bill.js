const billItemsDiv = document.getElementById("billItems");
const totalAmountEl = document.getElementById("totalAmount");
const qrImg = document.getElementById("qrCode");
const payBtn = document.getElementById("payBtn");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if (cart.length === 0) {
  billItemsDiv.innerHTML = "<p>🛒 Cart is empty</p>";
  totalAmountEl.innerText = "Total Amount: ₹0";
} else {
  let total = 0;

  cart.forEach(item => {
    const qty = item.qty || 1; // 🛡 safety
    const price = Number(item.price);

    const itemTotal = price * qty;
    total += itemTotal;

    const div = document.createElement("div");
    div.className = "bill-item";
    div.innerText = `${item.name} × ${qty} = ₹${itemTotal}`;

    billItemsDiv.appendChild(div);
  });

  totalAmountEl.innerText = `Total Amount: ₹${total}`;

  // ✅ Dynamic UPI QR
  const upiId = "demo@upi"; // fake demo
  const payee = "Food Delivery";
  const upiURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=${payee}&am=${total}`;

  qrImg.src = upiURL;
}

// ✅ Payment Done
payBtn.addEventListener("click", () => {
  alert("✅ Payment Successful!");

  localStorage.removeItem("cart"); // clear cart
  window.location.href = "index.html"; // home / thank you page
});
