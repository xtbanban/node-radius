const db = require("./db")

const MacSchema = new db.Schema({
    mac: {
        type: String,
        require: true,
        unique: true
    },
    status: {
        type: Number,
        default: 0,
        require: true       
    },
})
const Mac = db.model('Mac', MacSchema)

module.exports = Mac