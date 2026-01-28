const userLat = parseFloat(localStorage.getItem("lat"));
const userLng = parseFloat(localStorage.getItem("lng"));

if (!userLat || !userLng) {
  alert("❌ Location not found. Please checkout again.");
  window.location.href = "checkout.html";
}

// 🏪 SHOP LOCATION (FIXED)
const shopLat = 23.0225;
const shopLng = 72.5714;

// 🗺 MAP INIT
const map = L.map("map").setView([userLat, userLng], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// 📍 MARKERS
L.marker([shopLat, shopLng]).addTo(map).bindPopup("🏪 Restaurant");
L.marker([userLat, userLng]).addTo(map).bindPopup("🏠 Your Address");

// 🛣 ROUTE + DELIVERY BOY
fetch(
  `https://router.project-osrm.org/route/v1/driving/${shopLng},${shopLat};${userLng},${userLat}?overview=full&geometries=geojson`
)
  .then(res => res.json())
  .then(data => {
    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

    const route = L.polyline(coords, {
      color: "red",
      weight: 5
    }).addTo(map);

    map.fitBounds(route.getBounds());

    startDeliveryBoy(coords);
  })
  .catch(() => {
    alert("❌ Route not found");
  });

function startDeliveryBoy(path) {
  let i = 0;

  const boy = L.marker(path[0], {
    icon: L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
      iconSize: [40, 40]
    })
  }).addTo(map);

  document.getElementById("status").innerText =
    "🚴 Delivery partner is on the way";

  const move = setInterval(() => {
    if (i >= path.length) {
      clearInterval(move);

      document.getElementById("status").innerText =
        "✅ Order Delivered Successfully";

      // ⏳ SHOW MESSAGE → THEN REDIRECT TO BILL
      setTimeout(() => {
        window.location.href = "bill.html";
      }, 2000);

      return;
    }

    boy.setLatLng(path[i]);
    i++;
  }, 600);
}
