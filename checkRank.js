const fetchAttendances = require('./fetchAttendances');

const validRank = (attendance) => {
  if (attendance >= 2) return '3';
  if (attendance === 1) return '2';
  return '1';
};

const checkRank = async (instance, members) => {
  const attendances = await fetchAttendances(instance);

  return members
    .filter(
      (member) => member[instance] !== validRank(attendances[member.name])
    )
    .map((member) => {
      const attendance = attendances[member.name] || 0;
      return {
        name: member.name,
        rank: member[instance],
        attendance,
        validRank: validRank(attendance),
      };
    });
};

module.exports = checkRank;
