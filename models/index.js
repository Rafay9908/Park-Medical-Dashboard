// // models/index.js
// const clinic = require('./clinic');
// const clinician = require('./clinician');
// const slot = require('./slot');
// const rota = require('./rota');

// module.exports = {
//   clinic,
//   clinician,
//   slot,
//   rota
// };

const Clinic = require('./Clinic');
const Clinician = require('./Clinician');
const Slot = require('./Slot');
const Rota = require('./Rota');

module.exports = {
  Clinic,
  Clinician,
  Slot,
  Rota
};
