import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

async function logApiDetails(type: string, details: any): Promise<void> {
  try {
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

export async function askOllama(prompt: string, input: string, model: string = 'qwen3:4b'): Promise<string> {
  try {
    const start = Date.now();
    const response = await axios.post(
      'http://localhost:11434/api/chat',
      {
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: input }
        ]
      },
      { headers: { 'Content-Type': 'application/json' }, responseType: 'stream', timeout: 120000 }
    );
    await logApiDetails('request', {
      provider: 'ollama',
      model,
      prompt,
      input
    });
    await logApiDetails('response', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    if (response.status !== 200) {
      throw new Error(`Ollama API request failed: ${response.statusText} (Status: ${response.status})`);
    }
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
          // skip parse error
        }
      }
    }
    console.log(`Ollama stream completed in ${Date.now() - start} ms`);
    return result.trim();
  } catch (error: any) {
    console.error('Ollama API request failed:', error);
    throw error;
  }
}
