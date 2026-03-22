import React, { createContext, useContext, useState } from 'react';
import FlashcardSetModal from '../components/Flashcard/FlashcardSetModal';
import FlashcardModal from '../components/Flashcard/FlashcardModal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [setModal, setSetModal] = useState({ isOpen: false, setId: null, callback: null });
    const [cardModal, setCardModal] = useState({ isOpen: false, setId: null, cardId: null, callback: null });

    const openSetModal = (setId = null, callback = null) => {
        setSetModal({ isOpen: true, setId, callback });
    };

    const closeSetModal = () => {
        setSetModal({ isOpen: false, setId: null, callback: null });
    };

    const openCardModal = (setId = null, cardId = null, callback = null) => {
        setCardModal({ isOpen: true, setId, cardId, callback });
    };

    const closeCardModal = () => {
        setCardModal({ isOpen: false, setId: null, cardId: null, callback: null });
    };

    const handleSetSuccess = (data) => {
        if (setModal.callback) setModal.callback(data);
    };

    const handleCardSuccess = (data) => {
        if (cardModal.callback) cardModal.callback(data);
    };

    return (
        <ModalContext.Provider value={{ openSetModal, openCardModal }}>
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
                onSuccess={handleCardSuccess}
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
