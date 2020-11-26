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
    group: {
        type: String,
        default: '',
        require: true
    },
    name: {
        type: String,
        require: false
    },
    model: {
        type: String,
        require: false
    },
    status: {
        type: Number,
        default: 0,
        require: true       
    },
})
const Switch = db.model('Switch', SwitchSchema)

module.exports = Switch