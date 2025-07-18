// Final complete version with Interactive Character and all features.

class AudioManager {
    constructor(soundElements) {
        this.sounds = soundElements;
        this.isUnlocked = false;
    }

    unlockAudio() {
        if (this.isUnlocked) return;
        for (const key in this.sounds) {
            const sound = this.sounds[key];
            if (sound) {
                sound.volume = 0;
                sound.play().then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.volume = 1;
                }).catch(error => console.error(`Audio unlock failed for ${key}:`, error));
            }
        }
        this.isUnlocked = true;
    }

    play(name) {
        const sound = this.sounds[name];
        if (sound && this.isUnlocked) {
            sound.currentTime = 0;
            sound.play().catch(error => console.error(`Error playing sound "${name}":`, error));
        }
    }
}

class FloatingNumbersBackground {
    constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.width = window.innerWidth; this.height = window.innerHeight; this.canvas.width = this.width; this.canvas.height = this.height; this.particles = []; this.color = '#4f46e5'; this.animationId = null; }
    createParticles(count = 40) { this.particles = []; for (let i = 0; i < count; i++) { this.particles.push({ x: Math.random() * this.width, y: Math.random() * this.height, value: Math.floor(Math.random() * 9) + 1, size: Math.random() * 80 + 20, speedX: (Math.random() - 0.5) * 0.5, speedY: (Math.random() - 0.5) * 0.5, angle: Math.random() * 360, spin: (Math.random() - 0.5) * 0.1 }); } }
    updateColor(newColor) { this.color = newColor; }
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY; p.angle += p.spin;
            if (p.x > this.width + p.size) p.x = -p.size; if (p.x < -p.size) p.x = this.width + p.size;
            if (p.y > this.height + p.size) p.y = -p.size; if (p.y < -p.size) p.y = this.height + p.size;
            this.ctx.save(); this.ctx.translate(p.x, p.y); this.ctx.rotate(p.angle * Math.PI / 180);
            this.ctx.font = `bold ${p.size}px Poppins`; this.ctx.fillStyle = this.color; this.ctx.globalAlpha = 0.2;
            this.ctx.textAlign = "center"; this.ctx.textBaseline = "middle"; this.ctx.fillText(p.value, 0, 0); this.ctx.restore();
        });
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    start() { this.createParticles(); window.addEventListener('resize', () => { this.width = window.innerWidth; this.height = window.innerHeight; this.canvas.width = this.width; this.canvas.height = this.height; this.createParticles(); }); this.animate(); }
}

class FlowerShower {
    constructor(canvas, colors) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.width = window.innerWidth; this.height = window.innerHeight; this.canvas.width = this.width; this.canvas.height = this.height; this.colors = colors; this.petals = []; this.animationId = null; this.petalCount = 100; }
    createPetals() { for (let i = 0; i < this.petalCount; i++) { this.petals.push({ x: Math.random() * this.width, y: Math.random() * -this.height, size: Math.random() * 8 + 5, color: this.colors[Math.floor(Math.random() * this.colors.length)], speed: Math.random() * 2 + 1, rotation: Math.random() * Math.PI * 2, sway: Math.random() - 0.5, swaySpeed: (Math.random() - 0.5) * 0.01 }); } }
    drawPetal(petal) { this.ctx.beginPath(); this.ctx.fillStyle = petal.color; this.ctx.translate(petal.x, petal.y); this.ctx.rotate(petal.rotation); this.ctx.moveTo(0, 0); this.ctx.quadraticCurveTo(petal.size / 2, petal.size, petal.size, 0); this.ctx.quadraticCurveTo(petal.size / 2, -petal.size, 0, 0); this.ctx.fill(); this.ctx.setTransform(1, 0, 0, 1, 0, 0); }
    update() { this.petals.forEach(p => { p.y += p.speed; p.x += Math.sin(p.rotation) * p.sway; p.rotation += p.swaySpeed; if (p.y > this.height) { p.y = Math.random() * -100; p.x = Math.random() * this.width; } }); }
    animate() { this.ctx.clearRect(0, 0, this.width, this.height); this.petals.forEach(p => this.drawPetal(p)); this.update(); this.animationId = requestAnimationFrame(this.animate.bind(this)); }
    start() { this.createPetals(); this.animate(); }
    stop() { if (this.animationId) { cancelAnimationFrame(this.animationId); } this.ctx.clearRect(0, 0, this.width, this.height); this.petals = []; this.animationId = null; }
}

