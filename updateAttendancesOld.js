const Spreadsheet = require('./Spreadsheet');
const fetchAttendancesOld = require('./fetchAttendancesOld');

const colToA1 = (col) => {
  var temp,
    letter = '';
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = (col - temp - 1) / 26;
  }
  return letter;
};

const updateAttendancesOld = async (instance, members) => {
  const attendances = await fetchAttendancesOld(instance);

  const memberSheet = await Spreadsheet.build(
    '1fOos207kGy4P4--OVNZbJR6iV6erJk60elNcRXc76kQ'
  );
  const data = await memberSheet.get('Directory!1:1');
  const header = data.values[0].map((c) => c.toLowerCase());
  const a1 = colToA1(header.indexOf(instance) + 1);
  await memberSheet.update(
    `Directory!${a1}2:${a1}${members.length + 1}`,
    members.map((member) => [attendances[member.name] || 0])
  );
};

module.exports = updateAttendancesOld;
