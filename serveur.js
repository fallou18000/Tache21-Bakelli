const pool = require("./db")
async function TestConnexion() {
    try{
        const resultat = await pool.query("SELECT NOW()");
        console.log("Connexion etablie")
        console.log(resultat.rows)
    }
    catch(error){
        console.log(error)
    }
    
}

TestConnexion()