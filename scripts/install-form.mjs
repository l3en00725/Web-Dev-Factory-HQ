#!/usr/bin/env node
/**
 * Contact Form Installation Script
 * Interactive CLI for installing contact form templates
 */
import { parseArgs } from 'node:util';
import { readFile, cp, appendFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import prompts from 'prompts';
import chalk from 'chalk';

const { values } = parseArgs({
  options: {
    site: { type: 'string' },
    type: { type: 'string' }
  }
});

async function main() {
  console.log(chalk.blue.bold('\n📝 Contact Form Installation\n'));

  // Validate site exists
  if (!values.site) {
    console.error(chalk.red('❌ Error: --site flag is required'));
    console.log(chalk.gray('Usage: bun run install-form --site <site-name> [--type <form-type>]'));
    console.log(chalk.gray('Example: bun run install-form --site aveda-institute --type email-resend\n'));
    process.exit(1);
  }

  const sitePath = join(process.cwd(), 'sites', values.site);
  if (!existsSync(sitePath)) {
    console.error(chalk.red(`❌ Site not found: ${values.site}`));
    console.log(chalk.gray(`\nCreate it first: bun run new-site ${values.site}\n`));
    process.exit(1);
  }

  // Prompt for form type if not provided
  let formType = values.type;
  if (!formType) {
    const response = await prompts({
      type: 'select',
      name: 'formType',
      message: 'Which contact form integration?',
      choices: [
        { 
          title: 'Jobber via Zapier (Recommended for Jobber users)', 
          value: 'jobber-zapier',
          description: 'Best reliability, OAuth handled automatically, includes email backup' 
        },
        { 
          title: 'Email via Resend (Recommended for non-CRM users)', 
          value: 'email-resend',
          description: 'No CRM, just email notifications (100/day free)' 
        },
        { 
          title: 'Generic (No Integration)', 
          value: 'generic',
          description: 'Placeholder - add integration later' 
        }
      ]
    });
    
    if (!response.formType) {
      console.log(chalk.yellow('\nInstallation cancelled'));
      process.exit(0);
    }
    
    formType = response.formType;
  }

  console.log(chalk.blue(`\n📦 Installing ${formType} form...\n`));

  // Copy template files
  const templatePath = join(process.cwd(), 'templates/contact-forms', formType);
  const destComponentPath = join(sitePath, 'src/components/ContactForm.astro');
  const destApiPath = join(sitePath, 'src/pages/api');
  const destApiFile = join(destApiPath, 'submit-form.js');

  // Ensure api directory exists
  await mkdir(destApiPath, { recursive: true });

  // Copy ContactForm.astro
  await cp(
    join(templatePath, 'ContactForm.astro'),
    destComponentPath
  );
  console.log(chalk.green('✓ Installed ContactForm.astro → src/components/'));

  // Copy API route (submit-form.js)
  await cp(
    join(templatePath, 'submit-form.js'),
    destApiFile
  );
  console.log(chalk.green('✓ Installed API route → src/pages/api/submit-form.js'));

  // Prompt for credentials based on type
  console.log(chalk.blue('\n🔑 Configuration:\n'));

  const envPath = join(sitePath, '.env');
  
  // Ensure .env exists
  if (!existsSync(envPath)) {
    await appendFile(envPath, '# Environment Variables\n');
  }

  if (formType === 'jobber-zapier') {
    const creds = await prompts([
      {
        type: 'text',
        name: 'webhookUrl',
        message: 'Zapier webhook URL (or press Enter to add later):',
        validate: value => !value || value.startsWith('https://hooks.zapier.com') || value.startsWith('https://hooks.make.com') || 'Must be Zapier or Make webhook URL'
      },
      {
        type: 'password',
        name: 'resendKey',
        message: 'Resend API key (for email backup, or press Enter to add later):'
      },
      {
        type: 'text',
        name: 'contactEmail',
        message: 'Contact email address (where notifications are sent):',
        validate: value => !value || value.includes('@') || 'Must be valid email'
      }
    ]);
    
    let envContent = '\n# Jobber Zapier Integration\n';
    
    if (creds.webhookUrl) {
      envContent += `ZAPIER_WEBHOOK_URL=${creds.webhookUrl}\n`;
      console.log(chalk.green('✓ Added ZAPIER_WEBHOOK_URL'));
    } else {
      envContent += `ZAPIER_WEBHOOK_URL=\n`;
      console.log(chalk.yellow('⚠ Remember to add ZAPIER_WEBHOOK_URL to .env'));
    }
    
    if (creds.resendKey) {
      envContent += `RESEND_API_KEY=${creds.resendKey}\n`;
      console.log(chalk.green('✓ Added RESEND_API_KEY'));
    } else {
      envContent += `RESEND_API_KEY=\n`;
      console.log(chalk.yellow('⚠ Remember to add RESEND_API_KEY to .env'));
    }
    
    if (creds.contactEmail) {
      envContent += `CONTACT_EMAIL=${creds.contactEmail}\n`;
      console.log(chalk.green('✓ Added CONTACT_EMAIL'));
    } else {
      envContent += `CONTACT_EMAIL=\n`;
      console.log(chalk.yellow('⚠ Remember to add CONTACT_EMAIL to .env'));
    }
    
    await appendFile(envPath, envContent);
  }

  if (formType === 'email-resend') {
    const creds = await prompts([
      {
        type: 'password',
        name: 'resendKey',
        message: 'Resend API key (or press Enter to add later):'
      },
      {
        type: 'text',
        name: 'contactEmail',
        message: 'Contact email address (where notifications are sent):',
        validate: value => !value || value.includes('@') || 'Must be valid email'
      }
    ]);
    
    let envContent = '\n# Email via Resend\n';
    
    if (creds.resendKey) {
      envContent += `RESEND_API_KEY=${creds.resendKey}\n`;
      console.log(chalk.green('✓ Added RESEND_API_KEY'));
    } else {
      envContent += `RESEND_API_KEY=\n`;
      console.log(chalk.yellow('⚠ Remember to add RESEND_API_KEY to .env'));
    }
    
    if (creds.contactEmail) {
      envContent += `CONTACT_EMAIL=${creds.contactEmail}\n`;
      console.log(chalk.green('✓ Added CONTACT_EMAIL'));
    } else {
      envContent += `CONTACT_EMAIL=\n`;
      console.log(chalk.yellow('⚠ Remember to add CONTACT_EMAIL to .env'));
    }
    
    await appendFile(envPath, envContent);
  }

  if (formType === 'generic') {
    console.log(chalk.gray('No credentials needed for generic form'));
    console.log(chalk.gray('Add integration later by re-running this script'));
  }

  // Show README
  const readmePath = join(templatePath, 'README.md');
  const readme = await readFile(readmePath, 'utf-8');
  
  console.log(chalk.blue('\n📚 Setup Instructions:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(readme);
  console.log(chalk.gray('─'.repeat(60)));

  console.log(chalk.green('\n✅ Form installation complete!\n'));
  console.log(chalk.white.bold('Next steps:'));
  console.log(chalk.gray(`  1. Add <ContactForm /> to your contact page`));
  console.log(chalk.gray(`     Example: import ContactForm from '@/components/ContactForm.astro'`));
  console.log(chalk.gray(`  2. Test locally: cd sites/${values.site} && bun run dev`));
  console.log(chalk.gray(`  3. Submit test form and verify integration`));
  
  if (formType === 'jobber-zapier') {
    console.log(chalk.gray(`  4. Check Zapier task history and email inbox`));
  } else if (formType === 'email-resend') {
    console.log(chalk.gray(`  4. Check email inbox for notification`));
  } else {
    console.log(chalk.gray(`  4. Upgrade integration: bun run install-form --site ${values.site} --type [email-resend|jobber-zapier]`));
  }
  
  console.log(chalk.blue('\n📘 Decision Guide: templates/contact-forms/DECISION-GUIDE.md\n'));
}

main().catch(error => {
  console.error(chalk.red('\n❌ Installation failed:'), error.message);
  process.exit(1);
});

