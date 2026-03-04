// Список доступных тем
const themes = ['Columbina', 'Tinasha', 'Kurumi Tokisaki', 'Mahiru Shiina', 'Miyako Shikimori', 'Alisa Mikhailovna Kujou', 'Tsukasa Yuzaki', 'Ai Hoshino', 'Ruby Hoshino', 'Akane Kurokawa', 'Aki Adagaki', 'Terakomari Gandesblood'];

// Выбор случайной темы
function getRandomTheme() {
    const randomIndex = Math.floor(Math.random() * themes.length);
    return themes[randomIndex];
}

function preventDefaultLinkClick(event) {
    event.preventDefault();
}

function safeParseJson(value) {
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function saveSoundState(state) {
    localStorage.setItem('soundState', JSON.stringify(state));
}

function getThemeState() {
    const saved = safeParseJson(localStorage.getItem('themeState'));
    if (saved && typeof saved === 'object') {
        if (saved.mode === 'fixed' && typeof saved.theme === 'string') {
            return { mode: 'fixed', theme: saved.theme };
        }
    }
    return { mode: 'random' };
}

function saveThemeState(state) {
    localStorage.setItem('themeState', JSON.stringify(state));
}

async function fetchThemeDirectories() {
    try {
        const res = await fetch('src/');
        if (!res.ok) return null;

        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const anchors = Array.from(doc.querySelectorAll('a[href]'));

        const names = anchors
            .map((a) => a.getAttribute('href'))
            .filter(Boolean)
            .filter((href) => href.endsWith('/'))
            .map((href) => href.replace(/\/$/, ''))
            .filter((name) => name !== '..' && name !== '.')
            .map((name) => decodeURIComponent(name));

        return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    } catch {
        return null;
    }
}

function buildThemeItems(themeNames, currentThemeName, currentMode) {
    const result = [];
    result.push({ id: '__random__', label: 'random', isSelected: currentMode === 'random' });

    for (const name of themeNames) {
        result.push({
            id: name,
            label: name,
            isSelected: currentMode === 'fixed' && currentThemeName === name
        });
    }
    return result;
}

function getSoundState() {
    const saved = safeParseJson(localStorage.getItem('soundState'));
    if (saved && typeof saved === 'object') {
        return {
            musicIsPlaying: Boolean(saved.musicIsPlaying),
            volume: typeof saved.volume === 'number' ? saved.volume : 0.3,
            bgStopped: Boolean(saved.bgStopped),
            avatarAudioActive: Boolean(saved.avatarAudioActive)
        };
    }
    return { musicIsPlaying: false, volume: 0.3, bgStopped: false, avatarAudioActive: false };
}

function setAudioFocus(mode, { backgroundVideo, avatarVideo, musicAudio }) {
    if (mode === 'music') {
        backgroundVideo.muted = true;
        avatarVideo.muted = true;
        return;
    }

    if (mode === 'avatar') {
        backgroundVideo.muted = true;
        musicAudio.pause();
        return;
    }

    if (mode === 'background') {
        musicAudio.pause();
        avatarVideo.muted = true;
        backgroundVideo.muted = false;
        return;
    }
}

// Проверка существования файла
async function checkFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Error checking file:', url, error);
        return false;
    }
}

function loadImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

function loadVideo(videoEl, url) {
    return new Promise((resolve) => {
        const onLoaded = () => {
            cleanup();
            resolve(true);
        };

        const onError = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            videoEl.removeEventListener('loadeddata', onLoaded);
            videoEl.removeEventListener('error', onError);
        };

        videoEl.addEventListener('loadeddata', onLoaded, { once: true });
        videoEl.addEventListener('error', onError, { once: true });
        videoEl.src = url;
        videoEl.load();

        videoEl.play().catch(() => { });
    });
}

