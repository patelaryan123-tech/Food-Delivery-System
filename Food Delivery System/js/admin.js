const foodList = document.getElementById("foodList");
const ordersDiv = document.getElementById("orders");

/* ADD FOOD */
async function addFood() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const image = document.getElementById("image").value;

  if (!name || !price || !image) {
    alert("Fill all fields");
    return;
  }

  await fetch("/api/food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, image })
  });

  alert("Food Added ✅");
  loadFood();
}

/* LOAD FOOD */
async function loadFood() {
  const res = await fetch("/api/food");
  const foods = await res.json();

  foodList.innerHTML = "";

  foods.forEach(f => {
    foodList.innerHTML += `
      <div class="food-card">
        <img src="${f.image}">
        <h3>${f.name}</h3>
        <p>₹${f.price}</p>
        <button onclick="deleteFood('${f._id}')">❌ Delete</button>
      </div>
    `;
  });
}

/* DELETE FOOD */
async function deleteFood(id) {
  await fetch("/api/food/" + id, { method: "DELETE" });
  loadFood();
}

/* LOAD ON PAGE */
loadFood();
