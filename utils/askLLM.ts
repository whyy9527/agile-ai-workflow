import axios from 'axios';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function askLLM(
  prompt: string,
  input: string,
  _options?: { provider?: 'ollama' | 'openai' }
): Promise<string> {
  const response = await axios.post(
    OPENAI_URL,
    {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: input }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const data = response.data as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content?.trim?.() || '';
}
