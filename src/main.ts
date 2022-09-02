#!/usr/bin/env node
import { parse } from "@progfay/scrapbox-parser";
import * as fs from "fs"

if (process.argv.length != 3) {
  console.log("Usage: npx ts-node src/main.ts <FILENAME>")
  process.exit(1);
}
const filename = process.argv[2];

const TAB_WIDTH = 4;

const convertHref = (href: string) => {
  return href.replace(" ", "_");
}

const nodesToText = (nodes: any) => {
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
      text += nodesToText(node["nodes"]);
      text += "\n";
      if (indent == 0) {
        text += "\n";
      }
    }
    else if (type == "quote") {
      text += ">";
      text += nodesToText(node["nodes"]);
    }
    else if (type == "plain") {
      text += node["raw"];
    }
    else if (type == "decoration") {
      if (node["rawDecos"][0] == "*") {
        text += "**" + nodesToText(node["nodes"]) + "**";
      } else if (node["rawDecos"][0] == "/") {
        text += "*" + nodesToText(node["nodes"]) + "*";
      } else if (node["rawDecos"][0] == "-") {
        text += "~~" + nodesToText(node["nodes"]) + "~~";
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
        text += "[" + node["href"] + "](" + convertHref(node["href"]) + ")";
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
      text += "**" + nodesToText(node["nodes"]) + "**";
    }
    else if (type == "code") {
      text += "`" + node["text"] + "`";
    }
    else if (type == "codeBlock") {
      // The indent is ignored.
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
          text += "|" + nodesToText(cell_line[j]);
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
    else {
      console.log(node);
      throw new Error();
    }
  }
  return text;
}

const scrapboxToMarkdown = (text: string) => {
  const nodes = parse(text);
  return nodesToText(nodes);
}

fs.readFile(filename, 'utf8', (err, text) => {
  if (err) {
    throw new Error("File not found.");
  }
  else {
    console.log(scrapboxToMarkdown(text));
  }
});
