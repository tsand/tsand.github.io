import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import {unified} from 'unified'

const textToHTML = async (input) => {
    const file = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeSanitize)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(input);

    return String(file);
}

export default textToHTML;
