const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// Middle ware

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.vfr78tp.mongodb.net/?retryWrites=true&w=majority`;


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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const carCollection = client.db('carDB').collection('car')
        const carCartCollection = client.db('carDB').collection('cart')

        app.get('/newCar', async (req, res) => {
            const cursor = carCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/newCar/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carCollection.findOne(query);
            res.send(result);
        });

        app.post('/newCar', async (req, res) => {
            const newCar = req.body;
            console.log(newCar)
            const result = await carCollection.insertOne(newCar);
            res.send(result)
        })


        app.put("/newCar/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateCar = req.body;

            const newCar = {
                $set: {
                    name: updateCar.name,
                    price: updateCar.price,
                    rating: updateCar.rating,
                    type: updateCar.type,
                    description: updateCar.description,
                    brand_name: updateCar.brand_name,
                    photo: updateCar.photo,
                },
            };;

            const result = await carCollection.updateOne(filter, newCar, options);
            res.send(result);
        });

        // add cart post

        app.delete("/getCart/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) }
            const result = await carCartCollection.deleteOne(query)
            console.log(result)
            res.send(result);
        });


        app.post('/addToCard', async (req, res) => {
            const addToCard = req.body;
            console.log(addToCard)


            const result = await carCartCollection.insertOne(addToCard);
            console.log(result)
            res.send(result)
        })



        app.get("/getCart/:userEmail", async (req, res) => {
            try {
                const id = req.params.userEmail;
                console.log(id)
                const result = await carCartCollection.find({ userEmail: id }).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error:", error);
                res.status(500).send("Internal Server Error");
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




// 
app.get('/', (req, res) => {
    res.send('app is running')
})

app.listen(port, () => {
    console.log(`app is running port on : ${port}`)
})