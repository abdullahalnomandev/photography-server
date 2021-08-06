const express = require("express")
const port = 5000;
const cors = require("cors")
const app = express()
const dotenv = require('dotenv')
const fileUpload = require('express-fileupload');
dotenv.config()
app.use(cors())
app.use(express.static('Services'));
app.use(fileUpload());
app.use(express.json())
app.get('/', (req, res) => {
    res.send("This is my server")
})
const { MongoClient,ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.weqbi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const usersCollection = client.db("photography").collection("users");
    const serviceCollection = client.db("photography").collection("services");
    const adminCollection = client.db("photography").collection("admin");
    const ordersCollection = client.db("photography").collection("orders");
    app.post('/addUsers', (req, res) => {
        console.log(req.body);
        usersCollection.insertOne(req.body)
        .then(result => {
            res.send(result)
        })

    })
    app.get("/users", (req, res) => {
        usersCollection.find({}).toArray((err, documents) => {
            res.send(documents)
        })
    })
    app.post("/addService", (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
         
        serviceCollection.insertOne({ name, description, price, image })
            .then(result => {

                res.send(result.insertedCount > 0);
            })
    })

    app.get("/services", (req, res) => {
        serviceCollection.find({}).toArray((err, documents) => {
            res.send(documents)
        })
    })
    app.get("/service/:id", (req, res) => {
        serviceCollection.find({_id:ObjectId(req.params.id)}).toArray((err, documents) => {
            res.send(documents)
        })
    })
    app.delete("/serviceDelete/:id", (req, res) => {
        serviceCollection.deleteOne({_id:ObjectId(req.params.id)})
    })
    app.post('/addAdmin',async (req, res)=>{
        console.log(req.body);
        const reqEmail = req.body.email;
        const reqEmailSplit = reqEmail.split('@')
        await adminCollection.find({email:{$regex: new RegExp(reqEmailSplit[0],'i')}}).toArray((err, documents)=>{
            if(documents.length>0){
                res.send({error: 'allready added'})
            
            }
            else{
                adminCollection.insertOne(req.body)
        .then(result => {
            res.send(result.insertedCount>0)
            c
        })

            }
        })
        
    })
    app.get("/admin",(req, res)=>{
        adminCollection.find({}).toArray((err, documents)=>{
            res.send(documents)
        })
    })
    app.post("/addOrder",(req, res)=>{
        ordersCollection.insertOne(req.body)
        console.log(req.body)


    })
    app.get("/orders",(req, res)=>{
        ordersCollection.find({}).toArray((err, documents)=>
        res.send(documents))
    })

    app.patch("/statusUpdate/:id", (req, res) => {
        ordersCollection.updateOne({_id:ObjectId(req.params.id)},
        {
            $set:{status:req.body.status}
        }
 
        )

    })
    

})



app.listen(port || process.env.PORT)
})
