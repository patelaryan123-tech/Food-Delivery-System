document.addEventListener("DOMContentLoaded", () => {

  const categoryButtons = document.querySelectorAll(".category");
  const restaurantCards = document.querySelectorAll(".restaurant-card");
  const searchInput = document.getElementById("searchInput");

  let currentCategory = "all";

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      categoryButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      currentCategory = button.dataset.category.toLowerCase();
      filterRestaurants();
    });
  });

  searchInput.addEventListener("input", filterRestaurants);


  function filterRestaurants() {
    const searchText = searchInput.value.trim().toLowerCase();

    restaurantCards.forEach(card => {

      const cardCategory = card.dataset.category.toLowerCase();

      
      const cardText = card.innerText.toLowerCase();

      const matchCategory =
        currentCategory === "all" || cardCategory === currentCategory;

      const matchSearch =
        cardText.includes(searchText);

      if (matchCategory && matchSearch) {
        card.style.display = "flex";
        card.style.animation = "fadeZoom 0.35s ease";
      } else {
        card.style.display = "none";
      }
    });
  }

});
