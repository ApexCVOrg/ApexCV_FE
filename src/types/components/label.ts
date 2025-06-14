export type ProductLabel =
  | 'new'
  | 'hot'
  | 'sale'
  | 'outlet'
  | 'limited'
  | 'preorder'
  | 'exclusive'
  | 'bestseller'
  | 'trend'
  | 'restock';

export const PRODUCT_LABELS: { value: ProductLabel; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'hot', label: 'Hot' },
  { value: 'sale', label: 'Sale' },
  { value: 'outlet', label: 'Outlet' },
  { value: 'limited', label: 'Limited' },
  { value: 'preorder', label: 'Preorder' },
  { value: 'exclusive', label: 'Exclusive' },
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'trend', label: 'Trend' },
  { value: 'restock', label: 'Restock' },
];
