#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

/**
 * Machine Learning-based Transaction Categorization
 *
 * This script analyzes existing transactions to build a categorization model
 * that can automatically categorize new transactions based on name patterns.
 */

class TransactionCategorizer {
  constructor() {
    this.prisma = new PrismaClient();
    this.categoryPatterns = new Map();
    this.categoryScores = new Map();
  }

  /**
   * Extract keywords from transaction names
   */
  extractKeywords(name) {
    // Clean and normalize the name
    const cleaned = name
      .toLowerCase()
      .replace(/[^\w\s]/g, " ") // Replace special chars with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Split into words and filter out common words
    const words = cleaned
      .split(" ")
      .filter((word) => word.length > 2) // Filter out short words
      .filter((word) => !this.isCommonWord(word)); // Filter out common words

    return words;
  }

  /**
   * Check if a word is too common to be useful for categorization
   */
  isCommonWord(word) {
    const commonWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "up",
      "about",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "between",
      "among",
      "within",
      "without",
      "inc",
      "llc",
      "corp",
      "co",
      "ltd",
      "usa",
      "ca",
      "ny",
      "tx",
      "fl",
      "payment",
      "purchase",
      "transaction",
      "transfer",
      "deposit",
      "withdrawal",
    ];
    return commonWords.includes(word);
  }

  /**
   * Build patterns from existing transactions
   */
  async buildPatterns() {
    console.log("🔍 Analyzing existing transactions...");

    // Get all transactions with their categories
    const transactions = await this.prisma.transaction.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📊 Found ${transactions.length} transactions to analyze`);

    // Group transactions by category
    const categoryGroups = new Map();

    for (const transaction of transactions) {
      const categoryId = transaction.categoryId;
      const categoryName = transaction.category.name;

      if (!categoryGroups.has(categoryId)) {
        categoryGroups.set(categoryId, {
          name: categoryName,
          transactions: [],
          keywords: new Map(),
        });
      }

      const group = categoryGroups.get(categoryId);
      group.transactions.push(transaction);

      // Extract keywords from this transaction
      const keywords = this.extractKeywords(transaction.name);

      for (const keyword of keywords) {
        if (!group.keywords.has(keyword)) {
          group.keywords.set(keyword, 0);
        }
        group.keywords.set(keyword, group.keywords.get(keyword) + 1);
      }
    }

    // Build scoring system
    for (const [categoryId, group] of categoryGroups) {
      console.log(`\n📁 Category: ${group.name} (ID: ${categoryId})`);
      console.log(`   Transactions: ${group.transactions.length}`);

      // Sort keywords by frequency
      const sortedKeywords = Array.from(group.keywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10 keywords

      console.log(
        `   Top keywords: ${sortedKeywords
          .map(([word, count]) => `${word}(${count})`)
          .join(", ")}`
      );

      // Store patterns for this category
      this.categoryPatterns.set(categoryId, {
        name: group.name,
        keywords: sortedKeywords,
        transactionCount: group.transactions.length,
      });
    }

    return categoryGroups;
  }

  /**
   * Predict category for a new transaction
   */
  predictCategory(transactionName) {
    const keywords = this.extractKeywords(transactionName);
    const scores = new Map();

    // Calculate scores for each category
    for (const [categoryId, pattern] of this.categoryPatterns) {
      let score = 0;

      for (const keyword of keywords) {
        const keywordEntry = pattern.keywords.find(
          ([word]) => word === keyword
        );
        if (keywordEntry) {
          score += keywordEntry[1]; // Add frequency score
        }
      }

      // Normalize by transaction count
      score = score / pattern.transactionCount;
      scores.set(categoryId, score);
    }

    // Find the best match
    let bestCategory = null;
    let bestScore = 0;

    for (const [categoryId, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestCategory = categoryId;
      }
    }

    return {
      categoryId: bestCategory,
      score: bestScore,
      confidence:
        bestScore > 0.1 ? "high" : bestScore > 0.05 ? "medium" : "low",
    };
  }

  /**
   * Test the model with existing transactions
   */
  async testModel() {
    console.log("\n🧪 Testing model accuracy...");

    const transactions = await this.prisma.transaction.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let correct = 0;
    let total = 0;
    const results = [];

    for (const transaction of transactions) {
      const prediction = this.predictCategory(transaction.name);

      const isCorrect = prediction.categoryId === transaction.categoryId;
      if (isCorrect) correct++;
      total++;

      results.push({
        name: transaction.name,
        actualCategory: transaction.category.name,
        predictedCategory:
          this.categoryPatterns.get(prediction.categoryId)?.name || "Unknown",
        confidence: prediction.confidence,
        correct: isCorrect,
      });
    }

    const accuracy = (correct / total) * 100;
    console.log(
      `\n📈 Model Accuracy: ${accuracy.toFixed(2)}% (${correct}/${total})`
    );

    // Show some examples
    console.log("\n📋 Sample Predictions:");
    results.slice(0, 10).forEach((result) => {
      const status = result.correct ? "✅" : "❌";
      console.log(`${status} "${result.name}"`);
      console.log(`   Actual: ${result.actualCategory}`);
      console.log(
        `   Predicted: ${result.predictedCategory} (${result.confidence} confidence)`
      );
      console.log("");
    });

    return { accuracy, results };
  }

  /**
   * Generate category mapping for the conversion script
   */
  generateCategoryMapping() {
    console.log("\n🔧 Generating category mapping for conversion script...");

    const mapping = {};

    // Add manual overrides for specific patterns
    const manualOverrides = {
      docs: 23, // ☕︎ Coffee - manual override
    };

    // Apply manual overrides first (these take precedence)
    Object.assign(mapping, manualOverrides);

    for (const [categoryId, pattern] of this.categoryPatterns) {
      const topKeywords = pattern.keywords.slice(0, 5).map(([word]) => word);

      console.log(
        `Category ${categoryId} (${pattern.name}): ${topKeywords.join(", ")}`
      );

      // Create mapping entries for each top keyword (only if not already overridden)
      for (const keyword of topKeywords) {
        if (!mapping[keyword]) {
          mapping[keyword] = categoryId;
        }
      }
    }

    return mapping;
  }

  /**
   * Update the conversion script with learned patterns
   */
  async updateConversionScript() {
    const mapping = this.generateCategoryMapping();

    const scriptPath = path.join(__dirname, "convert-credit-card-csv.js");
    let scriptContent = fs.readFileSync(scriptPath, "utf8");

    // Generate the new detectCategory function
    const newDetectCategoryFunction = `function detectCategory(description) {
  const desc = description.toLowerCase();
  
  // Auto-generated mappings from machine learning analysis
${Object.entries(mapping)
  .map(
    ([keyword, categoryId]) =>
      `  if (desc.includes('${keyword}')) {
    return ${categoryId}; // ${
        this.categoryPatterns.get(categoryId)?.name || "Unknown"
      }
  }`
  )
  .join("\n")}
  
  return 1; // Default category ID
}`;

    // Replace the existing detectCategory function
    const functionRegex =
      /function detectCategory\(description\) \{[\s\S]*?\n\}/;
    scriptContent = scriptContent.replace(
      functionRegex,
      newDetectCategoryFunction
    );

    fs.writeFileSync(scriptPath, scriptContent);

    console.log("✅ Updated conversion script with learned patterns");
  }

  /**
   * Main execution
   */
  async run() {
    try {
      await this.buildPatterns();
      await this.testModel();
      await this.updateConversionScript();

      console.log("\n🎉 Machine learning analysis complete!");
      console.log(
        "The conversion script has been updated with learned patterns."
      );
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const categorizer = new TransactionCategorizer();
  categorizer.run();
}

module.exports = TransactionCategorizer;
