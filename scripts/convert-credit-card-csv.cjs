#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

/**
 * Converts multiple CSV formats to Junction Bank import format
 *
 * Supported formats:
 * 1. Credit Card (CAD): Description, Type, Card Holder Name, Date, Time, Amount
 * 2. Bank Card (USD): POSTED DATE, DESCRIPTION, AMOUNT, CURRENCY, TRANSACTION REFERENCE NUMBER, FI TRANSACTION REFERENCE, TYPE, CREDIT/DEBIT, ORIGINAL AMOUNT
 *
 * Output format: Date, Name, Amount CAD, Amount USD, Category Id, Notes, Type
 */

// Format detection
function detectFormat(headers) {
  const headerSet = new Set(headers.map((h) => h.toLowerCase()));

  if (
    headerSet.has("posted date") &&
    headerSet.has("description") &&
    headerSet.has("amount")
  ) {
    return "bank-card";
  }
  if (
    headerSet.has("description") &&
    headerSet.has("type") &&
    headerSet.has("amount")
  ) {
    return "credit-card";
  }
  return "unknown";
}

// Base parser class
class BaseParser {
  detectCategory(description) {
    const desc = description.toLowerCase();

    if (desc.includes("docs")) {
      return 23; // ☕︎ Coffee
    }
    if (desc.includes("uber")) {
      return 28; // 🚗 Transportation
    }
    if (desc.includes("cvs")) {
      return 29; // 🏥 Health & Personal Care
    }
    if (desc.includes("pharm")) {
      return 29; // 🏥 Health & Personal Care
    }
    if (desc.includes("dollarama")) {
      return 26; // 🏠 House
    }
    if (desc.includes("baller")) {
      return 26; // 🏠 House
    }
    if (desc.includes("hardware")) {
      return 26; // 🏠 House
    }
    if (desc.includes("tinos")) {
      return 30; // 🍴 Eating Out
    }
    if (desc.includes("tasty")) {
      return 30; // 🍴 Eating Out
    }
    if (desc.includes("venmo")) {
      if (desc.includes("cashout")) {
        return 34; // 💰Income
      } else {
        return 33; // 🎲 Other
      }
    }
    if (desc.includes("amazon")) {
      return 33; // 🎲 Other
    }
    if (desc.includes("feliz")) {
      return 23; // ☕︎ Coffee
    }
    if (desc.includes("bru")) {
      return 23; // ☕︎ Coffee
    }
    if (desc.includes("coffeebar")) {
      return 23; // ☕︎ Coffee
    }
    if (desc.includes("albertsons")) {
      return 24; // 🛒 Groceries
    }
    if (desc.includes("trader")) {
      return 24; // 🛒 Groceries
    }
    if (desc.includes("csc")) {
      return 22; // 💵 Bills
    }
    if (desc.includes("serviceworks")) {
      return 22; // 💵 Bills
    }
    if (desc.includes("ultra")) {
      return 22; // 💵 Bills
    }
    if (desc.includes("plainview")) {
      return 22; // 💵 Bills
    }
    if (desc.includes("property")) {
      return 21; // 🏘️ Rent
    }
    if (desc.includes("managem")) {
      return 21; // 🏘️ Rent
    }
    if (desc.includes("vetrxdirect")) {
      return 35; // 😼 Bessie
    }
    if (desc.includes("stripe")) {
      return 34; // 💰Income
    }
    if (desc.includes("tiktok")) {
      return 40; // 🛍️ Clothes
    }

    return "-"; // Default category ID
  }

  parseAmount(amountStr) {
    // Remove currency symbols and commas, then parse
    const cleaned = amountStr.replace(/[$£€,\s]/g, "");
    return parseFloat(cleaned);
  }

  formatDate(dateStr, timeStr = "") {
    // Handle various date formats
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      // Try different date formats
      const formats = [
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
      ];

      for (const format of formats) {
        const match = dateStr.match(format);
        if (match) {
          if (format.source.includes("YYYY-MM-DD")) {
            return `${match[1]}-${match[2].padStart(
              2,
              "0"
            )}-${match[3].padStart(2, "0")}`;
          } else {
            return `${match[1].padStart(2, "0")}/${match[2].padStart(2, "0")}/${
              match[3]
            }`;
          }
        }
      }

      console.warn(`Could not parse date: ${dateStr}`);
      return dateStr; // Return original if can't parse
    }

    // Format as MM/DD/YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  convertTransaction(row) {
    throw new Error("convertTransaction must be implemented by subclass");
  }
}

// Credit Card Parser (CAD transactions)
class CreditCardParser extends BaseParser {
  convertTransaction(inputRow) {
    const description = inputRow.Description || inputRow.description || "";
    const type = inputRow.Type || inputRow.type || "";
    const date = inputRow.Date || inputRow.date || "";
    const time = inputRow.Time || inputRow.time || "";
    const amount = inputRow.Amount || inputRow.amount || "";

    // Parse and format amount
    const parsedAmount = this.parseAmount(amount);
    const isExpense = parsedAmount < 0;
    const formattedAmount = Math.abs(parsedAmount).toFixed(2);

    // Determine transaction type
    const transactionType = isExpense ? "expense" : "income";

    // Detect category based on description
    const categoryId = this.detectCategory(description);

    // Format date
    const formattedDate = this.formatDate(date, time);

    return {
      Date: formattedDate,
      Name: description,
      "Amount CAD": formattedAmount,
      "Amount USD": "", // Leave empty for CAD-only transactions
      "Category Id": categoryId,
      Notes: `Imported from credit card - ${type}`,
      Type: transactionType,
    };
  }
}

