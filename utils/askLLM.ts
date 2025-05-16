import { askOpenAI } from './askOpenAI.ts';
import { askOllama } from './askOllama.ts';

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
  const model = _options?.model || 'gemma3:4b' ||'qwen3:4b';
  return askOllama(prompt, input, model);
}
