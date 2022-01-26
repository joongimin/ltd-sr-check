const getRank = (attendance) => {
  if (attendance > 4) return 'Regular Raider';
  else if (attendance > 0) return 'Intermediate Raider';
  else return 'New Raider';
};

module.exports = getRank;
