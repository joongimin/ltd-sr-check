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

  const membersInvalidRank = members.filter(
    (member) => member.rank !== validRank(attendances[member.name])
  );

  if (!membersInvalidRank.length) {
    console.log(`All ranks are valid for ${instance}`);
    return;
  }

  console.log(`Invalid ranks for ${instance}:`);
  membersInvalidRank.forEach((member) => {
    const attendance = attendances[member.name] || 0;
    console.log(
      `${member.name} - attendance: ${attendance}, current-rank: ${
        member.rank
      }, valid-rank: ${validRank(attendance)}`
    );
  });
};

(async () => {
  await checkRank('aq40');
  console.log('');
  await checkRank('bwl');
  console.log('');
  await checkRank('mc');
})();
