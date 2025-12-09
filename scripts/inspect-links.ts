import * as cheerio from 'cheerio';

async function main() {
  const html = await (await fetch('https://bluelawns.com')).text();
  const $ = cheerio.load(html);
  $('a').each((i, el) => {
    console.log($(el).text().trim(), '->', $(el).attr('href'));
  });
}
main();
