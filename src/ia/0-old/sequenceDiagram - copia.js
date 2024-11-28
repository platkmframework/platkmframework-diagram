
const canvas = document.getElementById('sequenceDiagram');
const ctx = canvas.getContext('2d');

// Define actors
const actors = ['User', 'System', 'Database'];
const actorY = 50;

// Draw actors
function drawActors() {
    actors.forEach((actor, index) => {
        const x = 100 + index * 200;
        ctx.fillText(actor, x, actorY);
        ctx.moveTo(x, actorY + 5);
        ctx.lineTo(x, canvas.height - 50);
        ctx.stroke();
    });
}

// Draw messages
function drawMessage(fromIndex, toIndex, message, time) {
    const fromX = 100 + fromIndex * 200;
    const toX = 100 + toIndex * 200;
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

// Draw sequence diagram
function drawSequenceDiagram() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';

    // Draw actors
    drawActors();

    // Draw messages
    drawMessage(0, 1, 'Login', 0); // User -> System
    drawMessage(1, 2, 'Query User', 1); // System -> Database
    drawMessage(2, 1, 'User Data', 2); // Database -> System
    drawMessage(1, 0, 'Success', 3); // System -> User
}

// Initial draw
drawSequenceDiagram();
