import parser from "any-date-parser";
import {isDate} from "date-fns";

const good = "2025-02-26";
const bad = "Invalid Dadte";

const converted = new Date(bad);

console.log("converted", converted);

// const date = parser.attempt(good)
// const hmm = new Date(date.year, date.month)

// console.log(isDate(input))
// console.log(date)
// console.log(hmm)
