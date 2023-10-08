const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');

const mqttServerUrl = 'mqtt://test.mosquitto.org';
const mongoUri = "mongodb+srv://admin:admin@clusterace2.z3slk1n.mongodb.net/?retryWrites=true&w=majority";

const client = mqtt.connect(mqttServerUrl);
let db; // Database connection

client.on('connect', () => {
  console.log('Conectado al servidor MQTT');

  client.subscribe('ACE2_G9_2023/#', (err) => {
    if (!err) {
      console.log('Suscrito al topic "ACE2_G9_2023"');
    } else {
      console.error('Error al suscribirse al topic "ACE2_G9_2023":', err);
    }
  });
});

client.on('message', (topic, message) => {
  if (topic === "ACE2_G9_2023/register_lecture") {
    registerLecture(message.toString());
  }
});

client.on('close', () => {
  console.log('Desconectado del servidor MQTT');
});

// Establish MongoDB connection
async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('sensor_data');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

connectToMongoDB();

// Lecture registration
async function registerLecture(lecture) {

console.log(lecture)

  try {
    if (!db) {
      console.error('MongoDB connection not established.');
      return;
    }

    const data = lecture.split('&');

    const temperature = data[0];
    const aqi = data[1];
    const light = data[2];
    const proximity = data[3] === "true";

    const newReading = {
      temperature,
      aqi,
      light,
      proximity,
    };

    console.log('New reading:', newReading);

    const result = await db.collection("readings").insertOne(newReading);
    console.log(result)
 
  } catch (e) {
    console.error('Error inserting data into MongoDB:', e);
  }
}
