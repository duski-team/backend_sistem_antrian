const express = require('express')
const app = express()

class Controller{

    static testing(req,res){
        // const{isi}= req.params

        app.use(express.static(__dirname + '/asset/file/seratus.wav'));
        res.json("sukses")


    }

}

module.exports=Controller