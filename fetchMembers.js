const moment = require('moment-timezone');
const AttendanceSheet = require('./AttendanceSheet');

moment.tz.setDefault('America/New_York');

const MAX_WEEKS = 10;

const getCutoffDate = () => {
  const date = moment().startOf('day').subtract(MAX_WEEKS, 'weeks');
  return date.subtract((date.day() + 5) % 7, 'day');
};

const getRecentRecordsCount = (instance, dates) => {
  const isConsecutive = instance === 'naxxramas';
  if (isConsecutive) return MAX_WEEKS;

  const cutOffDate = getCutoffDate();

  let records = 0;
  for (let date of dates.slice(1)) {
    const reportDate = moment(date.replaceAll('/', '-'));
    if (reportDate < cutOffDate) break;

    records += 1;
  }

  return records;
};

const fetchMembers = async (instance) => {
  const attendanceSheet = await AttendanceSheet.build();
  const data = await attendanceSheet.fetchWorksheet(instance);
  const table = data.values;

  let recentRecordsCount = Math.min(
    getRecentRecordsCount(instance, table[0]),
    table[0].length - 1
  );

  const firstReportDate = moment(
    table[0][recentRecordsCount].replaceAll('/', '-')
  ).format('l');

  const lastReportDate = moment(table[0][1].replaceAll('/', '-')).format('l');

  const members = {};
  table.slice(1).forEach((row) => {
    const name = row[0].toLowerCase();
    const attendance = row
      .slice(1, 1 + recentRecordsCount)
      .filter((c) => c === 'P' || c === 'S' || c === 'B').length;
    members[name] = attendance;
  });

  return { members, firstReportDate, lastReportDate };
};

module.exports = fetchMembers;
