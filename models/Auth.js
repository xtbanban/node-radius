const db = require("./db")

const AuthSchema = new db.Schema({
    mac: {
        type: String,
        require: true,
        unique: true
    },
    ip_address: {
        type: String,
        require: true
    },
    code: {
        type: String,
        require: true
    },
    time: {
        type: String,
        require: true
    },
})
const Auth = db.model('Auth', AuthSchema)

module.exports = Auth