class CharacterController {
    constructor(elements, audioManager) {
        this.elements = elements;
        this.audioManager = audioManager;
        this.timeoutId = null;
    }
    init() { window.addEventListener('mousemove', (e) => this.updatePupils(e)); }
    updatePupils(event) {
        const eyes = this.elements.animatedCharacter.querySelectorAll('.eye');
        eyes.forEach(eye => {
            const rect = eye.getBoundingClientRect();
            const x = (rect.left) + (rect.width / 2); const y = (rect.top) + (rect.height / 2);
            const radian = Math.atan2(event.pageX - x, event.pageY - y);
            const rot = (radian * (180 / Math.PI) * -1) + 270;
            const pupil = eye.querySelector('.pupil'); pupil.style.transform = `rotate(${rot}deg) translateX(3px)`;
        });
    }
    react(reactionType, text = null) {
        const character = this.elements.animatedCharacter; const mouth = character.querySelector('.mouth');
        character.classList.remove('is-reacting', 'is-sad'); mouth.classList.remove('is-happy', 'is-sad');
        clearTimeout(this.timeoutId);
        if (text) { this.elements.characterNumber.textContent = text; }
        switch(reactionType) {
            case 'numberSelect':
                character.classList.add('is-reacting'); mouth.classList.add('is-happy');
                this.timeoutId = setTimeout(() => mouth.classList.remove('is-happy'), 500);
                break;
            case 'mistake':
                character.classList.add('is-sad'); mouth.classList.add('is-sad');
                this.audioManager.play('mistake');
                this.timeoutId = setTimeout(() => { character.classList.remove('is-sad'); mouth.classList.remove('is-sad'); }, 1000);
                break;
            case 'win':
                character.classList.add('is-reacting'); mouth.classList.add('is-happy');
                this.elements.characterNumber.textContent = '🎉';
                this.audioManager.play('win');
                break;
            case 'lose':
                 character.classList.add('is-sad'); mouth.classList.add('is-sad');
                 this.elements.characterNumber.textContent = 'X_X';
                 this.audioManager.play('lose');
                 break;
            case 'idle':
                this.elements.characterNumber.textContent = ':)';
                break;
        }
    }
}

