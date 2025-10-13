import { NextRequest } from 'next/server';
import formidable from 'formidable';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';

export interface FormData {
  fields: { [key: string]: string[] };
  files: { [key: string]: formidable.File[] };
}

/**
 * Parse form data by writing to temp file, since Next.js request streams aren't directly
 * compatible with formidable's expected Node.js request format
 */
export async function parseFormData(req: NextRequest): Promise<FormData> {
  // Read the request body
  const data = await req.arrayBuffer();
  const buffer = Buffer.from(data);
  
  // Create a temporary file path
  const tempFilePath = join('/tmp', `upload-${randomUUID()}`);
  
  // Write the data to a temporary file
  await writeFile(tempFilePath, buffer);
  
  // Create empty fields and files to be populated
  const fields: { [key: string]: string[] } = {};
  const files: { [key: string]: formidable.File[] } = {};
  
  // Parse any multipart form data from headers
  const contentType = req.headers.get('content-type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    // This would require a more complex implementation to fully parse 
    // multipart form data without the actual Node request object
    
    // For simplicity, we'll treat the uploaded file as a CSV file directly
    files.file = [{
      filepath: tempFilePath,
      originalFilename: 'import.csv',
      newFilename: tempFilePath,
      mimetype: 'text/csv',
      size: buffer.length,
      toJSON: () => ({})
    } as any];
  } else {
    // For non-multipart, we can extract JSON or form data
    if (contentType.includes('application/json')) {
      try {
        const jsonData = JSON.parse(buffer.toString());
        for (const key in jsonData) {
          fields[key] = [jsonData[key].toString()];
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }
  
  return { fields, files };
}

/**
 * Read a file as text from formidable file object
 */
export async function readFileAsText(file: formidable.File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Use Node.js fs module to read the file
      const fs = require('fs');
      fs.readFile(file.filepath, 'utf8', (err: any, data: string) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  });
} 