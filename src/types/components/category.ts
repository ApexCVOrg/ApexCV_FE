export interface Category {
  _id: string;
  name: string;
  description: string;
  parentCategory?: { _id: string; name: string } | null;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}
