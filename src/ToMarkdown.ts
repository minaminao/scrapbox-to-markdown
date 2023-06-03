import { parse, Page, Node, ImageNode } from "@progfay/scrapbox-parser";
import { MarkdownType } from "./MarkdownType";
import { ScrapboxType } from "./ScrapboxType";

const TAB_WIDTH = 4;

const convertHref = (href: string) => {
    return href.replace(" ", "_");
};

const sanitizeLinkTitle = (title: string) => {
    return title.replace(/_/g, "\\_").replace(/\*/g, "\\*");
};

export const sanitizeFilename = (filename: string) => {
    filename = filename.replace(/\s*[:|]\s*/g, " - ");
    return filename;
};

const scrapboxImageNodeToMarkdownText = (
    node: ImageNode,
    scrapboxType: ScrapboxType,
    markdownType: MarkdownType,
    size = -1
) => {
    if (scrapboxType == ScrapboxType.Minaminao && markdownType == MarkdownType.Obsidian && size != -1) {
        return `![|${size}00](${node.src})`;
    } else {
        return "![](" + node.src + ")";
    }
};

const scrapboxNodesToMarkdownText = (nodes: Page | Node[], scrapboxType: ScrapboxType, markdownType: MarkdownType) => {
    let text = "";
    for (const node of nodes) {
        const type = node.type;
        if (type == "title") {
            text += "# " + node.text;
            if ("nodes" in node) throw new Error();
            text += "\n\n";
        } else if (type == "line") {
            if (node.indent > 0) {
                text += " ".repeat(TAB_WIDTH * (node.indent - 1));
                // If there is no content in the list item, node.nodes will be empty.
                if (node.nodes.length == 0 || node.nodes[0].type != "numberList") text += "- ";
            }
            text += scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType);
            text += "\n";
            if (markdownType == MarkdownType.GitHub && node.indent == 0) {
                text += "\n";
            }
        } else if (type == "quote") {
            text += ">";
            text += scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType);
        } else if (type == "plain") {
            text += node.raw;
        } else if (type == "decoration") {
            if (node.rawDecos[0] == "*") {
                if (node.nodes.length == 1 && node.nodes[0].type == "image") {
                    text += scrapboxImageNodeToMarkdownText(
                        node.nodes[0],
                        scrapboxType,
                        markdownType,
                        node.rawDecos.length
                    );
                } else if (node.rawDecos.length == 1) {
                    text += "**" + scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType) + "**";
                } else {
                    const level = Math.max(1, 5 - node.rawDecos.length);
                    text +=
                        "#".repeat(level) + " " + scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType);
                }
            } else if (node.rawDecos[0] == "/") {
                text += "*" + scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType) + "*";
            } else if (node.rawDecos[0] == "-") {
                text += "~~" + scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType) + "~~";
            } else if (node.rawDecos[0] == "!" && scrapboxType == ScrapboxType.Minaminao) {
                text += scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType);
            } else {
                console.error(node);
                throw new Error();
            }
        } else if (type == "link") {
            if (node.pathType == "root") {
                text += "[" + node.href + "](https://scrapbox.io" + node.href + ")";
            } else if (node.pathType == "absolute") {
                if (node.content == "") {
                    text += node.raw;
                } else {
                    text += "[" + sanitizeLinkTitle(node.content) + "](" + node.href + ")";
                }
            } else if (node.pathType == "relative") {
                if (markdownType == MarkdownType.GitHub) {
                    text += "[" + sanitizeLinkTitle(node.href) + "](" + convertHref(node.href) + ")";
                } else if (markdownType == MarkdownType.Obsidian) {
                    text += "[[" + sanitizeFilename(node.href) + "]]";
                }
            } else {
                console.error(node);
                throw new Error();
            }
        } else if (type == "icon") {
            text += "(" + node.path + ")";
        } else if (type == "commandLine") {
            text += "`" + node.raw + "`";
        } else if (type == "image") {
            text += scrapboxImageNodeToMarkdownText(node, scrapboxType, markdownType);
        } else if (type == "strong") {
            text += "**" + scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType) + "**";
        } else if (type == "code") {
            text += "`" + node.text + "`";
        } else if (type == "codeBlock") {
            const indentSpaces = node.indent > 0 ? " ".repeat(TAB_WIDTH * (node.indent - 1)) : "";
            text += indentSpaces + "```" + node.fileName + "\n";
            text += indentSpaces + node.content.split("\n").join("\n" + indentSpaces) + "\n";
            text += indentSpaces + "```\n";
        } else if (type == "table") {
            // The indent is ignored.
            text += "\n";
            for (let i = 0; i < node.cells.length; i++) {
                const cell_line = node.cells[i];
                for (let j = 0; j < cell_line.length; j++) {
                    text += "|" + scrapboxNodesToMarkdownText(cell_line[j], scrapboxType, markdownType);
                }
                text += "|\n";
                if (i == 0) {
                    for (let j = 0; j < cell_line.length; j++) {
                        text += "|--";
                    }
                    text += "|\n";
                }
            }
        } else if (type == "formula") {
            text += "$" + node.formula + "$";
        } else if (type == "hashTag") {
            text += node.raw;
        } else if (type == "blank") {
            text += node.raw;
        } else if (type == "numberList") {
            text += node.rawNumber + ". " + scrapboxNodesToMarkdownText(node.nodes, scrapboxType, markdownType);
        } else {
            console.error(node);
            throw new Error();
        }
    }
    return text;
};

export const scrapboxToMarkdown = (text: string, scrapboxType: ScrapboxType, markdownType: MarkdownType) => {
    const nodes = parse(text);
    return scrapboxNodesToMarkdownText(nodes, scrapboxType, markdownType);
};
