import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { outputLogger } from './outputLogger';
import { askOpenAI } from './askOpenAI';
import axios from 'axios';

const OPENAI_MODEL = 'gpt-4o';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Type definition for Axios error
interface AxiosErrorResponse {
  response?: {
    status?: number;
    statusText?: string;
    data?: any;
  };
  message?: string;
}

/**
 * Log API request and response details
 */
async function logApiDetails(type: string, details: any): Promise<void> {
  try {
    // Remove sensitive information
    if (type === 'request' && details.headers && details.headers.Authorization) {
      details.headers.Authorization = 'Bearer ********';
    }
    const logDir = path.join(process.cwd(), 'outputs', 'api-logs');
    await fs.mkdir(logDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `api_${type}_${timestamp}.json`;
    const filePath = path.join(logDir, filename);
    await fs.writeFile(filePath, JSON.stringify(details, null, 2), 'utf-8');
    console.log(`API ${type} logged to ${filePath}`);
  } catch (error) {
    console.error(`Error logging API ${type}:`, error);
  }
}

export async function askLLM(
  prompt: string,
  input: string,
  _options?: { provider?: 'ollama' | 'openai' }
): Promise<string> {
  const provider = _options?.provider || 'ollama';
  return ''
  if (provider === 'openai') {
    return askOpenAI(prompt, input);
  }
  // Default: use local Ollama (qwen3:4b)
  try {
    const response = await axios.post(
      'http://localhost:11434/api/chat',
      {
        model: 'qwen3:4b',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: input }
        ]
      },
      { headers: { 'Content-Type': 'application/json' }, responseType: 'stream' }
    );
    let result = '';
    const stream = response.data as NodeJS.ReadableStream;
    for await (const chunk of stream) {
      const lines = chunk.toString().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          if (obj.message && obj.message.content) {
            result += obj.message.content;
          }
        } catch (e) {
          // 跳过解析失败的行
        }
      }
    }
    return result.trim();
  } catch (error: any) {
    console.error('Ollama API request failed:', error);
    throw error;
  }
}
