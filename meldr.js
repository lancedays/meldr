#!/usr/bin/env node

import { initializeProject } from './src/commands/new.js';
import { buildSite } from './src/commands/build.js';

const args = process.argv.slice(2);

if (args[0] === 'new') {
    initializeProject();
} else if (args[0] === 'build') {
    buildSite();
} else if (args[0] === 'serve') {
    buildSite({ watch: true });
} else {
    console.log("Unknown command. Available commands: 'new', 'build', 'serve'");
}
