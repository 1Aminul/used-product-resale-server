const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { ObjectId } = require('bson');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)


const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())
app.use(express.static("public"));




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.flkzc5o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const categoryColletion = client.db('usedProductMarket').collection('category');
        const bookingColletion = client.db('usedProductMarket').collection('booking');
        const usersColletion = client.db('usedProductMarket').collection('users');
        const productsColletion = client.db('usedProductMarket').collection('products');
        const advertiseColletion = client.db('usedProductMarket').collection('advertise');
        const paymentColletion = client.db('usedProductMarket').collection('payments');
        



        app.get('/category', async (req, res) => {
            const query = {}
            const category = await categoryColletion.find(query).toArray()
            res.send(category)
        })


        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const category = await categoryColletion.findOne(query)
            res.send(category)
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const bookings = await bookingColletion.find(query).toArray()
            res.send(bookings)
        })

        app.get('/bookings/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await bookingColletion.findOne(query)
            res.send(result)
        })

        app.put('/bookings/:id', async(req, res)=>{
            const transaction = req.headers.transaction;
            const id = req.params.id
            const filter = {_id: ObjectId(id)}
            const options = {upsert: true}
            const updatedDoc = {
                $set:{
                    transactionId: transaction,
                },
            }
            const result = await bookingColletion.updateOne(filter, updatedDoc, options)
            res.send(result)
        })


        app.post('/create-payment-intent', async(req, res)=>{
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "inr",
               "payment_method_types": [
                    "card"
               ]
                  
              });
            
              res.send({
                clientSecret: paymentIntent.client_secret,
              });
        })

        app.get('/payments', async(req, res)=>{
            const query = {}
            const result = await paymentColletion.find(query).toArray()
            res.send(result)
        })

        app.post('/payments', async(req, res)=>{
            const payment = req.body;
            const result = await paymentColletion.insertOne(payment);
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingColletion.insertOne(booking)
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            const query = {}
            const users = await usersColletion.find(query).toArray()
            res.send(users)
        })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersColletion.deleteOne(query)
            res.send(result)
        })
        app.put('/users/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    verification : "verified",
                }
            }
            const result = await usersColletion.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersColletion.findOne(query);
            res.send({ isAdmin: user?.option === 'Admin' });
        })
        app.get('/users/saller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersColletion.findOne(query);
            res.send({ isSeller: user?.option === 'Seller' });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersColletion.insertOne(user)
            res.send(result)
        })

        // app.get('/products/:email', async (req, res) => {
        //     const email = req.params.email
        //     const query = {email: email}
        //     const result = await productsColletion.find(query).toArray()
        //     res.send(result)
        // })
        app.get('/products', async (req, res) => {
            const query = {}
            const result = await productsColletion.find(query).toArray()
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsColletion.insertOne(product)
            res.send(result)
        })

        app.put('/products/:id', async(req, res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    advertise : "advertised",
                }
            }
            const result = await productsColletion.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        app.delete('/products/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result  = await productsColletion.deleteOne(query)
            res.send(result)
        })

        app.get('/advertiseitem', async(req, res)=>{
            const query = {};
            const result = await advertiseColletion.find(query).toArray()
            res.send(result)
        })
        // app.put('/advertiseitem/:email', async(req, res)=>{
        //     const email = req.params.email;
        //     const filter = {email: email};
        //     const options = {upsert: true}
        //     const updatedDoc = {
        //         $set: {
        //             verification : "verified",
        //         }
        //     }
        //     const result = await advertiseColletion.updateOne(filter, updatedDoc, options)
        //     res.send(result)
        // })

        app.post('/advertiseitem', async(req, res)=>{
            const item = req.body;
            const result = await advertiseColletion.insertOne(item)
            res.send(result);
        })

        app.delete('/advertiseitem/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await advertiseColletion.deleteOne(query)
            res.send(result)
        })




        // app.get('/category', async(req, res)=>{
        //     const filter = {};
        //     const options = {upsert: true}
        //     const updatedDoc = {
        //         $set:{
        //             date: "Nov 24, 2022",
        //         }
        //     }
        //     const category = await categoryColletion.updateMany(filter, updatedDoc, options)
        //     res.send(category)
        // })






    }
    finally {

    }
}
run().catch(err => console.error(err))


 
app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`used Product Saller ${port}`);
})