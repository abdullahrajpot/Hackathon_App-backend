const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const bcrypt = require("bcryptjs")
const mongoUrl = "mongodb+srv://abdullah:tariq5044@cluster0.2m7rk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const jwt = require("jsonwebtoken");
const cors = require('cors');
app.use(cors());

const JWT_SECRET =  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jdsds039[]]pou89ywe";

mongoose.connect(mongoUrl).then(() => {
    console.log("database connected ")
}).catch((e) => {
    console.log(e);

});

require('./AuthModel');
require('./ItemModel');
const User = mongoose.model('UserInfo')
const Item = mongoose.model('Item')

app.get("/", (req, res) => {
    res.send({ status: "started" })
})

app.post('/register', async (req, res) => {
    console.log("Register Route Hit");
    const { name, email, number, password } = req.body;

    const oldUser = await User.findOne({ email: email });
    if (oldUser) {
        console.log("User already exists");
        return res.send({ data: 'User already exists' });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
        await User.create({
            name: name,
            email: email,
            number,
            password: encryptedPassword
        });
        console.log("User created successfully");
        res.send({ status: 'ok', data: 'User created' });
    } catch (error) {
        console.error("Error creating user:", error);
        res.send({ status: 'error', data: error });
    }
});


// Login

app.post("/login", async (req, res) => {
    console.log('Login route hit');
    console.log('Request body:', req.body);  

    const { email, password } = req.body;

    console.log('Received email:', email);
    console.log('Received password:', password);

    const oldUser = await User.findOne({ email });

    if (!oldUser) {
        console.log('User not found for email:', email);
        return res.send({ data: "User doesn't exist!!" });
    }

    console.log('User found:', oldUser);

    const passwordMatch = await bcrypt.compare(password, oldUser.password);
    console.log('Password comparison result:', passwordMatch);

    if (passwordMatch) {
        const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);
        console.log('Generated JWT token:', token);

        return res.send({
            status: "ok",
            data: token,
            userType: oldUser.userType,
        });
    } else {
        console.log('Incorrect password for user:', email);
        return res.send({ data: "Invalid credentials" });
    }
});



// get user data

app.post("/userdata", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET);
      const useremail = user.email;
  
      User.findOne({ email: useremail }).then((data) => {
        return res.send({ status: "Ok", data: data });
      });
    } catch (error) {
      return res.send({ error: error });
    }
  });


// update user
  app.post("/update-user", async (req, res) => {
    const { name, email, mobile, image, gender, profession } = req.body;
    console.log(req.body);
    try {
      await User.updateOne(
        { email: email },
        {
          $set: {
            name,
            mobile,
            image,
            gender,
            profession,
          },
        }
      );
      res.send({ status: "Ok", data: "Updated" });
    } catch (error) {
      return res.send({ error: error });
    }
  });



// add event
app.post("/add-event", async (req, res) => {
    const { title, description, date, location, category } = req.body;
    const token = req.headers['authorization']?.split(' ')[1];  // Get the token from 'Bearer <token>'

    if (!token) {
        return res.status(400).send({ status: "error", message: "Token is required" });
    }

    try {
        const decodedUser = jwt.verify(token, JWT_SECRET);  // Verify token
        const userEmail = decodedUser.email;

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(400).send({ status: "error", message: "User not found" });
        }

        const newEvent = new Item({
            title,
            description,
            date,
            location,
            category,
            userId: user._id,  
            createdDate: Date.now(),
        });

        await newEvent.save();
        res.send({ status: "ok", message: "Event added successfully", event: newEvent });

    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).send({ status: "error", message: "Failed to add event" });
    }
});

// Get events from the database
app.get("/get-events", async (req, res) => {
    try {
        const events = await Item.find();  // Fetch all events from the 'Item' model (which represents events)

        if (events.length > 0) {
            return res.send({ status: "ok", items: events });
        } else {
            return res.send({ status: "ok", message: "No events found" });
        }
    } catch (error) {
        console.error("Error fetching events:", error);
        return res.status(500).send({ status: "error", message: "Failed to fetch events" });
    }
});



  


app.listen(5003, () => {
    console.log("app is running")
})