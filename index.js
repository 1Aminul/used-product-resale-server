const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const {  ObjectId } = require('bson');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.flkzc5o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const categoryColletion = client.db('usedProductMarket').collection('category');
        const bookingColletion = client.db('usedProductMarket').collection('booking');
        const usersColletion = client.db('usedProductMarket').collection('users');
        const productsColletion = client.db('usedProductMarket').collection('products');


        app.get('/category', async (req, res) => {
            const query = {}
            const category = await categoryColletion.find(query).toArray()
            res.send(category)
        })


        app.get('/category/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const category = await categoryColletion.findOne(query)
            res.send(category)
        })  

        app.get('/bookings', async(req, res)=>{
            const email = req.query.email
            const query = {email: email}
            const bookings = await bookingColletion.find(query).toArray()
            res.send(bookings)
        })


        app.get('/users', async(req, res)=>{
            const query = {}
            const users = await usersColletion.find(query).toArray()
            res.send(users)
        })

        app.post('/bookings', async(req, res)=>{
            const booking = req.body;
            const result = await bookingColletion.insertOne(booking)
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

        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await usersColletion.insertOne(user)
            res.send(result)
        })

        app.get('/products', async(req, res)=>{
            const query = {}
            const result = await productsColletion.find(query).toArray()
            res.send(result)
        })

        app.post('/products', async(req, res)=>{
            const product = req.body;
            const result = await productsColletion.insertOne(product)
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