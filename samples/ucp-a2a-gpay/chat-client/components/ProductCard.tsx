/*
 * Copyright 2026 UCP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import {Product} from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({product, onAddToCart}) => {
  const isAvailable = product.offers.availability.includes('InStock');
  const handleAddToCartClick = () => onAddToCart && onAddToCart(product);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-64 flex-shrink-0 border border-[#e0e0e0]">
      <img
        src={product.image[0]}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3
          className="text-lg font-semibold text-[#333] truncate"
          title={product.name}>
          {product.name}
        </h3>
        <p className="text-sm text-[#666]">{product.brand.name}</p>
        <div className="flex justify-between items-center mt-3">
          <p className="text-lg font-bold text-[#333]">
            {product.offers.priceCurrency === 'EUR' ? '€' : '$'}
            {product.offers.price}
          </p>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${isAvailable ? 'bg-[#e8f5e9] text-[#006633]' : 'bg-red-100 text-red-800'}`}>
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <button
          onClick={handleAddToCartClick}
          disabled={!isAvailable || !onAddToCart}
          className="block w-full text-center bg-[#00a040] text-white py-2 rounded-md mt-4 hover:bg-[#006633] transition-colors disabled:bg-[#bdbdbd] disabled:cursor-not-allowed">
          Add to Checkout
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
