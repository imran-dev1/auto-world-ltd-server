const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = 4000;

//Use Middleware
app.use(cors());
app.use(express.json());

//Mongodb Connection
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    // Get api to read all data
    app.get("/products", async (req, res) => {
      const query = req.query;
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // Get api to read a specific data
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(filter);
      res.send(product);
    });

    // Get api to read data count
    app.get("/productCount", async (req, res) => {
      const query = {};
      const count = await productsCollection.countDocuments(query);
      res.send({ count });
    });

    // Post api to insert one data
    app.post("/products", async (req, res) => {
      const data = req.body;
      const result = await productsCollection.insertOne(data);
      res.send(result);
    });

    // Delete api to delete one data
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      res.send(result);
    });

    // Patch api to update properties of a data
    app.patch("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updates = req.body;
      const filter = { _id: ObjectId(id) };
      // const options = { upsert: true };
      const updateDoc = {
        $set: updates,
      };
      const result = await productsCollection.updateOne(filter, updateDoc);
      res.send(result);
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
