import { useState, useRef, useEffect } from 'react';
import { MentionState, MentionItem } from './types';

export function useMentions(onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, storageKey: string = 'mentionState') {
    // Load initial state from localStorage
    const initialState = (): MentionState => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : {
            isOpen: false,
            searchText: '',
            triggerIdx: -1,
            position: { top: 0, left: 0 },
            selectedType: null,
            activeIndex: 0,
            selectedItems: []
        };
    };

    const [mentionState, setMentionState] = useState<MentionState>(initialState());
    const [typedText, setTypedText] = useState<string>('');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Save to localStorage whenever selectedItems changes
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(mentionState));
    }, [mentionState.selectedItems]);

    // Clear localStorage on unmount (optional - remove if you want to persist across page navigations)
    useEffect(() => {
        return () => {
            localStorage.removeItem(storageKey);
        };
    }, []);

    const pendingUpdateRef = useRef<{
        newText: string;
        lastAtIndex: number;
        mentionText: string;
        items: MentionItem[];
    } | null>(null);

    // Effect to handle pending updates
    useEffect(() => {
        if (pendingUpdateRef.current && textareaRef.current) {
            const { newText, lastAtIndex, mentionText, items } = pendingUpdateRef.current;

            // Update typed text state
            setTypedText(newText);

            // Move cursor after the mention
            const newCursorPos = lastAtIndex + mentionText.length + 1; // +1 for @
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);

            // Create a proper synthetic event
            if (onChange) {
                const syntheticEvent = {
                    target: {
                        value: newText,
                        selectionStart: newCursorPos,
                        selectionEnd: newCursorPos
                    },
                    currentTarget: {
                        value: newText,
                        selectionStart: newCursorPos,
                        selectionEnd: newCursorPos
                    }
                } as React.ChangeEvent<HTMLTextAreaElement>;

                onChange(syntheticEvent);
            }

            // Update mention state
            setMentionState(prev => ({
                ...prev,
                isOpen: false,
                selectedType: null,
                selectedItems: [...prev.selectedItems, ...items],
                position: {
                    top: prev.position.top,
                    left: 50
                }
            }));

            // Clear the pending update
            pendingUpdateRef.current = null;
        }
    }, [onChange]);

    const handleMentionSelect = (
        selection: { type: string; items: MentionItem[]; action: 'toggle' | 'remove' | 'select-type' }
    ) => {
        if (!textareaRef.current) return;

        if (selection.action === 'toggle') {
            const textarea = textareaRef.current;
            const currentText = textarea.value;
            const cursorPos = textarea.selectionStart;

            // Find the last @ before cursor
            const lastAtIndex = currentText.lastIndexOf('@', cursorPos);
            if (lastAtIndex === -1) return;

            // Remove the @ symbol by taking text before @ and after @
            const beforeText = currentText.slice(0, lastAtIndex);
            const afterText = currentText.slice(lastAtIndex + 1);
            const newText = beforeText + afterText;

            // Immediately update the text
            setTypedText(newText);

            // Update cursor position to where @ was
            textarea.setSelectionRange(lastAtIndex, lastAtIndex);

            // Update mention state
            setMentionState(prev => {
                const newState = {
                    ...prev,
                    isOpen: false,
                    selectedType: null,
                    selectedItems: [...prev.selectedItems, ...selection.items],
                    position: {
                        top: prev.position.top,
                        left: 50
                    }
                };
                localStorage.setItem('mentionState', JSON.stringify(newState));
                return newState;
            });

            // Trigger onChange
            if (onChange) {
                const syntheticEvent = {
                    target: {
                        value: newText,
                        selectionStart: lastAtIndex,
                        selectionEnd: lastAtIndex
                    },
                    currentTarget: {
                        value: newText,
                        selectionStart: lastAtIndex,
                        selectionEnd: lastAtIndex
                    }
                } as React.ChangeEvent<HTMLTextAreaElement>;

                onChange(syntheticEvent);
            }
        } else if (selection.action === 'select-type') {
            setMentionState(prev => ({
                ...prev,
                selectedType: selection.type,
                activeIndex: 0,
                isOpen: true,
                position: {
                    ...prev.position,
                    left: prev.position.left
                }
            }));
        } else if (selection.action === 'remove') {
            setMentionState(prev => {
                const newState = {
                    ...prev,
                    selectedItems: prev.selectedItems.filter(item => item.id !== selection.items[0].id)
                };
                localStorage.setItem('mentionState', JSON.stringify(newState));
                return newState;
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        const caretPos = textarea.selectionStart;
        const text = textarea.value;

        // Update typed text state
        setTypedText(text);

        // Close popup if backspace removes @ or if current char isn't @
        if (mentionState.isOpen) {
            const isBackspaceOnTrigger = caretPos === mentionState.triggerIdx && text[caretPos - 1] !== '@';
            const isTypingWithoutTrigger = !text.slice(0, caretPos).includes('@');

            if (isBackspaceOnTrigger || isTypingWithoutTrigger) {
                setMentionState(prev => ({
                    ...prev,
                    isOpen: false,
                    selectedType: null
                }));
                onChange?.(e);
                return;
            }
        }

        // Handle @ trigger
        if (text[caretPos - 1] === '@') {
            setMentionState(prev => ({
                ...prev,
                isOpen: true,
                searchText: '',
                triggerIdx: caretPos,
                position: {
                    top: -20,
                    left: 50
                },
                selectedType: null,
                activeIndex: 0
            }));
        }

        onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === '@') {
            const textarea = e.currentTarget;
            setMentionState(prev => ({
                ...prev,
                isOpen: true,
                searchText: '',
                triggerIdx: textarea.selectionStart + 1,
                position: {
                    top: -20,
                    left: 50
                },
                selectedType: null,
                activeIndex: 0
            }));
        }
    };

    return {
        mentionState,
        setMentionState,
        typedText,
        setTypedText,
        textareaRef,
        handleMentionSelect,
        handleChange,
        handleKeyDown
    };
}