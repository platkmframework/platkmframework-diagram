const canvas = document.getElementById('sequenceDiagram');
const ctx = canvas.getContext('2d');

// Define an array to hold actors and messages
const actors = [];
const messages = [];

// Actor properties
const actorY = 50;
const actorSpacing = 200;

// Object to store actor positions
const actorPositions = {};

// Function to add an actor
function addActor(name) {
    if (!actors.includes(name)) {
        actors.push(name);
        actorPositions[name] = { x: 100 + (actors.length - 1) * actorSpacing, y: actorY };
    }
}

// Function to add a message
function addMessage(fromIndex, toIndex, message, time) {
    messages.push({ fromIndex, toIndex, message, time });
}

// Function to draw actors
function drawActors() {
    actors.forEach((actor) => {
        const pos = actorPositions[actor];
        ctx.fillText(actor, pos.x, pos.y);
        ctx.moveTo(pos.x, pos.y + 5);
        ctx.lineTo(pos.x, canvas.height - 50);
        ctx.stroke();
    });
}

// Function to draw messages
function drawMessage(fromIndex, toIndex, message, time) {
    const fromPos = actorPositions[actors[fromIndex]];
    const toPos = actorPositions[actors[toIndex]];
    const messageY = actorY + 30 + (time * 50); // Vertical spacing for messages

    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(fromPos.x, messageY);
    ctx.lineTo(toPos.x, messageY);
    ctx.stroke();

    // Draw message text
    const midX = (fromPos.x + toPos.x) / 2;
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

// Dragging functionality
let isDraggingActor = false;
let isDraggingMessage = false;
let dragActor = null;
let dragMessageIndex = null;
let offsetX = 0;
let offsetY = 0;

// Event handlers for dragging
canvas.addEventListener('mousedown', (e) => {
    const mousePos = getMousePos(canvas, e);
    const clickedActor = actors.find(a => {
        const pos = actorPositions[a];
        return mousePos.x >= pos.x - 15 && mousePos.x <= pos.x + 15 && mousePos.y >= pos.y - 15 && mousePos.y <= pos.y + 15;
    });

    if (clickedActor) {
        isDraggingActor = true;
        dragActor = clickedActor;
        offsetX = mousePos.x - actorPositions[dragActor].x;
    } else {
        const clickedMessageIndex = messages.findIndex((msg, index) => {
            const fromPos = actorPositions[actors[msg.fromIndex]];
            const toPos = actorPositions[actors[msg.toIndex]];
            const messageY = actorY + 30 + (msg.time * 50);
            return mousePos.x >= Math.min(fromPos.x, toPos.x) && mousePos.x <= Math.max(fromPos.x, toPos.x) && mousePos.y >= messageY - 15 && mousePos.y <= messageY + 15;
        });

        if (clickedMessageIndex !== -1) {
            isDraggingMessage = true;
            dragMessageIndex = clickedMessageIndex;
            offsetY = mousePos.y - (actorY + 30 + (messages[dragMessageIndex].time * 50));
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDraggingActor = false;
    isDraggingMessage = false;
    dragActor = null;
    dragMessageIndex = null;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDraggingActor && dragActor) {
        const mousePos = getMousePos(canvas, e);
        actorPositions[dragActor].x = mousePos.x - offsetX;

        // Update the positions of the messages connected to the actor
        messages.forEach((msg) => {
            if (msg.fromIndex === actors.indexOf(dragActor) || msg.toIndex === actors.indexOf(dragActor)) {
                msg.time = msg.time; // Keep track of message time for vertical positioning
            }
        });

        drawSequenceDiagram();
    } else if (isDraggingMessage && dragMessageIndex !== null) {
        const mousePos = getMousePos(canvas, e);
        messages[dragMessageIndex].time = Math.max(0, Math.floor((mousePos.y - actorY - 30) / 50)); // Update message vertical position
        drawSequenceDiagram();
    }
});

// Function to get mouse position on canvas
function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
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
