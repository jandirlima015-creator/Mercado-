/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ShoppingBag, 
  Loader2,
  ChevronRight,
  RotateCcw,
  ShoppingCart
} from 'lucide-react';
import { ShoppingItem, CATEGORY_MAP } from './types.ts';
import { categorizeItem } from './services/geminiService.ts';

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shopping-list');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem('shopping-list', JSON.stringify(items));
  }, [items]);

  const addItem = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isAdding) return;

    setIsAdding(true);
    const itemName = inputValue.trim();
    setInputValue('');

    // Pre-create item with "Outros" category
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: itemName,
      category: 'Outros',
      bought: false,
      quantity: 1,
      createdAt: Date.now(),
    };

    setItems(prev => [newItem, ...prev]);

    // Update category with Gemini
    const category = await categorizeItem(itemName);
    setItems(prev => prev.map(item => 
      item.id === newItem.id ? { ...item, category } : item
    ));

    setIsAdding(false);
  };

  const toggleBought = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, bought: !item.bought } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<ShoppingItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const clearList = () => {
    if (window.confirm('Tem certeza que deseja limpar toda a lista?')) {
      setItems([]);
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // Stats
  const totalItems = items.length;
  const boughtItems = items.filter(i => i.bought).length;
  const progress = totalItems === 0 ? 0 : (boughtItems / totalItems) * 100;

  const totalCost = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const boughtCost = items.filter(i => i.bought).reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 transition-all duration-300">
        <div className="max-w-xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Mercado
              </h1>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Comprado</div>
              <div className="text-2xl font-black text-blue-600 tabular-nums">
                {formatCurrency(boughtCost)}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          {totalItems > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimativa da Lista</div>
                  <div className="text-lg font-bold text-slate-700">{formatCurrency(totalCost)}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">Total no Carrinho</div>
                  <div className="text-lg font-bold text-blue-700">{formatCurrency(boughtCost)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Progresso {Math.round(progress)}%</span>
                  <span>{boughtItems}/{totalItems} itens</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                  <motion.div 
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        {/* Input Form */}
        <form onSubmit={addItem} className="mb-10 relative group">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="O que vamos comprar hoje?"
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-5 pl-14 text-lg focus:outline-none focus:border-blue-600 transition-all shadow-xl shadow-slate-100 focus:shadow-blue-50 placeholder:text-slate-400"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              {isAdding ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : <Plus className="w-6 h-6" />}
            </div>
            <button 
              type="submit"
              disabled={!inputValue.trim() || isAdding}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 disabled:opacity-30 disabled:shadow-none hover:bg-blue-700 active:scale-95 transition-all"
            >
              Adicionar
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400 font-medium px-2 italic">
            Dica: Digite e daremos a categoria automaticamente! 🪄
          </p>
        </form>

        {/* List Content */}
        <AnimatePresence mode="popLayout">
          {totalItems === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="bg-slate-100 p-8 rounded-full mb-6">
                <ShoppingBag className="w-16 h-16 text-slate-300" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Sua lista está vazia</h2>
              <p className="text-slate-500 max-w-xs leading-relaxed">
                Adicione alguns itens acima para começar suas compras com inteligência!
              </p>
            </motion.div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedItems).sort().map(([category, catItems]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4 group">
                    <span className={`w-2.5 h-7 rounded-full ${CATEGORY_MAP[category]?.bg || 'bg-slate-200'}`} />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      {category}
                      <span className="text-xs text-slate-400 font-medium">({catItems.length})</span>
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {catItems.sort((a,b) => (a.bought === b.bought ? 0 : a.bought ? 1 : -1)).map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group bg-white rounded-2xl flex flex-col p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all ${item.bought ? 'opacity-60 bg-slate-50/50 grayscale-[0.3]' : ''}`}
                      >
                        <div className="flex items-center w-full">
                          <div 
                            className="mr-4 transition-transform active:scale-90 cursor-pointer"
                            onClick={() => toggleBought(item.id)}
                          >
                            {item.bought ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0" onClick={() => toggleBought(item.id)}>
                            <p className={`text-base font-bold truncate transition-all ${item.bought ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                              {item.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {item.price && (
                              <div className="text-sm font-black text-slate-400">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item.id);
                              }}
                              className="p-1.5 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg translate-x-1"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>

                        {/* Price and Quantity Controls */}
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                          <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
                            <button 
                              onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:bg-white rounded-lg transition-all"
                            >-</button>
                            <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                            <button 
                              onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                              className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:bg-white rounded-lg transition-all"
                            >+</button>
                          </div>
                          
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                            <input 
                              type="number"
                              step="0.01"
                              value={item.price || ''}
                              onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                              placeholder="0,00"
                              className="w-full bg-slate-100 border-none rounded-xl py-2 pl-9 pr-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Summary for Mobile */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: items.length > 0 ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none md:hidden"
      >
        <div className="max-w-xl mx-auto flex justify-center pointer-events-auto">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 text-sm font-bold">
            <ShoppingCart className="w-4 h-4 text-blue-400" />
            <span>{boughtItems} / {totalItems} Itens Comprados</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
