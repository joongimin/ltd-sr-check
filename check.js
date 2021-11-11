const { google } = require('googleapis');
const axios = require('axios');
const _ = require('lodash');

const fetchSoftres = async (id) => {
  const { data } = await axios(`https://softres.it/api/raid/${id}`);

  const priorityItems = _.chain(data.itemNotes)
    .filter((i) => i.note === 'Priority Item')
    .map((i) => i.id)
    .value();

  const reserves = data.reserved.map(({ name, items }) => {
    const total = items.length;
    const priority = _.intersection(items, priorityItems).length;

    return { name: name.toLowerCase(), total, priority };
  });

  return { softresData: data, reserves };
};

const fetchMembers = async (instance) => {
  const googleAuth = new google.auth.GoogleAuth({
    keyFilename: 'secret/ltd-sr-check-2c15bc2ecb33.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const auth = await googleAuth.getClient();
  const { spreadsheets } = google.sheets({ version: 'v4', auth });
  const client = spreadsheets.values;
  const spreadsheetId = '1fOos207kGy4P4--OVNZbJR6iV6erJk60elNcRXc76kQ';
  const { data } = await client.get({ spreadsheetId, range: 'Directory' });
  const table = data.values;
  const header = table[0].map((c) => c.toLowerCase());
  const colName = header.indexOf('character');
  const colRank = header.indexOf(instance);

  const rows = table.slice(1);
  return _.map(rows, (row) => ({
    name: row[colName].split('-')[0].toLowerCase(),
    rank: row[colRank],
  }));
};

const check = async (softresId) => {
  const { softresData, reserves } = await fetchSoftres(softresId);
  const members = await fetchMembers(softresData.instance.toLowerCase());

  const invalidReserves = _.reject(reserves, ({ name, total, priority }) => {
    const member = members.find((m) => m.name === name);
    const rank = member ? member.rank : '1';

    if (rank === '1') {
      return total <= 1 && priority === 0;
    } else if (rank === '2') {
      return total <= 2 && priority === 0;
    } else if (rank === '3') {
      return total <= 2 && priority <= 1;
    } else {
      return false;
    }
  });

  return { softresData, members, invalidReserves };
};

module.exports = check;
