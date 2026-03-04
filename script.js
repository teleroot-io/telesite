// Список доступных тем
//const themes = ['Tinasha', 'Kurumi Tokisaki', 'Mahiru Shiina', 'Miyako Shikimori', 'Alisa Mikhailovna Kujou', 'Tsukasa Yuzaki', 'Ai Hoshino', 'Ruby Hoshino', 'Akane Kurokawa', 'Aki Adagaki', 'Terakomari Gandesblood'];

// Выбор случайной темы
//function getRandomTheme() {
//    const randomIndex = Math.floor(Math.random() * themes.length);
//    return themes[randomIndex];
//}

async function checkFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Error checking file:', url, error);
        return false;
    }
}

async function setThemeResources(theme) {
    const basePath = `src/${theme}`;

    const avatarImage = document.getElementById('avatarImage');
    const avatarVideo = document.getElementById('avatarVideo');

    const videoExtensions = ['mp4', 'webm', 'mov'];
    let avatarType = 'image';

    for (const ext of videoExtensions) {
        const videoPath = `${basePath}/avatar.${ext}`;
        if (await checkFileExists(videoPath)) {
            avatarVideo.src = videoPath;
            avatarVideo.style.display = 'block';
            avatarImage.style.display = 'none';
            avatarType = 'video';
            break;
        }
    }

    if (avatarType === 'image') {
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif'];
        for (const ext of imageExtensions) {
            const imagePath = `${basePath}/avatar.${ext}`;
            if (await checkFileExists(imagePath)) {
                avatarImage.style.backgroundImage = `url('${imagePath}')`;
                avatarImage.style.display = 'block';
                avatarVideo.style.display = 'none';
                break;
            }
        }
    }

    const videoSource = document.getElementById('videoSource');
    if (videoSource) {
        const rootVideoPath = 'background.mp4';
        const themedVideoPath = `${basePath}/background.mp4`;
        videoSource.src = (await checkFileExists(rootVideoPath)) ? rootVideoPath : themedVideoPath;
    }
    const backgroundVideo = document.getElementById('backgroundVideo');
    backgroundVideo?.load();

    const disc = document.getElementById('disc');
    if (disc) {
        disc.style.backgroundImage = `url('${basePath}/disc.png')`;
    }

    const audio = document.getElementById('backgroundMusic');
    if (audio) {
        audio.src = `${basePath}/music.mp3`;
    }

    return { audio, backgroundVideo };
}

function saveMusicState(audio) {
    const musicState = {
        isPlaying: !audio.paused,
        volume: audio.volume
    };
    localStorage.setItem('musicState', JSON.stringify(musicState));
}

function safeParseMusicState() {
    try {
        const raw = localStorage.getItem('musicState');
        if (!raw) {
            return null;
        }
        return JSON.parse(raw);
    } catch (e) {
        console.warn('musicState parse error:', e);
        return null;
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        return;
    }

    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) {
        return;
    }

    modalContent.classList.remove('collapsing');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        return;
    }

    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) {
        return;
    }

    modalContent.classList.add('collapsing');
    setTimeout(() => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modalContent.classList.remove('collapsing');
    }, 400);
}

function setupModals() {
    const donatModal = document.getElementById('donatModal');
    const projectsModal = document.getElementById('projectsModal');
    const projectsButton = document.getElementById('projectsButton');
    const donateButton = document.getElementById('donateButton');

    projectsButton?.addEventListener('click', (event) => {
        event.preventDefault();
        openModal('projectsModal');
    });

    donateButton?.addEventListener('click', (event) => {
        event.preventDefault();
        openModal('donatModal');
    });

    document.querySelectorAll('[data-close-modal]').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const modalId = button.getAttribute('data-close-modal');
            if (modalId) {
                closeModal(modalId);
            }
        });
    });

    donatModal?.addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal('donatModal');
        }
    });

    projectsModal?.addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal('projectsModal');
        }
    });
}

function setupStartOverlay(audio, backgroundVideo, musicControl, playPauseButton) {
    const startOverlay = document.getElementById('startOverlay');
    if (!startOverlay) {
        return;
    }

    let started = false;

    const startPlayback = async () => {
        if (started) {
            return;
        }
        started = true;

        startOverlay.classList.add('hidden');
        musicControl?.classList.add('visible');

        try {
            if (backgroundVideo) {
                backgroundVideo.muted = false;
                backgroundVideo.volume = 1;
                await backgroundVideo.play();
            }
        } catch (e) {
            console.warn('Background video play failed:', e);
        }

        if (audio) {
            saveMusicState(audio);
        }
    };

    startOverlay.addEventListener('click', startPlayback);
    startOverlay.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            startPlayback();
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const theme = 'Columbina'; //getRandomTheme();
    const { audio, backgroundVideo } = await setThemeResources(theme);

    if (backgroundVideo) {
        backgroundVideo.muted = true;
        backgroundVideo.volume = 1;
    }

    const musicControl = document.getElementById('musicControl');
    const playPauseButton = document.getElementById('playPause');
    const musicSlider = document.getElementById('musicSlider');

    setupModals();

    const donatModalEl = document.getElementById('donatModal');
    if (donatModalEl) {
        donatModalEl.style.display = 'none';
    }
    const projectsModalEl = document.getElementById('projectsModal');
    if (projectsModalEl) {
        projectsModalEl.style.display = 'none';
    }

    const savedState = safeParseMusicState();
    if (audio && musicSlider) {
        if (savedState) {
            const safeVolume = Math.min(1, Math.max(0, Number(savedState.volume) || 0.3));
            audio.volume = safeVolume;
            musicSlider.value = String(safeVolume);
        } else {
            audio.volume = 0.3;
            musicSlider.value = '0.3';
        }
    }

    playPauseButton?.addEventListener('click', async () => {
        if (!audio || !musicControl || !playPauseButton) {
            return;
        }
        if (audio.paused) {
            try {
                await audio.play();
                playPauseButton.textContent = 'Pause';
                musicControl.classList.add('playing');
            } catch (e) {
                console.warn('Audio play failed:', e);
            }
        } else {
            audio.pause();
            playPauseButton.textContent = 'Play';
            musicControl.classList.remove('playing');
        }
        saveMusicState(audio);
    });

    musicSlider?.addEventListener('input', function() {
        if (!audio) {
            return;
        }
        audio.volume = Number(this.value);
        saveMusicState(audio);
    });

    setupStartOverlay(audio, backgroundVideo, musicControl, playPauseButton);
});
