import fs from 'fs';
import path from 'path';
import { Reward } from './types';

export function loadRewardsFromMDX(): Reward[] {
  const filePath = path.join(process.cwd(), 'data', 'rewards.mdx');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Split by new line, filter out empty lines, and map to objects
  return fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((text, index) => ({
      id: index + 1,
      text
    }));
}
