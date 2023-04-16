# scrapbox-to-markdown

A CLI application to convert Scrapbox text to Markdown using [progfay/scrapbox-parser](https://github.com/progfay/scrapbox-parser).

## Usage
```
pnpm tsc
node build/index.js example.txt
```

## Example

[example.txt](example.txt) based on https://scrapbox.io/help/syntax is converted to [example-result.md](example-result.md) as follows:

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
