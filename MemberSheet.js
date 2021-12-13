const { google } = require('googleapis');
const spreadsheetId = '1fOos207kGy4P4--OVNZbJR6iV6erJk60elNcRXc76kQ';

class MemberSheet {
  constructor(client) {
    this.client = client;
  }

  async get(range) {
    const { data } = await this.client.get({ spreadsheetId, range });
    return data;
  }

  static async build() {
    const googleAuth = new google.auth.GoogleAuth({
      keyFilename: 'secret/ltd-sr-check-2c15bc2ecb33.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const auth = await googleAuth.getClient();
    const { spreadsheets } = google.sheets({ version: 'v4', auth });
    return new MemberSheet(spreadsheets.values);
  }
}

module.exports = MemberSheet;
