const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jobcluster.1ec5qio.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const userCollection = client.db("taskDB").collection("users");
    const taskCollection = client.db("taskDB").collection("tasks");

     // user related api
     app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    app.get('/users/:name', async (req, res) => {
      const userName = req.params.name;
      const query = {name: userName}
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    //tasks related
    app.get('/tasks', async(req, res)=>{
      const email = req.query.email;
      const result = await taskCollection.find({email}).toArray();
      res.send(result);
    })

    app.post('/tasks', async(req, res)=>{
      const addedTask = req.body;
      console.log(addedTask);
      const result = await taskCollection.insertOne(addedTask);
      res.send(result);
    })

    app.delete('/tasks/:id', async(req, res)=>{
      const id = req.params.id;
      console.log(id);
      const query = { id: id }
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    })
    app.patch('/tasks/:id', async(req, res)=>{
      const id = req.params.id;
      const status = req.body.status;
      console.log(id, status);
      const filter = { id: id }
      const updatedDoc = {
            $set: {
              status: status
            }
          }
          const result = await taskCollection.updateOne(filter, updatedDoc);
          res.send(result);
    })

    app.put('/tasks/:id', async (req, res)=>{
      const id = req.params.id;
      const update = req.body;
      console.log(id);
      const filter = { id: id }
      const updatedDoc = {
            $set: {
              name: update.name,
              details: update.details,
              priority: update.priority,
              deadline: update.priority
            }
          }
          const result = await taskCollection.updateOne(filter, updatedDoc);
          res.send(result);
    })

    // app.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await userCollection.deleteOne(query)
    //   res.send(result);
    // })

    // app.patch('/users/admin/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) }
    //   const updatedDoc = {
    //     $set: {
    //       role: 'admin'
    //     }
    //   }
    //   const result = await userCollection.updateOne(filter, updatedDoc);
    //   res.send(result);
    // })

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('task-management server is live now')
})

app.listen(port, ()=>{
    console.log(`task-management server is running on port ${port}`);
})