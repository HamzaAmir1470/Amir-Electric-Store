const ensureAuthenticated = require("../Middlewares/Auth");


const router = require("express").Router();

router.get('/products', ensureAuthenticated, (req, res) => {
    res.status(200).json([
        {
            name: "Laptop",
            price: 999.99,
            description: "A high-performance laptop for all your computing needs.",
            imageUrl: "https://example.com/laptop.jpg"
        },
        {
            name: "Smartphone",
            price: 499.99,
            description: "A sleek smartphone with the latest features and a stunning display.",
            imageUrl: "https://example.com/smartphone.jpg"
        },
    ]);
});


module.exports = router;