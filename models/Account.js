const db = require("./db")

const AccountSchema = new db.Schema({
    mac: {
        type: String,
        require: true,
        unique: true
    },
    ip_address: {
        type: String,
        require: true
    },
    acct_status: {
        type: String,
        require: true
    },
    event_time: {
        type: String,
        require: true
    },
})
const Account = db.model('Account', AccountSchema)

module.exports = Account