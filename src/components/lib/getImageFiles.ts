import fs from 'fs';
import path from 'path';

export function getImageFiles() {
  const directory = path.join(process.cwd(), 'public', 'ribxz_pics');
  const fileNames = fs.readdirSync(directory);
  return fileNames.filter(file => file.endsWith('.png'));
}


export async function GET() {
  const imageFiles = getImageFiles();
  return Response.json({ imageFiles });
}