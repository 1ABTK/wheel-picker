const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('optionsInput');
const spinBtn = document.getElementById('spinBtn');
const removeCheck = document.getElementById('removeOption');
const staticWinnerDisplay = document.getElementById('staticWinner');
const overlay = document.getElementById('winnerOverlay');
const winnerNameDisplay = document.getElementById('winnerNameDisplay');
const countdownDisplay = document.getElementById('countdown');

// Audio
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');

let options = [];
let currentRotation = 0;
let isSpinning = false;

// Draw the wheel based on text input
function drawWheel() {
    options = input.value.split('\n').filter(t => t.trim() !== "");
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    
    ctx.clearRect(0, 0, size, size);
    if (options.length === 0) return;

    const arcSize = (2 * Math.PI) / options.length;

    options.forEach((opt, i) => {
        const angle = i * arcSize;
        
        // Draw Slice
        ctx.beginPath();
        ctx.fillStyle = `hsl(${i * (360 / options.length)}, 70%, 50%)`;
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, angle, angle + arcSize);
        ctx.lineTo(center, center);
        ctx.fill();
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        // Trim long text
        const text = opt.length > 15 ? opt.substring(0, 12) + "..." : opt;
        ctx.fillText(text, radius - 20, 10);
        ctx.restore();
    });
}

function spin() {
    if (isSpinning || options.length === 0) return;

    isSpinning = true;
    
    // Play sound (reset to start first)
    spinSound.currentTime = 0;
    spinSound.play().catch(e => console.log("Sound blocked by browser until user interacts."));
    
    // Physics parameters
    const extraSpins = Math.floor(Math.random() * 5) + 10; // 10-15 full rotations
    const randomStop = Math.random() * 360;
    const totalRotation = (extraSpins * 360) + randomStop;
    
    canvas.style.transition = 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)';
    currentRotation += totalRotation;
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    // Wait for animation to finish
    setTimeout(() => {
        isSpinning = false;
        spinSound.pause();
        winSound.play().catch(e => {});

        // Calculation:
        // The pointer is at 0 degrees (Right). 
        // As the wheel rotates clockwise (positive), we subtract the rotation from 360.
        const actualRotation = currentRotation % 360;
        const arcSize = 360 / options.length;
        let winnerIndex = Math.floor((360 - actualRotation) / arcSize) % options.length;
        
        // Handle edge case for negative results
        if (winnerIndex < 0) winnerIndex += options.length;
        
        const winner = options[winnerIndex];
        showWinnerPopup(winner, winnerIndex);
    }, 5000);
}

function showWinnerPopup(name, index) {
    winnerNameDisplay.innerText = name;
    winnerNameDisplay.style.color = `hsl(${index * (360 / options.length)}, 80%, 40%)`;
    overlay.style.display = 'flex';
    
    let timeLeft = 5;
    countdownDisplay.innerText = timeLeft;

    const interval = setInterval(() => {
        timeLeft--;
        countdownDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            closePopup(name, index);
        }
    }, 1000);
}

function closePopup(name, index) {
    overlay.style.display = 'none';
    staticWinnerDisplay.innerText = name;
    
    if (removeCheck.checked) {
        options.splice(index, 1);
        input.value = options.join('\n');
        drawWheel();
    }
}

// Event Listeners
input.addEventListener('input', drawWheel);
spinBtn.addEventListener('click', spin);

// Initialize
drawWheel();