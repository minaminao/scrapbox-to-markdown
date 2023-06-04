#!/usr/bin/env node
import * as fs from "fs";
import { Command, Option } from "commander";
import { scrapboxToMarkdown, sanitizeFilename } from "./ToMarkdown";
import { ScrapboxType } from "./ScrapboxType";
import { MarkdownType } from "./MarkdownType";

const program = new Command();

program
    .name("scrapbox-to-markdown")
    .description("A CLI application to convert Scrapbox text to Markdown")
    .arguments("<filename>")
    .usage("<filename> [options]")

    .option(
        "--obsidian",
        "output in Obsidian Markdown format (when this option is not specified, output in GitHub Markdown format)"
    )
    .option("-o, --output <filepath>", "output file path (only works when --output-dir is not specified)")
    .option("--output-dir <dir>", "output directory (only works when --output is not specified)")
    .option("--append", "append to output file (only works when --output or --output-dir is specified)")
    .addOption(new Option("--minaminao").hideHelp())
    .addOption(new Option("--import-json").hideHelp())

    .action((filename, options) => {
        fs.readFile(filename, "utf8", (err, text) => {
            if (err) {
                throw new Error("File not found.");
            }

            const scrapboxType = options.minaminao ? ScrapboxType.Minaminao : ScrapboxType.Normal;
            const markdownType = options.obsidian ? MarkdownType.Obsidian : MarkdownType.GitHub;

            if (options.importJson) {
                const json = JSON.parse(text);
                const pages = json.pages;
                if (!pages) {
                    throw new Error("Invalid JSON.");
                }
                console.log("Importing " + pages.length + " pages...");

                if (options.output) {
                    throw new Error("--output option is invalid when --import-json is specified.");
                }
                if (!options.outputDir) {
                    throw new Error("--output-dir option is required when --import-json is specified.");
                }
                if (options.append) {
                    throw new Error(
                        "--append option is not supported when --import-json is specified. Duplicate pages is not allowed."
                    );
                }

                for (const page of pages) {
                    // page.titleに/が含まれているなら、全角に変換する
                    let slashSanitizedTitle;
                    // bodyの最初に追加するテキスト
                    let bodyPrefix = "";
                    let title;
                    if (page.title.indexOf("/") != -1) {
                        slashSanitizedTitle = page.title.replace(/\//g, "／");
                        title = sanitizeFilename(slashSanitizedTitle);
                        bodyPrefix += `---\naliases: ${title}\n---\n`;
                    } else {
                        title = sanitizeFilename(page.title);
                    }
                    console.log("title: " + title);

                    const body =
                        bodyPrefix +
                        scrapboxToMarkdown(page.lines.join("\n"), scrapboxType, markdownType)
                            .split("\n")
                            .slice(2)
                            .join("\n");

                    let dir = options.outputDir;
                    if (dir.slice(-1) != "/") dir += "/";

                    const filePath = dir + title + ".md";

                    fs.writeFile(filePath, body, (err) => {
                        if (err) throw new Error("Failed to write file.");
                    });
                }
            } else {
                const markdownText = scrapboxToMarkdown(text, scrapboxType, markdownType);

                if (options.output) {
                    if (options.append) {
                        fs.appendFile(options.output, markdownText, (err) => {
                            if (err) throw new Error("Failed to write file.");
                        });
                    } else {
                        fs.writeFile(options.output, markdownText, (err) => {
                            if (err) throw new Error("Failed to write file.");
                        });
                    }
                } else if (options.outputDir) {
                    const title = sanitizeFilename(text.split("\n")[0]);
                    const body = markdownText.split("\n").slice(2).join("\n");

                    let dir = options.outputDir;
                    if (dir.slice(-1) != "/") dir += "/";

                    const filePath = dir + title + ".md";

                    if (options.append) {
                        fs.appendFile(filePath, body, (err) => {
                            if (err) throw new Error("Failed to write file.");
                        });
                    } else {
                        if (fs.existsSync(filePath)) throw new Error("File already exists.");
                        fs.writeFile(filePath, body, (err) => {
                            if (err) throw new Error("Failed to write file.");
                        });
                    }
                } else {
                    console.log(markdownText);
                }
            }
        });
    });

program.parse();
