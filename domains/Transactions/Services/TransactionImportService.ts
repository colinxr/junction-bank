import Papa from 'papaparse';
import { IMonthRepository } from '../../Months/IMonthRepository';
import { Month } from '../../Months/Month';
import { TransactionCSVRecord, TransactionImportDTO, ImportError } from '../DTOs/TransactionImportDTO';
import { TransactionType } from '../Entities/Transaction';

export class TransactionImportService {
  constructor(private monthRepository: IMonthRepository) {}

  /**
   * Parse CSV content and validate for transaction import
   */
  async parseCSV(
    csvContent: string, 
    clerkId: string,
    options: {
      headerMapping?: { [key: string]: string },
      validateCategories?: (categoryIds: number[]) => Promise<boolean[]>
    } = {}
  ): Promise<{ 
    validTransactions: TransactionImportDTO[], 
    errors: ImportError[] 
  }> {
    try {
      // Default header mapping (CSV column name to TransactionCSVRecord property)
      // Based on the actual data structure seen in logs
      const headerMapping = options.headerMapping || {
        'Date': 'date',
        'date': 'date',
        'Name': 'name',
        'name': 'name',
        'AMOUNT CAD': 'amount_cad',
        'Amount CAD': 'amount_cad',
        'amount_cad': 'amount_cad',
        'AMOUNT USD': 'amount_usd', 
        'Amount USD': 'amount_usd',
        'amount_usd': 'amount_usd',
        'CategoryId': 'category_id',
        'Category Id': 'category_id',
        'Category ID': 'category_id',
        'category_id': 'category_id',
        'notes': 'notes',
        'Notes': 'notes',
        'Type': 'type',
        'type': 'type'
      };

      // Check if input is multipart form-data and extract actual CSV content
      let cleanedContent = csvContent;
      if (csvContent.includes('WebKitFormBoundary')) {
        // Extract the actual CSV content from form data
        const lines = csvContent.split('\n');
        const csvLines = [];
        
        // Add headers manually - use exact case from original CSV
        csvLines.push('Date,Name,AMOUNT CAD,AMOUNT USD,Category Id,Notes,Type');
        
        // Clean up CSV content to ensure consistent field count
        let cleanLines = [];
        for (const line of lines) {
          // Skip form boundary lines and metadata
          if (line.includes('WebKitFormBoundary') || 
              line.includes('Content-Disposition') || 
              line.trim() === '') {
            continue;
          }
          
          // Process __parsed_extra content
          if (line.includes('__parsed_extra')) {
            continue; // Skip the line with __parsed_extra
          } else if (line.includes('[') && line.includes(']')) {
            // This might be the array content from __parsed_extra
            const arrayMatch = line.match(/\[(.*)\]/);
            if (arrayMatch && arrayMatch[1]) {
              try {
                const parts = arrayMatch[1].split(',').map(p => p.trim().replace(/^'|'$/g, ''));
                
                if (parts.length >= 3) {
                  // Assuming format: [name, empty, amount, category, ...]
                  let date = '';
                  const lineIndex = lines.indexOf(line);
                  if (lineIndex > 0) {
                    date = lines[lineIndex - 1].replace(/['"{}]/g, '').trim();
                  }
                  const name = parts[0];
                  const amount = parts[2];
                  const categoryId = parts[3] || '';
                  
                  csvLines.push(`${date},${name},${amount},,${categoryId},`);
                }
              } catch (err) {
                console.error('Error processing array content:', err);
              }
            }
          } else if (!line.startsWith('{') && !line.startsWith('}')) {
            // Regular CSV content lines
            csvLines.push(line);
          }
        }
        
        cleanedContent = csvLines.join('\n');
      } else {
        // For regular CSV input, normalize the field count
        const lines = csvContent.split('\n');
        const headerLine = lines[0];
        const expectedFieldCount = headerLine.split(',').length;
        
        console.log('Expected field count:', expectedFieldCount);
        console.log('Header line:', headerLine);
        
        const normalizedLines = [headerLine];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Simple CSV field count validation/normalization
          const fields = line.split(',');
          
          console.log(`Row ${i}: ${fields.length} fields - ${line}`);
          
          if (fields.length > expectedFieldCount) {
            // Too many fields - combine extra fields into the last expected field
            const normalFields = fields.slice(0, expectedFieldCount - 1);
            const extraFields = fields.slice(expectedFieldCount - 1);
            normalFields.push(extraFields.join(' '));
            normalizedLines.push(normalFields.join(','));
          } else if (fields.length < expectedFieldCount) {
            // Too few fields - add empty fields to match expected count
            while (fields.length < expectedFieldCount) {
              fields.push('');
            }
            normalizedLines.push(fields.join(','));
          } else {
            // Field count matches expected
            normalizedLines.push(line);
          }
        }
        
        cleanedContent = normalizedLines.join('\n');
        console.log('Cleaned content preview:', cleanedContent.substring(0, 500));
      }

      // Parse CSV with more lenient settings
      const parseOptions = {
        header: true,
        skipEmptyLines: true,
        comments: '#', // Skip lines starting with #
        dynamicTyping: false
      };
      
      const parseResult = Papa.parse<Record<string, string>>(cleanedContent, parseOptions);

      if (parseResult.errors && parseResult.errors.length > 0) {
        console.error('Papa Parse errors:', parseResult.errors);
      }

      const records: TransactionCSVRecord[] = [];
      const errors: ImportError[] = [];

      // Map CSV records to TransactionCSVRecord objects
      if (Array.isArray(parseResult.data)) {
        console.log('Parsed CSV data:', parseResult.data);
        console.log('Header mapping:', headerMapping);
        
        parseResult.data.forEach((row, index) => {
          if (!row || typeof row !== 'object') {
            console.error('Invalid row at index', index, row);
            return;
          }
          
          console.log(`Processing row ${index}:`, row);
          
          const record: Partial<TransactionCSVRecord> = {};
          
          // Skip content-type header row
          if (row.Date?.startsWith('Content-Type:') || row.date?.startsWith('Content-Type:')) {
            return;
          }
          
          // Skip header row if it got parsed as data
          if ((row.Date === 'Date' || row.date === 'date') && 
              (row.Name === 'Name' || row.name === 'name')) {
            return;
          }
          
          // Map fields using headerMapping
          for (const [csvHeader, recordField] of Object.entries(headerMapping)) {
            if (row[csvHeader] !== undefined) {
              record[recordField as keyof TransactionCSVRecord] = row[csvHeader];
              console.log(`Mapped ${csvHeader} -> ${recordField}: ${row[csvHeader]}`);
            }
          }
          
          console.log('Mapped record:', record);
          
          // Validate required fields
          if (!record.date || !record.name) {
            errors.push({
              row: index + 1, // +1 for header row
              message: 'Missing required fields (date, name, or amount_cad)',
              originalData: record as TransactionCSVRecord
            });
            return; // Skip this record
          }
          
          records.push(record as TransactionCSVRecord);
        });
        
        console.log('Final records:', records);
      } else {
        throw new Error('Papa Parse did not return an array of data');
      }

      // Process records into valid TransactionImportDTO objects
      const validTransactions: TransactionImportDTO[] = [];
      const pendingValidations: Promise<void>[] = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowIndex = i + 1; // +1 for header row
      
        const validation = this.processRecord(record, clerkId, rowIndex, options)
          .then(result => {
            if (result.valid) {
              validTransactions.push(result.transaction!);
            } else {
              errors.push(result.error!);
            }
          });
        
        pendingValidations.push(validation);
      }


      // Wait for all validations to complete
      await Promise.all(pendingValidations);

      console.log('Final validation results:', { validTransactions, errors });
      return { validTransactions, errors };
    } catch (err) {
      console.error('Error in parseCSV:', err);
      throw err;
    }
  }

