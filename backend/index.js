const dotenv = require('dotenv');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routers/AuthRouter'); 
const ProductRouter = require('./Routers/ProductRouter'); // Import the ProductRouter
const Shorten = require('./Routers/Shorten'); // Import the Shorten router

const UrlModel = require('./Models/Url').UrlModel; // Import the UrlModel

dotenv.config(); // Load environment variables from .env file

require('./Models/db'); // Import the database connection

const app = express();

const PORT = process.env.PORT || 8080;
;

app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', AuthRouter);
app.use('/products', ProductRouter); 
app.use ('/shorten',Shorten);

app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  console.log("Short URL requested:", shortUrl);
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);
  console.log("Request query:", req.query);

  try {
      const urlDoc = await UrlModel.findOne({ shortUrl });

      if (!urlDoc) {
          return res.status(404).json({ message: "Short URL not found" });
      }

      res.redirect(urlDoc.originalUrl);
  } catch (error) {
      console.error("Error retrieving URL:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/urls/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const urls = await UrlModel.find({ email });
    res.json(urls);
  } catch (error) {
    console.error("Error fetching URLs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/api', (req, res) => {
  res.send('API is working!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});