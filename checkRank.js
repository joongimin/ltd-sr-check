const fetchAttendances = require('./fetchAttendances');
const fetchMembers = require('./fetchMembers');

const validRank = (attendance) => {
  if (attendance >= 2) return '3';
  if (attendance === 1) return '2';
  return '1';
};

const checkRank = async (instance) => {
  const attendances = await fetchAttendances(instance);
  const members = await fetchMembers(instance);

  return members
    .filter((member) => member.rank !== validRank(attendances[member.name]))
    .map((member) => {
      const attendance = attendances[member.name] || 0;
      return { ...member, attendance, validRank: validRank(attendance) };
    });
};

module.exports = checkRank;
