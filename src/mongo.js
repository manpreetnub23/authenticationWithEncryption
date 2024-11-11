const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/loginPage")
    .then(() => {
        console.log("mongodb connected")
    })
    .catch(() => console.log("error"));
const Schema = new mongoose.Schema({
    name: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true
    },
    token: {
        type: 'string',
        required: true
    }
})
const Collection = new mongoose.model("AuthColletion", Schema)
module.exports = Collection