#!/usr/bin/env node
import prompts from 'prompts';
import chalk from 'chalk';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const execAsync = promisify(exec);

async function main() {
  console.log(chalk.blue.bold('\n📝 Contact Form Decision Helper\n'));

  const answers = await prompts([
    {
      type: 'confirm',
      name: 'usesJobber',
      message: 'Does this client use Jobber for service management?'
    },
    {
      type: prev => prev ? 'confirm' : null,
      name: 'canAffordZapier',
      message: 'Can they afford $30/month for Zapier? (Recommended)',
      initial: true
    },
    {
      type: (prev, values) => !values.usesJobber ? 'confirm' : null,
      name: 'needsCRM',
      message: 'Do they use any other CRM system?'
    },
    {
      type: (prev, values) => !values.usesJobber && !values.needsCRM ? 'select' : null,
      name: 'emailProvider',
      message: 'Which email provider do they prefer?',
      choices: [
        { title: 'Resend (Recommended)', value: 'resend' },
        { title: 'SendGrid', value: 'sendgrid' }
      ]
    }
  ]);

  // Determine recommendation
  let recommendation;
  let reasoning;
  let monthlyCost;
  let setupTime;

  if (answers.usesJobber && answers.canAffordZapier) {
    recommendation = 'jobber-zapier';
    reasoning = 'Best reliability, OAuth handled automatically, easy for client to modify';
    monthlyCost = '$30 (Zapier)';
    setupTime = '10 minutes';
  } else if (answers.usesJobber && !answers.canAffordZapier) {
    recommendation = 'jobber-oauth';
    reasoning = 'No monthly fee, but requires technical support for OAuth token management';
    monthlyCost = '$0';
    setupTime = '30 minutes';
  } else if (!answers.usesJobber && answers.needsCRM) {
    recommendation = 'generic';
    reasoning = 'Use generic form and add custom webhook to their CRM system';
    monthlyCost = '$0';
    setupTime = '5 minutes (+ custom integration)';
  } else if (answers.emailProvider === 'resend') {
    recommendation = 'email-resend';
    reasoning = 'Simple email notifications, 100/day free tier, clean API';
    monthlyCost = '$0 (free tier)';
    setupTime = '5 minutes';
  } else if (answers.emailProvider === 'sendgrid') {
    recommendation = 'email-sendgrid';
    reasoning = 'Alternative email service, robust delivery infrastructure';
    monthlyCost = '$0 (free tier)';
    setupTime = '5 minutes';
  } else {
    recommendation = 'generic';
    reasoning = 'Client needs haven\'t been decided yet';
    monthlyCost = '$0';
    setupTime = '2 minutes';
  }

  console.log(chalk.green.bold('\n✨ Recommendation:\n'));
  console.log(chalk.white(`  Form Type: ${chalk.cyan.bold(recommendation)}`));
  console.log(chalk.gray(`  Reason: ${reasoning}`));
  console.log(chalk.gray(`  Monthly Cost: ${monthlyCost}`));
  console.log(chalk.gray(`  Setup Time: ${setupTime}\n`));

  // Show what they'll need
  console.log(chalk.blue('📋 What you\'ll need:\n'));
  
  if (recommendation === 'jobber-zapier') {
    console.log(chalk.gray('  • Zapier account (zapier.com)'));
    console.log(chalk.gray('  • Jobber account (client\'s credentials)'));
    console.log(chalk.gray('  • Resend account (resend.com) for email backup'));
  } else if (recommendation === 'jobber-oauth') {
    console.log(chalk.gray('  • Jobber Developer App credentials'));
    console.log(chalk.gray('  • Client ID and Client Secret from developer.getjobber.com'));
  } else if (recommendation === 'email-resend') {
    console.log(chalk.gray('  • Resend account (resend.com)'));
    console.log(chalk.gray('  • Domain verified (or use resend.dev for testing)'));
  } else if (recommendation === 'email-sendgrid') {
    console.log(chalk.gray('  • SendGrid account (sendgrid.com)'));
    console.log(chalk.gray('  • API key with sending permissions'));
  } else {
    console.log(chalk.gray('  • Nothing! Generic form just logs to console'));
  }

  console.log('');

  const { proceed } = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: `Install ${recommendation} form now?`,
    initial: true
  });

  if (proceed) {
    const { siteName } = await prompts({
      type: 'text',
      name: 'siteName',
      message: 'Site name (folder in /sites/):',
      validate: value => {
        if (!value) return 'Site name required';
        const sitePath = resolve(`sites/${value}`);
        if (!existsSync(sitePath)) {
          return `Site not found: sites/${value}. Create it first with: bun run new-site ${value}`;
        }
        return true;
      }
    });

    if (siteName) {
      console.log(chalk.blue(`\nInstalling ${recommendation} for ${siteName}...\n`));
      try {
        const { stdout } = await execAsync(`bun run scripts/install-form.mjs --site ${siteName} --type ${recommendation}`);
        console.log(stdout);
        console.log(chalk.green('\n✅ Form installed successfully!\n'));
        console.log(chalk.blue('📚 Next steps:\n'));
        console.log(chalk.gray(`  1. Add credentials to sites/${siteName}/.env`));
        console.log(chalk.gray(`  2. Add <ContactForm /> to your contact page`));
        console.log(chalk.gray(`  3. Test: cd sites/${siteName} && bun run dev\n`));
      } catch (error) {
        console.error(chalk.red('\n❌ Installation failed:'), error.message);
        console.log(chalk.yellow('\nTry running manually:\n'));
        console.log(chalk.gray(`  bun run install-form --site ${siteName} --type ${recommendation}\n`));
      }
    }
  } else {
    console.log(chalk.yellow('\nNo problem! Run this helper anytime:\n'));
    console.log(chalk.gray('  bun run choose-form\n'));
    console.log(chalk.blue('Or install directly:\n'));
    console.log(chalk.gray(`  bun run install-form --site <site-name> --type ${recommendation}\n`));
  }

  // Show decision guide link
  console.log(chalk.blue('📖 For more details, see:\n'));
  console.log(chalk.gray('  templates/contact-forms/DECISION-GUIDE.md\n'));
}

main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});

