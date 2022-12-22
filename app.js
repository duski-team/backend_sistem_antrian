const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const routing = require('./routing/index')
const server = require('http').createServer(app);
const io = require('socket.io')(server,{cors:'*'});
const antrian_loket= require('./module/antrian_loket/model')



io.on('connection', function(socket) { 
	// console.log(socket);
	console.log('ada yang connect');
	socket.on('disconnect', () => {
		console.log('ada yang disconnect');
	  });

	socket.on('panggil',async (asd)=>{
		let data = await antrian_loket.update({master_loket_id:asd.master_loket_id,status_antrian:asd.status_antrian},{
			where:{
				id:asd.id
			}
		})
		.then(hasil=>{
			console.log("asdasdasd");
			io.emit("refresh","ale ale");
        })
        .catch(error=>{
			socket.emit("error",error);
        })
	
	})
});




app.use(morgan('dev'))
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static('asset/file/'));

app.use('/', routing);

app.use((req,res,next)=>{
	res.status(200).json({ status: '404', message: "gagal,tidak ada endpoint"});
  })

const port = 8070
server.listen(port, () => {
	console.log(` telah tersambung pada port : ${port}`)
});