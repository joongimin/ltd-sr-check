const _ = require('lodash');
const axios = require('axios');
const cheerio = require('cheerio');

const getInstanceId = (instance) => {
  switch (instance) {
    case 'naxxramas':
      return '2006';
    case 'aq40':
      return '2005';
    case 'bwl':
      return '2002';
    case 'mc':
      return '2000';
  }
};

const fetchAttendances = async (instance) => {
  const MAX_RAIDS = 10;
  const instanceId = getInstanceId(instance);
  const response = await axios(
    `https://vanilla.warcraftlogs.com/guild/attendance-table/612614/0/${instanceId}`
  );

  const $ = cheerio.load(response.data);

  const attendance = {};

  const dates = [
    ...response.data.matchAll(/var createdDate = new Date\((\d+)\)/g),
  ].map((m) => m[1]);
  const validDates = [...dates].sort().reverse().slice(0, MAX_RAIDS);

  $('#attendance-table > tbody > tr').each(function () {
    const cols = [...$(this).find('td')];
    const name = $(cols[0]).text().trim();
    attendance[name.toLowerCase()] = cols
      .slice(2)
      .filter(
        (c, i) => validDates.includes(dates[i]) && $(c).text().trim() === '1'
      ).length;
  });

  return attendance;
};

module.exports = fetchAttendances;
