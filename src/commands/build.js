import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import liveServer from 'live-server';
import { parseMarkdown } from '../modules/markdownParser.js';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

function applyTemplate(content) {
    const template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Meldr Site</title>
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            {{content}}
        </body>
        </html>
    `;
    return template.replace('{{content}}', content);
}

async function buildSite(options = {}) {
    const startTime = performance.now();
    const configPath = path.join(process.cwd(), 'meldr.config.json');
    console.log(chalk.blue(`📚 Loading configuration from ${chalk.underline(configPath)}`));

    if (!fs.existsSync(configPath)) {
        console.error(chalk.red('❌ No meldr.config.json found in the current directory.'));
        return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const inputDir = path.resolve(config.inputDir);
    const outputDir = path.resolve(config.outputDir);

    console.log(chalk.green(`📂 Input directory: ${chalk.underline(inputDir)}`));
    console.log(chalk.green(`📂 Output directory: ${chalk.underline(outputDir)}`));

    fs.ensureDirSync(outputDir);

    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.md'));
    console.log(chalk.yellow(`🗂️  Markdown files to process: ${chalk.bold(files.length)}`));

    let totalChars = 0;
    let totalWords = 0;

    for (const file of files) {
        const filePath = path.join(inputDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(chalk.cyan(`📄 Processing: ${chalk.underline(filePath)}`));

        const fileStats = getFileStats(content);
        totalChars += fileStats.chars;
        totalWords += fileStats.words;

        const htmlContent = parseMarkdown(content, path.dirname(filePath));
        const finalHtml = applyTemplate(htmlContent);

        const outputFilePath = path.join(outputDir, file.replace('.md', '.html'));
        fs.writeFileSync(outputFilePath, finalHtml);
        console.log(chalk.green(`✅ Generated: ${chalk.underline(outputFilePath)}`));
    }

    const endTime = performance.now();
    const buildTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log(chalk.magenta('\n🚀 Build completed successfully!'));
    console.log(chalk.magenta('📊 Build Statistics:'));
    console.log(chalk.magenta(`   📁 Files processed: ${chalk.bold(files.length)}`));
    console.log(chalk.magenta(`   🔤 Total characters: ${chalk.bold(totalChars)}`));
    console.log(chalk.magenta(`   📝 Total words: ${chalk.bold(totalWords)}`));
    console.log(chalk.magenta(`   ⏱️  Build time: ${chalk.bold(buildTime)} seconds`));

    if (options.watch) {
        console.log(chalk.blue('\n👀 Watching for changes...'));
        chokidar.watch(inputDir).on('change', (filePath) => {
            console.log(chalk.yellow(`🔄 File changed: ${chalk.underline(filePath)}`));
            buildSite();
        });

        console.log(chalk.blue('🌐 Starting live server...'));
        liveServer.start({
            root: outputDir,
            file: "index.html",
            open: true,
            wait: 1000,
            logLevel: 0,
        });
    }
}

function getFileStats(content) {
    const chars = content.length;
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    return { chars, words };
}

export { buildSite };