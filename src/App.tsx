import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingItem, Language, getInitialLanguage } from './types';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { processVoiceCommand, generateItemImage, generateSpeech } from './services/geminiService';
import { Header } from './components/Header';
import { ShoppingList } from './components/ShoppingList';
import { StatusBar } from './components/StatusBar';
import { VoiceControlButton } from './components/VoiceControlButton';
import { Suggestions } from './components/Suggestions';
import { useTranslations } from './hooks/useTranslations';

// Helper function to decode base64 string to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const App: React.FC = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const { t } = useTranslations(language);

  const { isListening, transcript, error: speechError, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition(language);

  useEffect(() => {
    setStatusMessage(t('statusTapMic'));
  }, [t]);

  // Persist language choice in localStorage
  useEffect(() => {
    localStorage.setItem('vocalcart-lang', language);
  }, [language]);

  const playAudioFeedback = useCallback(async (text: string) => {
    try {
      const base64Audio = await generateSpeech(text);
      if (!base64Audio) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;
      
      const decodedBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);

    } catch (err) {
      console.error("Failed to play audio feedback:", err);
    }
  }, []);

  const handleCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;
    setIsLoading(true);
    setSuggestions([]); // Clear old suggestions
    setStatusMessage(t('statusProcessing', command));
    setError(null);

    const result = await processVoiceCommand(command, shoppingList, language);

    let listChanged = false;
    const feedbackMessages: string[] = [];
    let updatedListForSuggestions = [...shoppingList];

    // Process modifications
    if (result.modifications && result.modifications.length > 0) {
        listChanged = true;
        let modifiedItems: {name: string, quantity: string}[] = [];
        const modifiedItemIds: string[] = [];

        setShoppingList(prev => {
            let nextState = [...prev];
            result.modifications.forEach((mod: { name: string, newQuantity: string }) => {
                const itemIndex = nextState.findIndex(item => item.name.toLowerCase() === mod.name.toLowerCase());
                if (itemIndex > -1) {
                    nextState[itemIndex] = { ...nextState[itemIndex], quantity: mod.newQuantity, isModified: true };
                    modifiedItemIds.push(nextState[itemIndex].id);
                    modifiedItems.push({name: nextState[itemIndex].name, quantity: mod.newQuantity});
                }
            });
            updatedListForSuggestions = nextState;
            return nextState;
        });
        
        if (modifiedItems.length > 0) {
            const modificationsText = modifiedItems.map(item => `${item.name} to ${item.quantity}`).join(', ');
            feedbackMessages.push(t('updatedItems', modificationsText));
            setTimeout(() => {
                setShoppingList(prev => prev.map(item => (modifiedItemIds.includes(item.id) ? { ...item, isModified: false } : item)));
            }, 800);
        } else {
            const itemNamesStr = result.modifications.map((m: any) => m.name).join(', ');
            feedbackMessages.push(t('couldNotFindToUpdate', itemNamesStr));
        }
    }

    // Process removals
    if (result.itemNames && result.itemNames.length > 0) {
        listChanged = true;
        const lowerCaseNamesToRemove = result.itemNames.map((name: string) => name.toLowerCase());
        
        // Use a functional update to get the most recent state after potential modifications
        setShoppingList(prev => {
            const itemsToRemove = prev.filter(item => 
                lowerCaseNamesToRemove.includes(item.name.toLowerCase()) && !item.isRemoving
            );

            if (itemsToRemove.length > 0) {
                const idsToRemove = itemsToRemove.map(i => i.id);
                const removedNames = itemsToRemove.map(i => i.name).join(', ');
                feedbackMessages.push(t('removedItems', removedNames));
                
                setTimeout(() => {
                    setShoppingList(current => {
                        const nextState = current.filter(item => !idsToRemove.includes(item.id));
                        updatedListForSuggestions = nextState;
                        return nextState;
                    });
                }, 300);
                
                return prev.map(item => idsToRemove.includes(item.id) ? { ...item, isRemoving: true } : item);
            } else {
                const itemNamesStr = result.itemNames.join(', ');
                feedbackMessages.push(t('couldNotFindToRemove', itemNamesStr));
                updatedListForSuggestions = prev;
                return prev;
            }
        });
    }
    
    // Process additions
    if (result.items && result.items.length > 0) {
        listChanged = true;
        const newItems: ShoppingItem[] = result.items.map((item: any, index: number) => ({
            id: `${new Date().toISOString()}-${item.name}-${index}`,
            name: item.name,
            quantity: item.quantity || '1',
            category: item.category || 'Other',
            completed: false,
            isGeneratingImage: true,
        }));
        
        setShoppingList(prev => {
            const nextState = [...prev, ...newItems];
            updatedListForSuggestions = nextState;
            return nextState;
        });
        
        const itemNames = newItems.map(i => i.name).join(', ');
        feedbackMessages.push(t('addedItems', itemNames));

        newItems.forEach(newItem => {
            generateItemImage(newItem.name).then(imageUrl => {
                setShoppingList(prev => prev.map(item => 
                    item.id === newItem.id 
                    ? {...item, imageUrl, isGeneratingImage: false} 
                    : item
                ));
            });
        });
    }

    // Consolidate and deliver feedback
    if (listChanged) {
        // Wait a moment for state updates to begin processing
        setTimeout(async () => {
            const confirmationText = feedbackMessages.join(' ');
            setStatusMessage(confirmationText);
            playAudioFeedback(confirmationText);

            // Trigger a suggestion call with the latest list state
            const suggestResult = await processVoiceCommand('suggest', updatedListForSuggestions, language);
            if(suggestResult.suggestions) {
                setSuggestions(suggestResult.suggestions);
            }
        }, 350);
    } else {
      // Handle non-list-modifying commands
      if (result.query) {
        const query = result.query.toLowerCase();
        const foundItem = shoppingList.find(item => item.name.toLowerCase().includes(query));
        const responseText = foundItem ? t('searchFound', foundItem.name) : t('searchNotFound', result.query);
        setStatusMessage(responseText);
        playAudioFeedback(responseText);
      } else if (result.suggestions) {
          setSuggestions(result.suggestions);
          const responseText = t('suggestionsResponse');
          setStatusMessage(responseText);
          playAudioFeedback(responseText);
      } else if (result.response) {
        setStatusMessage(result.response);
        playAudioFeedback(result.response);
      } else {
        const errorText = result.reason || t('unclearCommand');
        setError(errorText);
        playAudioFeedback(errorText);
        setTimeout(() => setError(null), 4000);
      }
    }
    
    setIsLoading(false);
  }, [shoppingList, language, playAudioFeedback, t]);

  useEffect(() => {
    if (!isListening && transcript) {
      handleCommand(transcript);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, transcript]);

  useEffect(() => {
    if(speechError) {
        setError(t('speechError', speechError));
        setTimeout(() => setError(null), 4000);
    }
  }, [speechError, t]);
  
  useEffect(() => {
    if(!hasRecognitionSupport) {
      setError(t('voiceNotSupported'));
    }
  }, [hasRecognitionSupport, t]);

  const handleToggleItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleRemoveItem = (name: string) => {
    handleCommand(`remove ${name}`);
  };

  const handleModifyQuantity = (id: string, newQuantity: string) => {
    let itemName = '';
    setShoppingList(prev =>
        prev.map(item => {
            if (item.id === id) {
                itemName = item.name;
                return { ...item, quantity: newQuantity, isModified: true };
            }
            return item;
        })
    );
    playAudioFeedback(t('setItemQuantity', itemName, newQuantity));
     setTimeout(() => {
        setShoppingList(prev => prev.map(item => (item.id === id ? { ...item, isModified: false } : item)));
    }, 800);
  };

  const handleAddSuggestion = (itemName: string) => {
    handleCommand(`add ${itemName}`);
    setSuggestions(prev => prev.filter(s => s !== itemName));
  }

  const handleVoiceButtonClick = () => {
    setError(null);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#0D1117] text-white flex flex-col"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '20px 20px'
      }}
    >
      <Header language={language} setLanguage={setLanguage} />

      <main className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
        <Suggestions suggestions={suggestions} onAdd={handleAddSuggestion} language={language} />
        <ShoppingList
          items={shoppingList}
          onToggleItem={handleToggleItem}
          onRemoveItem={handleRemoveItem}
          onModifyQuantity={handleModifyQuantity}
          language={language}
        />
      </main>

      <footer className="sticky bottom-0 left-0 right-0 z-10">
        <StatusBar isListening={isListening} isLoading={isLoading} transcript={transcript} message={statusMessage} error={error} language={language} />
        <VoiceControlButton isListening={isListening} onClick={handleVoiceButtonClick} disabled={isLoading || !hasRecognitionSupport} language={language}/>
      </footer>
    </div>
  );
};

export default App;