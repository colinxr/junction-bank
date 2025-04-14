import { InvalidCategoryTypeException, CategoryNameEmptyException } from './CategoryException';

export class Category {
  readonly id?: number;
  readonly name: string;
  readonly type: string;
  readonly notes?: string;
  readonly createdAt?: Date;

  constructor(props: {
    id?: number;
    name: string;
    type: string;
    notes?: string;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    
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
  }): Category {
    return new Category(props);
  }
} 