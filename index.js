const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 4000;

//Use Middleware
app.use(cors());
app.use(express.json());

//Mongodb Connection
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oho5a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("autoWorld").collection("products");

    // Get api to read data
    app.get("/products", async (req, res) => {
      const query = req.query;
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to express server!");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
