import OpenAI from 'openai';
import { outputLogger } from './outputLogger';
import fs from 'fs/promises';
import path from 'path';

const OPENAI_MODEL = 'gpt-4o';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function logApiDetails(type: string, details: any): Promise<void> {
  try {
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

export async function askOpenAI(prompt: string, input: string): Promise<string> {
  console.log(`Making API request to OpenAI with model ${OPENAI_MODEL}`);
  console.log(`API Key present: ${Boolean(OPENAI_API_KEY)}`);
  console.log(`OPENAI_API_KEY (masked): ${OPENAI_API_KEY ? OPENAI_API_KEY.slice(0, 5) + '...' : 'undefined'}`);

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  await logApiDetails('request', {
    provider: 'openai',
    model: OPENAI_MODEL,
    prompt,
    input
  });

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: input }
      ]
    });
    await logApiDetails('response', {
      status: 200,
      data: response
    });
    const content = response.choices?.[0]?.message?.content?.trim?.() || '';
    return content;
  } catch (error: any) {
    console.error('OpenAI API request failed:');
    console.error('Error stack:', error?.stack);
    console.error('Error details:', error);
    await logApiDetails('error', {
      message: error instanceof Error ? error.message : String(error),
      stack: error?.stack,
      error
    });
    await outputLogger.saveOutput('api-error',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : String(error),
        stack: error?.stack,
        error
      }, null, 2)
    );
    throw error;
  }
}
