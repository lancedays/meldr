import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Get the current directory of the module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultThemes = {
    light: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
    },
    dark: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        primaryColor: '#17a2b8',
        secondaryColor: '#6c757d',
        fontFamily: 'Arial, sans-serif',
    },
    nature: {
        backgroundColor: '#f1f8e9',
        textColor: '#333333',
        primaryColor: '#4caf50',
        secondaryColor: '#8bc34a',
        fontFamily: 'Verdana, sans-serif',
    },
    // Add more pre-defined themes here
};

async function initializeProject() {
    console.log(chalk.cyan('🚀 Welcome to Meldr Project Initialization! 🚀'));

    // Prompt the user for the project name and theme
    const { projectName, theme } = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: chalk.yellow('Enter a name for your project:'),
            default: 'MyMeldrSite',
        },
        {
            type: 'list',
            name: 'theme',
            message: chalk.yellow('Choose a theme for your site:'),
            choices: Object.keys(defaultThemes),
            default: 'light',
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

    console.log(chalk.green('🎨 Creating meldr.style.json configuration file...'));
    fs.writeFileSync(
        path.join(projectDir, 'meldr.style.json'),
        JSON.stringify(
            {
                theme: theme,
                customColors: {},
                fontFamily: defaultThemes[theme].fontFamily,
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

    console.log(chalk.green('📝 Creating .gitignore file...'));
    const gitignoreContent = `
# Dependencies
node_modules/

# Build output
out/

# Environment variables
.env

# OS generated files
.DS_Store
Thumbs.db

# Editor directories and files
.idea/
.vscode/
.vs
*.swp
*.swo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

`;
    fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignoreContent.trim());

    console.log(chalk.green(`\n✅ Success! Project ${chalk.bold(projectName)} has been initialized with the ${chalk.bold(theme)} theme.`));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.yellow(`1. cd ${projectName}`));
    console.log(chalk.yellow('2. meldr build'));
    console.log(chalk.yellow('3. meldr serve'));
    console.log(chalk.cyan('\nTo customize your theme, edit the meldr.style.json file.'));
    console.log(chalk.cyan('Happy creating with Meldr! 🎉'));
}

export { initializeProject };