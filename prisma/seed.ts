import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    // Expense categories
    { name: '🏘️ Rent', type: 'expense' },
    { name: '💵 Bills', type: 'expense' },
    { name: '☕︎ Coffee', type: 'expense' },
    { name: '🛒 Groceries', type: 'expense' },
    { name: '🏥 Therapy', type: 'expense' },
    { name: '🏠 House', type: 'expense' },
    { name: '👫 Dates', type: 'expense' },
    { name: '🚗 Transportation', type: 'expense' },
    { name: '🏥 Health & Personal Care', type: 'expense' },
    { name: '🍴 Eating Out', type: 'expense' },
    { name: '🎉 Entertainment', type: 'expense' },
    { name: '🎁 Gifts', type: 'expense' },
    { name: '🎲 Other', type: 'expense' },
    
    // Income categories
    { name: '💰Income', type: 'income' },
  ];

  console.log('Starting to seed categories...');

  for (const category of categories) {
    // Using upsert to avoid duplicates
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
        type: category.type
      }
    });
  }

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 