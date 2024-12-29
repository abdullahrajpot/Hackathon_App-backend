const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: String,
    description: String,
    date: String,
    location: String,
    category: String,
    createdDate: { type: Date, default: Date.now } // Manually add createdDate
}, { collection: "Item" });

mongoose.model("Item", EventSchema);
