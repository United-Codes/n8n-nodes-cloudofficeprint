// prints the newest CHANGELOG.md section, used as the github release body
import { readFileSync } from 'node:fs';

const version = process.argv[2];
const section = readFileSync('CHANGELOG.md', 'utf8').split(/^## /m)[1] ?? '';
const heading = section.split('\n')[0].trim();
const body = section.split('\n').slice(1).join('\n').trim();

if (!body) {
	console.error('release-notes: no section in CHANGELOG.md - add one under a "## <version>" heading before releasing');
	process.exit(1);
}

if (version && !heading.startsWith(version)) {
	console.error(`release-notes: newest CHANGELOG.md section is "${heading}", expected ${version} - add this release's entry first`);
	process.exit(1);
}

process.stdout.write(body);
