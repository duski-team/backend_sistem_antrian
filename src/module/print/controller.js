const moment = require('moment');
const axios = require('axios')
const purworejo = process.env.HOST_PURWOREJO
const config = require("../../helper/config").config

class Controller {

    static async printAntrian(req, res) {
        const {tgl,jam,no_antrian,tempat,sisa_antrian} = req.query
        try {
            let html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                <style>
                    .container {
                        /* background-color: 25%; */
                        /* border:2px solid red; */
                        max-width:100%;
                        box-sizing:border-box;
                    }
                    header{
                        border-top:2px solid black;
                        border-bottom: 2px dashed black;
                        text-align: center;
                    }
                    .tanggal{
                        margin-top:10px;
                    }
                    .contain_nomor{
                        text-align: center;
                        border-bottom: 2px solid black;
                    }
                    .contain_nomor .nomor{
                        font-size: 70px;
                        font-weight: bold;
                    }
                    
                    .contain_nomor .loket{
                        font-size: 20px;
                        /* font-weight: bold; */
                    }
                </style>
                </head>
                <body>
                    <div class="container">
                        <header>
                            <p>RSUD <br>
                            R.A.A Tjokronegoro</p>
                        </header>
                        <section class="tanggal">
                            <small >${tgl}</small>
                            <small style="float: right; "> ${jam} </small>
                        </section>
                        <section class="contain_nomor">
                        <span class="nomor"> ${no_antrian} </span><br>
                        <span class="loket">ANTRIAN ${tempat}</span><br><br>
                        <small>
                            Jumlah Antrian Yang belum Dipanggil: ${sisa_antrian} <br>
                            <br>
                            <br>
                            <br>
                        </small>
                        </section>
                    </div>
                </body>
            </html>` 
            res.send(html)
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }

    }

    static async printSEP(req, res) {
        const {} = req.body
        try {
            let html = `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                    <style>
                        .contain{
                            max-width:25%;
                            /* border:1px solid red; */
                        }
                        table{
                            border-collapse: collapse;
                        }
                    
                    </style>
                </head>
                <body>
                    <div class="contain">
                        <header>
                            <center>
                                BUKTI REGISTRASI <br>
                                RSUP Dr SARDJITO
                            </center>
                        </header>
                        <table style="margin-left:10px;">
                        <tr>
                            <td width="100px">
                                No. SEP
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                                RSS1391665630526
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Tgl. SEP
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                                13-10-2022
                            </td>
                        </tr>
                        <tr>
                            <td>
                            No. Kartu
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                                0002580954917
                            </td>
                        </tr>
                        <tr>
                            <td>
                                No. RM
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                                02025139
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Nama Peserta
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                            SUKISMI
                            </td>
                        </tr>
                        <tr>
                            <td>
                            No. Telp
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                            081328760101
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Tgl. Lahir
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                                19-12-1960
                            </td>
                        </tr>
                        <tr>
                            <td>
                                Jenis Kelamin
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                            P
                            </td>
                        </tr>
                        <tr>
                            <td>
                            Poli Tujuan
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                            008-Kanker Terpadu
                            </td>
                        </tr>
                        <tr>
                            <td style="vertical-align: top;">
                                Nama Dokter
                            </td>
                            <td style="vertical-align: top;">
                                :
                            </td>
                            <td style="vertical-align: top;">
                            dr. Kartika Widayat I Sp. Pd-KHOM
                            </td>
                        </tr>
                        <tr>
                            <td>
                                No Urut
                            </td>
                            <td>
                                :
                            </td>
                            <td>
                            14
                            </td>
                        </tr>
                        </table>
                        <footer>
                            <center>
                            RSUP Dr SARDJITO  <br>
                                Mitra Tepercaya menuju sehat
                            </center>
                        </footer>
                    </div>
                </body>
                </html>
            `
            res.send(html)
        } catch (error) {
            res.status(500).json({ status: 500, message: "gagal", data: error })
        }
    }
}


module.exports = Controller