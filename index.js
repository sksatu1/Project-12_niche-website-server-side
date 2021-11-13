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
        const ordersCollection = database.collection('orders');


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


        // for finding a admin user ---------------------------------
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // load orders ------------
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })



        // POST api------------------------------
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // post API -------------------------
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await bikeCollection.insertOne(newProduct);

            console.log('got new product', req.body);
            console.log('added product', result);
            res.json(result);
        })

        app.post('/orders', async (req, res) => {
            const orderInfo = req.body;
            console.log(orderInfo);
            const result = await ordersCollection.insertOne(orderInfo);
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


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });


        // PUT API -------------------------------
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Shipped'
                },
            };
            const update = await ordersCollection.updateOne(query, updateDoc, options);
            res.json(update);
        })

        // delete API ------------------------
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikeCollection.deleteOne(query);
            console.log('deleting user with id : ', result);
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