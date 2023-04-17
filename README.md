# scrapbox-to-markdown

A CLI application to convert Scrapbox text to Markdown (GitHub/Obsidian-flavored) using [progfay/scrapbox-parser](https://github.com/progfay/scrapbox-parser).


# Install & Usage

Clone this repo and then execute the following commands.

```
pnpm global-install
scrapbox-to-markdown examples/example.txt
```

or

```
pnpm tsc
node build/index.js examples/example.txt
```

`s2m` is an alias for `scrapbox-to-markdown`.

For Obsidian markdown:
```
scrapbox-to-markdown examples/example.txt --obsidian
```

If you want to output to a file:
```
scrapbox-to-markdow examples/example.txt -o examples/example.md
```

Tips
- `pbpaste > /tmp/s2m | s2m /tmp/s2m | pbcopy`
- `pbpaste > /tmp/s2m | s2m /tmp/s2m --obsidian | tail -n +2 | pbcopy`

## Example

[example.txt](src/example.txt) based on https://scrapbox.io/help/syntax is converted to [example.md](src/example.md) as follows:

```
Syntax
[https://gyazo.com/0f82099330f378fe4917a1b4a5fe8815]

[[Internal Links]] (linking to another page on scrapbox)
	`[link]` ⇒ [Link]

[[External  Links]] (linking to another web page)
 `http://google.com` ⇒ http://google.com
	`[http://google.com Google]` ⇒ [http://google.com Google]
or
 `[Google http://google.com]` ⇒ [Google http://google.com]

...
```

is converted to

```md
# Syntax

![](https://gyazo.com/0f82099330f378fe4917a1b4a5fe8815/thumb/1000)



**Internal Links** (linking to another page on scrapbox)

- `[link]` ⇒ [Link](Link)


**External  Links** (linking to another web page)

- `http://google.com` ⇒ [](http://google.com)
- `[http://google.com Google]` ⇒ [Google](http://google.com)
or

- `[Google http://google.com]` ⇒ [Google](http://google.com)

...
```
