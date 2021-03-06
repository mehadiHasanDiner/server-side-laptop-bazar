const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID ;
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctgcy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log('connection err', err)
  const laptopsCollection = client.db("laptopsSell").collection("laptops");
  const laptopsNewCollection = client.db("laptopsSell").collection("laptopsOrders");
  // perform actions on the collection object
  console.log('database connected')

  app.get('/laptops', (req, res) => {
    laptopsCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })

  app.post('/addProduct', (req, res) => {
    const newProduct = req.body;
    console.log('adding new event: ', newProduct)
    laptopsCollection.insertOne(newProduct)
      .then(result => {
        console.log('inserted count', result.insertedCount)
        res.send(result.insertedCount > 0)
      })
  })

  // 
  app.post('/addLaptop', (req, res) => {
    const laptopsOrder = req.body;
    console.log('adding new event: ', laptopsOrder)
    laptopsNewCollection.insertOne(laptopsOrder)
      .then(result => {
        console.log('inserted count', result.insertedCount)
        res.send(result.insertedCount > 0)
      })
  })

  app.delete('/deleteLaptop/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    console.log('delete this', id);
    laptopsCollection.findOneAndDelete({_id: id})
    .then(result => {
      res.send(result.deleteCount>0)
    })
    // console.log(documents)
  })

  app.get('/laptops/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    laptopsCollection.find({_id: id})
    .toArray((err, documents) => {
      res.send(documents[0])
    })
    // console.log(documents)
  })

  app.get('/orderPreviewPass', (req, res) => {
    console.log(req.query.email);
    laptopsNewCollection.find({email: req.query.email})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  //   client.close();
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})