class GeminiChat {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.imageButton = document.getElementById('imageButton');
        this.imageInput = document.getElementById('imageInput');
        this.inputImagePreview = document.getElementById('inputImagePreview');
        this.inputPreviewImage = document.getElementById('inputPreviewImage');
        this.removeInputImage = document.getElementById('removeInputImage');
        this.chatMessages = document.getElementById('chatMessages');
        
        this.selectedImage = null;
        this.isLoading = false;
        
        this.initializeEventListeners();
        this.autoResizeTextarea();
    }
    
    initializeEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key (Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Image upload
        this.imageButton.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.removeInputImage.addEventListener('click', () => this.removeSelectedImage());
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.selectedImage = e.target.result;
                this.inputPreviewImage.src = this.selectedImage;
                this.inputImagePreview.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }
    }
    
    removeSelectedImage() {
        this.selectedImage = null;
        this.inputImagePreview.style.display = 'none';
        this.imageInput.value = '';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message && !this.selectedImage) {
            return;
        }
        
        if (this.isLoading) {
            return;
        }
        
        // Add user message to chat
        this.addMessage(message, 'user', this.selectedImage);
        
        // Clear input
        this.messageInput.value = '';
        this.autoResizeTextarea();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Disable send button
        this.setLoading(true);
        
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    image: this.selectedImage
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            if (data.success) {
                this.typeMessage(data.response, 'bot');
            } else {
                this.addMessage('Sorry, I encountered an error: ' + data.error, 'bot');
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered a network error. Please try again.', 'bot');
            console.error('Error:', error);
        } finally {
            this.setLoading(false);
            this.removeSelectedImage();
        }
    }
    
    addMessage(text, sender, image = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (image && sender === 'user') {
            const imageElement = document.createElement('img');
            imageElement.src = image;
            imageElement.style.maxWidth = '200px';
            imageElement.style.maxHeight = '200px';
            imageElement.style.borderRadius = '10px';
            imageElement.style.marginBottom = '10px';
            contentDiv.appendChild(imageElement);
        }
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        
        if (sender === 'bot') {
            // Render markdown for bot messages
            textDiv.innerHTML = marked.parse(text);
        } else {
            // Plain text for user messages
            textDiv.textContent = text;
        }
        
        contentDiv.appendChild(textDiv);
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }
    
    typeMessage(text, sender) {
        // Create message container first
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        
        contentDiv.appendChild(textDiv);
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Simple character-by-character typing animation
        let currentText = '';
        let index = 0;
        
        const typeNextChar = () => {
            if (index >= text.length) {
                // Finished typing, now render the markdown
                textDiv.innerHTML = marked.parse(currentText);
                this.scrollToBottom();
                return;
            }
            
            currentText += text[index];
            index++;
            
            // Show raw text while typing
            textDiv.textContent = currentText;
            this.scrollToBottom();
            
            // Schedule next character
            const delay = this.getRandomDelay();
            setTimeout(typeNextChar, delay);
        };
        
        // Start typing animation
        typeNextChar();
    }
    
    getRandomDelay() {
        // Random delay between 5-25ms for fast typing
        return Math.floor(Math.random() * 20) + 5;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        
        const dotsDiv = document.createElement('div');
        dotsDiv.style.display = 'flex';
        dotsDiv.style.gap = '5px';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            dotsDiv.appendChild(dot);
        }
        
        typingDiv.appendChild(dotsDiv);
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;
        
        if (loading) {
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new GeminiChat();
});
