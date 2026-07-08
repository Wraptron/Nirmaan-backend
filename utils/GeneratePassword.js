const crypto = require("crypto");

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SPECIAL = "@.#$!%*?&^";
const ALL = LOWER + UPPER + DIGITS + SPECIAL;

const pick = (charset) => charset[crypto.randomInt(charset.length)];

const shuffle = (chars) => {
  const arr = [...chars];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
};

const generatePassword = (length = 8) => {
  const size = Math.max(8, length);
  const required = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SPECIAL)];
  const rest = Array.from({ length: size - required.length }, () => pick(ALL));
  return shuffle([...required, ...rest]);
};

module.exports = generatePassword;
