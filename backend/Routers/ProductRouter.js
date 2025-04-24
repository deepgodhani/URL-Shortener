
const ensureAuthenticated = require("../Middlewares/Auth");

const router = require("express").Router();

router.get("/", ensureAuthenticated , (req, res) => {
    res.send("Product Router is working");
}
);

module.exports = router;