  /**
   * Process a single CSV record into a valid TransactionImportDTO
   */
  private async processRecord(
    record: TransactionCSVRecord, 
    clerkId: string, 
    rowIndex: number,
    options: {
      validateCategories?: (categoryIds: number[]) => Promise<boolean[]>
    } = {}
  ): Promise<{ 
    valid: boolean, 
    transaction?: TransactionImportDTO, 
    error?: ImportError 
  }> {
    try {
      console.log(`Processing record ${rowIndex}:`, record);
      
      // Parse date
      const date = this.parseDate(record.date);
      if (!date) {
        console.log(`Invalid date for row ${rowIndex}: ${record.date}`);
        return {
          valid: false,
          error: {
            row: rowIndex,
            message: `Invalid date format: ${record.date}`,
            originalData: record
          }
        };
      }

      // Ensure at least one amount field is provided
      if (!record.amount_cad && !record.amount_usd) {
        return {
          valid: false,
          error: {
            row: rowIndex,
            message: 'At least one of amount_cad or amount_usd must be provided',
            originalData: record
          }
        };
      }

      // Parse CAD amount if available
      let amountCAD: number | undefined;
      if (record.amount_cad) {
        amountCAD = this.parseAmount(record.amount_cad);
        if (isNaN(amountCAD)) {
          return {
            valid: false,
            error: {
              row: rowIndex,
              message: `Invalid CAD amount format: ${record.amount_cad}`,
              originalData: record
            }
          };
        }
      }

      // Parse USD amount if available
      let amountUSD: number | undefined;
      if (record.amount_usd) {
        amountUSD = this.parseAmount(record.amount_usd);
        if (isNaN(amountUSD)) {
          return {
            valid: false,
            error: {
              row: rowIndex,
              message: `Invalid USD amount format: ${record.amount_usd}`,
              originalData: record
            }
          };
        }
      }

      // Determine transaction type based on amount sign (use whichever amount is available)
      const amount = amountCAD !== undefined ? amountCAD : (amountUSD || 0);
      let type = amount > 0 
        ? TransactionType.INCOME 
        : TransactionType.EXPENSE;

      // Override type if explicitly provided in CSV
      if (record.type) {
        const normalizedType = record.type.toLowerCase();
        if (normalizedType === 'income' || normalizedType === 'expense') {
          type = normalizedType === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE;
        }
      }

      // Normalize amount to positive value
      const normalizedAmountCAD = amountCAD !== undefined ? Math.abs(amountCAD) : undefined;
      const normalizedAmountUSD = amountUSD !== undefined ? Math.abs(amountUSD) : undefined;

      // Determine categoryId
      let categoryId: number;
      if (record.category_id) {
        categoryId = parseInt(record.category_id, 10);
        if (isNaN(categoryId)) {
          return {
            valid: false,
            error: {
              row: rowIndex,
              message: `Invalid category ID: ${record.category_id}`,
              originalData: record
            }
          };
        }
      } else {
        return {
          valid: false,
          error: {
            row: rowIndex,
            message: 'Missing category information',
            originalData: record
          }
        };
      }

      // Find or create month for the transaction date
      const monthNumber = date.getMonth() + 1; // JavaScript months are 0-indexed
      const year = date.getFullYear();
      
      let monthId: number;
      const existingMonth = await this.monthRepository.findByDate(monthNumber, year);
      
      if (existingMonth) {
        monthId = existingMonth.id!;
      } else {
        const month = Month.create({
          month: monthNumber,
          year,
          notes: undefined,
          totalIncome: 0,
          totalExpenses: 0
        });
        
        const newMonth = await this.monthRepository.store(month);
        monthId = newMonth.id!;
      }

      // Create valid transaction with proper typing
      const transaction: TransactionImportDTO = {
        clerkId,
        name: record.name,
        amountCAD: normalizedAmountCAD,
        amountUSD: normalizedAmountUSD,
        categoryId,
        notes: record.notes,
        type: type, // Use the processed type, not the raw record.type
        date,
        monthId
      };

      return { valid: true, transaction };
    } catch (error) {
      return {
        valid: false,
        error: {
          row: rowIndex,
          message: error instanceof Error ? error.message : 'Unknown error processing record',
          originalData: record
        }
      };
    }
  }

