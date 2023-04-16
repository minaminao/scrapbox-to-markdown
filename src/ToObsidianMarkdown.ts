import { parse, Page, Node } from "@progfay/scrapbox-parser";

const TAB_WIDTH = 4;

const scrapboxNodesToObsidianMarkdownText = (nodes: Page | Node[]) => {
    let text = "";
    for (const node of nodes) {
        const type = node["type"];
        if (type == "title") {
            text += "# " + node["text"];
            if ("nodes" in node)
                throw new Error();
            text += "\n\n";
        }
        else if (type == "line") {
            const indent = node["indent"];
            if (indent > 0) {
                text += " ".repeat(TAB_WIDTH * (indent - 1));
                text += "- ";
            }
            text += scrapboxNodesToObsidianMarkdownText(node["nodes"]);
            text += "\n";
        }
        else if (type == "quote") {
            text += ">";
            text += scrapboxNodesToObsidianMarkdownText(node["nodes"]);
        }
        else if (type == "plain") {
            text += node["raw"];
        }
        else if (type == "decoration") {
            if (node["rawDecos"][0] == "*") {
                if (node["rawDecos"].length == 1) {
                    text += "**" + scrapboxNodesToObsidianMarkdownText(node["nodes"]) + "**";
                } else {
                    const level = Math.max(1, 5 - node["rawDecos"].length);
                    text += "#".repeat(level) + " " + scrapboxNodesToObsidianMarkdownText(node["nodes"]);
                }
            } else if (node["rawDecos"][0] == "/") {
                text += "*" + scrapboxNodesToObsidianMarkdownText(node["nodes"]) + "*";
            } else if (node["rawDecos"][0] == "-") {
                text += "~~" + scrapboxNodesToObsidianMarkdownText(node["nodes"]) + "~~";
            } else {
                throw new Error();
            }
        }
        else if (type == "link") {
            if (node["pathType"] == "root") {
                text += "[" + node["href"] + "](https://scrapbox.io" + node["href"] + ")";
            } else if (node["pathType"] == "absolute") {
                text += "[" + node["content"] + "](" + node["href"] + ")";
            } else if (node["pathType"] == "relative") {
                text += "[[" + node["href"] + "]]";
            } else {
                throw new Error();
            }
        }
        else if (type == "icon") {
            text += "(" + node["path"] + ")";
        }
        else if (type == "commandLine") {
            text += "`" + node["raw"] + "`";
        }
        else if (type == "image") {
            text += "![](" + node["src"] + ")";
        }
        else if (type == "strong") {
            text += "**" + scrapboxNodesToObsidianMarkdownText(node["nodes"]) + "**";
        }
        else if (type == "code") {
            text += "`" + node["text"] + "`";
        }
        else if (type == "codeBlock") {
            // The indent is ignored.
            // TODO 
            text += "```\n";
            text += node["content"]
            text += "\n```\n";
        }
        else if (type == "table") {
            // The indent is ignored.
            text += "\n";
            for (let i = 0; i < node["cells"].length; i++) {
                const cell_line = node["cells"][i];
                for (let j = 0; j < cell_line.length; j++) {
                    text += "|" + scrapboxNodesToObsidianMarkdownText(cell_line[j]);
                }
                text += "|\n";
                if (i == 0) {
                    for (let j = 0; j < cell_line.length; j++) {
                        text += "|--"
                    }
                    text += "|\n";
                }
            }
        }
        else if (type == "formula") {
            text += "$" + node["formula"] + "$";
        }
        else if (type == "hashTag") {
            text += node["raw"];
        }
        else if (type == "blank") {
            text += node["raw"];
        }
        else {
            console.error(node);
            throw new Error();
        }
    }
    return text;
}

export const scrapboxToObsidianMarkdown = (text: string) => {
    const nodes = parse(text);
    return scrapboxNodesToObsidianMarkdownText(nodes);
}