// Bank Card Parser (USD transactions)
class BankCardParser extends BaseParser {
  convertTransaction(inputRow) {
    const description = inputRow.DESCRIPTION || inputRow.description || "";
    const postedDate = inputRow["POSTED DATE"] || inputRow["posted date"] || "";
    const amount = inputRow.AMOUNT || inputRow.amount || "";
    const currency = inputRow.CURRENCY || inputRow.currency || "";
    const transactionRef =
      inputRow["TRANSACTION REFERENCE NUMBER"] ||
      inputRow["transaction reference number"] ||
      "";
    const fiTransactionRef =
      inputRow["FI TRANSACTION REFERENCE"] ||
      inputRow["fi transaction reference"] ||
      "";
    const type = inputRow.TYPE || inputRow.type || "";
    const creditDebit =
      inputRow["CREDIT/DEBIT"] || inputRow["credit/debit"] || "";
    const originalAmount =
      inputRow["ORIGINAL AMOUNT"] || inputRow["original amount"] || "";

    // Parse and format amount
    const parsedAmount = this.parseAmount(amount);
    const isExpense = creditDebit === "DEBIT" || parsedAmount < 0;
    const formattedAmount = Math.abs(parsedAmount).toFixed(2);

    // Determine transaction type
    const transactionType = isExpense ? "expense" : "income";

    // Detect category based on description
    const categoryId = this.detectCategory(description);

    // Format date
    const formattedDate = this.formatDate(postedDate);

    return {
      Date: formattedDate,
      Name: description,
      "Amount CAD": "", // Leave empty for USD-only transactions
      "Amount USD": formattedAmount,
      "Category Id": categoryId,
      Notes: `Imported from bank card - ${type} - Ref: ${transactionRef}`,
      Type: transactionType,
    };
  }
}

// Parser factory
function getParser(format) {
  switch (format) {
    case "credit-card":
      return new CreditCardParser();
    case "bank-card":
      return new BankCardParser();
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: node convert-credit-card-csv.js [--format <format>] <input-file> [output-file]"
    );
    console.log("");
    console.log("Formats:");
    console.log("  credit-card  - Credit card export (CAD)");
    console.log("  bank-card    - Bank card export (USD)");
    console.log("  auto         - Auto-detect format (default)");
    console.log("");
    console.log("Examples:");
    console.log("  node convert-credit-card-csv.js credit-card-export.csv");
    console.log(
      "  node convert-credit-card-csv.js --format bank-card bank-export.csv"
    );
    console.log(
      "  node convert-credit-card-csv.js --format credit-card credit-card-export.csv converted-transactions.csv"
    );
    process.exit(1);
  }

  let format = "auto";
  let inputFile;
  let outputFile;

  // Parse arguments
  if (args[0] === "--format") {
    format = args[1];
    inputFile = args[2];
    outputFile = args[3];
  } else {
    inputFile = args[0];
    outputFile = args[1];
  }

  // If no output file specified, generate one in temp/converted with same filename
  if (!outputFile) {
    const inputBasename = path.basename(inputFile);
    const tempConvertedDir = path.join(process.cwd(), "temp", "converted");

    // Create temp/converted directory if it doesn't exist
    fs.mkdirSync(tempConvertedDir, { recursive: true });

    outputFile = path.join(tempConvertedDir, inputBasename);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found.`);
    process.exit(1);
  }

  const results = [];

  // Handle auto-detection or specified format
  if (format === "auto") {
    // Read first row to detect format
    const headers = [];
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on("data", (row) => {
        if (headers.length === 0) {
          headers.push(...Object.keys(row));
        }
      })
      .on("end", () => {
        const detectedFormat = detectFormat(headers);
        if (detectedFormat === "unknown") {
          console.error(
            "Could not detect CSV format. Please specify format manually using --format option."
          );
          process.exit(1);
        }
        console.log(`Detected format: ${detectedFormat}`);
        const parser = getParser(detectedFormat);
        processFile(parser);
      })
      .on("error", (error) => {
        console.error("Error reading input file:", error);
        process.exit(1);
      });
  } else {
    try {
      const parser = getParser(format);
      processFile(parser);
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  }

  function processFile(parser) {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on("data", (data) => {
        // Skip header row if it gets parsed as data
        if (data.Description === "Description" && data.Type === "Type") {
          return;
        }
        if (data.DESCRIPTION === "DESCRIPTION" && data.AMOUNT === "AMOUNT") {
          return;
        }

        const converted = parser.convertTransaction(data);
        results.push(converted);
      })
      .on("end", () => {
        if (results.length === 0) {
          console.error("No transactions found in the input file.");
          process.exit(1);
        }

        // Create CSV writer
        const csvWriter = createCsvWriter({
          path: outputFile,
          header: [
            { id: "Date", title: "Date" },
            { id: "Name", title: "Name" },
            { id: "Amount CAD", title: "Amount CAD" },
            { id: "Amount USD", title: "Amount USD" },
            { id: "Category Id", title: "Category Id" },
            { id: "Notes", title: "Notes" },
            { id: "Type", title: "Type" },
          ],
        });

        // Write the converted data
        csvWriter
          .writeRecords(results)
          .then(() => {
            console.log(
              `✅ Successfully converted ${results.length} transactions`
            );
            console.log(`📁 Output file: ${outputFile}`);
            console.log("");
            console.log("📋 Next steps:");
            console.log("1. Review the converted file to ensure accuracy");
            console.log("2. Update category mappings in the script if needed");
            console.log("3. Import the converted file into Junction Bank");
          })
          .catch((error) => {
            console.error("Error writing output file:", error);
            process.exit(1);
          });
      })
      .on("error", (error) => {
        console.error("Error reading input file:", error);
        process.exit(1);
      });
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  detectFormat,
  CreditCardParser,
  BankCardParser,
  BaseParser,
  getParser,
};
