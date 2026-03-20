import React, { useState, useRef, useEffect } from 'react';
import '../styles/Chatbot.css';

const foodSuggestions = {
    hungry: ["🍕 Try a Cheese Burst Pizza!", "🍔 How about a crispy Veg Burger?", "🍛 Paneer Biryani is always a great choice!"],
    healthy: ["🥗 Go for our Green Bowl Salad!", "🥙 Try Veg Momos - light and tasty!", "🍲 Our healthy bowls are chef's special!"],
    spicy: ["🌶️ Peri Peri Fries are on fire!", "🍛 Paneer Tikka Pizza has the kick you need!", "🌯 Try our Fried Momos with extra chutney!"],
    sweet: ["🍰 Sweet Delight's cakes are amazing!", "🍨 Our ice cream selection is top-notch!", "🧁 Chocolate lava cake is a must-try!"],
    cheap: ["🍟 French Fries at ₹99 - great deal!", "🥟 Veg Momos at ₹119 - value for money!", "🍔 Veg Burger at ₹129 - filling and affordable!"],
    pizza: ["🍕 Margherita Pizza (₹199) - Classic!", "🍕 Cheese Burst Pizza (₹299) - Cheesy!", "🍕 Paneer Tikka Pizza (₹329) - Spicy!"],
    burger: ["🍔 Veg Burger (₹129) - Simple & tasty!", "🍔 Cheese Burger (₹159) - Extra cheesy!", "🍔 Paneer Burger (₹179) - Premium!"],
    default: ["Check out our today's specials! 🌟", "Popular choice: Paneer Biryani 🍛", "Try our best seller: Cheese Burst Pizza 🍕"]
};

const getResponse = (input) => {
    const lower = input.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        return "Hey there! 👋 I'm Eatify Bot! How can I help you today? Ask me about food recommendations!";
    }
    if (lower.includes('menu') || lower.includes('what do you have')) {
        return "We have Pizza 🍕, Burgers 🍔, Chinese 🍜, Biryani 🍛, Momos 🥟, Fries 🍟, Paneer dishes, and Desserts 🍰! What interests you?";
    }
    if (lower.includes('order') || lower.includes('track')) {
        return "To track your order, go to the Order History page from the navbar! You can see real-time status updates there. 📦";
    }
    if (lower.includes('coupon') || lower.includes('discount') || lower.includes('offer')) {
        return "🎉 Try these coupons!\n• WELCOME50 - 50% off first order\n• EATIFY20 - 20% off on ₹300+\n• FLAT100 - ₹100 off on ₹500+\n• FREESHIP - 10% off delivery";
    }
    if (lower.includes('delivery') || lower.includes('time')) {
        return "🚴 Average delivery time is 25-35 minutes. You can track your delivery in real-time on the map!";
    }
    if (lower.includes('payment') || lower.includes('pay') || lower.includes('upi')) {
        return "💳 We accept UPI, Credit/Debit Cards! Payment is secure and instant. Scan the QR code at checkout!";
    }
    if (lower.includes('help') || lower.includes('support')) {
        return "I can help with:\n• 🍕 Food recommendations\n• 📦 Order tracking\n• 🎟️ Coupon codes\n• 💳 Payment info\n• 🚴 Delivery details\nJust ask!";
    }

    // Food-specific suggestions
    for (const [key, suggestions] of Object.entries(foodSuggestions)) {
        if (lower.includes(key)) {
            return suggestions[Math.floor(Math.random() * suggestions.length)];
        }
    }

    if (lower.includes('suggest') || lower.includes('recommend') || lower.includes('what should')) {
        const allSuggestions = Object.values(foodSuggestions).flat();
        return allSuggestions[Math.floor(Math.random() * allSuggestions.length)];
    }

    return foodSuggestions.default[Math.floor(Math.random() * foodSuggestions.default.length)] +
        "\n\nYou can ask me about: pizza, burger, healthy food, spicy dishes, sweet treats, or budget options! 😊";
};

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! 👋 I'm Eatify Bot! Ask me anything orally or by typing!", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text) => {
        const msgText = text || input;
        if (!msgText.trim()) return;

        const userMessage = { text: msgText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        // Simulate typing delay
        setTimeout(() => {
            const response = getResponse(msgText);
            setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
            
            // Speak the response (Advanced Text-to-Speech)
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(response.replace(/[🍕🍔🍛🥗🍰🌶️🥟🍟📦🎟️💳🚴👋😊🌟]/g, ''));
                utterance.rate = 1.1;
                utterance.pitch = 1;
                window.speechSynthesis.speak(utterance);
            }
        }, 500);

        if (!text) setInput('');
    };

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSend(transcript);
        };

        recognition.start();
    };

    const quickActions = [
        { label: '🍕 Pizza', msg: 'pizza' },
        { label: '🍔 Burger', msg: 'burger' },
        { label: '🎟️ Coupons', msg: 'coupon' },
        { label: '❓ Help', msg: 'help' },
    ];

    return (
        <>
            <button
                className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Chat with Eatify Bot"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <span className="chatbot-avatar">🤖</span>
                            <div>
                                <h4>Eatify AI Concierge</h4>
                                <span className="chatbot-status">● Advanced AI Active</span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chatbot-msg ${msg.sender}`}>
                                {msg.sender === 'bot' && <span className="msg-avatar">🤖</span>}
                                <div className="msg-bubble">
                                    {msg.text.split('\n').map((line, j) => (
                                        <span key={j}>{line}<br/></span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-quick-actions">
                        {quickActions.map((action, i) => (
                            <button key={i} onClick={() => handleSend(action.msg)}>
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Type or use microphone..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            className={`mic-btn ${isListening ? 'listening' : ''}`} 
                            onClick={startVoiceInput}
                            type="button"
                        >
                            {isListening ? '⏺️' : '🎤'}
                        </button>
                        <button onClick={() => handleSend()}>➤</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
