import React from 'react';
import { ShoppingItem, Language, Category } from '../src/types';
import { ListItem } from './ListItem';
import { EmptyCartIcon } from './Icons';
import { useTranslations } from '../hooks/useTranslations';


interface ShoppingListProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (name: string) => void;
  onModifyQuantity: (id: string, newQuantity: string) => void;
  language: Language;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, onToggleItem, onRemoveItem, onModifyQuantity, language }) => {
  const { t } = useTranslations(language);

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const sortedCategories = Object.keys(groupedItems).sort();

  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-4 mt-8 bg-gray-500/5 rounded-2xl border-2 border-dashed border-gray-500/20 flex flex-col items-center animate-fadeInDown">
        <EmptyCartIcon className="w-24 h-24 mb-6 text-emerald-400" />
        <h3 className="font-poppins text-xl font-semibold text-white/90">{t('shoppingListEmptyTitle')}</h3>
        <p className="mt-2 text-gray-400 max-w-sm">
          {t('shoppingListEmptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => (
        <div key={category}>
          <h2 className="text-lg font-bold text-emerald-400/80 mb-3 font-poppins border-b-2 border-white/10 pb-2 tracking-wide">
            {t('categoryHeader', category as Category)}
          </h2>
          <div className="space-y-3">
            {groupedItems[category].map((item) => (
              <ListItem
                key={item.id}
                item={item}
                onToggle={onToggleItem}
                onRemove={onRemoveItem}
                onModifyQuantity={onModifyQuantity}
                language={language}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
