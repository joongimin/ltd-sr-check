const Spreadsheet = require('./Spreadsheet');

const getSheetName = (instance) => {
  switch (instance) {
    case 'naxxramas':
      return 'Naxx Attendance';
    case 'aq40':
      return 'AQ40 Attendance';
    case 'bwl':
      return 'BWL Attendance';
    case 'mc':
      return 'MC Attendance';
  }
};

class AttendanceSheet {
  constructor(sheet) {
    this.sheet = sheet;
  }

  async fetchWorksheet(instance) {
    const sheetName = getSheetName(instance);
    if (!sheetName) throw `Invalid instance type '${instance}'`;
    return await this.sheet.get(sheetName);
  }

  async updateWorksheet(instance, table) {
    const sheetName = getSheetName(instance);
    if (!sheetName) throw `Invalid instance type '${instance}'`;
    await this.sheet.clear(sheetName);
    await this.sheet.update(sheetName, table);
  }

  static async build() {
    const sheet = await Spreadsheet.build(
      '1GbYI2yrv5hGAzSzF8Ql8vXRwtLiuhrMAFgnQU5BWzFs'
    );
    return new AttendanceSheet(sheet);
  }
}

module.exports = AttendanceSheet;
