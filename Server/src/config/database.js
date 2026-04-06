const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://mdshahalamsabri78601_db_user:DQAoxqxktYsl7Oya@cluster1.kgg0ieo.mongodb.net/devtinder?retryWrites=true&w=majority&appName=Cluster1')
        console.log('mongodb connected successfully')
    }
    catch(error){
        console.error('mongodb connection failed ',error.message)
        process.exit(1);

    }
}
module.exports = connectDB;
