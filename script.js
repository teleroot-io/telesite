// SYSTEM INITIALIZATION SCRIPT

const systemColors = [
    { id: 'matrix', label: 'Matrix Green', hex: '#00ff41' },
    { id: 'hacker', label: 'Terminal Monochrome', hex: '#00ff00' },
    { id: 'tron', label: 'System Blue', hex: '#00ffff' },
    { id: 'alert', label: 'Critical Red', hex: '#ff003c' },
    { id: 'amber', label: 'Retro Amber', hex: '#ffcc00' },
    { id: 'cyber', label: 'Cyberpunk Purple', hex: '#bc13fe' }
];

function applyColor(hex) {
    document.documentElement.style.setProperty('--main-color', hex);
    localStorage.setItem('systemColor', hex);
    document.getElementById('customColor').value = hex;
}

// ---------------------------
// 1. SOUND EFFECTS (SFX)
// ---------------------------
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTypingSound() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150 + Math.random() * 50, audioCtx.currentTime); 
    
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

function playAccessSound(granted = true) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = granted ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(granted ? 800 : 150, audioCtx.currentTime); 
    if(granted) {
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.5);
    }
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
}

// ---------------------------
// 2. MATRIX RAIN EFFECT
// ---------------------------
function initMatrixCanvas() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let matrixChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()<>{}[]/\\|'.split('');
    let fontSize = window.innerWidth < 600 ? 12 : 16;
    let columns = canvas.width / fontSize;
    let drops = [];

    for (let x = 0; x < columns; x++) drops[x] = 1;

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const color = getComputedStyle(document.documentElement).getPropertyValue('--main-color').trim() || '#00ff41';
        ctx.fillStyle = color;
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    window.addEventListener('resize', () => {
        if(window.innerWidth !== width) {
            width = window.innerWidth; height = window.innerHeight;
            canvas.width = width; canvas.height = height;
            fontSize = window.innerWidth < 600 ? 12 : 16;
            columns = canvas.width / fontSize;
            drops = [];
            for (let x = 0; x < columns; x++) drops[x] = 1;
        }
    });

    setInterval(drawMatrix, 33);
}

// ---------------------------
// 3. TARGET SCANNER (OS/IP Info)
// ---------------------------
function generateTargetData() {
    const ua = navigator.userAgent;
    let os = "UNKNOWN";
    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "MacOS";
    if (ua.indexOf("Linux") !== -1 || ua.indexOf("X11") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("like Mac") !== -1) os = "iOS";

    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const cores = navigator.hardwareConcurrency || "Unknown";
    
    // Fake IP for visual cool factor
    const fakeIp = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

    return [
        `[!] Fetching Target Data...`,
        `> OS: ${os}`,
        `> Resolution: ${screenRes}`,
        `> Logical Cores: ${cores}`,
        `> Assigned IP Route: ${fakeIp}`,
        `> Threat Level: ZERO`,
        `> INITIALIZATION COMPLETE.`
    ];
}

// ---------------------------
// 4. SHELL LOGIC & EASTER EGGS
// ---------------------------
function initShell() {
    const shellInput = document.getElementById('shellInput');
    const shellOutput = document.getElementById('shellOutput');
    const navButtons = document.querySelectorAll('.nav-links .button');
    const terminalShell = document.getElementById('terminalShell');
    const terminalToggleBtn = document.getElementById('terminalToggleBtn');
    const terminalCloseBtn = document.getElementById('terminalCloseBtn');

    if (terminalToggleBtn) {
        terminalToggleBtn.addEventListener('click', () => {
            terminalShell.classList.toggle('active');
            if(terminalShell.classList.contains('active')) {
                shellInput.focus();
            }
        });
    }

    if (terminalCloseBtn) {
        terminalCloseBtn.addEventListener('click', () => {
            terminalShell.classList.remove('active');
        });
    }

    // Sound effect on type
    shellInput.addEventListener('input', playTypingSound);

    // Auto-type on hover
    navButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const cmd = btn.getAttribute('data-cmd');
            if (cmd) {
                shellInput.value = cmd;
                playTypingSound();
            }
        });
        btn.addEventListener('mouseleave', () => {
            if(document.activeElement !== shellInput) shellInput.value = '';
        });
    });

    shellInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = shellInput.value.trim().toLowerCase();
            shellInput.value = '';
            
            if (val === 'clear') {
                shellOutput.innerHTML = '';
            } else if (val === 'help') {
                shellOutput.innerHTML += `<div>> Available cmds: open projects, open donate, ssh contact, clear, sudo su</div>`;
            } else if (val === 'open projects') {
                document.getElementById('projectsModal').classList.add('show');
                shellOutput.innerHTML += `<div>> Excecuting projects...</div>`;
                triggerTypewriter('projectsModal');
            } else if (val === 'open donate') {
                document.getElementById('donatModal').classList.add('show');
                shellOutput.innerHTML += `<div>> Routing funds...</div>`;
                triggerTypewriter('donatModal');
            } else if (val === 'ssh contact') {
                shellOutput.innerHTML += `<div>> Connecting via Telegram...</div>`;
                window.open('https://t.me/teleroot', '_blank');
            } else if (val === 'sudo su' || val === 'yuuki' || val === 'root') {
                document.getElementById('secretModal').classList.add('show');
                shellOutput.innerHTML += `<div style="color:red">> WARNING: ROOT PRIVILEGES ACQUIRED</div>`;
                playAccessSound(true);
            } else if (val === '') {
                shellOutput.innerHTML += `<div> </div>`;
            } else {
                shellOutput.innerHTML += `<div>> bash: ${val}: command not found</div>`;
                playAccessSound(false);
            }
            shellOutput.scrollTop = shellOutput.scrollHeight;
        }
    });
}

