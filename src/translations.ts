import { Category } from './types';

export const translations: Record<string, any> = {
  'en-US': {
    // Header
    vocalCartTitle: 'VocalCart',
    selectLanguageLabel: 'Select language',
    // Status Bar
    statusListening: 'Listening...',
    statusThinking: 'Thinking...',
    statusTapMic: 'Tap the mic to start',
    statusProcessing: (command: string) => `Processing: "${command}"`,
    // Voice Control Button
    startListeningLabel: 'Start listening',
    stopListeningLabel: 'Stop listening',
    // Shopping List
    shoppingListEmptyTitle: 'Your Shopping List is Empty',
    shoppingListEmptyDescription: 'Tap the microphone button to start. You can say things like "Add milk and bread" or "I need 2 pounds of apples".',
    categoryHeader: (category: Category) => category,
    // List Item
    decreaseQuantityLabel: 'Decrease quantity',
    increaseQuantityLabel: 'Increase quantity',
    removeItemLabel: (itemName: string) => `Remove ${itemName}`,
    // Suggestions
    suggestionsTitle: 'Smart Suggestions',
    // App Logic Messages
    addedItems: (itemNames: string) => `Added ${itemNames}.`,
    removedItems: (itemNames: string) => `Removed ${itemNames}.`,
    couldNotFindToRemove: (itemNames: string) => `Could not find ${itemNames} to remove.`,
    updatedItems: (modificationsText: string) => `Updated ${modificationsText}.`,
    couldNotFindToUpdate: (itemNames: string) => `Could not find ${itemNames} to update.`,
    searchFound: (itemName: string) => `Yes, you have ${itemName} on your list.`,
    searchNotFound: (itemName: string) => `No, ${itemName} is not on your list.`,
    suggestionsResponse: "Here are some suggestions for you.",
    unclearCommand: "I'm not sure how to handle that.",
    voiceNotSupported: "Voice commands are not supported on this browser.",
    speechError: (error: string) => `Speech recognition error: ${error}`,
    setItemQuantity: (itemName: string, newQuantity: string) => `Set ${itemName} to ${newQuantity}`
  },
  'es-ES': {
    // Header
    vocalCartTitle: 'VocalCart',
    selectLanguageLabel: 'Seleccionar idioma',
    // Status Bar
    statusListening: 'Escuchando...',
    statusThinking: 'Pensando...',
    statusTapMic: 'Toca el micrófono para empezar',
    statusProcessing: (command: string) => `Procesando: "${command}"`,
    // Voice Control Button
    startListeningLabel: 'Empezar a escuchar',
    stopListeningLabel: 'Dejar de escuchar',
    // Shopping List
    shoppingListEmptyTitle: 'Tu Lista de Compras está Vacía',
    shoppingListEmptyDescription: 'Toca el botón del micrófono para empezar. Puedes decir cosas como "Añade leche y pan" o "Necesito 2 kilos de manzanas".',
    categoryHeader: (category: Category) => {
        const map: Record<Category, string> = {
            'Produce': 'Frutas y Verduras',
            'Dairy': 'Lácteos',
            'Meat': 'Carne',
            'Pantry': 'Despensa',
            'Frozen': 'Congelados',
            'Household': 'Hogar',
            'Other': 'Otros',
        };
        return map[category] || category;
    },
    // List Item
    decreaseQuantityLabel: 'Disminuir cantidad',
    increaseQuantityLabel: 'Aumentar cantidad',
    removeItemLabel: (itemName: string) => `Quitar ${itemName}`,
    // Suggestions
    suggestionsTitle: 'Sugerencias Inteligentes',
    // App Logic Messages
    addedItems: (itemNames: string) => `Añadido ${itemNames}.`,
    removedItems: (itemNames: string) => `Eliminado ${itemNames}.`,
    couldNotFindToRemove: (itemNames: string) => `No se pudo encontrar ${itemNames} para eliminar.`,
    updatedItems: (modificationsText: string) => `Actualizado ${modificationsText}.`,
    couldNotFindToUpdate: (itemNames: string) => `No se pudo encontrar ${itemNames} para actualizar.`,
    searchFound: (itemName: string) => `Sí, tienes ${itemName} en tu lista.`,
    searchNotFound: (itemName: string) => `No, ${itemName} no está en tu lista.`,
    suggestionsResponse: "Aquí tienes algunas sugerencias.",
    unclearCommand: "No estoy seguro de cómo procesar eso.",
    voiceNotSupported: "Los comandos de voz no son compatibles en este navegador.",
    speechError: (error: string) => `Error de reconocimiento de voz: ${error}`,
    setItemQuantity: (itemName: string, newQuantity: string) => `Poner ${itemName} a ${newQuantity}`
  },
};
