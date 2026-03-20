
const getProducts = (req, res) => {
  res.json({
    success: true,
    message: "Products fetched successfully",
    products: []
  });
};

module.exports = {
  getProducts
};
