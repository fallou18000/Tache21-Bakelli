const {Pool} = require("pg")

const pool = new Pool({
    user :"postgres",
    password :"Papenar18",
    host :"localhost",
    port :5432,
    database :"Easy-call",
})

module.exports=pool