const db = require("./db")

const MacSchema = new db.Schema({
    mac: {
        type: String,
        require: true,
        unique: true
    },
    group: {
        type: String,
        default: 'all', // all组表示任何交换机，this表示只能在sw_ip交换机
        require: true
    },
    sw_ip: {
        type: String,
        default: '127.0.0.1'
    },
    status: {
        type: Number,
        default: 0,
        require: true       
    },
})
const Mac = db.model('Mac', MacSchema)

module.exports = Mac