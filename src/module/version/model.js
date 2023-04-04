const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const version = sq.define('version', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_version: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

module.exports = version