import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import { unified } from "unified";

let highlightLoaded = false;

const textToHTML = async (input) => {
    // If input contains ``` tags load css if we haven't already
    if (!highlightLoaded && input.includes("```")) {
        loadCSS("./assets/code.css");
        highlightLoaded = true;
    }


    const file = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(input);

    return String(file);
};

function loadCSS(filename) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = filename;
    document.getElementsByTagName("head")[0].appendChild(link);
}

export default textToHTML;
