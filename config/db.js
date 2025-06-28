const mongoose = require("mongoose");

function connect_to_db(){
    mongoose.connect(process.env.MONGO_URI).then(() =>{
        console.log('connected to db');
    })
}
module.exports = connect_to_db;