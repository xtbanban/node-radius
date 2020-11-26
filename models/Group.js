const db = require("./db")

const GroupSchema = new db.Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    address: {
        type: String,
        require: false
    },
    manager: {
        type: String,
        require: false
    },
    tel: {
        type: String,
        require: false
    },
})
const Group = db.model('Group', GroupSchema)

module.exports = Auth