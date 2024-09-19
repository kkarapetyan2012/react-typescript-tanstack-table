// src/mockData.ts
export interface Product {
    id: string;
    name: string;
    price: string;
    quality: number;
    description: string;
    imageUrl: string;
}

export const products: Product[] = [
    {
        id: '1',
        name: 'Product A',
        price: '$10',
        quality: 4,
        description: 'Description of Product A',
        imageUrl: 'https://via.placeholder.com/150',
    },
    {
        id: '2',
        name: 'Product B',
        price: '$15',
        quality: 5,
        description: 'Description of Product B',
        imageUrl: 'https://via.placeholder.com/150',
    },
// More mock data...
];
  