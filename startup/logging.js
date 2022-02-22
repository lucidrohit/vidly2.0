const winston = require('winston');
require("winston-mongodb");
require('express-async-errors');


module.exports = function (){
    winston.add(new winston.transports.File({ filename: 'logfile.log' }))
    winston.add(new winston.transports.MongoDB({ db: 'mongodb://localhost/VidlyMain',level:"info" }))
  
    winston.exceptions.handle(
        new winston.transports.File({ filename: 'uncaughtExceptions.log' })
    );
    process.on('unhandledRejection',(ex)=>{
        throw ex;
    })
    
}