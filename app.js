const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const routing = require('./routing/index')
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: '*' });
const moment = require('moment');

const booking = require('./module/booking/model');
const { sq } = require("./config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const antrian_list = require('./module/antrian_list/model')



io.on('connection', function (socket) {
	// console.log(socket.id);
	console.log('ada yang connect');
	socket.on('disconnect', () => {
		console.log('ada yang disconnect');
	});

	socket.on('panggil', async (asd, room_id) => {
		const { id, tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id } = asd
		let data = await antrian_list.update({ tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id }, { where: { id } }).then(hasil => {
			console.log("asdasdasd");
			if (status_antrian == 0) {
				io.to(room_id).emit("refresh_layar", asd);
			} else {
				io.emit("refresh_admin", asd);
			}
		}).catch(error => {
			socket.emit("error", error);
		})
	})

	socket.on('registerTanpaRM', async (asd) => {
		const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, tanggal_antrian, poli_layanan, initial, jadwal_dokter_id, poli_id } = asd

		const t = await sq.transaction();

		try {
			let data_booking = await booking.create({ id: uuid_v4(), tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking }, { transaction: t })
			let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tanggal_antrian}'and poli_id =${poli_id} and initial = '${initial}' and is_master = 1`, s)
			let nomer_antrian = +nomernya[0].count + 1
			const sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tanggal_antrian}' and poli_id =${poli_id} `, s)

			let data_antrian = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].count + 1, jadwal_dokter_id, poli_id, booking_id: data_booking.id }, { transaction: t })
			await t.commit();

			io.emit("refresh_mobile", data_booking);
		} catch (error) {
			await t.rollback();
			console.log(error);
			socket.emit("error", error);
		}
	})

	socket.on('registerAntrianLoket', async (asd) => {
		const { tanggal_antrian, poli_layanan, initial, status_antrian, poli_id, master_loket_id, jenis_antrian_id } = asd

		try {
			let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')
			const antrian_no = await sq.query(`select count(*)+1 as nomor from antrian_list al where date(al.tanggal_antrian) = '${tgl}' and initial = '${initial}'`, s)
			let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: antrian_no[0].nomor, sequence: antrian_no[0].nomor, status_antrian, master_loket_id, poli_id, jenis_antrian_id })

			io.emit("refresh_antrian_loket", hasil);
		} catch (error) {
			console.log(error);
			socket.emit("error", error);
		}
	})

	socket.on('registerMandiri', async (asd) => {
		const { tanggal_antrian, is_master, poli_layanan, initial, antrian_no, is_cancel, is_process, status_antrian, id_antrian_list, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id, room_id } = asd

		try {
			let nomer_antrian = ''
			let tgl = moment(tanggal_antrian).format('YYYY-MM-DD')

			if (antrian_no) {
				nomer_antrian = antrian_no
			}
			else {
				let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tgl}'and poli_id =${poli_id} and initial = '${initial}' and is_master=1`, s)
				nomer_antrian = +nomernya[0].count + 1
			}

			const sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tgl}' and poli_id =${poli_id} `, s);

			// console.log(nomer_antrian,sequence[0].count);

			if (id_antrian_list) {
				await antrian_list.update({ status_antrian: 2 }, { where: { id: id_antrian_list } })
			}

			let hasil = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].count + 1, is_cancel, is_process, status_antrian, jadwal_dokter_id, poli_id, master_loket_id, jenis_antrian_id })
			io.to(room_id).emit("refresh_register_mandiri", hasil);

		} catch (error) {
			console.log(error);
			socket.emit("error", error);
		}
	})

	socket.on('joinRoom', (room_id) => {
		socket.join(room_id);
		console.log(`join ${room_id}`);
	})

	socket.on('leaveRoom', (room_id) => {
		socket.leave(room_id);
		console.log(`leave ${room_id}`);
	})
});




app.use(morgan('dev'))
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static('asset/file/'));

app.use('/', routing);

app.use((req, res, next) => {
	res.status(200).json({ status: '404', message: "gagal,tidak ada endpoint" });
})

const port = 8070
server.listen(port, () => {
	console.log(` telah tersambung pada port : ${port}`)
});
