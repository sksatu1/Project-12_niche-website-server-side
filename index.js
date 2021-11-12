const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId

// const admin = require("firebase-admin");

const port = process.env.PORT || 5000;

// middleware-----
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kzjok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('data base connected');

        const database = client.db('bikestore');

        const bikeCollection = database.collection('bikes');
        const usersCollection = database.collection('users');


        // get API ----------------------
        app.get('/products', async (req, res) => {
            const cursor = bikeCollection.find({});
            const bikes = await cursor.toArray();
            res.send(bikes);
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await bikeCollection.findOne(query);
            console.log('load place with id: ', id);
            res.send(product);
        })


        // POST api------------------------------
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });


        // PUT api -------------------------------
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
    }

    finally {
        // await client.close();
    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello from ass-12');
})
app.listen(port, () => {
    console.log('listening to port', port);
})