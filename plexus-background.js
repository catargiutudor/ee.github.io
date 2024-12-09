const canvas = document.getElementById('plexusCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let nodeColor = '#012739'; // Subtle dark tone matching the background
let lineOpacity = 0.15; // Low opacity for subtle visibility
let numberOfNodes = 50; // Adjusted node count for simplicity
let nodes = [];
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

window.addEventListener('mousemove', function (event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

function createNodes(count) {
    nodes = [];
    for (let i = 0; i < count; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 2,
            speedX: (Math.random() - 0.5) * 1.5,
            speedY: (Math.random() - 0.5) * 1.5,
        });
    }
}

function updateNodes() {
    nodes.forEach(node => {
        node.x += node.speedX;
        node.y += node.speedY;

        if (node.x < 0 || node.x > canvas.width) node.speedX *= -1;
        if (node.y < 0 || node.y > canvas.height) node.speedY *= -1;
    });
}

function draw() {
    updateNodes();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach((node, i) => {
        for (let j = i + 1; j < nodes.length; j++) {
            let dx = node.x - nodes[j].x;
            let dy = node.y - nodes[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = nodeColor;
                ctx.globalAlpha = lineOpacity;
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
            }
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = nodeColor;
        ctx.globalAlpha = 0.8;
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

createNodes(numberOfNodes);
draw();
