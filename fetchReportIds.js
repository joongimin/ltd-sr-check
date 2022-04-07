const axios = require('axios');
const _ = require('lodash');

const fetchReportIdsFromPage = async (page) => {
  console.log(`Fetching page ${page}..`);
  const { data } = await axios(
    `https://vanilla.warcraftlogs.com/guild/reports-list/612614?page=${page}`
  );

  return [...data.matchAll(/href="\/reports\/(.*)"/g)].map((m) => m[1]);
};

const fetchReportIds = async () => {
  const reportIds = [];
  for (let i = 1; i < 10000; ++i) {
    const result = await fetchReportIdsFromPage(i);
    if (!result.length) break;

    reportIds.push(...result);
  }
  return reportIds;
};

(async () => {
  const reportIds = await fetchReportIds();
  console.log(JSON.stringify(reportIds));
})();
