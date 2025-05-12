// models/index.js
const clinic = require('./clinic');
const clinician = require('./clinician');
const slot = require('./slot');
const rota = require('./rota');

module.exports = {
  clinic,
  clinician,
  slot,
  rota
};