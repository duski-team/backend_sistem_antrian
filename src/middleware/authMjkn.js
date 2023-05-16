const { verifyToken } = require('../helper/jwt')
const user = require('../module/users/model')

async function authMjkn(req, res, next) {
    
    //let token = req.headers.x-token
    console.log(req.headers)
    try {
        
        let decode = verifyToken(req.headers['x-token']);
        // let role = ["1","2","4","5","6","7","8","9",'11',"24","99","1017","9998","9999"];
        // console.log(decode);
        if (decode) {
            let data = await user.findAll({where: {username:decode.username}})
            req.dataUsers = decode
            if(data.length>0){
                req.dataUsers = data[0]
            }
            next()
        }else {
            res.status(201).json({ status: 201, message: "anda belum loginn" });
        }
    } catch (err) {
        console.log("error authen");
        res.status(201).json({ status: 201, message: "anda belum login" });
    }
}

module.exports = authMjkn
