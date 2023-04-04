const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const users = sq.define('users', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.INTEGER
    },
    user_status: {
        type: DataTypes.INTEGER, // 0: belum ganti password, 1 : sudah ganti password
        defaultValue: 0
    },
    otp_time: {
        type: DataTypes.DATE
    },
    kode_otp: {
        type: DataTypes.STRING
    },
    nomor_wa: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

// users.sync({alter:true})

module.exports = users

// role id : 
/* 
1. admin = 1017 
2. superadmin = 9999
3. user_mobile = 9998
4. kasir = 2
5. loket = 1 
6. poli = 4 
7. radiologi = 6
8. farmasi = 9 
9. laboratorium = 5
10. supervisor = 99
*/