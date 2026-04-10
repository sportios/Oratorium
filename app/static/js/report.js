// Ораториум/app/static/js/report.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 Report.js: Страница отчета загружена');

    // Небольшая задержка для гарантии загрузки данных
    setTimeout(() => {
        if (window.currentSession) {
            fillReportData(window.currentSession);
            setupReportEventListeners();
        } else {
            console.error('❌ Нет данных текущей сессии');
            showReportError();
        }
    }, 100);
});

/**
 * Настройка обработчиков событий
 */
function setupReportEventListeners() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/history/';
        });
    }
}

/**
 * Показать ошибку загрузки
 */
function showReportError() {
    const content = document.querySelector('.report-content');
    if (content) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Ошибка загрузки данных</h3>
                <p>Не удалось загрузить информацию о сессии</p>
                <button class="back-btn" onclick="window.location.href='/history/'">
                    <i class="fas fa-arrow-left"></i>
                    <span>Вернуться к истории</span>
                </button>
            </div>
        `;
    }
}

/**
 * Заполнение отчета данными сессии
 */
function fillReportData(session) {
    console.log('📊 Заполняю отчет данными:', session);

    // Основная информация
    setElementText('report-title', session.title || 'Детальный отчет');
    setElementText('report-session-id', session.id);
    setElementText('report-date', formatDate(session.date));
    setElementText('report-duration', formatDuration(session.duration));

    // Итоговая оценка и круг
    const scoreStyle = getScoreStyle(session.finalScore);
    const circle = document.getElementById('score-circle');
    const scoreValue = document.getElementById('score-value');

    if (circle) {
        circle.style.background = scoreStyle.gradient;
    }
    if (scoreValue) {
        scoreValue.textContent = session.finalScore;
    }

    // Метрики
    setElementText('metric-speech-rate', session.speechRate || 0);
    setElementText('metric-volume', session.volume || 0);
    setElementText('metric-eye-contact', `${session.eyeContact || 0}%`);
    setElementText('metric-parasites', session.parasites || 0);


    // РЕКОМЕНДАЦИИ
    if (session.recommendations && session.recommendations.length > 0) {
        renderRecommendations(session.recommendations);
    } else {
        const container = document.getElementById('recommendations-list');
        if (container) {
            container.innerHTML = '<div class="no-data">Рекомендации будут доступны после анализа выступления</div>';
        }
    }

    startPolling(session.id);
}

/**
 * Отрисовка рекомендаций
 */
function renderRecommendations(recommendations) {
    const container = document.getElementById('recommendations-list');
    if (!container) {
        console.warn('⚠️ Контейнер recommendations-list не найден');
        return;
    }

    let html = '';
    recommendations.forEach(rec => {
        html += `
            <div class="recommendation-item">
                <div class="recommendation-icon">
                    <i class="${rec.icon}"></i>
                </div>
                <div class="recommendation-content">
                    <div class="recommendation-category">${rec.category}</div>
                    <div class="recommendation-text">${rec.text}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    console.log(`✅ Отрендерено ${recommendations.length} рекомендаций`);
}

/**
 * Утилита для установки текста элемента
 */
function setElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`⚠️ Элемент с id "${elementId}" не найден`);
    }
}

// Ораториум/app/static/js/report.js
// Добавить в конец файла

let pollingInterval = null;

function startPolling(sessionId) {
    // Останавливаем старый интервал, если есть
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    // Запускаем новый: каждые 4 секунды обновляем данные
    pollingInterval = setInterval(() => {
        fetch(`/api/sessions/${sessionId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Обновляем UI новыми данными
                    updateReportData(data.data);
                }
            })
            .catch(error => console.error('Polling error:', error));
    }, 4000); // 4000 мс = 4 секунды
}

function updateReportData(session) {
    // Обновляем метрики без перезагрузки страницы
    document.getElementById('metric-speech-rate').textContent = session.speech_rate || 0;
    document.getElementById('metric-volume').textContent = session.volume || 0;
    document.getElementById('metric-eye-contact').textContent = `${session.eye_contact || 0}%`;
    document.getElementById('metric-parasites').textContent = session.filler_words || 0;

    // Обновляем итоговую оценку
    const score = Math.round(session.final_score || 0);
    document.getElementById('score-value').textContent = score;

    // Обновляем цвет круга
    const scoreStyle = getScoreStyle(score);
    document.getElementById('score-circle').style.background = scoreStyle.gradient;
    // ✨ НОВОЕ: Обновляем длительность
    if (session.duration) {
        document.getElementById('report-duration').textContent = formatDuration(session.duration);
    }

    // ✨ НОВОЕ: Обновляем дату (если нужно)
    if (session.date) {
        document.getElementById('report-date').textContent = formatDate(session.date);
    }

    // ✨ НОВОЕ: Обновляем заголовок (если изменился)
    if (session.title) {
        document.getElementById('report-title').textContent = session.title;
    }

    // ✨ НОВОЕ: Обновляем рекомендации, если они появились
    if (session.recommendations && session.recommendations.length > 0) {
        renderRecommendations(session.recommendations);
    }


}

// Вызвать startPolling после загрузки данных сессии
// В функции fillReportData добавить:
// startPolling(session.id);
