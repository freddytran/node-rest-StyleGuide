const jwt = require('jsonwebtoken');


/*
* Was passiert hier in der Middleware?
*
* Exportiere eine Funktion die checkt, ob der Token der mitgeschickt wird gültig ist. Wenn ja dann füge den Token
* als weiteres Feld in den request ein. Mach danach weiter mit dem Programm.
*
* Da diese Funktion exportiert wird, kann diese Middleware in den anderen js - Dateien verwendet werden.
* */
module.exports = (req, res, next) =>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.benutzerData = decoded;
        next();
    }catch(error){
        return res.status(401).json({
            message: 'Authentication failed!'
        });
    }
};