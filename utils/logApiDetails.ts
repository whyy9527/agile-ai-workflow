import fs from 'fs/promises';
import path from 'path';

export async function logApiDetails(type: string, details: any): Promise<void> {
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
