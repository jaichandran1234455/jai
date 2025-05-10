document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    let knowledgeBase = [];
    
    // Load knowledge base from CSV
    loadKnowledgeBase();
    
    // Send message when button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';
        
        // Process user message
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response, 'bot');
            
            // Scroll to bottom of chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 500);
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom of chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function getBotResponse(userMessage) {
        // Convert to lowercase for case-insensitive matching
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for exact matches first
        const exactMatch = knowledgeBase.find(item => 
            item.question.toLowerCase() === lowerMessage
        );
        
        if (exactMatch) {
            return exactMatch.answer;
        }
        
        // Check for partial matches
        const partialMatches = knowledgeBase.filter(item => 
            lowerMessage.includes(item.question.toLowerCase()) || 
            item.question.toLowerCase().includes(lowerMessage)
        );
        
        if (partialMatches.length > 0) {
            // Return the best match (longest question match)
            partialMatches.sort((a, b) => b.question.length - a.question.length);
            return partialMatches[0].answer;
        }
        
        // If no matches found
        return "I'm sorry, I don't have an answer for that. Could you try rephrasing your question or ask something else?";
    }
    
    function loadKnowledgeBase() {
        fetch('chatbot_data.csv')
            .then(response => response.text())
            .then(data => {
                // Parse CSV data
                const lines = data.split('\n');
                const headers = lines[0].split(',');
                
                for (let i = 1; i < lines.length; i++) {
                    const currentLine = lines[i].split(',');
                    if (currentLine.length === headers.length) {
                        knowledgeBase.push({
                            question: currentLine[0].trim(),
                            answer: currentLine[1].trim()
                        });
                    }
                }
                
                console.log('Knowledge base loaded:', knowledgeBase);
            })
            .catch(error => {
                console.error('Error loading knowledge base:', error);
                // Default responses if CSV fails to load
                knowledgeBase = [
                    {
                        question: "hello",
                        answer: "Hello! How can I assist you today?"
                    },
                    {
                        question: "hi",
                        answer: "Hi there! What can I help you with?"
                    },
                    {
                        question: "help",
                        answer: "I'm here to help! Please ask me your question."
                    }
                ];
            });
    }
    
    // Periodically check for updates to the CSV file
    setInterval(() => {
        fetch('chatbot_data.csv?cache=' + new Date().getTime())
            .then(response => response.text())
            .then(data => {
                const newKnowledgeBase = [];
                const lines = data.split('\n');
                const headers = lines[0].split(',');
                
                for (let i = 1; i < lines.length; i++) {
                    const currentLine = lines[i].split(',');
                    if (currentLine.length === headers.length) {
                        newKnowledgeBase.push({
                            question: currentLine[0].trim(),
                            answer: currentLine[1].trim()
                        });
                    }
                }
                
                // Only update if there are changes
                if (JSON.stringify(newKnowledgeBase) !== JSON.stringify(knowledgeBase)) {
                    knowledgeBase = newKnowledgeBase;
                    console.log('Knowledge base updated');
                }
            })
            .catch(error => {
                console.error('Error checking for knowledge base updates:', error);
            });
    }, 30000); // Check every 30 seconds
});