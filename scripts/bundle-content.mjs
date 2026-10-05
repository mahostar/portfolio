import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');
const directory = path.join(root, 'src/content/projects');
const projects = fs.readdirSync(directory).filter((file) => file.endsWith('.mdx')).sort().map((file) => {
  const { data, content } = matter(fs.readFileSync(path.join(directory, file), 'utf8'));
  return { data, body: content };
});
fs.writeFileSync(path.join(root, 'src/content/bundled-projects.json'), JSON.stringify({ projects, hasCv: fs.existsSync(path.join(root, 'public/cv.pdf')) }, null, 2) + '\n');
console.log(`Bundled ${projects.length} projects for deployment.`);

// Serve matching PDF.js assets locally; regenerate with the installed version.
const pdfjs = path.join(root, 'node_modules/pdfjs-dist');
const pdfAssets = path.join(root, 'public/pdfjs');
fs.mkdirSync(pdfAssets, { recursive: true });
fs.copyFileSync(path.join(pdfjs, 'legacy/build/pdf.worker.min.mjs'), path.join(pdfAssets, 'pdf.worker.legacy.min.mjs'));
for (const folder of ['cmaps', 'standard_fonts', 'wasm']) {
  fs.cpSync(path.join(pdfjs, folder), path.join(pdfAssets, folder), { recursive: true });
}

// Keep the standalone pre-hydration script and its TypeScript policy in sync.
const policy = fs.readFileSync(path.join(root, 'src/lib/welcome-policy.ts'), 'utf8');
const entrypoint = policy.indexOf('// Browser entrypoint');
if (entrypoint < 0) throw new Error('Welcome startup entrypoint marker is missing.');
const startup = policy.slice(0, entrypoint) + '\ninitializeWelcomeDocument();';
const { outputText } = ts.transpileModule(startup, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } });
fs.writeFileSync(path.join(root, 'public/welcome-startup.js'), outputText);
