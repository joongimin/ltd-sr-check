const fs = require('fs');

const wowItems = JSON.parse(
  fs.readFileSync('wow-items.json', {
    encoding: 'utf8',
  })
);

const wowItemName = (id) => {
  const wowItem = wowItems.find((i) => i.id === id);
  return wowItem ? wowItem.name : '';
};

module.exports = { wowItemName };
