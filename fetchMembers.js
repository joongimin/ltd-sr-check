const { google } = require('googleapis');

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
  return rows.map((row) => ({
    name: row[colName].split('-')[0].toLowerCase(),
    rank: row[colRank],
  }));
};

module.exports = fetchMembers;