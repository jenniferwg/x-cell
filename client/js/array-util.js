const getRange = function(fromNum, toNum) {
  return Array.from({ length: toNum - fromNum + 1 },
    (unused, i) => i + fromNum);
};

const getLetterRange = function(firstLetter = 'A', numLetters) {
  const rangeStart = firstLetter.charCodeAt(0);
  const rangeEnd = rangeStart + numLetters -1;
  return getRange(rangeStart, rangeEnd)
    .map(charCode => String.fromCharCode(charCode));
};

const getLetter = function(firstLetter = 'A', numCols) {
  const rangeStart = firstLetter.charCodeAt(0);
  const rangeEnd = rangeStart + numCols -1;
  return String.fromCharCode(rangeEnd);
};

module.exports = {
  getRange: getRange,
  getLetterRange: getLetterRange,
  getLetter: getLetter
};