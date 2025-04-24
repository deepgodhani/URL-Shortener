const { shorten } = require("../Controllers/AuthController");
const { shortenValidation } = require("../Middlewares/AuthValidation");
const express = require("express");
const router = require("express").Router();

router.post("/" , shorten);

module.exports = router;
