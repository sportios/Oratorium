// Ораториум/app/static/js/history.js

const SESSIONS_PER_PAGE = 10;

const historyState = {
    currentPage: 1,
    totalPages: 1,
    currentSort: 'date',
    sortOrder: 'desc',
    displayedSessions: []
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('📜 History.js: Страница истории загружена');
    
    // Ждем данные из main.js
    setTimeout(() => {
        if (window.djangoSessions && window.djangoSessions.length > 0) {
            initializeHistory();
        } else if (window.sessionsCount === 0) {
            showEmptyState();
        } else {
            console.warn('Нет данных сессий');
            showEmptyState();
        }
    }, 100);
});

function initializeHistory() {
    if (!state.allSessions || state.allSessions.length === 0) {
        showEmptyState();
        return;
    }
    
    sortSessions('date', 'desc');
    historyState.totalPages = Math.ceil(state.allSessions.length / SESSIONS_PER_PAGE);
    
    updateSessionCount();
    renderSessionsTable();
    updatePagination();
    setupHistoryEventListeners();
}

function showEmptyState() {
    document.getElementById('no-sessions-message').style.display = 'block';
    document.getElementById('pagination').style.display = 'none';
}

function setupHistoryEventListeners() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sortType = btn.dataset.sort;
            handleSortChange(sortType);
        });
    });
    
    document.getElementById('prev-page')?.addEventListener('click', goToPrevPage);
    document.getElementById('next-page')?.addEventListener('click', goToNextPage);
    
    document.addEventListener('click', (event) => {
        const row = event.target.closest('tr[session-id]');
        if (row) {
            const sessionId = row.getAttribute('session-id');
            window.location.href = `/report/${sessionId}/`;
        }
    });
}

function handleSortChange(sortType) {
    if (historyState.currentSort === sortType) {
        historyState.sortOrder = historyState.sortOrder === 'desc' ? 'asc' : 'desc';
    } else {
        historyState.currentSort = sortType;
        historyState.sortOrder = 'desc';
    }
    
    updateSortButtons();
    sortSessions(historyState.currentSort, historyState.sortOrder);
    historyState.currentPage = 1;
    renderSessionsTable();
    updatePagination();
}

function updateSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        const sortType = btn.dataset.sort;
        const icon = btn.querySelector('i');
        
        btn.classList.remove('active');
        icon.className = 'fas fa-sort';
        
        if (sortType === historyState.currentSort) {
            btn.classList.add('active');
            icon.className = historyState.sortOrder === 'desc' ? 'fas fa-sort-down' : 'fas fa-sort-up';
        }
    });
}

function sortSessions(sortType, order) {
    state.allSessions.sort((a, b) => {
        let valueA, valueB;
        
        if (sortType === 'date') {
            valueA = new Date(a.date).getTime();
            valueB = new Date(b.date).getTime();
        } else {
            valueA = a.finalScore;
            valueB = b.finalScore;
        }
        
        if (order === 'desc') {
            return valueB - valueA;
        } else {
            return valueA - valueB;
        }
    });
}

function goToPrevPage() {
    if (historyState.currentPage > 1) {
        historyState.currentPage--;
        renderSessionsTable();
        updatePagination();
    }
}

function goToNextPage() {
    if (historyState.currentPage < historyState.totalPages) {
        historyState.currentPage++;
        renderSessionsTable();
        updatePagination();
    }
}

function updatePagination() {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    if (!pagination || !state.allSessions || state.allSessions.length === 0) {
        if (pagination) pagination.style.display = 'none';
        return;
    }
    
    if (state.allSessions.length <= SESSIONS_PER_PAGE) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    prevBtn.disabled = historyState.currentPage === 1;
    nextBtn.disabled = historyState.currentPage === historyState.totalPages;
    pageInfo.textContent = `Страница ${historyState.currentPage} из ${historyState.totalPages}`;
}

function updateSessionCount() {
    const countElement = document.getElementById('session-count');
    if (countElement) {
        countElement.textContent = `Всего сессий: ${state.allSessions.length}`;
    }
}

function renderSessionsTable() {
    const tableBody = document.getElementById('sessions-body');
    const noSessions = document.getElementById('no-sessions-message');
    
    if (!tableBody) return;
    
    if (!state.allSessions || state.allSessions.length === 0) {
        tableBody.innerHTML = '';
        if (noSessions) noSessions.style.display = 'block';
        return;
    }
    
    if (noSessions) noSessions.style.display = 'none';
    
    const startIndex = (historyState.currentPage - 1) * SESSIONS_PER_PAGE;
    const endIndex = Math.min(startIndex + SESSIONS_PER_PAGE, state.allSessions.length);
    
    historyState.displayedSessions = state.allSessions.slice(startIndex, endIndex);
    
    let tableHTML = '';
    
    historyState.displayedSessions.forEach((session) => {
        const dateFormatted = formatDate(session.date);
        const scoreStyle = getScoreStyle(session.finalScore);
        
        const dateParts = dateFormatted.split(',');
        const datePart = dateParts[0] || '';
        const timePart = dateParts[1] || '';

        tableHTML += `
            <tr session-id="${session.id}">
                <td>${session.id}</td>
                <td>${session.title || 'Без названия'}</td>
                <td>
                    <div class="session-datetime">
                        <div class="session-date">${datePart}</div>
                        <div class="session-time">
                            <i class="far fa-clock"></i>
                            ${timePart}
                        </div>
                    </div>
                </td>
                <td>${formatDuration(session.duration)}</td>
                <td>
                    <div class="score-badge ${scoreStyle.className}">
                        ${session.finalScore}
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
}

