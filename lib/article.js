// An article is a .txt file sitting next to its .html page:
//   Title: ...          sets the page and document title
//   Date: ...           shown under the title
//   Description: ...    one line summary, used by the index and the meta tag
//   ## Heading          sections (### and #### for deeper ones)
//   - item / 1. item    lists
//   > quoted line       blockquote
//   Remark: ...         paragraph set aside, with the label picked out
//   $$ ... $$           display equation, alone on its line or fenced by bare $$
//   \[ ... \]           display equation, the same but in LaTeX delimiters
//   ```                 fences a code block
//   ![caption](src)     image with an optional caption
//   ---                 horizontal rule
// Inline: $math$ or \(math\), `code`, **bold**, *italic*, [text](url).
// Blank lines separate blocks, consecutive lines join into one paragraph.
// Inside math, ASCII shorthands expand (<= becomes \le) and a doubled capital
// becomes a blackboard letter (\RR becomes \mathbb{R}).

const FIELD = /^(Title|Date|Description): (.*)$/;
// an aside, labelled where it opens, so the label is dropped from the text
const REMARK = /^Remark:\s*/;
const ESCAPES = {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"};

// longest first, so <=> is not read as <= followed by a stray >
const SHORTHANDS = [
    [/<=>/g, "\\iff"],
    [/<->/g, "\\leftrightarrow"],
    [/<=/g, "\\le"],
    [/>=/g, "\\ge"],
    [/>>/g, "\\gg"],
    [/!=/g, "\\ne"],
    [/~=/g, "\\approx"],
    [/=>/g, "\\implies"],
    [/->/g, "\\to"],
    [/\.\.\./g, "\\dots"],
];

// display math may be written either way, so both open a block
const DISPLAY = [["$$", "$$"], ["\\[", "\\]"]];
// every delimiter pair, held aside by parseInline; $$ before $ so it wins
const MATH = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([\s\S]+?\\\)/g;

function escapeHTML(s){
    return s.replace(/[&<>"]/g, (c) => ESCAPES[c]);
}

// only called on a delimited math span, so prose keeps its arrows
function expandMath(s){
    for (const [pattern, command] of SHORTHANDS){
        // the trailing space keeps the command from running into what follows
        s = s.replace(pattern, `${command} `);
    }
    return s.replace(/\\([A-Z])\1(?![A-Za-z])/g, "\\mathbb{$1}");
}

function parseInline(s){
    const spans = [];
    const hold = (html) => {
        spans.push(html);
        return `\x00${spans.length - 1}\x00`;
    };
    // math and code are held aside so escaping and markdown cannot mangle them
    s = s.replace(MATH, (m) => hold(escapeHTML(expandMath(m))));
    s = s.replace(/`([^`]+)`/g, (m, code) => hold(`<code>${escapeHTML(code)}</code>`));
    s = escapeHTML(s);
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2">$1</a>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return s.replace(/\x00(\d+)\x00/g, (m, i) => spans[i]);
}

function setField(name, value){
    if (name == "Title"){
        document.title = value;
        document.getElementById("title").textContent = value;
    }else if (name == "Date"){
        document.getElementById("date").textContent = value;
    }else{
        const tag = document.querySelector("meta[name=description]");
        if (tag) tag.content = value;
    }
}

function parse(data){
    const lines = data.split("\n");
    const html = [];
    var para = [];
    var list = "";

    function flushPara(){
        if (para.length){
            const text = para.join(" ");
            const match = text.match(REMARK);
            if (match){
                const body = parseInline(text.slice(match[0].length));
                html.push(`<p class="remark"><span class="remark-label">Remark</span>${body}</p>`);
            }else{
                html.push(`<p>${parseInline(text)}</p>`);
            }
            para = [];
        }
    }

    function closeList(){
        if (list){
            html.push(`</${list}>`);
            list = "";
        }
    }

    function openList(tag){
        flushPara();
        if (list != tag){
            closeList();
            html.push(`<${tag}>`);
            list = tag;
        }
    }

    function closeBlock(){
        flushPara();
        closeList();
    }

    for (var i = 0; i < lines.length; i++){
        const line = lines[i].trim();
        var match;
        if (line == ""){
            closeBlock();
        }else if (match = line.match(FIELD)){
            setField(match[1], match[2].trim());
        }else if (line.startsWith("```")){
            closeBlock();
            const code = [];
            for (i++; i < lines.length && !lines[i].trim().startsWith("```"); i++){
                code.push(lines[i]);
            }
            html.push(`<pre><code>${escapeHTML(code.join("\n"))}</code></pre>`);
        }else if (match = DISPLAY.find(([open]) => line.startsWith(open))){
            closeBlock();
            const [open, close] = match;
            const math = [line];
            // the closer may be on this line, otherwise read until it shows up
            if (!line.slice(open.length).includes(close)){
                for (i++; i < lines.length && !lines[i].includes(close); i++){
                    math.push(lines[i].trim());
                }
                math.push(i < lines.length ? lines[i].trim() : close);
            }
            html.push(escapeHTML(expandMath(math.join(" "))));
        }else if (line == "---"){
            closeBlock();
            html.push("<hr />");
        }else if (match = line.match(/^(#{1,4})\s+(.*)$/)){
            closeBlock();
            // the title is the page's h1, so sections start at h2
            const level = Math.min(Math.max(match[1].length, 2), 4);
            html.push(`<h${level}>${parseInline(match[2])}</h${level}>`);
        }else if (match = line.match(/^!\[(.*)\]\((.*)\)$/)){
            closeBlock();
            const caption = match[1] == "" ? "" : `<figcaption>${parseInline(match[1])}</figcaption>`;
            html.push(`<figure><img src="${escapeHTML(match[2])}" alt="${escapeHTML(match[1])}" />${caption}</figure>`);
        }else if (line.startsWith(">")){
            closeBlock();
            const quote = [];
            for (; i < lines.length && lines[i].trim().startsWith(">"); i++){
                quote.push(lines[i].trim().replace(/^>\s?/, ""));
            }
            i--;
            html.push(`<blockquote><p>${parseInline(quote.join(" "))}</p></blockquote>`);
        }else if (match = line.match(/^[-*]\s+(.*)$/)){
            openList("ul");
            html.push(`<li>${parseInline(match[1])}</li>`);
        }else if (match = line.match(/^\d+[.)]\s+(.*)$/)){
            openList("ol");
            html.push(`<li>${parseInline(match[1])}</li>`);
        }else{
            para.push(line);
        }
    }
    closeBlock();
    document.getElementById("article-body").innerHTML = html.join("\n");

    if (window.MathJax && window.MathJax.typesetPromise){
        MathJax.typesetClear();
        MathJax.typesetPromise().then(reveal).catch((err) => {
            console.log(err.message);
            reveal();
        });
    }else{
        reveal();
    }
}

// the article is hidden until the math is laid out, so the page does not reflow
function reveal(){
    document.getElementById("article-container").classList.add("loaded");
}

async function load(){
    const response = await fetch(window.location.pathname.replace(/\.html?$/, "") + ".txt");
    if (!response.ok){
        document.title = "Not found";
        document.getElementById("title").textContent = "Article not found";
        reveal();
        return;
    }
    parse(await response.text());
}

// the fields at the top of an article, read by the index without parsing the body
function header(data){
    const fields = {};
    for (const line of data.split("\n")){
        const match = line.match(FIELD);
        if (match){
            fields[match[1]] = match[2].trim();
        }else if (line.trim() != ""){
            break;
        }
    }
    return fields;
}

// articles is [{file: "name-without-extension", tags: ["Math"]}, ...], newest first
async function loadIndex(articles){
    const tiles = await Promise.all(articles.map(async (article) => {
        const response = await fetch(`./${article.file}.txt`);
        if (!response.ok){
            console.log(`missing article: ${article.file}`);
            return "";
        }
        const fields = header(await response.text());
        const tags = (article.tags || []).map((tag) => `<div class="tag">${escapeHTML(tag)}</div>`).join("");
        return `<a class="article-tile" href="./${article.file}.html">
    <div class="article-title">${escapeHTML(fields["Title"] || article.file)}</div>
    <div class="article-date">${escapeHTML(fields["Date"] || "")}</div>
    <div class="article-description">${escapeHTML(fields["Description"] || "")}</div>
    ${tags == "" ? "" : `<div class="tag-container">${tags}</div>`}
</a>`;
    }));
    document.getElementById("article-body").innerHTML = tiles.join("\n");
    reveal();
}
