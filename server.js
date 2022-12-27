let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mysql = require('mysql');
const cors = require('cors');
const multer = require('multer'); 
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(cors({ origin: '*' }));


// homepage route
app.get('/', (req, res) => {
    return res.send({ 
        error: false, 
        message: 'Welcome to RESTful CRUD API with NodeJS, Express, MYSQL',
    })
})

// connection to mysql database
let dbConnection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'nodejs_api'
})
dbConnection.connect();

// retrieve all fruits 
app.get('/getdatafruit', (req, res) => {
    dbConnection.query('SELECT * FROM fruits', (error, results, fields) => {
        if (error) throw error;

        let message = ""
        if (results === undefined || results.length == 0) {
            message = "Fruits table is empty";
        } else {
            message = "Successfully retrieved all fruits";
        }
        return res.send({ data: results, message: message});
    })
})

// add a new fruit
// app.post('/addfruit', (req, res) => {
//     let name = req.body.name;
//     let author = req.body.author;

//     // validation
//     if (!name || !author) {
//         return res.status(400).send({ message: "Please provide fruit name and author."});
//     } else {
//         dbConnection.query('INSERT INTO fruits (name, author) VALUES(?, ?)', [name, author], (error, results, fields) => {
//             if (error) throw error;
//             return res.send({message: "fruit successfully added"})
//         })
//     }
// });
app.post('/upload', upload.single('photo'), (req, res) => {
    // extract the value and photo from the request body
    let name = req.body.name;
    let author = req.body.author;
    let photo = req.file;
  
    // validate the input
    if (!name || !author ||  !photo) {
      return res.status(400).send({ message: 'Please provide a value and a photo.' });
    }
  
    // insert the value and photo into the database
    dbConnection.query(
      'INSERT INTO fruits (name, author, photo) VALUES (?, ?, ?)',
      [name, author, photo.path],
      (error, results, fields) => {
        if (error) throw error;
        return res.send({ message: 'Value and photo successfully added.' });
      }
    );
  });

// retrieve fruit by name 
app.get('/getdatafruit/:name', (req, res) => {
    let name = req.params.name;

    if (!name) {
        return res.status(400).send({ message: "Please provide fruit name"});
    } else {
        dbConnection.query("SELECT * FROM fruits WHERE name = ?", name, (error, results, fields) => {
            if (error) throw error;

            let message = "";
            if (results === undefined || results.length == 0) {
                message = "fruit not found";
            } else {
                message = "Successfully retrieved fruit data";
            }
            return res.send({data: results[0], message: message })
        })
    }
})

// update fruits with id 
app.put('/updatefruit', (req, res) => {
    let id = req.body.id;
    let name = req.body.name;
    let author = req.body.author;

    // validation
    if (!id || !name || !author) {
        return res.status(400).send({ message: 'Please provide fruit id, name and author'});
    } else {
        dbConnection.query('UPDATE fruits SET name = ?, author = ? WHERE id = ?', [name, author, id], (error, results, fields) => {
            if (error) throw error;

            let message = "";
            if (results.changedRows === 0) {
                message = "fruit not found or data are same";
            } else {
                message = "fruit successfully updated";
            }

            return res.send({ error: false, data: results, message: message })
        })
    }
})

// delete fruit by id
app.delete('/deletefruit', (req, res) => {
    let id = req.body.id;

    if (!id) {
        return res.status(400).send({ error: true, message: "Please provide fruit id"});
    } else {
        dbConnection.query('DELETE FROM fruits WHERE id = ?', [id], (error, results, fields) => {
            if (error) throw error;

            let message = "";
            if (results.affectedRows === 0) {
                message = "fruit not found";
            } else {
                message = "fruit successfully deleted";
            }

            return res.send({ error: false, data: results, message: message })
        })
    }
})

app.listen(3000, () => {
    console.log('Node App is running on port 3000');
})

module.exports = app;
