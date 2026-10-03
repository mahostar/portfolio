import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = path.resolve(import.meta.dirname, '..');
const directory = path.join(root, 'src/content/projects');
const projects = fs.readdirSync(directory).filter((file) => file.endsWith('.mdx')).sort().map((file) => {
  const { data, content } = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
  return { data, body: content };
});
fs.writeFileSync(path.join(root, 'src/content/bundled-projects.json'), JSON.stringify({ projects, hasCv: fs.existsSync(path.join(root, 'public/cv.pdf')) }, null, 2) + '\n');
console.log(`Bundled ${projects.length} projects for deployment.`);
