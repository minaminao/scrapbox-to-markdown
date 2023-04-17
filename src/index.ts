#!/usr/bin/env node
import * as fs from "fs";
import { Command, Option } from "commander";
import { scrapboxToMarkdown } from "./ToMarkdown";
import { ScrapboxType } from "./ScrapboxType";
import { MarkdownType } from "./MarkdownType";

const program = new Command();

program
    .name("scrapbox-to-markdown")
    .description("A CLI application to convert Scrapbox text to Markdown")
    .arguments("<filename>")
    .usage("<filename> [options]")
    .option("-o, --output <filename>", "Output file name")
    .option("--obsidian", "Output in Obsidian Markdown format")
    .addOption(new Option("--minaminao").hideHelp())
    .addOption(new Option("--copy-and-output <dir>").hideHelp())
    .action((filename, options) => {
        fs.readFile(filename, "utf8", (err, text) => {
            if (err) {
                throw new Error("File not found.");
            }

            const scrapboxType = options.minaminao ? ScrapboxType.Minaminao : ScrapboxType.Normal;
            const markdownType = options.obsidian ? MarkdownType.Obsidian : MarkdownType.GitHub;
            const markdownText = scrapboxToMarkdown(text, scrapboxType, markdownType);

            if (options.output) {
                fs.writeFile(options.output, markdownText, (err) => {
                    if (err) throw new Error("Failed to write file.");
                });
            } else if (options.copyAndOutput) {
                const title = text.split("\n")[0];
                const body = markdownText.split("\n").slice(1).join("\n");
                let dir = options.copyAndOutput;
                if (dir.slice(-1) != "/")
                    dir += "/";
                fs.writeFile(dir + title + ".md", body, (err) => {
                    if (err) throw new Error("Failed to write file.");
                });
            } else {
                console.log(markdownText);
            }
        });
    });

program.parse();
