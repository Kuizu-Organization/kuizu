import React, { useRef, useEffect } from 'react';
import './OtpInput.css';

const OtpInput = ({ value, onChange, length = 6, disabled = false }) => {
    const inputs = useRef([]);

    // Initialize the inputs array based on the length
    useEffect(() => {
        inputs.current = inputs.current.slice(0, length);
    }, [length]);

    const handleChange = (e, index) => {
        const char = e.target.value.slice(-1); // Get only the last character entered
        
        // Only allow numbers
        if (char && !/^[0-9]$/.test(char)) return;

        const otpArray = value.split('');
        otpArray[index] = char;
        const newValue = otpArray.join('');
        onChange(newValue);

        // Auto focus next input
        if (char && index < length - 1) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                // Focus previous if current is empty
                inputs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length).replace(/[^0-9]/g, '');
        if (pastedData) {
            onChange(pastedData);
            // Focus the last input or the next empty one
            const nextIndex = Math.min(pastedData.length, length - 1);
            inputs.current[nextIndex].focus();
        }
    };

    return (
        <div className="otp-input-container">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={value[index] || ''}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(el) => (inputs.current[index] = el)}
                    className={`otp-digit-slot ${value[index] ? 'filled' : ''}`}
                    disabled={disabled}
                    maxLength={1}
                />
            ))}
        </div>
    );
};

export default OtpInput;
