import { InvalidCategoryTypeException, CategoryNameEmptyException } from './CategoryException';

export class Category {
  readonly id?: number;
  readonly name: string;
  readonly type: string;
  readonly notes?: string;
  readonly createdAt?: Date;
  readonly isRecurring: boolean;

  constructor(props: {
    id?: number;
    name: string;
    type: string;
    notes?: string;
    createdAt?: Date;
    isRecurring?: boolean;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.isRecurring = props.isRecurring ?? false;
    
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim() === '') {
      throw new CategoryNameEmptyException();
    }
    
    if (!['income', 'expense'].includes(this.type)) {
      throw new InvalidCategoryTypeException(this.type);
    }
  }

  public static create(props: {
    id?: number;
    name: string;
    type: string;
    notes?: string;
    createdAt?: Date;
    isRecurring?: boolean;
  }): Category {
    return new Category(props);
  }
} 