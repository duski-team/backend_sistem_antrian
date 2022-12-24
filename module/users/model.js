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
        type: DataTypes.STRING
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
},
    {
        paranoid: true,
        freezeTableName: true
    });

// users.sync({alter:true})

module.exports = users