const { google } = require('googleapis');

class Spreadsheet {
  constructor(client, spreadsheetId) {
    this.client = client;
    this.spreadsheetId = spreadsheetId;
  }

  async get(range) {
    const { data } = await this.client.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });
    return data;
  }

  async update(range, values) {
    return await this.client.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });
  }

  static async build(spreadsheetId) {
    const googleAuth = new google.auth.GoogleAuth({
      keyFilename: 'secret/ltd-sr-check-2c15bc2ecb33.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const auth = await googleAuth.getClient();
    const { spreadsheets } = google.sheets({ version: 'v4', auth });
    return new Spreadsheet(spreadsheets.values, spreadsheetId);
  }
}

module.exports = Spreadsheet;
