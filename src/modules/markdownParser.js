import path from 'path';
import fs from 'fs-extra';

const emojiMap = {
    ':joy:': '😂',
    ':smile:': '😊',
    ':heart:': '❤️',
    // Add more emojis as needed
};

export function parseMarkdown(content, basePath = '') {
    let parsedContent = '';
    const lines = content.split('\n');
    const context = {
        footnotes: {},
        footnoteCounter: 1,
        inCodeBlock: false,
        codeLanguage: '',
        inList: false,
        listType: '',
        listIndent: 0,
        inTable: false,
        tableHeader: [],
        tableAlignments: [],
        tableRows: []
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        parsedContent += parseLine(line, context, basePath);
    }

    parsedContent += renderFootnotes(context.footnotes);

    return parsedContent.trim();
}

function parseLine(line, context, basePath) {
    if (context.inCodeBlock) {
        return handleCodeBlockContent(line, context);
    }

    if (line.trim() === '') {
        return handleEmptyLine(context);
    }

    if (line.includes('$insert=')) return handleInsert(line, basePath);
    if (line.match(/^\[\^[\w]+\]:/)) return handleFootnoteDefinition(line, context);
    if (line.match(/^#{1,6}\s/)) return handleHeading(line);
    if (line.match(/^\|.*\|$/)) return handleTableRow(line, context);
    if (line.match(/^(\s*)-\s/) || line.match(/^(\s*)\d+\.\s/)) return handleListItem(line, context);
    if (line.match(/^-{3,}$/)) return '<hr>\n';
    if (line.match(/^\>\s/)) return handleBlockquote(line);
    if (line.trim().startsWith('```')) return handleCodeBlockStart(line, context);

    return handleRegularLine(line, context);
}

function handleInsert(line, basePath) {
    const insertMatch = line.match(/\$insert=([a-zA-Z0-9_-]+\.md)/);
    if (insertMatch) {
        const fileToInsert = insertMatch[1];
        const insertPath = path.resolve(basePath, fileToInsert);
        if (fs.existsSync(insertPath)) {
            const insertContent = fs.readFileSync(insertPath, 'utf-8');
            return parseMarkdown(insertContent, path.dirname(insertPath));
        } else {
            console.warn(`File not found for $insert: ${insertPath}`);
            return `<p>Error: File not found for insertion (${fileToInsert})</p>\n`;
        }
    }
    return '';
}

function handleFootnoteDefinition(line, context) {
    const footnoteMatch = line.match(/^\[\^([\w]+)\]:\s*(.*)/);
    if (footnoteMatch) {
        context.footnotes[footnoteMatch[1]] = footnoteMatch[2];
    }
    return '';
}

function handleHeading(line, context) {
    const level = line.match(/^#+/)[0].length;
    const content = line.slice(level).trim();
    return `<h${level}>${handleInlineElements(content, context)}</h${level}>\n`;
}

function handleTableRow(line, context) {
    const cells = line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());

    if (!context.inTable) {
        context.inTable = true;
        context.tableHeader = cells;
        return '';
    }

    if (line.includes('-|-')) {
        context.tableAlignments = cells.map(cell => {
            if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
            if (cell.endsWith(':')) return 'right';
            if (cell.startsWith(':')) return 'left';
            return '';
        });
        return '';
    }

    context.tableRows.push(cells);

    // If this is the last row, render the entire table
    if (!line.endsWith('|')) {
        const tableHtml = renderTable(context);
        context.inTable = false;
        context.tableHeader = [];
        context.tableAlignments = [];
        context.tableRows = [];
        return tableHtml;
    }

    return '';
}

function renderTable(context) {
    let tableHtml = '<table>\n<thead>\n<tr>\n';
    context.tableHeader.forEach((cell, index) => {
        const alignment = context.tableAlignments[index] ? ` style="text-align: ${context.tableAlignments[index]};"` : '';
        tableHtml += `<th${alignment}>${escapeHtml(cell)}</th>\n`;
    });
    tableHtml += '</tr>\n</thead>\n<tbody>\n';

    context.tableRows.forEach(row => {
        tableHtml += '<tr>\n';
        row.forEach((cell, index) => {
            const alignment = context.tableAlignments[index] ? ` style="text-align: ${context.tableAlignments[index]};"` : '';
            tableHtml += `<td${alignment}>${escapeHtml(cell)}</td>\n`;
        });
        tableHtml += '</tr>\n';
    });

    tableHtml += '</tbody>\n</table>\n';
    return tableHtml;
}

function handleListItem(line, context) {
    const indent = line.match(/^\s*/)[0].length;
    const isOrdered = line.match(/^\s*\d+\.\s/) !== null;
    const content = line.replace(/^\s*(?:-|\d+\.)\s/, '');

    let output = '';

    if (!context.inList || indent !== context.listIndent || (isOrdered && context.listType === 'ul') || (!isOrdered && context.listType === 'ol')) {
        if (context.inList) {
            output += `</${context.listType}>\n`;
        }
        context.listType = isOrdered ? 'ol' : 'ul';
        output += `<${context.listType}>\n`;
        context.inList = true;
        context.listIndent = indent;
    }

    output += `<li>${handleInlineElements(content, context)}</li>\n`;

    return output;
}

function handleEmptyLine(context) {
    let output = '';
    if (context.inList) {
        output += `</${context.listType}>\n`;
        context.inList = false;
        context.listIndent = 0;
    }
    return output;
}

function handleBlockquote(line, context) {
    return `<blockquote>${handleInlineElements(line.slice(2), context)}</blockquote>\n`;
}

function handleCodeBlockStart(line, context) {
    context.inCodeBlock = true;
    context.codeLanguage = line.slice(3).trim();
    return `<pre><code class="language-${context.codeLanguage}">`;
}

function handleCodeBlockContent(line, context) {
    if (line.trim() === '```') {
        context.inCodeBlock = false;
        return '</code></pre>\n';
    }
    return escapeHtml(line) + '\n';
}

function handleRegularLine(line, context) {
    return `<p>${handleInlineElements(line, context)}</p>\n`;
}

function handleInlineElements(text, context) {
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
    text = text.replace(/==(.*?)==/g, '<mark>$1</mark>');
    text = text.replace(/\^(.*?)\^/g, '<sup>$1</sup>');
    text = text.replace(/~(.*?)~/g, '<sub>$1</sub>');
    text = text.replace(/!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g, '<img alt="$1" src="$2" />');
    text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    text = replaceFootnotes(text, context);
    text = replaceEmojis(text);
    return text;
}

function replaceFootnotes(text, context) {
    return text.replace(/\[\^(\w+)\]/g, (match, footnoteId) => {
        if (context.footnotes.hasOwnProperty(footnoteId)) {
            return `<sup id="fnref:${footnoteId}"><a href="#fn:${footnoteId}" class="footnote-ref">${context.footnoteCounter++}</a></sup>`;
        }
        return match;
    });
}

function replaceEmojis(text) {
    return text.replace(/:([\w-]+):/g, (match, emojiName) => {
        return emojiMap[match] || match;
    });
}

function renderFootnotes(footnotes) {
    if (Object.keys(footnotes).length === 0) return '';

    let footnotesHtml = '<hr>\n<section class="footnotes">\n<ol>\n';
    for (const [id, text] of Object.entries(footnotes)) {
        footnotesHtml += `<li id="fn:${id}">${handleInlineElements(text, { footnotes: {}, footnoteCounter: 1 })} <a href="#fnref:${id}" class="footnote-backref">↩</a></li>\n`;
    }
    footnotesHtml += '</ol>\n</section>\n';
    return footnotesHtml;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Export any additional functions that might be useful for testing or extending functionality
export {
    handleInsert,
    handleFootnoteDefinition,
    handleHeading,
    handleTableRow,
    handleListItem,
    handleBlockquote,
    handleCodeBlockStart,
    handleCodeBlockContent,
    handleRegularLine,
    handleInlineElements,
    replaceFootnotes,
    replaceEmojis,
    renderFootnotes,
    escapeHtml
};