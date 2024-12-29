const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
    name:String,
    email:{type:String, unique:true},
    number:String,
    password:String ,
    image:String,
    gender:String,
    profession:String,
    userType:String
},
{
    collection:"UserInfo"
})

mongoose.model("UserInfo", AuthSchema);