// Установка ресурсов для выбранной темы
async function setThemeResources(theme) {
    const basePath = `src/${encodeURIComponent(theme)}`;

    // Определение типа аватара
    const avatarImage = document.getElementById('avatarImage');
    const avatarVideo = document.getElementById('avatarVideo');

    // Проверяем существование видео-аватара
    const videoExtensions = ['mp4', 'webm', 'mov'];
    let avatarType = 'image';

    for (const ext of videoExtensions) {
        const videoPath = `${basePath}/avatar.${ext}`;
        if (await loadVideo(avatarVideo, videoPath)) {
            // Установка видео-аватара
            avatarVideo.style.display = 'block';
            avatarImage.style.display = 'none';
            avatarType = 'video';
            break;
        }
    }

    // Если видео не найдено, используем изображение
    if (avatarType === 'image') {
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif'];
        for (const ext of imageExtensions) {
            const imagePath = `${basePath}/avatar.${ext}`;
            if (await loadImage(imagePath)) {
                avatarImage.style.backgroundImage = `url('${imagePath}')`;
                avatarImage.style.display = 'block';
                avatarVideo.style.display = 'none';
                break;
            }
        }
    }

    // Фоновое видео
    const videoSource = document.getElementById('videoSource');
    videoSource.src = `${basePath}/background.mp4`;
    const video = document.getElementById('backgroundVideo');
    video.load();

    // Диск для музыки
    document.getElementById('disc').style.backgroundImage = `url('${basePath}/disc.png')`;

    // Фоновая музыка
    const audio = document.getElementById('backgroundMusic');
    audio.src = `${basePath}/music.mp3`;

    return { audio, theme, basePath };
}

function getInitialSoundState() {
    return getSoundState();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.remove('collapsing');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal-content');
    modalContent.classList.add('collapsing');
    setTimeout(() => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modalContent.classList.remove('collapsing');
    }, 400);
}

async function startExperience({ backgroundVideo, avatarVideo, musicAudio, musicControl, playPauseButton, musicSlider, bgStopButton }) {
    const state = getSoundState();
    state.musicIsPlaying = false;
    state.bgStopped = false;
    state.avatarAudioActive = false;

    musicAudio.volume = state.volume;
    backgroundVideo.volume = state.volume;
    avatarVideo.volume = state.volume;
    musicSlider.value = state.volume;

    if (state.bgStopped) {
        bgStopButton.classList.add('is-stopped');
    } else {
        bgStopButton.classList.remove('is-stopped');
    }

    setAudioFocus('background', { backgroundVideo, avatarVideo, musicAudio });

    try {
        await backgroundVideo.play();
    } catch (e) {
        console.log('Video play failed:', e);
    }

    playPauseButton.textContent = 'Play';
    musicControl.classList.remove('playing');

    saveSoundState(state);
}

