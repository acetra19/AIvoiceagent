import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils';

class PromptService {
  private promptCache = new Map<string, string>();

  getSystemPrompt(promptName: string = 'sarah_plumber_de'): string {
    if (this.promptCache.has(promptName)) {
      return this.promptCache.get(promptName)!;
    }

    const promptPath = join(__dirname, '..', 'prompts', `${promptName}.txt`);

    try {
      const content = readFileSync(promptPath, 'utf-8');
      this.promptCache.set(promptName, content);
      logger.info(`Prompt loaded: ${promptName}`);
      return content;
    } catch (err) {
      logger.error(`Failed to load prompt: ${promptName}`, { error: err });
      throw new Error(`Prompt "${promptName}" not found at ${promptPath}`);
    }
  }

  clearCache(): void {
    this.promptCache.clear();
  }
}

export const promptService = new PromptService();