  /**
   * Parse date string into Date object
   */
  private parseDate(dateString: string): Date | null {
    // Define format (MM/DD/YYYY) for US format which matches the provided dates
    const usFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    
    const match = dateString.match(usFormat);
    if (match) {
      const [, monthStr, dayStr, yearStr] = match;
      const month = parseInt(monthStr, 10) - 1; // JS months are 0-indexed
      const day = parseInt(dayStr, 10);
      const year = parseInt(yearStr, 10);
      
      const date = new Date(year, month, day);
      
      // Check if valid date
      if (date.getFullYear() === year && 
          date.getMonth() === month && 
          date.getDate() === day) {
        return date;
      }
    }
    
    // Fall back to other formats if the US format doesn't match
    const otherFormats = [
      // ISO format (YYYY-MM-DD)
      { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, groups: [1, 2, 3], isIso: true },
      // European format (DD/MM/YYYY)
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, groups: [3, 2, 1] },
      // European format (DD.MM.YYYY)
      { regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, groups: [3, 2, 1] },
    ];

    for (const format of otherFormats) {
      const match = dateString.match(format.regex);
      if (match) {
        let year: number, month: number, day: number;
        
        if (format.isIso) {
          year = parseInt(match[format.groups[0]], 10);
          month = parseInt(match[format.groups[1]], 10) - 1;
          day = parseInt(match[format.groups[2]], 10);
        } else {
          year = parseInt(match[format.groups[0]], 10);
          month = parseInt(match[format.groups[1]], 10) - 1;
          day = parseInt(match[format.groups[2]], 10);
        }
        
        const date = new Date(year, month, day);
        
        // Check if valid date
        if (date.getFullYear() === year && 
            date.getMonth() === month && 
            date.getDate() === day) {
          return date;
        }
      }
    }
    
    // If no formats match, try built-in Date parsing
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Parse amount string into number
   */
  private parseAmount(amountString: string): number {
    // Remove currency symbols and thousands separators
    const cleaned = amountString.replace(/[$£€,\s]/g, '');
    return parseFloat(cleaned);
  }
} 