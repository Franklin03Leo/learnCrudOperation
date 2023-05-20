const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ReturnDocument } = require('mongodb');
const { ObjectId } = require('mongodb');
const app = express();
const dotenv = require('dotenv');

dotenv.config();

// MongoDB Database URL
const url = process.env.MONGO_URL;
const dbName = 'Testdb';

// Connect to MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    // Enable CORS
    const corsOptions = {
      origin: 'http://localhost:4200',
      optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));

    // Parse incoming requests with JSON payloads
    app.use(bodyParser.json());

    // Create a user document
    app.post('/create', (req, res) => {
      const collection = db.collection('testCollection');
      collection.insertOne(req.body)
        .then(result => {
          console.log('User document inserted successfully');
          res.status(200).json({ message: 'User document inserted successfully', insertedId: result.insertedId });
        })
        .catch(error => {
          console.error('Error inserting user document:', error);
          res.status(500).json({ message: 'Error inserting user document', error: error.message });
        });
    });

    // Get all user documents
    app.get('/getData', (req, res) => {
      const collection = db.collection('testCollection');
      collection.find().toArray()
        .then(users => {
          console.log('Retrieved all user documents');
          res.status(200).json(users);
        })
        .catch(error => {
          console.error('Error retrieving user documents:', error);
          res.status(500).json({ message: 'Error retrieving user documents', error: error.message });
        });
    });
    
    /* app.delete('/delete', (req, res) => {
      console.log(req.body.EmployeID);
      const userId = req.body.EmployeID;
      const collection = db.collection('testCollection');
      collection.deleteOne({ _id: userId })
        .then(result => {
          console.log(result)
          if (result.deletedCount === 1) {
            console.log('User document deleted successfully');
            res.status(200).json({ message: 'User document deleted successfully' });
          } else {
            console.log('User document not found');
            res.status(404).json({ message: 'User document not found' });
          }
        })
        .catch(error => {
          console.error('Error deleting user document:', error);
          res.status(500).json({ message: 'Error deleting user document', error: error.message });
        });
    }); */
    
    app.delete('/deleteData/:id', (req, res) => {
      const collection = db.collection('testCollection');
      const id = req.params.id;
      console.log('ids - ', id)
      collection.deleteOne({ _id: new ObjectId(id)}) //
        .then(result => {
          if (result.deletedCount === 1) {
            console.log('Deleted user document:', id);
            res.status(200).json({ message: 'User document deleted successfully' });
          } else {
            console.log('User document not found:', id);
            res.status(404).json({ message: 'User document not found' });
          }
        })
        .catch(error => {
          console.error('Error deleting user document:', error);
          res.status(500).json({ message: 'Error deleting user document', error: error.message });
        });
    });

    app.put('/updateData/:id', (req, res) => {
      const collection = db.collection('testCollection');
      const id = req.params.id;
      const updatedData = req.body;
      delete updatedData._id; // Exclude _id field from update
      console.log('data -',updatedData)
      collection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData })
        .then(result => {
          if (result.matchedCount === 1) {
            console.log('Updated user document:', id);
            res.status(200).json({ message: 'User document updated successfully' });
          } else {
            console.log('User document not found:', id);
            res.status(404).json({ message: 'User document not found' });
          }
        })
        .catch(error => {
          console.error('Error updating user document:', error);
          res.status(500).json({ message: 'Error updating user document', error: error.message });
        });
    });
    
    
  
    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log('Server listening on port:', port);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });
