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

const fetchAttendancesFromPage = async (instanceId, page) => {
  const response = await axios(
    `https://vanilla.warcraftlogs.com/guild/attendance-table/612614/0/${instanceId}?page=${page}`
  );

  const $ = cheerio.load(response.data);

  const attendances = [];

  const dates = [
    ...response.data.matchAll(/var createdDate = new Date\((\d+)\)/g),
  ].map((m) =>
    new Date(parseInt(m[1]))
      .toLocaleString('ko-KR', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .slice(0, 12)
      .replaceAll('. ', '/')
  );

  $('#attendance-table > tbody > tr').each(function () {
    const cols = [...$(this).find('td')];
    const name = $(cols[0]).text().trim();

    cols.slice(2).forEach((col, i) => {
      if ($(col).text().trim() === '1') {
        attendances.push([name, dates[i]]);
      }
    });
  });

  return attendances;
};

const fetchAttendances = async (instance) => {
  const instanceId = getInstanceId(instance);

  const MAX_PAGES = 1;
  const attendances = [];
  for (let i = 1; i <= MAX_PAGES; ++i) {
    const result = await fetchAttendancesFromPage(instanceId, i);
    if (result.length === 0) break;

    attendances.push(...result);
  }

  return attendances;
};

module.exports = fetchAttendances;
