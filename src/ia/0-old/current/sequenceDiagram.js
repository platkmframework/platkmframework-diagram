const canvas = document.getElementById('sequenceDiagram');
const ctx = canvas.getContext('2d');

// Define arrays to hold actors, messages, frames, and execution specs
const actors = [];
const messages = [];
const frames = [];
const executionSpecs = [];

// Actor properties
const actorY = 50;
const actorSpacing = 200;

// Object to store actor positions
const actorPositions = {};

// Function to add an actor
function addActor(name) {
    if (!actors.includes(name) && name.trim()) {
        actors.push(name);
        actorPositions[name] = { x: 100 + (actors.length - 1) * actorSpacing, y: actorY };
        drawSequenceDiagram(); // Redraw the diagram after adding an actor
    }
}

// Function to add a message
function addMessage(fromIndex, toIndex, message, time) {
    messages.push({ fromIndex, toIndex, message, time });
}

// Function to add a frame
function addFrame(name) {
    frames.push(name);
}

// Function to add an execution specification
function addExecutionSpec(actorIndex) {
    executionSpecs.push({ actorIndex });
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

// Function to draw frames
function drawFrames() {
    frames.forEach((name, index) => {
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(50, 30 + index * 200, canvas.width - 100, 150); // Simple frame
        ctx.fillText(name, 60, 50 + index * 200);
    });
}

// Function to draw execution specifications
function drawExecutionSpecs() {
    executionSpecs.forEach(({ actorIndex }) => {
        const actorPos = actorPositions[actors[actorIndex]];
        const x = actorPos.x;
        const y = actorY + 30; // Simple positioning
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'red';
        ctx.fillRect(x - 10, y, 20, 50); // Execution spec rectangle
    });
}

// Function to draw the entire sequence diagram
function drawSequenceDiagram() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';

    // Draw frames and execution specifications
    drawFrames();
    drawExecutionSpecs();

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
let isDraggingExecution = false;
let dragActor = null;
let dragMessageIndex = null;
let dragExecutionIndex = null;
let offsetX = 0;
let offsetY = 0;

// Event handlers for dragging and message creation
canvas.addEventListener('mousedown', (e) => {
    const mousePos = getMousePos(canvas, e);
    
    // Check for clicks on actor lines
    actors.forEach((actor, index) => {
        const pos = actorPositions[actor];
        if (mousePos.x >= pos.x - 15 && mousePos.x <= pos.x + 15 && mousePos.y >= pos.y + 5 && mousePos.y <= canvas.height - 50) {
            if (!isDraggingActor && !isDraggingMessage) {
                isDraggingActor = true;
                dragActor = actor;
                offsetX = mousePos.x - actorPositions[dragActor].x;
            }
            return; // Exit after processing the actor click
        }
    });

    // Check for clicks on messages
    messages.forEach((msg, index) => {
        const fromPos = actorPositions[actors[msg.fromIndex]];
        const toPos = actorPositions[actors[msg.toIndex]];
        const messageY = actorY + 30 + (msg.time * 50);
        if (mousePos.x >= Math.min(fromPos.x, toPos.x) && mousePos.x <= Math.max(fromPos.x, toPos.x) && mousePos.y >= messageY - 15 && mousePos.y <= messageY + 15) {
            isDraggingMessage = true;
            dragMessageIndex = index;
            offsetY = mousePos.y - (actorY + 30 + (messages[dragMessageIndex].time * 50));
        }
    });

    // Check for clicks on execution specifications
    executionSpecs.forEach((exec, index) => {
        const actorPos = actorPositions[actors[exec.actorIndex]];
        if (mousePos.x >= actorPos.x - 10 && mousePos.x <= actorPos.x + 10 && mousePos.y >= actorY + 30 && mousePos.y <= actorY + 80) {
            isDraggingExecution = true;
            dragExecutionIndex = index;
            offsetY = mousePos.y - (actorY + 30);
        }
    });

    // Handle message creation
    if (!isDraggingActor && !isDraggingMessage) {
        let clickCount = 0;
        let firstActorIndex = null;
        let secondActorIndex = null;

        actors.forEach((actor, index) => {
            const pos = actorPositions[actor];
            if (mousePos.x >= pos.x - 15 && mousePos.x <= pos.x + 15 && mousePos.y >= pos.y + 5 && mousePos.y <= canvas.height - 50) {
                if (clickCount === 0) {
                    firstActorIndex = index;
                    clickCount++;
                    return; // Exit after the first click
                } else if (clickCount === 1) {
                    secondActorIndex = index;
                    const messageText = prompt("Enter message text:"); // Prompt for message text
                    if (messageText) {
                        addMessage(firstActorIndex, secondActorIndex, messageText, messages.length);
                    }
                    clickCount = 0; // Reset for the next message
                    firstActorIndex = null;
                    secondActorIndex = null;
                    drawSequenceDiagram(); // Redraw the diagram after adding a message
                }
            }
        });
    }
});

canvas.addEventListener('mouseup', () => {
    isDraggingActor = false;
    isDraggingMessage = false;
    isDraggingExecution = false;
    dragActor = null;
    dragMessageIndex = null;
    dragExecutionIndex = null;
});

canvas.addEventListener('mousemove', (e) => {
    const mousePos = getMousePos(canvas, e);
    if (isDraggingActor && dragActor) {
        actorPositions[dragActor].x = mousePos.x - offsetX;

        drawSequenceDiagram();
    } else if (isDraggingMessage && dragMessageIndex !== null) {
        messages[dragMessageIndex].time = Math.max(0, Math.floor((mousePos.y - actorY - 30) / 50)); // Update message vertical position
        drawSequenceDiagram();
    } else if (isDraggingExecution && dragExecutionIndex !== null) {
        const actorPos = actorPositions[actors[executionSpecs[dragExecutionIndex].actorIndex]];
        actorPositions[actors[executionSpecs[dragExecutionIndex].actorIndex]].y = mousePos.y - offsetY; // Adjust execution specification
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

// Add functionality to create new actors
document.getElementById('addActorButton').addEventListener('click', () => {
    const actorName = document.getElementById('actorName').value.trim();
    addActor(actorName);
    document.getElementById('actorName').value = ''; // Clear the input field
});

// Example usage
function initializeDiagram() {
    // Add initial actors
    addActor('User');
    addActor('System');

    // Add messages
    addMessage(0, 1, 'Login', 0); // User -> System
    addMessage(1, 0, 'Success', 1); // System -> User

    // Add a frame
    addFrame('Login Frame');

    // Add execution specifications
    addExecutionSpec(1); // For 'System'

    // Draw the diagram
    drawSequenceDiagram();
}

// Initialize the diagram
