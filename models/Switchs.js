const db = require("./db")

const SwitchSchema = new db.Schema({
    IP: {
        type: String,
        require: true,
        unique: true
    },
    Secert: {
        type: String,
        require: true
    },
    status: {
        type: Number,
        default: 0,
        require: true       
    },
})
const Switch = db.model('Switch', SwitchSchema)

module.exports = Switch