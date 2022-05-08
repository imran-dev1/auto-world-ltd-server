const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT;

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
console.log(uri);
async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("autoWorld").collection("products");

    // Get api to read all data
    app.get("/products", async (req, res) => {
      console.log(req.query);
      const page = parseInt(req.query.page);
      const items = parseInt(req.query.items);
      const cursor = productsCollection.find({});
      let products;
      if (page || items) {
        products = await cursor
          .skip(page * items)
          .limit(items)
          .toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send(products);
    });

    // Get api to read 6 data for home
    app.get("/homeInventories", async (req, res) => {
      const query = req.query;
      const cursor = productsCollection.find(query);
      const result = await cursor.limit(6).toArray();
      res.send(result);
    });

    // Get api to read only my items
    app.get("/myItems", async (req, res) => {
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
      const accessInfo = req.headers.authorization;
      if (accessInfo) {
        const [email, accessToken] = accessInfo.split(" ");
        const decoded = tokenVerify(accessToken);
        if (email === decoded.email) {
          const result = await productsCollection.insertOne(data);
          res.send({ message: "success" });
        } else {
          res.send({ message: "failed" });
        }
      } else {
        res.send({ message: "Unauthorize access" });
      }
    });

    function tokenVerify(accessToken) {
      let email;
      jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET_KEY,
        function (err, decoded) {
          if (err) {
            email = "Invalid email";
          }
          if (decoded) {
            email = decoded;
          }
        }
      );
      console.log(email);
      return email;
    }

    // Delete api to delete one data
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const accessInfo = req.headers.authorization;
      if (accessInfo) {
        const [email, accessToken] = accessInfo.split(" ");
        const decoded = tokenVerify(accessToken);
        if (email === decoded.email) {
          const result = await productsCollection.deleteOne(filter);
          res.send({ message: "success" });
        } else {
          res.send({ message: "failed" });
        }
      } else {
        res.send({ message: "Unauthorize access" });
      }
    });

    // Patch api to update properties of a data
    app.patch("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updates = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: updates,
      };
      const accessInfo = req.headers.authorization;
      if (accessInfo) {
        const [email, accessToken] = accessInfo.split(" ");
        const decoded = tokenVerify(accessToken);
        if (email === decoded.email) {
          const result = await productsCollection.updateOne(filter, updateDoc);
          res.send({ message: "success" });
        } else {
          res.send({ message: "failed" });
        }
      } else {
        res.send({ message: "Unauthorize access" });
      }
    });

    // JWT token generate
    app.post("/login", async (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET_KEY);
      res.send({ token });
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
