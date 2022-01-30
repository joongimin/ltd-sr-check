const axios = require('axios');
const _ = require('lodash');

const fetchSoftres = async (id) => {
  const { data } = await axios(`https://softres.it/api/raid/${id}`);

  const priorityItems = _.chain(data.itemNotes)
    .filter((i) => i.note.toLowerCase().includes('priority'))
    .map((i) => i.id)
    .value();

  const reserves = data.reserved.map(({ name, items }) => {
    return {
      name: name.toLowerCase(),
      items,
      priorityItems: _.intersection(items, priorityItems),
    };
  });

  return { softresData: data, reserves };
};

module.exports = fetchSoftres;
