import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { outputLogger } from './outputLogger';
import { askOpenAI } from './askOpenAI';
import axios from 'axios';
import { askOllama } from './askOllama';

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
    const safeDetails = { ...details };
    if (safeDetails.data && typeof safeDetails.data === 'object') {
      safeDetails.data = '[stream/circular omitted]';
    }
    const logDir = path.join(process.cwd(), 'outputs', 'api-logs');
    await fs.mkdir(logDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `api_${type}_${timestamp}.json`;
    const filePath = path.join(logDir, filename);
    await fs.writeFile(filePath, JSON.stringify(safeDetails, null, 2), 'utf-8');
    console.log(`API ${type} logged to ${filePath}`);
  } catch (error) {
    console.error(`Error logging API ${type}:`, error);
  }
}

export async function askLLM(
  prompt: string,
  input: string,
  _options?: { provider?: 'ollama' | 'openai', model?: string }
): Promise<string> {
  const provider = _options?.provider || 'ollama';
  if (provider === 'openai') {
    return askOpenAI(prompt, input);
  }
  // 支持自定义 Ollama 模型，默认 qwen3:4b，可传 gemma3:4b
  const model = _options?.model || 'qwen3:4b';
  return askOllama(prompt, input, model);
}
