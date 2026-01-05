import * as fs from 'fs';

export const writeJson = (filePath: string, data: unknown): void =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

export const readJson = <T>(filePath: string): T =>
  JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
