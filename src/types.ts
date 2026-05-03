/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  bought: boolean;
  price?: number;
  quantity: number;
  createdAt: number;
}

export type CategoryColor = {
  bg: string;
  text: string;
  icon: string;
};

export const CATEGORY_MAP: Record<string, CategoryColor> = {
  'Frutas e Vegetais': { bg: 'bg-green-100', text: 'text-green-700', icon: 'Apple' },
  'Laticínios e Ovos': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'Egg' },
  'Padaria': { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'Wheat' },
  'Carnes e Peixes': { bg: 'bg-red-100', text: 'text-red-700', icon: 'Beef' },
  'Bebidas': { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'CupSoda' },
  'Limpeza': { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'Sparkles' },
  'Higiene Pessoal': { bg: 'bg-pink-100', text: 'text-pink-700', icon: 'Bath' },
  'Congelados': { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: 'IceCream' },
  'Despensa': { bg: 'bg-slate-100', text: 'text-slate-700', icon: 'Container' },
  'Outros': { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'Package' },
};
