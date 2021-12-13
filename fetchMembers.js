const MemberSheet = require('./MemberSheet');

const fetchMembers = async () => {
  const memberSheet = await MemberSheet.build();
  const data = await memberSheet.get('Directory');
  const table = data.values;
  const header = table[0].map((c) => c.toLowerCase());
  const colName = header.indexOf('character');
  const colMc = header.indexOf('mc');
  const colBwl = header.indexOf('bwl');
  const colAq40 = header.indexOf('aq40');

  const rows = table.slice(1);
  return rows.map((row) => ({
    name: row[colName].split('-')[0].toLowerCase(),
    mc: row[colMc],
    bwl: row[colBwl],
    aq40: row[colAq40],
  }));
};

module.exports = fetchMembers;
