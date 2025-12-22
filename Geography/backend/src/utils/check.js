const geography10 = require("../db/geography10/chunks.json");
const geography9 = require("../db/geography9/chunks.json");
const geography8 = require("../db/geography8/chunks.json");
const geography7 = require("../db/geography7/chunks.json");
const geography6 = require("../db/geography6/chunks.json");

const allChunks = [geography10, geography9, geography8, geography7, geography6];

for (const chunk of allChunks) {
  let i = 10;
  console.log(`geography${i}`, chunk.length);
  i--;
}
