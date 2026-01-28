const form = document.getElementById("checkoutForm");
const statusText = document.getElementById("locationStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  statusText.innerText = "📍 Finding delivery address location...";

  try {
    // 🌍 ADDRESS → LAT LNG (GEOCODING)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    const data = await res.json();

    if (data.length === 0) {
      alert("❌ Address not found on map");
      return;
    }

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    // SAVE EVERYTHING
    localStorage.setItem("deliveryName", name);
    localStorage.setItem("deliveryPhone", phone);
    localStorage.setItem("deliveryAddress", address);
    localStorage.setItem("lat", lat);
    localStorage.setItem("lng", lng);

    statusText.innerText = "✅ Address located! Redirecting...";

    setTimeout(() => {
      window.location.href = "delivery.html";
    }, 1000);

  } catch (err) {
    alert("❌ Failed to locate address");
    console.error(err);
  }
});
