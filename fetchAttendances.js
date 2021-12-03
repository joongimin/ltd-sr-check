const _ = require('lodash');
const axios = require('axios');
const cheerio = require('cheerio');
const { kebabCase } = require('lodash');

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

const fetchAttendancesFromPage = async (instance, page) => {
  const instanceId = getInstanceId(instance);
  const response = await axios(
    `https://vanilla.warcraftlogs.com/guild/attendance-table/612614/0/${instanceId}?page=${page}`
  );

  const $ = cheerio.load(response.data);

  const attendance = {};

  $('#attendance-table > tbody > tr').each(function () {
    const cols = [...$(this).find('td')];
    const name = $(cols[0]).text().trim();
    const count = cols.filter((c) => $(c).text().trim() === '1').length;
    attendance[name.toLowerCase()] = count;
  });

  return attendance;
};

const fetchAttendances = async (instance) => {
  const result = {};
  const MAX_PAGES = 10;
  for (let i = 1; i < MAX_PAGES; ++i) {
    const attendances = await fetchAttendancesFromPage(instance, i);
    if (_.isEmpty(attendances)) break;

    for (const [k, v] of Object.entries(attendances))
      result[k] = (result[k] || 0) + v;
  }

  return result;
};

module.exports = fetchAttendances;
