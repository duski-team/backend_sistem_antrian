const { Sequelize } = require('sequelize');

const sq = new Sequelize('SistemAntrian','postgres','Grafika9', {
    host: 'Serova.id',
    port: 8000,
    dialect: 'postgres',
    logging:false,
    dialectOptions:{
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 1000,
      min: 0,
      idle: 200000,
      acquire: 1000000,
    },
    timezone: '+07:00'
  });
  module.exports = {sq}