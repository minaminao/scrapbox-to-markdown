#!/usr/bin/env node
import * as fs from "fs";
import { Command, Option } from "commander";
import { scrapboxToMarkdown } from "./ToMarkdown";
import { scrapboxToObsidianMarkdown } from "./ToObsidianMarkdown";
import { minaminaoScrapboxToObsidianMarkdown } from "./MinaminaoScrapboxToObsidianMarkdown";

const program = new Command();

program
    .name("scrapbox-to-markdown")
    .description("A CLI application to convert Scrapbox text to Markdown")
    .arguments("<filename>")
    .usage("<filename> [options]")
    .option("-o, --output <filename>", "Output file name")
    .option("--obsidian", "Output in Obsidian Markdown format")
    .addOption(new Option("--minaminao").hideHelp())
    .action((filename, options) => {
        fs.readFile(filename, "utf8", (err, text) => {
            if (err) {
                throw new Error("File not found.");
            }

            let markdownText;
            if (options.minaminao) {
                markdownText = minaminaoScrapboxToObsidianMarkdown(text);
            } else if (options.obsidian) {
                markdownText = scrapboxToObsidianMarkdown(text);
            } else {
                markdownText = scrapboxToMarkdown(text);
            }

            if (options.output) {
                fs.writeFile(options.output, markdownText, (err) => {
                    if (err) {
                        throw new Error("Failed to write file.");
                    }
                });
            } else {
                console.log(markdownText);
            }
        });
    });

program.parse();