function initSystemClock() {
    const timeEl = document.getElementById('sysTime');
    const cpuEl = document.getElementById('sysCpu');
    const ramEl = document.getElementById('sysRam');
    
    // Выполняем сразу же, чтобы не ждать setInterval
    function updateClock() {
        const d = new Date();
        timeEl.textContent = d.toTimeString().split(' ')[0];
        
        // Fake CPU spike
        if(Math.random() > 0.8) {
            cpuEl.textContent = Math.floor(Math.random() * 80) + 10;
        }
        // Fake RAM hex change occasionally
        if(Math.random() > 0.9) {
            ramEl.textContent = (Math.floor(Math.random() * 0xFFFF)).toString(16).toUpperCase().padStart(4, '0');
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// ---------------------------
// 5. MODALS & TYPEWRITER EFFECT
// ---------------------------
function triggerTypewriter(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const targets = modal.querySelectorAll('.typewriter-target');
    
    targets.forEach(target => {
        target.classList.remove('hidden');
        const contentHtml = target.getAttribute('data-content');
        if (!contentHtml) return;

        target.innerHTML = '';
        let i = 0;
        let isTag = false;
        let text = contentHtml;

        function typeChar() {
            if (i < text.length) {
                if (text.charAt(i) === '<') isTag = true;
                
                target.innerHTML = text.substring(0, i + 1);
                i++;
                
                if (text.charAt(i - 1) === '>') isTag = false;
                
                if (isTag) {
                    typeChar();
                } else {
                    if (Math.random() > 0.5) playTypingSound();
                    setTimeout(typeChar, 10);
                }
            }
        }
        typeChar();
    });
}

function initModals() {
    // Click triggers
    document.addEventListener('click', (e) => {
        const openBtn = e.target.closest('[data-open-modal]');
        if (openBtn) {
            e.preventDefault();
            const modalId = openBtn.getAttribute('data-open-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('show');
                triggerTypewriter(modalId);
            }
        }
        const closeBtn = e.target.closest('[data-close-modal]');
        if (closeBtn) {
            e.preventDefault();
            const modalId = closeBtn.getAttribute('data-close-modal');
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('show');
        }
    });

    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    });
}

// ---------------------------
// 6. MAIN INITIALIZATION
// ---------------------------
window.addEventListener('DOMContentLoaded', () => {
    const savedColor = localStorage.getItem('systemColor') || systemColors[0].hex;
    applyColor(savedColor);

    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => preloader.classList.add('hidden'), 1000);
    }
    
    // Инициализация важных и независимых компонентов сразу
    initSystemClock();
    initShell();
    initModals();

    const startOverlay = document.getElementById('startOverlay');
    let hasStarted = false;

    // Inject scanner data before start
    const targetDataLines = generateTargetData();
    const dataContainer = document.createElement('div');
    dataContainer.className = 'target-data';
    if (startOverlay) {
        startOverlay.appendChild(dataContainer);
    }
    
    let lineIdx = 0;
    const scanInt = setInterval(() => {
        if(lineIdx < targetDataLines.length) {
            const p = document.createElement('div');
            p.textContent = targetDataLines[lineIdx];
            dataContainer.appendChild(p);
            lineIdx++;
        } else {
            clearInterval(scanInt);
        }
    }, 300);


    const handleStart = () => {
        if (hasStarted) return;
        hasStarted = true;
        initAudio(); // Required due to browser autoplay policies
        
        if(startOverlay) startOverlay.style.display = 'none';
        
        initMatrixCanvas();
        
        const typingStatus = document.getElementById('typingStatus');
        const statuses = ['System initialized...', 'Root access granted...', 'Compiling source code...', 'A R C H E R _ O N L I N E'];
        let statusIndex = 0; let charIndex = 0; let isDeleting = false;

        function typeStatus() {
            if (!typingStatus) return;
            const currentText = statuses[statusIndex];
            if (isDeleting) {
                typingStatus.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingStatus.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }
            let typeSpeed = isDeleting ? 30 : 80;
            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                statusIndex = (statusIndex + 1) % statuses.length;
                typeSpeed = 500;
            }
            setTimeout(typeStatus, typeSpeed);
        }
        typeStatus();
    };

    if (startOverlay) {
        startOverlay.addEventListener('click', handleStart);
        startOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleStart();
        });
        startOverlay.addEventListener('touchstart', handleStart, {passive: true});
    }

    const themeMenuButton = document.getElementById('themeMenuButton');
    const themeOverlay = document.getElementById('themeOverlay');
    const themeCloseButton = document.getElementById('themeCloseButton');
    const themeList = document.getElementById('themeList');
    const customColorInput = document.getElementById('customColor');

    if (themeList) {
        systemColors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'theme-item';
            const preview = document.createElement('div');
            preview.className = 'color-preview';
            preview.style.backgroundColor = color.hex;
            const label = document.createElement('span');
            label.textContent = `> ${color.label}`;
            btn.appendChild(preview);
            btn.appendChild(label);
            btn.addEventListener('click', () => applyColor(color.hex));
            themeList.appendChild(btn);
        });
    }

    if (customColorInput) {
        customColorInput.addEventListener('input', (e) => applyColor(e.target.value));
    }
    if (themeMenuButton) {
        themeMenuButton.addEventListener('click', () => themeOverlay.classList.add('is-open'));
    }
    if (themeCloseButton) {
        themeCloseButton.addEventListener('click', () => themeOverlay.classList.remove('is-open'));
    }

    const focusButton = document.getElementById('focusButton');
    if (focusButton) {
        focusButton.addEventListener('click', () => {
            document.body.classList.toggle('focus-mode');
            focusButton.classList.toggle('active');
        });
    }
});
