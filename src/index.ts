#!/usr/bin/env node
import * as fs from "fs";
import { scrapboxToMarkdown } from "./ToMarkdown";

if (process.argv.length != 3) {
  console.log("Usage: node build/index.js <FILENAME>")
  process.exit(1);
}
const filename = process.argv[2];

fs.readFile(filename, 'utf8', (err, text) => {
  if (err) {
    throw new Error("File not found.");
  }
  else {
    console.log(scrapboxToMarkdown(text));
  }
});
