export interface Category {
  _id: string;
  name: string;
  description: string;
  parentCategory?: string | null;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}
