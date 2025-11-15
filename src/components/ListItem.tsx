import React from 'react';
import { ShoppingItem, Language } from '../src/types';
import { TrashIcon, ImageIcon, PlusIcon, MinusIcon } from './Icons';
import { useTranslations } from '../hooks/useTranslations';

interface ListItemProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (name: string) => void;
  onModifyQuantity: (id: string, newQuantity: string) => void;
  language: Language;
}

export const ListItem: React.FC<ListItemProps> = ({ item, onToggle, onRemove, onModifyQuantity, language }) => {
  const { t } = useTranslations(language);

  const handleQuantityChange = (amount: number) => {
    const currentVal = parseInt(item.quantity, 10);
    if (isNaN(currentVal)) {
      return; // Cannot increment/decrement non-numeric quantity
    }

    const newValue = currentVal + amount;
    if (newValue < 1) return; // Prevent quantity from going below 1

    const unit = item.quantity.substring(String(currentVal).length).trim();
    const newQuantity = `${newValue} ${unit}`.trim();
    
    onModifyQuantity(item.id, newQuantity);
  };

  const isNumericQuantity = !isNaN(parseInt(item.quantity, 10));

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 transform animate-fadeInDown ${
        item.completed ? 'bg-black/30 opacity-60' : 'bg-gray-500/10 backdrop-blur-sm hover:scale-[1.02]'
      } ${
        item.isRemoving ? '!opacity-0 !scale-95' : ''
      } ${
        item.isModified ? 'animate-pulse-bg' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 bg-black/20 rounded-lg flex items-center justify-center">
            {item.isGeneratingImage && (
                <div className="animate-pulse w-full h-full bg-gray-700/50 rounded-lg"></div>
            )}
            {!item.isGeneratingImage && item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
            )}
            {!item.isGeneratingImage && !item.imageUrl && (
                <ImageIcon className="w-6 h-6 text-gray-500"/>
            )}
        </div>

        <div className="flex-grow">
          <p className={`font-medium text-white ${item.completed ? 'line-through' : ''}`}>
            {item.name}
          </p>
          <div className="flex items-center gap-1 text-gray-400 mt-1">
            <button
                onClick={() => handleQuantityChange(-1)}
                disabled={!isNumericQuantity || parseInt(item.quantity, 10) <= 1}
                className="p-1 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={t('decreaseQuantityLabel')}
            >
                <MinusIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium w-16 text-center">{item.quantity}</span>
            <button
                onClick={() => handleQuantityChange(1)}
                disabled={!isNumericQuantity}
                className="p-1 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={t('increaseQuantityLabel')}
            >
                <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <label className="relative flex items-center justify-center cursor-pointer">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggle(item.id)}
              className="peer relative h-6 w-6 cursor-pointer appearance-none rounded-md border border-gray-500 transition-all checked:border-emerald-500 checked:bg-emerald-500"
            />
            <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
        </label>
        <button
          onClick={() => onRemove(item.name)}
          className="text-gray-500 hover:text-red-500 transition-colors"
          aria-label={t('removeItemLabel', item.name)}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
