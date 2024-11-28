const canvas = document.getElementById('sequenceDiagram');
const ctx = canvas.getContext('2d');

// Define an array to hold actors and messages
const actors = [];
const messages = [];

// Actor position settings
const actorY = 50;
const actorSpacing = 200;

// Function to add an actor
function addActor(name) {
    if (!actors.includes(name)) {
        actors.push(name);
    }
}

// Function to add a message
function addMessage(fromIndex, toIndex, message, time) {
    messages.push({ fromIndex, toIndex, message, time });
}

// Function to draw actors
function drawActors() {
    actors.forEach((actor, index) => {
        const x = 100 + index * actorSpacing;
        ctx.fillText(actor, x, actorY);
        ctx.moveTo(x, actorY + 5);
        ctx.lineTo(x, canvas.height - 50);
        ctx.stroke();
    });
}

// Function to draw messages
function drawMessage(fromIndex, toIndex, message, time) {
    const fromX = 100 + fromIndex * actorSpacing;
    const toX = 100 + toIndex * actorSpacing;
    const messageY = actorY + 30 + (time * 50); // Vertical spacing for messages

    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(fromX, messageY);
    ctx.lineTo(toX, messageY);
    ctx.stroke();

    // Draw message text
    const midX = (fromX + toX) / 2;
    ctx.fillText(message, midX, messageY - 5);
}

// Function to draw the entire sequence diagram
function drawSequenceDiagram() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';

    // Draw actors
    drawActors();

    // Draw messages
    messages.forEach(({ fromIndex, toIndex, message, time }) => {
        drawMessage(fromIndex, toIndex, message, time);
    });
}

// Example usage
function initializeDiagram() {
    // Add actors
    addActor('User');
    addActor('System');
    addActor('Database');

    // Add messages
    addMessage(0, 1, 'Login', 0); // User -> System
    addMessage(1, 2, 'Query User', 1); // System -> Database
    addMessage(2, 1, 'User Data', 2); // Database -> System
    addMessage(1, 0, 'Success', 3); // System -> User

    // Draw the diagram
    drawSequenceDiagram();
}

// Initialize the diagram
initializeDiagram();
