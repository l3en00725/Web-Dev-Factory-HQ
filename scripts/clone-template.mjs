#!/usr/bin/env node
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import prompts from 'prompts';
import chalk from 'chalk';

const execAsync = promisify(exec);

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    template: { type: 'string', default: 'client-base' }
  }
});

if (!values.name) {
  console.error('❌ Error: --name flag is required');
  console.log('Usage: bun run scripts/clone-template.mjs --name <site-name> [--template <template-name>]');
  process.exit(1);
}

const sourcePath = resolve(`templates/${values.template}`);
const targetPath = resolve(`sites/${values.name}`);

if (!existsSync(sourcePath)) {
  console.error(`❌ Error: Template not found: ${sourcePath}`);
  console.error('Available templates should be in /templates/ directory');
  process.exit(1);
}

if (existsSync(targetPath)) {
  console.error(`❌ Error: Site directory already exists: ${targetPath}`);
  process.exit(1);
}

console.log(`📋 Cloning template "${values.template}" to sites/${values.name}...`);

try {
  await mkdir(targetPath, { recursive: true });
  await cp(sourcePath, targetPath, { recursive: true });
  
  // Update package.json with new site name
  const packageJsonPath = `${targetPath}/package.json`;
  if (existsSync(packageJsonPath)) {
    const { readFile } = await import('node:fs/promises');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    packageJson.name = values.name;
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }
  
  console.log(chalk.green(`✅ Created ${values.name} from ${values.template} template`));
  
  // Optional form installation
  console.log(chalk.blue('\n📝 Contact Form Setup\n'));

  const { needsForm } = await prompts({
    type: 'confirm',
    name: 'needsForm',
    message: 'Install contact form integration?',
    initial: true
  });

  if (needsForm) {
    const { formType } = await prompts({
      type: 'select',
      name: 'formType',
      message: 'Which integration does this client need?',
      choices: [
        { 
          title: 'Jobber via Zapier (Recommended)', 
          value: 'jobber-zapier',
          description: 'Best reliability, OAuth handled automatically'
        },
        { 
          title: 'Email via Resend', 
          value: 'email-resend',
          description: 'No CRM, just email notifications (100/day free)'
        },
        { 
          title: 'Generic Placeholder', 
          value: 'generic',
          description: 'Add integration later'
        },
        { 
          title: 'Skip for now', 
          value: null 
        }
      ]
    });

    if (formType) {
      console.log(chalk.blue(`\nInstalling ${formType} form...`));
      try {
        await execAsync(`bun run scripts/install-form.mjs --site ${values.name} --type ${formType}`);
        console.log(chalk.green('✓ Form installed successfully'));
      } catch (error) {
        console.error(chalk.red('✗ Form installation failed:'), error.message);
        console.log(chalk.yellow('You can install it later with: bun run install-form'));
      }
    }
  }
  
  console.log(chalk.blue(`\n📦 Next steps:`));
  console.log(chalk.gray(`   cd sites/${values.name}`));
  console.log(chalk.gray(`   bun install`));
  console.log(chalk.gray(`   bun run dev`));
  
} catch (err) {
  console.error(chalk.red(`❌ Failed to clone template: ${err.message}`));
  process.exit(1);
}

