const db = require('mongoose')

db.connect(process.env.DB_HOST, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connect mongodb sucess!")
}).catch(() => {
    console.log("Connect mongodb error!")
})

module.exports = db