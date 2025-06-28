import { Category, CategoryTree } from '@/types/components/category';

export const buildCategoryTree = (categories: Category[]): CategoryTree[] => {
  const categoryMap = new Map<string, CategoryTree>();
  const rootCategories: CategoryTree[] = [];

  // First pass: create map of all categories
  categories.forEach(category => {
    categoryMap.set(category._id, {
      ...category,
      children: [],
    });
  });

  // Second pass: build tree structure
  categories.forEach(category => {
    const treeNode = categoryMap.get(category._id)!;

    if (category.parentCategory) {
      const parent = categoryMap.get(category.parentCategory._id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(treeNode);
      }
    } else {
      rootCategories.push(treeNode);
    }
  });

  return rootCategories;
};

export const getAllChildCategoryIds = (category: CategoryTree): string[] => {
  const ids: string[] = [category._id];

  if (category.children) {
    category.children.forEach(child => {
      ids.push(...getAllChildCategoryIds(child));
    });
  }

  return ids;
};

export const getAllParentCategoryIds = (
  category: CategoryTree,
  categoryMap: Map<string, CategoryTree>
): string[] => {
  const ids: string[] = [];
  let currentCategory = category;

  while (currentCategory.parentCategory) {
    const parent = categoryMap.get(currentCategory.parentCategory._id);
    if (parent) {
      ids.push(parent._id);
      currentCategory = parent;
    } else {
      break;
    }
  }

  return ids;
};
