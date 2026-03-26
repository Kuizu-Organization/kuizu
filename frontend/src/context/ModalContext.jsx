import React, { createContext, useContext, useState } from 'react';
import FlashcardSetModal from '@/components/Flashcard/FlashcardSetModal';
import FlashcardModal from '@/components/Flashcard/FlashcardModal';
import ShareModal from '@/components/Flashcard/ShareModal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [setModal, setSetModal] = useState({ isOpen: false, setId: null, callback: null });
    const [cardModal, setCardModal] = useState({ isOpen: false, setId: null, cardId: null, callback: null, existingCards: [] });
    const [shareModal, setShareModal] = useState({ isOpen: false, set: null });

    const openSetModal = (setId = null, callback = null) => {
        setSetModal({ isOpen: true, setId, callback });
    };

    const closeSetModal = () => {
        setSetModal({ isOpen: false, setId: null, callback: null });
    };

    const openCardModal = (setId = null, cardId = null, callback = null, existingCards = []) => {
        setCardModal({ isOpen: true, setId, cardId, callback, existingCards });
    };

    const closeCardModal = () => {
        setCardModal({ isOpen: false, setId: null, cardId: null, callback: null, existingCards: [] });
    };

    const openShareModal = (set) => {
        setShareModal({ isOpen: true, set });
    };

    const closeShareModal = () => {
        setShareModal({ isOpen: false, set: null });
    };

    const handleSetSuccess = (data) => {
        if (setModal.callback) setModal.callback(data);
    };

    const handleCardSuccess = (data) => {
        if (cardModal.callback) cardModal.callback(data);
    };

    return (
        <ModalContext.Provider value={{ openSetModal, openCardModal, openShareModal }}>
            {children}
            <FlashcardSetModal
                isOpen={setModal.isOpen}
                onClose={closeSetModal}
                setId={setModal.setId}
                onSuccess={handleSetSuccess}
            />
            <FlashcardModal
                isOpen={cardModal.isOpen}
                onClose={closeCardModal}
                setId={cardModal.setId}
                cardId={cardModal.cardId}
                existingCards={cardModal.existingCards}
                onSuccess={handleCardSuccess}
            />
            <ShareModal
                isOpen={shareModal.isOpen}
                onClose={closeShareModal}
                set={shareModal.set}
            />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
