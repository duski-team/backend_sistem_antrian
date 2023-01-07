const { verifyToken } = require('../helper/jwt')
const user = require('../module/users/model')

async function authentification(req, res, next) {

    try {
        var decode = verifyToken(req.headers.token);
        user.findAll({
            where: {
                id: decode.id,
                password: decode.password
            }
        })
            .then(data => {
                //  console.log(data.length)
                if (data.length > 0) {
                    // console.log("masuk data")
                    req.dataUsers = decode
                    next()
                }
                else {
                    // console.log("masuk else")
                    res.status(201).json({ status: 201, message: "anda belum login" });
                }
            })
    } catch (err) {
        res.status(201).json({ status: 201, message: "anda belum login" });
    }
}

// async function authentification(req, res, next) {
//     try {
//        next()
//     } catch (err) {
//         res.status(201).json({ status: 201, message: "anda belum login" });
//     }
// }

module.exports = authentification
