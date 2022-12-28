let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb');
const mongoUrl = 'mongodb://dev01:zjkoC%5D6p@192.168.1.122:27017/?authMechanism=DEFAULT&authSource=admin';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(cors({ origin: '*' }));


// homepage route
app.get('/', (req, res) => {
  return res.send({
    message: 'Welcome to RESTful CRUD API with NodeJS, Express, Mongo',
  })
})

// retrieve all fruits 
app.get('/getdatafruit', (req, res) => {
  mongodb.MongoClient.connect(mongoUrl, (err, client) => {
    if (err) throw err;
    const db = client.db('admin');
    const collection = db.collection('fruits');
    collection.find().toArray((err, results) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      let message = "";
      if (results.length === 0) {
        message = "No documents found in the collection";
      } else {
        message = "Successfully retrieved all documents";
      }
      return res.send({ data: results, message: message });
    });
  });
});


// add a new fruit
app.post('/upload', upload.single('photo'), (req, res) => {
  let name = req.body.name;
  let photo = req.file;
  if (!name || !photo) {
    return res.status(400).send({ message: 'Please provide a value, and photo.' });
  }
  mongodb.MongoClient.connect(mongoUrl, (err, client) => {
    if (err) throw err;
    const db = client.db('admin');
    const collection = db.collection('fruits');
    collection.insertOne({ name: name, photo: photo.path }, (err, result) => {
      if (err) {
        console.error(err);
        return res.sendStatus(500);
      }
      return res.send({ message: 'Value and photo successfully added.' });
    });
  });
});


app.get('/searchdatafruit', (req, res) => {
  let name = req.query.name;

  mongodb.MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, client) => {
    if (err) throw err;
    const db = client.db('admin');
    const collection = db.collection('fruits');

    let query;
    if (!name || name === '') {
      query = {};
    } else {
      query = { name: new RegExp('^' + name) };
    }

    collection.find(query).toArray((err, result) => {
      if (err) throw err;
      let message = '';
      if (!result) {
        message = 'fruit not found';
      } else {
        message = 'Successfully retrieved fruit data';
      }
      return res.send({ data: result, message: message });
    });
  });
});

// delete fruit by name
app.delete('/deletefruit', (req, res) => {
  let name = req.body.name;
  if (!name) {
    return res.status(400).send({ error: true, message: "Please provide fruit name" });
  }
  mongodb.MongoClient.connect(mongoUrl, (err, client) => {
    if (err) throw err;
    const db = client.db('admin');
    const collection = db.collection('fruits');
    collection.deleteOne({ name: name }, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: 'An error occurred while deleting the fruit' });
      }

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: 'Fruit not found' });
      }

      return res.send({ message: 'Fruit successfully deleted' });
    });
  });
});

app.put('/updatefruit', (req, res) => {
  let id = req.body.id;
  let name = req.body.name;
  let photo = req.file;

  // Validation
  if (!id || !name || !photo) {
    return res.status(400).send({ message: 'Please provide fruit id, name, and photo' });
  }
  mongodb.MongoClient.connect(mongoUrl, (err, client) => {
    if (err) throw err;
    const db = client.db('admin');
    const collection = db.collection('fruits');
    const update = {
      $set: {
        name: name,
        photo: photo.path
      }
    };
    const options = {
      returnOriginal: false
    };
    collection.findOneAndUpdate({ _id: ObjectId(id) }, update, options, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ message: 'An error occurred while updating the fruit' });
      }

      if (result.value === null) {
        return res.status(404).send({ message: 'Fruit not found' });
      }

      return res.send({ message: 'Fruit successfully updated' });
    });
  });
});


app.listen(3000, () => {
  console.log('Node App is running on port 3000');
})
module.exports = app;
