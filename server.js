const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({path:"./config.env"});
const app = require("./app");

const DB = process.env.DB.replace("<password>", process.env.DB_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log("DB connect successful!"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port: ${port}`);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down ...");
    server.close();
});