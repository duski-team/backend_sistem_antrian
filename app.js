require('dotenv').config({})
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const routing = require('./routing/index')
const server = require('http').createServer(app);
const { koneksi_socket } = require('./helper/realTimeEngine')
koneksi_socket(server)

app.use(morgan('dev'))
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static('asset/file/'));

app.use('/', routing);

app.use((req, res, next) => {
	res.status(200).json({ status: '404', message: "gagal,tidak ada endpoint" });
})

const port = process.env.PORT_EXPRESS
server.listen(port, () => {
	console.log(` telah tersambung pada port : ${port}`)
});
