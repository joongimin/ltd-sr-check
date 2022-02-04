const AttendanceSheet = require('./AttendanceSheet');
const fetchAttendances = require('./fetchAttendances');

const getDates = (attendances) => {
  const set = new Set();
  attendances.forEach((i) => set.add(i[1]));
  return [...set].sort().reverse();
};

const updateAttendances = async (instance) => {
  const attendanceSheet = await AttendanceSheet.build();

  const attendances = await fetchAttendances(instance);

  const dates = getDates(attendances);

  const members = {};
  attendances.forEach((item) => {
    const name = item[0];
    const date = item[1];
    const index = dates.indexOf(date);
    members[name] = members[name] || Array(dates.length).fill('');
    members[name][index] = 'P';
  });

  const data = await attendanceSheet.fetchWorksheet(instance);
  const oldTable = data.values;
  const oldDates = oldTable[0].slice(1);
  oldTable.slice(1).forEach((row) => {
    const name = row[0];
    row.slice(1).forEach((col, i) => {
      const date = oldDates[i];
      const index = dates.indexOf(date);
      if (col && col !== 'P') {
        members[name] = members[name] || Array(dates.length).fill('');
        members[name][index] = col;
      }
    });
  });

  const table = [];
  table.push(['Name', ...dates]);
  const names = Object.keys(members).sort();
  names.forEach((name) => table.push([name, ...members[name]]));
  await attendanceSheet.updateWorksheet(instance, table);
};

module.exports = updateAttendances;
