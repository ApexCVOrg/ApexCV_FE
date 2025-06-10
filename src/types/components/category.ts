export interface Category {
  _id: string;
  name: string;
  description: string;
  parentCategory?: string | Category | null;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}
