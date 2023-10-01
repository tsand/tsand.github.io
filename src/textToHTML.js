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

// const copyButtonLabel = "Copy";

// // Function to add the copy button to a pre block
// function addCopyButton(block) {
//   if (!block.querySelector('button') && navigator.clipboard) { // check if button exists and browser supports Clipboard API
//     let button = document.createElement("button");
//     button.innerText = copyButtonLabel;
//     block.appendChild(button);

//     button.addEventListener("click", async () => {
//       await copyCode(block);
//     });
//   }
// }

// async function copyCode(block) {
//   let code = block.querySelector("code");
//   let text = code ? code.innerText : block.innerText; // fall back to block content if no <code> child

//   await navigator.clipboard.writeText(text);
// }

// // Add copy buttons to initial <pre> elements
// let blocks = document.querySelectorAll("pre");
// blocks.forEach(addCopyButton);

// // Set up a MutationObserver to monitor for new <pre> tags added
// const observer = new MutationObserver(mutations => {
//   mutations.forEach(mutation => {
//     if (mutation.addedNodes.length) {
//       mutation.addedNodes.forEach(node => {
//         if (node.nodeName === "PRE") {
//           addCopyButton(node);
//         } else if (node.querySelectorAll) { // In case multiple nodes are added at once
//           let blocks = node.querySelectorAll("pre");
//           blocks.forEach(addCopyButton);
//         }
//       });
//     }
//   });
// });

// // Start observing the document with the configured parameters
// observer.observe(document.body, { childList: true, subtree: true });


export default textToHTML;