class SudokuGame {
    constructor() {
        this.MISTAKE_LIMIT = 3;
        this.elements = {
            body: document.body, startScreen: document.getElementById("start-screen"), gameContainer: document.getElementById("game-container"),
            board: document.getElementById("board"), pauseOverlay: document.getElementById("pause-overlay"), digits: document.getElementById("digits"),
            actionControls: document.getElementById("action-controls"), newGameBtn: document.getElementById("new-game-btn"),
            startDifficultySelector: document.getElementById("start-difficulty-selector"), startGameBtn: document.getElementById("start-game-btn"),
            timer: document.getElementById("timer"), hintBadge: document.getElementById("hint-badge"), notesBtn: document.getElementById("notes-btn"),
            difficultyDisplay: document.getElementById("difficulty-display"), mistakesDisplay: document.getElementById("mistakes-display"),
            modalBackdrop: document.getElementById("modal-backdrop"), winModal: document.getElementById("win-modal"),
            gameOverModal: document.getElementById("game-over-modal"), playAgainBtn: document.getElementById("play-again-btn"),
            pauseBtn: document.getElementById("pause-btn"), previewGrid: document.querySelector('.preview-grid'),
            bestTimesDisplay: document.getElementById('best-times-display'), themesLink: document.getElementById("themes-link"),
            themesModal: document.getElementById("themes-modal"), themeOptionsContainer: document.getElementById("theme-options-container"),
            rulesLink: document.getElementById("rules-link"), rulesModal: document.getElementById("rules-modal"),
            aboutUsLink: document.getElementById("about-us-link"), aboutUsModal: document.getElementById("about-us-modal"),
            contactUsLink: document.getElementById("contact-us-link"), contactUsModal: document.getElementById("contact-us-modal"),
            celebrationCanvas: document.getElementById('celebration-canvas'),
            backgroundCanvas: document.getElementById('background-canvas'),
            hintBtn: document.getElementById('hint-btn'),
            hintSprite: document.getElementById('hint-sprite'),
            animatedCharacter: document.getElementById('animated-character'),
            characterNumber: document.querySelector('.character-number'),
        };
        this.themes = {
            'neon-dark': { name: 'Neon Dark', colors: ['#818cf8', '#f472b6', '#4f46e5', '#ffffff'] },
            'minty-fresh': { name: 'Minty Fresh', colors: ['#0d9488', '#14b8a6', '#5eead4', '#ffffff'] },
            'forest': { name: 'Forest', colors: ['#2f855a', '#dd6b20', '#68d391', '#ffffff'] },
            'ocean': { name: 'Ocean', colors: ['#3b82f6', '#2563eb', '#93c5fd', '#ffffff'] },
            'dusk': { name: 'Dusk', colors: ['#f97316', '#c026d3', '#a78bfa', '#ffffff'] },
            'monochrome': { name: 'Monochrome', colors: ['#111827', '#4b5563', '#9ca3af', '#ffffff'] },
        };

        this.audioManager = new AudioManager({
            win: document.getElementById('win-sound'),
            lose: document.getElementById('lose-sound'),
            mistake: document.getElementById('mistake-sound'),
            hint: document.getElementById('hint-sound'),
        });
        
        this.flowerShower = null; this.backgroundAnimation = null;
        this.character = new CharacterController(this.elements, this.audioManager);
        this.resetState();
    }
    resetState() {
        this.selectedTile = null; this.hintsLeft = 3; if (this.timer) clearInterval(this.timer);
        this.timeValue = 0; this.isNotesMode = false; this.isGameOver = false; this.isPaused = false;
        this.mistakesMade = 0; this.currentPuzzle = null; this.currentLevel = 'easy';
        this.userBoard = []; this.solution = []; this.tilesFilled = 0;
        if (this.flowerShower) { this.flowerShower.stop(); }
    }
    init() {
        this.createThemeOptions(); this.loadTheme(); this.createNumberPalette();
        this.addEventListeners(); this.createPreviewGrid(); this.showStartScreen();
        this.backgroundAnimation = new FloatingNumbersBackground(this.elements.backgroundCanvas);
        this.backgroundAnimation.start();
        this.updateBackgroundColor();
        this.character.init();
        
        document.body.addEventListener('click', () => this.audioManager.unlockAudio(), { once: true });
        document.body.addEventListener('keydown', () => this.audioManager.unlockAudio(), { once: true });
    }
    showStartScreen() { this.resetState(); this.elements.gameContainer.classList.remove('active'); this.elements.startScreen.classList.add('active'); this.updateDifficultyUI(this.currentLevel); this.hideAllModals(); this.loadBestTimes(); this.updatePreviewGrid(); this.character.react('idle'); }
    startGame() {
        const selectedButton = this.elements.startDifficultySelector.querySelector('.active'); this.currentLevel = selectedButton.dataset.level;
        this.elements.startScreen.classList.remove('active'); this.elements.gameContainer.classList.add('active');
        this.resetState(); this.currentLevel = selectedButton.dataset.level; const puzzleSet = puzzles[this.currentLevel];
        this.currentPuzzle = puzzleSet[Math.floor(Math.random() * puzzleSet.length)]; this.solution = this.currentPuzzle.solution;
        this.populateBoard(); this.elements.difficultyDisplay.textContent = this.currentLevel.replace('-', ' ');
        this.updateHintBadge(); this.updateMistakesDisplay(); this.startTimer();
        this.character.react('numberSelect', '1');
    }
    populateBoard() {
        this.elements.board.innerHTML = ""; this.userBoard = this.currentPuzzle.board.map(row => row.split(''));
        this.tilesFilled = 0; for (let r = 0; r < 9; r++) { for (let c = 0; c < 9; c++) {
            const tile = document.createElement("div"); tile.id = `${r}-${c}`; tile.classList.add("tile");
            if (this.userBoard[r][c] !== '-') { tile.innerText = this.userBoard[r][c]; tile.classList.add("tile-start"); this.tilesFilled++; }
            this.elements.board.appendChild(tile);
        } }
    }
    createNumberPalette() { for (let i = 1; i <= 9; i++) { const number = document.createElement("div"); number.innerText = i; number.classList.add("number"); this.elements.digits.appendChild(number); } }
    addEventListeners() {
        this.elements.startGameBtn.addEventListener("click", () => this.startGame()); this.elements.newGameBtn.addEventListener("click", () => this.showStartScreen());
        this.elements.playAgainBtn.addEventListener("click", () => this.showStartScreen()); this.elements.pauseBtn.addEventListener("click", () => this.togglePause());
        this.elements.themesLink.addEventListener("click", e => this.showModal(this.elements.themesModal, e)); this.elements.rulesLink.addEventListener("click", e => this.showModal(this.elements.rulesModal, e));
        this.elements.aboutUsLink.addEventListener("click", e => this.showModal(this.elements.aboutUsModal, e)); this.elements.contactUsLink.addEventListener("click", e => this.showModal(this.elements.contactUsModal, e));
        this.elements.startDifficultySelector.addEventListener("click", e => { if (e.target.dataset.level) { this.currentLevel = e.target.dataset.level; this.updateDifficultyUI(this.currentLevel); this.updatePreviewGrid(); } });
        this.elements.board.addEventListener("click", e => this.handleTileClick(e.target)); this.elements.digits.addEventListener("click", e => this.handleNumberClick(e.target));
        this.elements.actionControls.addEventListener("click", e => this.handleActionClick(e.target));
        this.elements.modalBackdrop.addEventListener("click", (e) => { if (e.target === this.elements.modalBackdrop || e.target.classList.contains('close-button')) { this.hideAllModals(); } });
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    handleKeyDown(e) {
        if (!this.selectedTile || this.isPaused || this.isGameOver) return;
        if (e.key >= '1' && e.key <= '9') { this.character.react('numberSelect', e.key); this.fillTile(e.key); }
        else if (e.key === 'Backspace' || e.key === 'Delete') { this.character.react('numberSelect', '?'); this.erase(); }
        else if (e.key.startsWith('Arrow')) {
            e.preventDefault();
            let [row, col] = this.selectedTile.id.split('-').map(Number);
            switch (e.key) {
                case 'ArrowUp': row = Math.max(row - 1, 0); break;
                case 'ArrowDown': row = Math.min(row + 1, 8); break;
                case 'ArrowLeft': col = Math.max(col - 1, 0); break;
                case 'ArrowRight': col = Math.min(col + 1, 8); break;
            }
            const newTile = document.getElementById(`${row}-${col}`);
            if (newTile) { this.handleTileClick(newTile); }
        }
    }
    handleTileClick(target) {
        if (this.isGameOver || this.isPaused || !target.classList.contains("tile")) return;
        if (this.selectedTile) { this.selectedTile.classList.remove("tile-selected"); }
        this.clearHighlights();
        this.selectedTile = target; this.selectedTile.classList.add("tile-selected");
        const [row, col] = this.selectedTile.id.split('-').map(Number);
        this.highlightAffectedCells(row, col);
        if (this.selectedTile.innerText) { this.highlightSameNumbers(this.selectedTile.innerText); }
    }
    highlightAffectedCells(row, col) {
        for (let i = 0; i < 9; i++) {
            document.getElementById(`${row}-${i}`).classList.add('highlight-affected');
            document.getElementById(`${i}-${col}`).classList.add('highlight-affected');
        }
        const startRow = Math.floor(row / 3) * 3; const startCol = Math.floor(col / 3) * 3;
        for (let r = 0; r < 3; r++) { for (let c = 0; c < 3; c++) {
            document.getElementById(`${startRow + r}-${startCol + c}`).classList.add('highlight-affected');
        } }
    }
    clearHighlights() {
        this.elements.board.querySelectorAll('.highlight-affected, .highlight-same-number').forEach(tile => {
            tile.classList.remove('highlight-affected', 'highlight-same-number');
        });
    }
    handleNumberClick(target) { if (this.isGameOver || this.isPaused || !target.classList.contains("number") || !this.selectedTile || this.selectedTile.classList.contains('tile-start')) return; this.character.react('numberSelect', target.innerText); if (this.isNotesMode) this.toggleNote(target.innerText); else this.fillTile(target.innerText); }
    fillTile(num) {
        const coords = this.selectedTile.id.split("-"); const r = parseInt(coords[0]), c = parseInt(coords[1]);
        if (this.userBoard[r][c] === num) return; const correctNum = this.solution[r][c]; const wasEmpty = this.userBoard[r][c] === '-';
        if (num == correctNum) {
            if (wasEmpty) this.tilesFilled++; this.userBoard[r][c] = num; this.selectedTile.innerText = num;
            this.selectedTile.classList.remove("error"); this.selectedTile.classList.add("user-input");
            this.clearHighlights();
            this.handleTileClick(this.selectedTile);
            if (this.tilesFilled === 81) this.winGame();
        } else {
            this.selectedTile.classList.add("error"); setTimeout(() => this.selectedTile.classList.remove("error"), 400);
            this.mistakesMade++; this.updateMistakesDisplay(); this.character.react('mistake');
            if (this.mistakesMade >= this.MISTAKE_LIMIT) this.gameOver();
        }
    }
    winGame() {
        clearInterval(this.timer); document.getElementById('win-time').innerText = this.formatTime(this.timeValue); this.saveBestTime();
        this.character.react('win');
        const currentThemeId = localStorage.getItem('sudoku_theme') || 'neon-dark';
        const themeColors = this.themes[currentThemeId].colors; this.flowerShower = new FlowerShower(this.elements.celebrationCanvas, themeColors);
        this.flowerShower.start();
        setTimeout(() => { this.showModal(this.elements.winModal); }, 100);
    }
    createThemeOptions() {
        this.elements.themeOptionsContainer.innerHTML = '';
        for (const themeId in this.themes) {
            const theme = this.themes[themeId];
            const option = document.createElement('div');
            option.classList.add('theme-option');
            option.dataset.theme = themeId;
            option.innerHTML = `
                <h4>${theme.name}</h4>
                <div class="theme-palette">
                    <div class="palette-color" style="background-color: ${theme.colors[0]}"></div>
                    <div class="palette-color" style="background-color: ${theme.colors[1]}"></div>
                    <div class="palette-color" style="background-color: ${theme.colors[2]}"></div>
                </div>`;
            option.addEventListener('click', () => {
                this.setTheme(themeId);
                this.hideAllModals();
            });
            this.elements.themeOptionsContainer.appendChild(option);
        }
    }
    loadTheme() { const savedTheme = localStorage.getItem('sudoku_theme') || 'neon-dark'; this.setTheme(savedTheme); }
    setTheme(themeId) {
        this.elements.body.className = ''; this.elements.body.classList.add(`theme-${themeId}`);
        localStorage.setItem('sudoku_theme', themeId);
        this.elements.themeOptionsContainer.querySelectorAll('.theme-option').forEach(opt => { opt.classList.toggle('active', opt.dataset.theme === themeId); });
        this.updateBackgroundColor();
    }
    updateBackgroundColor() { setTimeout(() => { if (this.backgroundAnimation) { const newColor = getComputedStyle(this.elements.body).getPropertyValue('--bg-anim-color'); this.backgroundAnimation.updateColor(newColor.trim()); } }, 50); }
    hideAllModals(preserveBackdrop = false) {
        if (!preserveBackdrop) { this.elements.modalBackdrop.classList.add("modal-hidden"); if (this.flowerShower) { this.flowerShower.stop(); } }
        this.elements.themesModal.classList.add("modal-hidden"); this.elements.rulesModal.classList.add("modal-hidden");
        this.elements.aboutUsModal.classList.add("modal-hidden"); this.elements.contactUsModal.classList.add("modal-hidden");
        this.elements.winModal.classList.add("modal-hidden"); this.elements.gameOverModal.classList.add("modal-hidden");
    }
    highlightSameNumbers(num) { this.elements.board.querySelectorAll('.tile').forEach(tile => { if (tile.innerText === num) tile.classList.add('highlight-same-number'); }); }
    togglePause() { if (this.isGameOver) return; this.isPaused = !this.isPaused; this.elements.pauseOverlay.classList.toggle('hidden'); if (this.isPaused) clearInterval(this.timer); else this.startTimer(true); }
    gameOver() {
        this.isGameOver = true;
        clearInterval(this.timer);
        this.character.react('lose');
        this.showModal(this.elements.gameOverModal);
        setTimeout(() => this.showStartScreen(), 2500);
    }
    createPreviewGrid() { this.elements.previewGrid.innerHTML = ''; for (let i = 0; i < 81; i++) { const tile = document.createElement('div'); tile.classList.add('preview-tile'); this.elements.previewGrid.appendChild(tile); } }
    updatePreviewGrid() { const difficultyToDensity = { 'easy': 0.4, 'medium': 0.5, 'hard': 0.6, 'very-hard': 0.7, 'expert': 0.8 }; const density = difficultyToDensity[this.currentLevel]; const tiles = this.elements.previewGrid.children; for (let i = 0; i < tiles.length; i++) { tiles[i].textContent = ''; tiles[i].classList.remove('filled'); if (Math.random() < density) { setTimeout(() => { tiles[i].textContent = Math.floor(Math.random() * 9) + 1; tiles[i].classList.add('filled'); }, Math.random() * 300); } } }
    saveBestTime() { const bestTimes = JSON.parse(localStorage.getItem('sudoku_best_times')) || {}; const oldTime = bestTimes[this.currentLevel]; if (!oldTime || this.timeValue < oldTime) { bestTimes[this.currentLevel] = this.timeValue; localStorage.setItem('sudoku_best_times', JSON.stringify(bestTimes)); } }
    loadBestTimes() { const bestTimes = JSON.parse(localStorage.getItem('sudoku_best_times')) || {}; this.elements.bestTimesDisplay.innerHTML = '<h3>Best Times</h3>'; const levels = ['easy', 'medium', 'hard', 'very-hard', 'expert']; levels.forEach(level => { const time = bestTimes[level] ? this.formatTime(bestTimes[level]) : '--:--'; const levelName = level.replace('-', ' '); this.elements.bestTimesDisplay.innerHTML += `<p>${levelName.charAt(0).toUpperCase() + levelName.slice(1)} <span>${time}</span></p>`; }); }
    updateMistakesDisplay() { this.elements.mistakesDisplay.textContent = `${this.mistakesMade} / ${this.MISTAKE_LIMIT}`; this.elements.mistakesDisplay.classList.remove('warning', 'error'); if (this.mistakesMade === 2) this.elements.mistakesDisplay.classList.add('warning'); if (this.mistakesMade >= 3) this.elements.mistakesDisplay.classList.add('error'); }
    updateDifficultyUI(level) { this.elements.startDifficultySelector.querySelectorAll(".difficulty-level").forEach(btn => { btn.classList.toggle("active", btn.dataset.level === level); }); }
    handleActionClick(target) { if (this.isGameOver || this.isPaused) return; const button = target.closest('.action-btn'); if (!button) return; if (button.id === 'notes-btn') this.toggleNotesMode(); if (button.id === 'erase-btn') this.erase(); if (button.id === 'hint-btn') this.getHint(); }
    toggleNotesMode() { if (this.isGameOver || this.isPaused) return; this.isNotesMode = !this.isNotesMode; this.elements.notesBtn.classList.toggle("active", this.isNotesMode); }
    erase() { if (this.isGameOver || this.isPaused || !this.selectedTile || this.selectedTile.classList.contains('tile-start')) return; const coords = this.selectedTile.id.split('-'); const r = parseInt(coords[0]); const c = parseInt(coords[1]); if (this.userBoard[r][c] !== '-') { this.tilesFilled--; this.userBoard[r][c] = '-'; } this.selectedTile.innerHTML = ""; this.selectedTile.classList.remove("user-input"); this.clearHighlights(); this.handleTileClick(this.selectedTile); }
    getHint() {
        if (this.isGameOver || this.isPaused || this.hintsLeft <= 0) return;
        const emptyTiles = [];
        for (let r = 0; r < 9; r++) { for (let c = 0; c < 9; c++) {
            if (this.userBoard[r][c] === '-') { emptyTiles.push(document.getElementById(`${r}-${c}`)); }
        } }
        if (emptyTiles.length > 0) {
            this.hintsLeft--; this.updateHintBadge();
            const hintTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            const hintValue = this.solution[hintTile.id.split('-')[0]][hintTile.id.split('-')[1]];
            const sprite = this.elements.hintSprite;
            const startRect = this.elements.hintBtn.getBoundingClientRect();
            const endRect = hintTile.getBoundingClientRect();
            sprite.classList.remove('hidden', 'acting');
            sprite.style.top = `${startRect.top + startRect.height / 2 - 20}px`;
            sprite.style.left = `${startRect.left + startRect.width / 2 - 20}px`;
            sprite.style.transform = 'scale(0)';
            requestAnimationFrame(() => { sprite.style.opacity = '1'; sprite.style.transform = 'scale(1) translateY(0)'; });
            setTimeout(() => {
                sprite.style.top = `${endRect.top + endRect.height / 2 - 20}px`;
                sprite.style.left = `${endRect.left + endRect.width / 2 - 20}px`;
            }, 100);
            setTimeout(() => {
                sprite.classList.add('acting');
                this.audioManager.play('hint');
                this.handleTileClick(hintTile);
                this.fillTile(hintValue);
                hintTile.classList.add('tile-hint');
            }, 900);
            setTimeout(() => {
                sprite.style.opacity = '0';
                sprite.style.transform = 'scale(0)';
                sprite.classList.remove('acting');
                setTimeout(() => hintTile.classList.remove('tile-hint'), 500);
            }, 1400);
        }
    }
    updateHintBadge() { this.elements.hintBadge.innerText = this.hintsLeft; }
    startTimer(resume = false) { if (this.timer && !resume) clearInterval(this.timer); if(!resume) this.timeValue = 0; this.elements.timer.textContent = this.formatTime(this.timeValue); this.timer = setInterval(() => { this.timeValue++; this.elements.timer.textContent = this.formatTime(this.timeValue); }, 1000); }
    formatTime(seconds) { const min = String(Math.floor(seconds / 60)).padStart(2, '0'); const sec = String(seconds % 60).padStart(2, '0'); return `${min}:${sec}`; }
    showModal(modal, event) { if (event) event.preventDefault(); this.hideAllModals(true); this.elements.modalBackdrop.classList.remove("modal-hidden"); modal.classList.remove("modal-hidden"); }
}

window.onload = function () {
    const game = new SudokuGame();
    game.init();
};