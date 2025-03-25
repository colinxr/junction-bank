import { PrismaClient } from "@prisma/client";

export class CategoryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    // Use the shared prisma client with middleware
    this.prisma = prisma;
  }

  async index() {
    try {
      // Execute query
      const categories = await this.prisma.category.findMany({
        orderBy: {
          name: 'asc'
        }
      });

      return {
        data: categories
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch categories');
    }
  }

  async show(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id }
      });
      
      if (!category) {
        return null;
      }
      
      return category;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch category');
    }
  }

  async create(data: {
    name: string;
    type: string;
    notes?: string;
  }) {
    try {
      // Check if category already exists
      const existingCategory = await this.prisma.category.findUnique({
        where: {
          name: data.name
        }
      });

      if (existingCategory) {
        throw new Error(`Category with name '${data.name}' already exists`);
      }

      // Create the category in the database
      const category = await this.prisma.category.create({
        data: {
          name: data.name,
          type: data.type,
          notes: data.notes || null
        }
      });

      return category;
    } catch (error) {
      console.error('Category creation error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create category');
    }
  }

  async destroy(id: number) {
    try {
      // Check if the category exists
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          transactions: {
            select: { id: true }
          },
          recurringTransactions: {
            select: { id: true }
          }
        }
      });

      if (!category) {
        throw new Error(`Category with ID ${id} not found`);
      }

      // Check if there are transactions associated with this category
      if (category.transactions.length > 0) {
        throw new Error(`Cannot delete category with ${category.transactions.length} associated transactions`);
      }

      // Check if there are recurring transactions associated with this category
      if (category.recurringTransactions.length > 0) {
        throw new Error(`Cannot delete category with ${category.recurringTransactions.length} associated recurring transactions`);
      }

      // Delete the category
      await this.prisma.category.delete({
        where: { id: Number(id) }
      });

      return { success: true, message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Category deletion error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  }
} 