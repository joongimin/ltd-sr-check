const MemberSheet = require('./MemberSheet');
const fetchAttendances = require('./fetchAttendances');

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

const updateAttendances = async (instance, members) => {
  const attendances = await fetchAttendances(instance);

  const memberSheet = await MemberSheet.build();
  const data = await memberSheet.get('Directory!1:1');
  const header = data.values[0].map((c) => c.toLowerCase());
  const a1 = colToA1(header.indexOf(instance) + 1);
  await memberSheet.update(
    `Directory!${a1}2:${a1}${members.length + 1}`,
    members.map((member) => [attendances[member.name] || 0])
  );
};

module.exports = updateAttendances;
