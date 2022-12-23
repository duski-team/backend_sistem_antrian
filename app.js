const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const routing = require('./routing/index')
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: '*' });

const antrian_loket = require('./module/antrian_list/model')
const booking = require('./module/booking/model');
const { sq } = require("./config/connection");
const { v4: uuid_v4 } = require("uuid");
const { QueryTypes } = require('sequelize');
const s = { type: QueryTypes.SELECT }
const antrian_list = require('./module/antrian_list/model')



io.on('connection', function (socket) {
	// console.log(socket);
	console.log('ada yang connect');
	socket.on('disconnect', () => {
		console.log('ada yang disconnect');
	});

	socket.on('panggil', async (asd) => {
		let data = await antrian_loket.update({ master_loket_id: asd.master_loket_id, status_antrian: asd.status_antrian }, {
			where: {
				id: asd.id
			}
		})
			.then(hasil => {
				console.log("asdasdasd");
				if (asd.status_antrian == 0) {
					io.emit("refresh_layar", asd);
				} else {
					io.emit("refresh_admin", asd);
				}
			})
			.catch(error => {
				socket.emit("error", error);
			})

	})

	socket.on('registerDenganRM', async (asd) => {
		const { tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, rm_id, tanggal_antrian, poli_layanan, initial, jadwal_dokter_id, poli_id } = asd

		const t = await sq.transaction();

		try {
			let nomernya = await sq.query(`select count(*) from antrian_list al where date(al.tanggal_antrian) = '${tanggal_antrian}'and poli_id =${poli_id} and initial = '${initial}' and is_master=1`, s)
			let nomer_antrian = +nomernya[0].count + 1
			const sequence = await sq.query(`select count(*) from antrian_list al where date(tanggal_antrian) = '${tanggal_antrian}' and poli_id =${poli_id} `, s)
			let idBooking = uuid_v4()

			await booking.create({ id: idBooking, tanggal_booking, jenis_booking, NIK, nama_booking, no_hp_booking, no_rujukan, no_kontrol, is_verified, is_registered, status_booking, rm_id }, { transaction: t })
			let antrian = await antrian_list.create({ id: uuid_v4(), tanggal_antrian, is_master: 1, poli_layanan, initial, antrian_no: nomer_antrian, sequence: +sequence[0].count + 1, jadwal_dokter_id, poli_id, booking_id: idBooking }, { transaction: t })

			await t.commit();
			io.emit("refresh_loket", antrian);
		} catch (error) {
			await t.rollback();
			socket.emit("error", error);
		}
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
			socket.emit("error", error);
		}
	})

	socket.on('registerAntrianLoket', async (asd) => {
		const { tanggal_antrian_loket, jenis_antrian_id,master_loket_id } = asd

		try {
			let jumlah = await sq.query(`select count(*) from antrian_loket al where al.tanggal_antrian_loket ='${tanggal_antrian_loket}' and jenis_antrian_id ='${jenis_antrian_id}' `, s)
			let data_antrian = await antrian_loket.create({ id: uuid_v4(), tanggal_antrian_loket, jenis_antrian_id, nomor_antrian_loket: +jumlah[0].count + 1,master_loket_id })

			io.emit("refresh_antrian_loket", data_antrian);
		} catch (error) {
			socket.emit("error", error);
		}
	})

	socket.on('updateAntrianLoket', async (asd) => {
		const { id, status_antrian, master_loket_id } = asd

		try {
			let data_antrian = await antrian_loket.update({ master_loket_id, status_antrian,master_loket_id }, { where: { id }, returning: true, plain: true }) 
			let cek_data = await sq.query(`select al.id as antrian_loket_id, * from antrian_loket al join jenis_antrian ja on ja.id = al.jenis_antrian_id left join master_loket ml on ml.id = al.master_loket_id where al."deletedAt" isnull and al.id = '${id}'`,s)
			
			io.emit("refresh_antrian_loket_update", cek_data[0]);
		} catch (error) {
			socket.emit("error", error);
		}
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
