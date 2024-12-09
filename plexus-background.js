const canvas = document.getElementById('plexusCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let nodeColor = '#012739'; // Node and line color
let lineOpacity = 0.15; // Line opacity
let numberOfNodes = 100; // Number of nodes
let nodes = [];

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let mouseActive = true;

// Track mouse movement
window.addEventListener('mousemove', function (event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

// Toggle mouse attraction on click
window.addEventListener('click', function () {
    mouseActive = !mouseActive;
    console.log(`Mouse attraction is now ${mouseActive ? 'enabled' : 'disabled'}.`);
});

// Create nodes
function createNodes(count) {
    nodes = [];
    for (let i = 0; i < count; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 2,
            speedX: (Math.random() - 0.5) * 2, // Speed in x direction
            speedY: (Math.random() - 0.5) * 2, // Speed in y direction
        });
    }
}

// Update node positions
function updateNodes() {
    nodes.forEach(node => {
        if (mouseActive) {
            let dx = mouseX - node.x;
            let dy = mouseY - node.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                node.x += dx * 0.05; // Magnetic pull
                node.y += dy * 0.05;
            }
        }

        node.x += node.speedX;
        node.y += node.speedY;

        if (node.x < 0 || node.x > canvas.width) node.speedX *= -1;
        if (node.y < 0 || node.y > canvas.height) node.speedY *= -1;
    });
}

// Draw Plexus
function draw() {
    updateNodes();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach((node, i) => {
        // Connect lines between close nodes
        for (let j = i + 1; j < nodes.length; j++) {
            let dx = node.x - nodes[j].x;
            let dy = node.y - nodes[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                ctx.beginPath();
                ctx.strokeStyle = nodeColor;
                ctx.globalAlpha = lineOpacity;
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }

        // Draw individual nodes
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = nodeColor;
        ctx.globalAlpha = 1;
        ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
}

// Handle resizing
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createNodes(numberOfNodes);
});

// Initialize nodes and animation
createNodes(numberOfNodes);
draw();
