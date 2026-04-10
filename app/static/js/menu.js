// Ораториум/app/static/js/menu.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Menu.js: Главное меню инициализировано');
    setupMenuButtons();
});

function setupMenuButtons() {
    const practiceBtn = document.getElementById('start-practice');
    if (practiceBtn) {
        practiceBtn.addEventListener('click', handlePracticeClick);
    }
    
    const historyBtn = document.getElementById('history-sessions');
    if (historyBtn) {
        historyBtn.addEventListener('click', handleHistoryClick);
    }
}

function handlePracticeClick() {
    console.log('🎮 Нажата кнопка "Начать тренировку"');
    showSessionNameModal();
}

function handleHistoryClick() {
    console.log('📊 Нажата кнопка "История сессий"');
    window.location.href = '/history/';
}

/**
 * Показывает модальное окно для ввода названия сессии
 */
function showSessionNameModal() {
    // Создаем затемненный фон
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'session-modal';
    
    // Заполняем контент
    modal.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-microphone"></i> Новая тренировка</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>Введите название тренировки</p>
            <input type="text" class="session-name-input" 
                   placeholder="Например: Защита курсовой, Питч для инвестора..." 
                   value="Тренировка ${new Date().toLocaleString('ru-RU', {
                       day: '2-digit',
                       month: '2-digit',
                       hour: '2-digit',
                       minute: '2-digit'
                   })}">
        </div>
        <div class="modal-footer">
            <button class="modal-btn cancel-btn">Отмена</button>
            <button class="modal-btn start-btn">Начать тренировку</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Анимация появления
    setTimeout(() => overlay.classList.add('active'), 10);
    
    // Фокус на поле ввода
    const input = modal.querySelector('.session-name-input');
    input.focus();
    input.select();
    
    // Обработчики
    setupModalHandlers(overlay, modal, input);
}

/**
 * Настройка обработчиков для модального окна
 */
function setupModalHandlers(overlay, modal, input) {
    // Закрытие по крестику
    modal.querySelector('.modal-close').addEventListener('click', () => {
        closeModal(overlay);
    });
    
    // Закрытие по кнопке "Отмена"
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
        closeModal(overlay);
    });
    
    // Закрытие по клику на фон
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay);
        }
    });
    
    // Начало тренировки
    const startBtn = modal.querySelector('.start-btn');
    startBtn.addEventListener('click', () => {
        const sessionName = input.value.trim() || `Тренировка ${new Date().toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        
        startTraining(sessionName, overlay);
    });
    
    // Enter в поле ввода
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startBtn.click();
        }
    });
}

/**
 * Начать тренировку с указанным названием
 */
function startTraining(sessionName, overlay) {
    // Показываем статус загрузки
    const startBtn = overlay.querySelector('.start-btn');
    const originalText = startBtn.textContent;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Создание...';
    startBtn.disabled = true;
    
    fetch('/sessions/create/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_name: sessionName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Закрываем модалку
            closeModal(overlay);
            
            // Показываем успех
            showMenuAlert(`✅ Сессия "${sessionName}" создана! Можно начинать тренировку в VR`);
            
            console.log('Создана сессия:', data);
        } else {
            showMenuAlert('❌ Ошибка при создании сессии');
            startBtn.innerHTML = originalText;
            startBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showMenuAlert('❌ Ошибка соединения с сервером');
        startBtn.innerHTML = originalText;
        startBtn.disabled = false;
    });
}

/**
 * Закрыть модальное окно
 */
function closeModal(overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.remove();
    }, 300);
}

/**
 * Показать уведомление
 */
function showMenuAlert(message) {
    const oldAlert = document.querySelector('.alert');
    if (oldAlert) oldAlert.remove();
    
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => alert.remove(), 300);
    }, 2000);
}

