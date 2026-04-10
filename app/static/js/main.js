// Ораториум/app/static/js/main.js

// ==========================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ==========================
const state = {
    currentTheme: localStorage.getItem('oratorium-theme') || 'dark',
    allSessions: [],
    currentSession: null
};

// ==========================
// УПРАВЛЕНИЕ ТЕМОЙ (ИЗ ТВОЕГО ПРИМЕРА)
// ==========================
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        const text = themeBtn.querySelector('span');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-moon';
            text.textContent = 'Тёмная тема';
        } else {
            icon.className = 'fas fa-sun';
            text.textContent = 'Светлая тема';
        }
    }
    
    localStorage.setItem('oratorium-theme', theme);
    state.currentTheme = theme;
    
    console.log(`Тема применена: ${theme}`);
}

function toggleTheme() {
    const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
}

function setupThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
}

// ==========================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main.js: инициализация...');
    
    // Загружаем сессии из window.djangoSessions
    if (window.djangoSessions && Array.isArray(window.djangoSessions)) {
        state.allSessions = window.djangoSessions.map(session => ({
            ...session,
            finalScore: Number(session.finalScore) || 0,
            speechRate: Number(session.speechRate) || 0,
            volume: Number(session.volume) || 0,
            eyeContact: Number(session.eyeContact) || 0,
            parasites: Number(session.parasites) || 0
        }));
        console.log(`Main.js: загружено ${state.allSessions.length} сессий`);
    }
    
    // Если это детальная страница, сохраняем текущую сессию
    if (window.currentSession) {
        state.currentSession = {
            ...window.currentSession,
            finalScore: Number(window.currentSession.finalScore) || 0,
            speechRate: Number(window.currentSession.speechRate) || 0,
            volume: Number(window.currentSession.volume) || 0,
            eyeContact: Number(window.currentSession.eyeContact) || 0,
            parasites: Number(window.currentSession.parasites) || 0
        };
        console.log('Main.js: текущая сессия загружена');
    }
    
    // Применяем сохранённую тему
    applyTheme(state.currentTheme);
    
    // Настраиваем переключатель темы
    setupThemeToggle();
});

// ==========================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================
function formatDate(dateString) {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Неизвестно';
    
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0 сек';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (hours > 0) parts.push(`${hours} ч`);
    if (minutes > 0) parts.push(`${minutes} мин`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} сек`);
    
    return parts.join(' ');
}

function getScoreStyle(score) {
    const numScore = Number(score) || 0;
    
    if (numScore === 0) return {
        className: 'score-red',
        gradient: 'linear-gradient(135deg, #FF5252, #FF8A80)',
        color: '#FF5252'
    };
    if (numScore <= 59) return {
        className: 'score-red',
        gradient: 'linear-gradient(135deg, #A50026, #FF5252)',
        color: '#FF5252'
    };
    if (numScore <= 70) return {
        className: 'score-orange',
        gradient: 'linear-gradient(135deg, #FDAE61, #FFB347)',
        color: '#FF9800'
    };
    if (numScore <= 84) return {
        className: 'score-light-green',
        gradient: 'linear-gradient(135deg, #66BD63, #6FCF97)',
        color: '#4CAF50'
    };
    return {
        className: 'score-dark-green',
        gradient: 'linear-gradient(135deg, #006837, #27AE60)',
        color: '#2E7D32'
    };
}

