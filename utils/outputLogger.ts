/*
MIT License
Copyright (c) 2025
*/

import fs from 'fs/promises';
import path from 'path';

/**
 * Simple output logger for MCP tool responses
 */
class OutputLogger {
  private outputDir: string;

  constructor(baseDir: string = 'outputs') {
    this.outputDir = path.join(process.cwd(), baseDir);
    this.ensureOutputDirExists();
  }

  /**
   * Ensure the output directory exists
   */
  private async ensureOutputDirExists(): Promise<void> {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  /**
   * Save tool output to a file
   * @param toolName - Name of the tool (ba, tl, dev, qa)
   * @param output - Tool output to save
   * @returns Path to the saved file
   */
  public async saveOutput(toolName: string, output: string): Promise<string> {
    const toolDir = path.join(this.outputDir, toolName);
    await fs.mkdir(toolDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${toolName}_${timestamp}.txt`;
    const filePath = path.join(toolDir, filename);

    await fs.writeFile(filePath, output, 'utf-8');
    console.log(`Output saved to ${filePath}`);
    
    return filePath;
  }
}

// Export singleton instance
export const outputLogger = new OutputLogger();
