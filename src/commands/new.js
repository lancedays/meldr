import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get the current directory of the module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeProject() {
    console.log(chalk.cyan('🚀 Welcome to Meldr Project Initialization! 🚀'));

    // Prompt the user for the project name
    const { projectName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: chalk.yellow('Enter a name for your project:'),
            default: 'MyMeldrSite',
        },
    ]);

    const projectDir = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectDir)) {
        console.error(chalk.red(`❌ Error: Directory ${chalk.bold(projectName)} already exists.`));
        return;
    }

    console.log(chalk.blue(`📁 Creating project directory: ${chalk.underline(projectDir)}`));
    fs.ensureDirSync(projectDir);

    console.log(chalk.green('✍️  Creating meldr.config.json configuration file...'));
    fs.writeFileSync(
        path.join(projectDir, 'meldr.config.json'),
        JSON.stringify(
            {
                inputDir: './markdown',
                outputDir: './out',
                template: 'default',  // Placeholder for future template handling
                ignoreFiles: [],
            },
            null,
            2
        )
    );

    const markdownDir = path.join(projectDir, 'markdown');
    console.log(chalk.blue(`📁 Creating markdown directory: ${chalk.underline(markdownDir)}`));
    fs.ensureDirSync(markdownDir);

    const templatesDir = path.join(__dirname, '../templates');
    console.log(chalk.magenta('🖼️  Copying template files...'));
    fs.copySync(templatesDir, markdownDir);

    console.log(chalk.green(`\n✅ Success! Project ${chalk.bold(projectName)} has been initialized.`));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.yellow(`1. cd ${projectName}`));
    console.log(chalk.yellow('2. meldr build'));
    console.log(chalk.yellow('3. meldr serve'));
    console.log(chalk.cyan('\nHappy creating with Meldr! 🎉'));
}

export { initializeProject };