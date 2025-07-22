interface Product {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  createdAt?: string;
  tags?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  images?: string[];
}

export const sortProductsClientSide = (products: Product[], sortType: string) => {
  const sorted = [...products];
  
  switch (sortType) {
    case 'price-low':
      return sorted.sort((a, b) => {
        const priceA = a.discountPrice !== undefined ? a.discountPrice : a.price;
        const priceB = b.discountPrice !== undefined ? b.discountPrice : b.price;
        return priceA - priceB;
      });
    case 'price-high':
      return sorted.sort((a, b) => {
        const priceA = a.discountPrice !== undefined ? a.discountPrice : a.price;
        const priceB = b.discountPrice !== undefined ? b.discountPrice : b.price;
        return priceB - priceA;
      });
    case 'newest':
      return sorted.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
    case 'popular':
      return sorted; // Keep original order for now
    default:
      return sorted;
  }
};

export const convertSortParams = (sortBy: string) => {
  let apiSortBy = sortBy;
  let sortOrder = 'desc';
  
  if (sortBy === 'price-low') { 
    apiSortBy = 'price'; 
    sortOrder = 'asc'; 
  }
  else if (sortBy === 'price-high') { 
    apiSortBy = 'price'; 
    sortOrder = 'desc'; 
  }
  else if (sortBy === 'newest') { 
    apiSortBy = 'createdAt'; 
    sortOrder = 'desc'; 
  }
  else if (sortBy === 'popular') { 
    apiSortBy = 'popularity'; 
    sortOrder = 'desc'; 
  }
  
  return { apiSortBy, sortOrder };
}; 