window.addEventListener('DOMContentLoaded', async () => {
    const themeMenuButton = document.getElementById('themeMenuButton');
    const themeOverlay = document.getElementById('themeOverlay');
    const themeList = document.getElementById('themeList');
    const themeCloseButton = document.getElementById('themeCloseButton');

    const themeDirs = (await fetchThemeDirectories()) ?? themes;

    const urlParams = new URLSearchParams(window.location.search);
    const chParam = urlParams.get('ch');

    if (chParam) {
        const matchedTheme = themeDirs.find(t => t.toLowerCase() === chParam.toLowerCase());
        if (matchedTheme) {
            saveThemeState({ mode: 'fixed', theme: matchedTheme });
        }

        const url = new URL(window.location);
        url.searchParams.delete('ch');
        window.history.replaceState({}, document.title, url.toString());
    }

    const themeState = getThemeState();
    const effectiveTheme = themeState.mode === 'fixed' ? themeState.theme : getRandomTheme();

    let currentTheme = effectiveTheme;

    const { audio: musicAudio } = await setThemeResources(currentTheme);

    const backgroundVideo = document.getElementById('backgroundVideo');
    const avatarVideo = document.getElementById('avatarVideo');
    const musicControl = document.querySelector('.music-control');
    const playPauseButton = document.getElementById('playPause');
    const musicSlider = document.getElementById('musicSlider');
    const bgStopButton = document.getElementById('bgStopButton');
    const overlay = document.querySelector('.overlay');

    const preloader = document.getElementById('preloader');
    const preloaderSymbol = document.getElementById('preloaderSymbol');
    if (preloaderSymbol && currentTheme) {
        const t = currentTheme.toLowerCase();
        if (t === 'columbina') {
            preloaderSymbol.textContent = '🌙';
        } else if (t === 'ai hoshino') {
            preloaderSymbol.textContent = '★';
        } else if (t === 'kurumi tokisaki') {
            preloaderSymbol.textContent = 'IV';
        } else {
            preloaderSymbol.textContent = '✦';
        }
    }

    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 800);
    }

    let menuSnapshot = null;

    const renderThemeList = () => {
        const state = getThemeState();
        const items = buildThemeItems(themeDirs, currentTheme, state.mode);

        themeList.innerHTML = '';
        for (const item of items) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'theme-item';
            btn.dataset.themeId = item.id;

            const marker = document.createElement('span');
            marker.className = 'theme-item__marker';
            marker.textContent = item.isSelected ? '➤' : '';

            const label = document.createElement('span');
            label.textContent = item.label;

            const preview = document.createElement('div');
            preview.className = 'theme-item-preview';
            if (item.id !== '__random__') {
                preview.style.backgroundImage = `url('src/${encodeURIComponent(item.id)}/avatar.png')`;
                const img = new Image();
                img.onerror = () => {
                    preview.style.backgroundImage = `url('src/${encodeURIComponent(item.id)}/avatar.jpg')`;
                    const img2 = new Image();
                    img2.onerror = () => { preview.style.display = 'none'; };
                    img2.src = `src/${encodeURIComponent(item.id)}/avatar.jpg`;
                };
                img.src = `src/${encodeURIComponent(item.id)}/avatar.png`;
            } else {
                preview.innerHTML = '🎲';
                preview.style.border = 'none';
                preview.style.display = 'flex';
                preview.style.alignItems = 'center';
                preview.style.justifyContent = 'center';
                preview.style.fontSize = '20px';
            }

            btn.appendChild(marker);
            btn.appendChild(label);
            btn.appendChild(preview);
            themeList.appendChild(btn);
        }
    };

    const openThemeMenu = () => {
        themeOverlay.classList.add('is-open');
        themeOverlay.setAttribute('aria-hidden', 'false');

        menuSnapshot = {
            bgPaused: backgroundVideo.paused,
            avatarPaused: avatarVideo.paused,
            musicPaused: musicAudio.paused,
            bgMuted: backgroundVideo.muted,
            avatarMuted: avatarVideo.muted
        };

        backgroundVideo.pause();
        avatarVideo.pause();
        musicAudio.pause();
    };

    const closeThemeMenu = async () => {
        themeOverlay.classList.remove('is-open');
        themeOverlay.setAttribute('aria-hidden', 'true');

        if (menuSnapshot) {
            backgroundVideo.muted = menuSnapshot.bgMuted;
            avatarVideo.muted = menuSnapshot.avatarMuted;

            if (!menuSnapshot.bgPaused) {
                try {
                    await backgroundVideo.play();
                } catch (e) {
                    console.log('Video play failed:', e);
                }
            }

            if (!menuSnapshot.avatarPaused) {
                try {
                    await avatarVideo.play();
                } catch (e) {
                    console.log('Avatar video play failed:', e);
                }
            }

            if (!menuSnapshot.musicPaused) {
                try {
                    await musicAudio.play();
                } catch (e) {
                    console.log('Audio play failed:', e);
                }
            }

            menuSnapshot = null;
            return;
        }

        const s = getSoundState();
        if (!s.bgStopped) {
            try {
                await backgroundVideo.play();
            } catch (e) {
                console.log('Video play failed:', e);
            }
        }
    };

    const themeTransitionOverlay = document.getElementById('themeTransitionOverlay');

    const applyTheme = async (nextThemeState) => {
        if (themeTransitionOverlay) {
            themeTransitionOverlay.classList.add('active');
            await new Promise(r => setTimeout(r, 400)); // wait for fade out
        }

        saveThemeState(nextThemeState);
        currentTheme = nextThemeState.mode === 'fixed' ? nextThemeState.theme : getRandomTheme();

        backgroundVideo.pause();
        avatarVideo.pause();
        musicAudio.pause();

        menuSnapshot = null;

        await setThemeResources(currentTheme);
        renderThemeList();

        const customCursor = document.getElementById('customCursor');
        if (customCursor) {
            customCursor.className = 'custom-cursor';
            const themeClass = 'theme-' + currentTheme.toLowerCase().replace(/\s+/g, '-');
            customCursor.classList.add(themeClass);
        }

        const s = getSoundState();
        s.musicIsPlaying = false;
        s.avatarAudioActive = false;
        s.bgStopped = false;
        saveSoundState(s);

        bgStopButton.classList.remove('is-stopped');
        setAudioFocus('background', { backgroundVideo, avatarVideo, musicAudio });

        // Fix: Reset music button text and state on theme switch
        if (playPauseButton) playPauseButton.textContent = 'Play';
        if (musicControl) musicControl.classList.remove('playing');

        try {
            await backgroundVideo.play();
        } catch (e) {
            console.log('Video play failed:', e);
        }

        if (themeTransitionOverlay) {
            themeTransitionOverlay.classList.remove('active');
        }
    };

    renderThemeList();

    themeMenuButton.addEventListener('click', (event) => {
        event.preventDefault();
        renderThemeList();
        openThemeMenu();
    });

    themeCloseButton.addEventListener('click', (event) => {
        event.preventDefault();
        closeThemeMenu();
    });

    themeOverlay.addEventListener('click', (event) => {
        if (event.target === themeOverlay) {
            closeThemeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && themeOverlay.classList.contains('is-open')) {
            closeThemeMenu();
        }
    });

    themeList.addEventListener('click', async (event) => {
        const btn = event.target.closest('[data-theme-id]');
        if (!btn) return;

        const id = btn.getAttribute('data-theme-id');
        if (!id) return;

        if (id === '__random__') {
            await applyTheme({ mode: 'random' });
        } else {
            await applyTheme({ mode: 'fixed', theme: id });
        }

        await closeThemeMenu();
    });

    const state = getSoundState();
    musicAudio.volume = state.volume;
    backgroundVideo.volume = state.volume;
    avatarVideo.volume = state.volume;
    musicSlider.value = state.volume;

    document.addEventListener('click', (event) => {
        const openTarget = event.target.closest('[data-open-modal]');
        if (openTarget) {
            event.preventDefault();
            const modalId = openTarget.getAttribute('data-open-modal');
            openModal(modalId);
            return;
        }

        const closeTarget = event.target.closest('[data-close-modal]');
        if (closeTarget) {
            event.preventDefault();
            const modalId = closeTarget.getAttribute('data-close-modal');
            closeModal(modalId);
            return;
        }

        const anchor = event.target.closest('a[href="#"]');
        if (anchor) {
            event.preventDefault();
        }
    });

    // Скрываем модальные окна
    const donatModal = document.getElementById('donatModal');
    const projectsModal = document.getElementById('projectsModal');
    donatModal.style.display = 'none';
    projectsModal.style.display = 'none';

    // Закрытие модальных окон при клике вне контента
    donatModal.addEventListener('click', function (event) {
        if (event.target === this) {
            closeModal('donatModal');
        }
    });

    projectsModal.addEventListener('click', function (event) {
        if (event.target === this) {
            closeModal('projectsModal');
        }
    });

    // Панель управления музыкой
    setTimeout(() => {
        musicControl.style.bottom = '20px';
        bgStopButton.style.bottom = '20px';
    }, 100);

    playPauseButton.addEventListener('click', async function () {
        const current = getSoundState();
        const shouldPlayMusic = !current.musicIsPlaying;

        current.musicIsPlaying = shouldPlayMusic;
        current.avatarAudioActive = false;
        current.volume = musicAudio.volume;

        if (shouldPlayMusic) {
            setAudioFocus('music', { backgroundVideo, avatarVideo, musicAudio });
            if (!current.bgStopped) {
                try {
                    await backgroundVideo.play();
                } catch (e) {
                    console.log('Video play failed:', e);
                }
            }
            try {
                await musicAudio.play();
            } catch (e) {
                console.log('Audio play failed:', e);
            }

            playPauseButton.textContent = 'Pause';
            musicControl.classList.add('playing');
        } else {
            musicAudio.pause();

            if (!current.bgStopped) {
                setAudioFocus('background', { backgroundVideo, avatarVideo, musicAudio });
                try {
                    await backgroundVideo.play();
                } catch (e) {
                    console.log('Video play failed:', e);
                }
            }

            playPauseButton.textContent = 'Play';
            musicControl.classList.remove('playing');
        }

        saveSoundState(current);
    });

    const switchToBackgroundAudio = async () => {
        const current = getSoundState();
        current.musicIsPlaying = false;
        current.avatarAudioActive = false;
        saveSoundState(current);

        musicAudio.pause();

        if (!current.bgStopped) {
            setAudioFocus('background', { backgroundVideo, avatarVideo, musicAudio });
            try {
                await backgroundVideo.play();
            } catch (e) {
                console.log('Video play failed:', e);
            }
        }

        playPauseButton.textContent = 'Play';
        musicControl.classList.remove('playing');
    };

    overlay.addEventListener('click', async (event) => {
        event.preventDefault();
        await switchToBackgroundAudio();
    });

    backgroundVideo.addEventListener('click', async (event) => {
        event.preventDefault();
        await switchToBackgroundAudio();
    });

    musicSlider.addEventListener('input', function () {
        const volume = Number(this.value);
        musicAudio.volume = volume;
        backgroundVideo.volume = volume;
        avatarVideo.volume = volume;

        const current = getSoundState();
        current.volume = volume;
        saveSoundState(current);
    });

    avatarVideo.addEventListener('click', async function () {
        if (avatarVideo.style.display === 'none') return;

        const current = getSoundState();

        setAudioFocus('avatar', { backgroundVideo, avatarVideo, musicAudio });
        current.musicIsPlaying = false;
        current.avatarAudioActive = true;
        saveSoundState(current);

        avatarVideo.muted = false;
        try {
            await avatarVideo.play();
        } catch (e) {
            console.log('Avatar video play failed:', e);
        }

        playPauseButton.textContent = 'Play';
        musicControl.classList.remove('playing');
    });

    bgStopButton.addEventListener('click', async function () {
        const current = getSoundState();
        current.bgStopped = !current.bgStopped;

        if (current.bgStopped) {
            backgroundVideo.pause();
            bgStopButton.classList.add('is-stopped');
        } else {
            bgStopButton.classList.remove('is-stopped');
            try {
                await backgroundVideo.play();
            } catch (e) {
                console.log('Video play failed:', e);
            }

            if (!current.musicIsPlaying && !current.avatarAudioActive) {
                setAudioFocus('background', { backgroundVideo, avatarVideo, musicAudio });
            } else {
                backgroundVideo.muted = true;
            }
        }

        saveSoundState(current);
    });

    // Стартовый оверлей
    const startOverlay = document.getElementById('startOverlay');

    backgroundVideo.pause();
    backgroundVideo.muted = true;

    const handleStart = async () => {
        startOverlay.style.display = 'none';
        startOverlay.setAttribute('aria-hidden', 'true');

        await startExperience({
            backgroundVideo,
            avatarVideo,
            musicAudio,
            musicControl,
            playPauseButton,
            musicSlider,
            bgStopButton
        });

        startOverlay.removeEventListener('click', handleStart);
        startOverlay.removeEventListener('keydown', handleStartKeydown);
    };

    const handleStartKeydown = async (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            await handleStart();
        }
    };

    startOverlay.addEventListener('click', handleStart);
    startOverlay.addEventListener('keydown', handleStartKeydown);

    // --- Typing Status ---
    const typingStatus = document.getElementById('typingStatus');
    const statuses = ['Welcome to my world...', 'Lover of Anime', 'Developer', 'Creator'];
    let statusIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

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

        let typeSpeed = isDeleting ? 40 : 100;

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

    // --- Share Button ---
    const shareButton = document.getElementById('shareButton');
    const shareToast = document.getElementById('shareToast');
    let toastTimeout = null;

    if (shareButton && shareToast) {
        shareButton.addEventListener('click', () => {
            const url = new URL(window.location.href);
            url.searchParams.set('ch', currentTheme);
            navigator.clipboard.writeText(url.toString()).then(() => {
                shareToast.classList.add('show');
                clearTimeout(toastTimeout);
                toastTimeout = setTimeout(() => shareToast.classList.remove('show'), 2500);
            }).catch(() => {
                // fallback
                const el = document.createElement('textarea');
                el.value = url.toString();
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                shareToast.classList.add('show');
                clearTimeout(toastTimeout);
                toastTimeout = setTimeout(() => shareToast.classList.remove('show'), 2500);
            });
        });
    }

    // --- Custom Cursor & Trail ---
    const customCursor = document.getElementById('customCursor');
    const cursorTrail = document.getElementById('cursorTrail');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trailX = window.innerWidth / 2;
    let trailY = window.innerHeight / 2;

    if (customCursor && cursorTrail) {

        // init theme class
        const initialThemeClass = 'theme-' + currentTheme.toLowerCase().replace(/\s+/g, '-');
        customCursor.classList.add(initialThemeClass);

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            customCursor.style.left = mouseX + 'px';
            customCursor.style.top = mouseY + 'px';
        });

        const updateTrail = () => {
            trailX += (mouseX - trailX) * 0.2;
            trailY += (mouseY - trailY) * 0.2;
            cursorTrail.style.left = trailX + 'px';
            cursorTrail.style.top = trailY + 'px';
            requestAnimationFrame(updateTrail);
        };
        updateTrail();

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('button, a, input, .theme-item, .start-overlay, .theme-menu, .bg-stop')) {
                customCursor.classList.add('hovering');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('button, a, input, .theme-item, .start-overlay, .theme-menu, .bg-stop')) {
                customCursor.classList.remove('hovering');
            }
        });
    }

    // --- Music Progress Logic ---
    const musicProgress = document.getElementById('musicProgress');
    const musicProgressFill = document.getElementById('musicProgressFill');

    if (musicAudio && musicProgress && musicProgressFill) {
        musicAudio.addEventListener('timeupdate', () => {
            if (musicAudio.duration) {
                const percent = (musicAudio.currentTime / musicAudio.duration) * 100;
                musicProgressFill.style.width = percent + '%';
            }
        });

        musicProgress.addEventListener('click', (e) => {
            const rect = musicProgress.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percent = x / width;
            musicAudio.currentTime = percent * musicAudio.duration;
        });
    }
    // --- Focus Mode (Chill Mode) ---
    const focusButton = document.getElementById('focusButton');
    if (focusButton) {
        focusButton.addEventListener('click', () => {
            document.body.classList.toggle('focus-mode');
            const isActive = document.body.classList.contains('focus-mode');
            focusButton.classList.toggle('active', isActive);
        });
    }

    // --- Magnetic Interaction ---
    const magneticElements = document.querySelectorAll('button, a, .theme-item, .bg-stop');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Apply a small translation (max 10px) towards the cursor
            const moveX = x * 0.3;
            const moveY = y * 0.3;

            el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });

});

// Экспортируем функции для inline-обработчиков
window.openModal = openModal;
window.closeModal = closeModal;
window.preventDefaultLinkClick = preventDefaultLinkClick;

