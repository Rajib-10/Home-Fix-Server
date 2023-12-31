const express = require('express')
const cors = require('cors')
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// middleware 

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fzaqft4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



// own middleware

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection



    const recentServiceCollection = client.db("HomeFixDB").collection("recentServices");
     const servicesCollection = client.db("HomeFixDB").collection("services");
     const bookingsCollection = client.db("HomeFixDB").collection("bookings");



    //  auth

    app.post("/jwt", async (req, res) => {
      const body = req.body;
      console.log("log in user", body);
      const token = jwt.sign(body, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "2h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })

        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      const user = req.body;
      console.log("server logout user", user);
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });


    app.get('/add-services',async(req,res)=>{
      let query = {}
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result =await servicesCollection.find(query).toArray();
      res.send(result)
    })


    app.get('/add-services/:id',async(req,res)=>{
      const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await servicesCollection.findOne(query);
        res.send(result)
    })
   

     app.post('/add-services',async(req,res)=>{
      const service = req.body
      console.log(service)
      const result = await servicesCollection.insertOne(service);
      res.send(result)
    })

    app.get('/booking-services',verifyToken,async(req,res)=>{
      
      let query = {}
      if(req.query?.email){
        query = { userEmail: req.query.email}
      }
      const result =await bookingsCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/booking-services/:id',async(req,res)=>{
      
      const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await bookingsCollection.findOne(query);
        res.send(result)
    })

    app.patch('/booking-services/:id',async(req,res)=>{
      const updateStatus = req.body
      const id = req.params.id
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
      $set: {
       status: updateStatus.status
      },
    };
    const result = await bookingsCollection.updateOne(filter,updateDoc)
    res.send(result)
    })

    app.delete('/booking-services/:id',async(req,res)=>{
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
     
      const result = await bookingsCollection.deleteOne(query);
      res.send(result)
    })

    app.post('/booking-services',async(req,res)=>{
      const service = req.body
      console.log(service)
      const result = await bookingsCollection.insertOne(service);
      res.send(result)
    })

    app.put('/add-services/:id',async(req,res)=>{
      const id = req.params.id
      const service = req.body
     const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
      $set: {
        serviceUrl: service.serviceUrl,
        serviceName : service.serviceName,
        name : service.name,
        email: service.email,
        photo: service.photo,
        price: service.price,
        area: service.area,
        description: service.description
      },
    };
    
    const result = await servicesCollection.updateOne(filter, updateDoc, options);
    res.send(result)
    })

    app.delete('/add-services/:id',async(req,res)=>{
      const id = req.params.id
       const query = { _id: new ObjectId(id) };
    const result = await servicesCollection.deleteOne(query);
    res.send(result)
    })

    app.get('/recent-services',async(req,res)=>{
      const result =await recentServiceCollection.find().toArray();
      res.send(result)
    })


    

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Home-Fix is running....')
})

app.listen(port, () => {
  console.log(`Home-Fix is listening on port ${port}`)
})