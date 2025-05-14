import Papa from 'papaparse';
import { IMonthRepository } from '../../Months/IMonthRepository';
import { Month } from '../../Months/Month';
import { TransactionCSVRecord, TransactionImportDTO, ImportError } from '../TransactionImportDTO';
import { TransactionType } from '../Transaction';

export class TransactionImportService {
  constructor(private monthRepository: IMonthRepository) {}

  /**
   * Parse CSV content and validate for transaction import
   */
  async parseCSV(
    csvContent: string, 
    userId: string,
    options: {
      headerMapping?: { [key: string]: string },
      validateCategories?: (categoryIds: number[]) => Promise<boolean[]>
    } = {}
  ): Promise<{ 
    validTransactions: TransactionImportDTO[], 
    errors: ImportError[] 
  }> {
    // Default header mapping (CSV column name to TransactionCSVRecord property)
    const headerMapping = options.headerMapping || {
      'Date': 'date',
      'Description': 'name',
      'Amount': 'amount',
      'Category': 'category',
      'Category ID': 'categoryId',
      'Notes': 'notes',
      'Type': 'type'
    };

    // Parse CSV
    const parseResult = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    const records: TransactionCSVRecord[] = [];
    const errors: ImportError[] = [];

    // Map CSV records to TransactionCSVRecord objects
    parseResult.data.forEach((row, index) => {
      const record: Partial<TransactionCSVRecord> = {};
      
      // Map fields using headerMapping
      for (const [csvHeader, recordField] of Object.entries(headerMapping)) {
        if (row[csvHeader] !== undefined) {
          record[recordField as keyof TransactionCSVRecord] = row[csvHeader];
        }
      }
      
      // Validate required fields
      if (!record.date || !record.name || !record.amount) {
        errors.push({
          row: index + 1, // +1 for header row
          message: 'Missing required fields (date, name, or amount)',
          originalData: record as TransactionCSVRecord
        });
        return; // Skip this record
      }
      
      records.push(record as TransactionCSVRecord);
    });

    // Process records into valid TransactionImportDTO objects
    const validTransactions: TransactionImportDTO[] = [];
    const pendingValidations: Promise<void>[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowIndex = i + 1; // +1 for header row
      
      const validation = this.processRecord(record, userId, rowIndex, options)
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

    return { validTransactions, errors };
  }

  /**
   * Process a single CSV record into a valid TransactionImportDTO
   */
  private async processRecord(
    record: TransactionCSVRecord, 
    userId: string, 
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
      // Parse date
      const date = this.parseDate(record.date);
      if (!date) {
        return {
          valid: false,
          error: {
            row: rowIndex,
            message: `Invalid date format: ${record.date}`,
            originalData: record
          }
        };
      }

      // Parse amount
      const amount = this.parseAmount(record.amount);
      if (isNaN(amount)) {
        return {
          valid: false,
          error: {
            row: rowIndex,
            message: `Invalid amount format: ${record.amount}`,
            originalData: record
          }
        };
      }

      // Determine transaction type
      let type = record.type?.toLowerCase() === 'income' 
        ? TransactionType.INCOME 
        : TransactionType.EXPENSE;
      
      // If amount is positive and no type specified, assume income
      if (!record.type && amount > 0) {
        type = TransactionType.INCOME;
      }
      // If amount is negative and no type specified, assume expense
      else if (!record.type && amount < 0) {
        type = TransactionType.EXPENSE;
      }

      // Normalize amount to positive value (type determines if it's income/expense)
      const normalizedAmount = Math.abs(amount);

      // Determine categoryId
      let categoryId: number;
      if (record.categoryId) {
        categoryId = parseInt(record.categoryId, 10);
        if (isNaN(categoryId)) {
          return {
            valid: false,
            error: {
              row: rowIndex,
              message: `Invalid category ID: ${record.categoryId}`,
              originalData: record
            }
          };
        }
      } else if (record.category) {
        // This would require category name to ID mapping
        // For now, return error that category ID is required
        return {
          valid: false,
          error: {
            row: rowIndex,
            message: 'Category ID is required for import',
            originalData: record
          }
        };
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

      // Validate category existence if validation function provided
      if (options.validateCategories) {
        const [categoryExists] = await options.validateCategories([categoryId]);
        if (!categoryExists) {
          return {
            valid: false,
            error: {
              row: rowIndex,
              message: `Category with ID ${categoryId} does not exist`,
              originalData: record
            }
          };
        }
      }

      // Find or create month for the transaction date
      const monthNumber = date.getMonth() + 1; // JavaScript months are 0-indexed
      const year = date.getFullYear();
      
      let monthId: number;
      const existingMonth = await this.monthRepository.findByDate(monthNumber, year);
      
      if (existingMonth) {
        monthId = existingMonth.id!;
      } else {
        // Create new month using Month.create
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

      // Create valid transaction
      const transaction: TransactionImportDTO = {
        userId,
        name: record.name,
        amountCAD: normalizedAmount,
        categoryId,
        notes: record.notes,
        type,
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
    // Try different date formats
    const formats = [
      // ISO format (YYYY-MM-DD)
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // US format (MM/DD/YYYY)
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // European format (DD/MM/YYYY)
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // European format (DD.MM.YYYY)
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        let year: number, month: number, day: number;
        
        if (format === formats[0]) { // ISO
          [, year, month, day] = match.map(Number);
        } else if (format === formats[1]) { // US
          [, month, day, year] = match.map(Number);
        } else { // European
          [, day, month, year] = match.map(Number);
        }
        
        // Adjust month for JavaScript's 0-indexed months
        month -= 1;
        
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