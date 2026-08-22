// 全局變量
let currentUser = null;
let token = localStorage.getItem('token');

// API基礎URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM元素
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const courseModal = document.getElementById('courseModal');
const userMenu = document.getElementById('userMenu');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');

// 初始化應用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
    loadPersonalStats();
});

// 初始化應用
function initializeApp() {
    if (token) {
        checkAuthStatus();
    }
}

// 設置事件監聽器
function setupEventListeners() {
    // 模態框事件
    loginBtn.addEventListener('click', () => showModal(loginModal));
    registerBtn.addEventListener('click', () => showModal(registerModal));
    
    // 關閉模態框
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // 點擊模態框外部關閉
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // 表單提交
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // 模態框切換
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        showModal(registerModal);
    });

    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        showModal(loginModal);
    });

    // 登出
    logoutBtn.addEventListener('click', handleLogout);

    // 分類卡片點擊
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            // 這裡可以添加跳轉到分類頁面的邏輯
            console.log('選擇分類:', category);
        });
    });
}

// 顯示模態框
function showModal(modal) {
    modal.style.display = 'block';
}

// 檢查身份驗證狀態
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateUIForLoggedInUser();
        } else {
            localStorage.removeItem('token');
            token = null;
        }
    } catch (error) {
        console.error('檢查身份驗證狀態錯誤:', error);
        localStorage.removeItem('token');
        token = null;
    }
}

// 更新已登入用戶的UI
function updateUIForLoggedInUser() {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    userMenu.style.display = 'flex';
    userAvatar.src = currentUser.avatar || 'https://via.placeholder.com/40x40?text=用戶';
}

// 處理登入
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            
            loginModal.style.display = 'none';
            updateUIForLoggedInUser();
            showNotification('登入成功！', 'success');
            
            // 重新載入數據
            loadInitialData();
        } else {
            showNotification(data.message || '登入失敗', 'error');
        }
    } catch (error) {
        console.error('登入錯誤:', error);
        showNotification('登入失敗，請稍後再試', 'error');
    }
}

// 處理註冊
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            
            registerModal.style.display = 'none';
            updateUIForLoggedInUser();
            showNotification('註冊成功！', 'success');
            
            // 重新載入數據
            loadInitialData();
        } else {
            showNotification(data.message || '註冊失敗', 'error');
        }
    } catch (error) {
        console.error('註冊錯誤:', error);
        showNotification('註冊失敗，請稍後再試', 'error');
    }
}

// 處理登出
function handleLogout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    userMenu.style.display = 'none';
    
    showNotification('已登出', 'info');
}

// 載入初始數據
async function loadInitialData() {
    await Promise.all([
        loadFeaturedCourses(),
        loadArticles(),
        loadStats()
    ]);
}

// 載入特色課程
async function loadFeaturedCourses() {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/featured`);
        const data = await response.json();

        if (response.ok) {
            renderFeaturedCourses(data.courses);
        }
    } catch (error) {
        console.error('載入特色課程錯誤:', error);
    }
}

// 渲染特色課程
function renderFeaturedCourses(courses) {
    const grid = document.getElementById('featuredCoursesGrid');
    
    if (courses.length === 0) {
        grid.innerHTML = '<p class="no-data">暫無特色課程</p>';
        return;
    }

    grid.innerHTML = courses.map(course => `
        <div class="course-card" onclick="showCourseDetails('${course._id}')">
            <img src="${course.thumbnail}" alt="${course.title}" class="course-image">
            <div class="course-content">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description.substring(0, 100)}...</p>
                <div class="course-meta">
                    <div class="course-instructor">
                        <img src="${course.instructor.avatar}" alt="${course.instructor.username}" class="instructor-avatar">
                        <span class="instructor-name">${course.instructor.username}</span>
                    </div>
                    <div class="course-rating">
                        <span class="rating-stars">${generateStars(course.averageRating)}</span>
                        <span class="rating-text">(${course.totalRatings})</span>
                    </div>
                </div>
                <div class="course-footer">
                    <span class="course-price ${course.isFree ? 'course-free' : ''}">
                        ${course.isFree ? '免費' : `NT$ ${course.price}`}
                    </span>
                    <div class="course-actions">
                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); toggleFavorite('${course._id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); enrollCourse('${course._id}')">
                            報名
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 載入最新文章
async function loadArticles() {
    try {
        // 從localStorage獲取文章數據
        const articles = JSON.parse(localStorage.getItem('articles')) || [];
        
        // 如果沒有文章，添加一些示例文章
        if (articles.length === 0) {
            const sampleArticles = [
                {
                    id: 1,
                    authorName: '張小明',
                    title: '我的英文學習心得：從零基礎到流利對話',
                    category: '英文',
                    content: '作為一個從零開始學習英文的學生，我想分享這一年來的學習心得和經驗...',
                    createdAt: new Date().toISOString(),
                    readTime: '5分鐘',
                    tags: ['英文學習', '心得分享', '學習方法']
                },
                {
                    id: 2,
                    authorName: '李美玲',
                    title: '管理學實戰經驗：如何有效管理團隊',
                    category: '管理學',
                    content: '在過去三年的團隊管理經驗中，我總結出了一些實用的管理技巧...',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    readTime: '8分鐘',
                    tags: ['團隊管理', '實戰經驗', '管理技巧']
                }
            ];
            localStorage.setItem('articles', JSON.stringify(sampleArticles));
            renderArticles(sampleArticles);
        } else {
            renderArticles(articles.slice(0, 3)); // 只顯示最新的3篇文章
        }
    } catch (error) {
        console.error('載入文章錯誤:', error);
    }
}

// 渲染最新文章
function renderArticles(articles) {
    const grid = document.getElementById('articlesGrid');
    
    if (articles.length === 0) {
        grid.innerHTML = '<p class="no-data">暫無文章</p>';
        return;
    }

    grid.innerHTML = articles.map(article => {
        const formattedDate = formatDate(article.createdAt);
        const excerpt = article.content.substring(0, 150) + (article.content.length > 150 ? '...' : '');
        const authorInitial = article.authorName.charAt(0);
        
        return `
            <div class="article-card" onclick="window.location.href='notes-manager.html'">
                <div class="article-image">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <div class="author-avatar">${authorInitial}</div>
                        <span>${article.authorName}</span>
                        <span>•</span>
                        <span>${formattedDate}</span>
                        <span>•</span>
                        <span>${article.readTime}</span>
                    </div>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${excerpt}</p>
                    ${article.tags.length > 0 ? `<div class="article-tags">${article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('')}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '今天';
    } else if (diffDays === 2) {
        return '昨天';
    } else if (diffDays <= 7) {
        return `${diffDays - 1}天前`;
    } else {
        return date.toLocaleDateString('zh-TW');
    }
}

// 載入統計數據
async function loadStats() {
    try {
        // 這裡可以添加獲取統計數據的API調用
        // 目前使用模擬數據
        document.getElementById('studyDays').textContent = '45';
        document.getElementById('totalNotes').textContent = '23';
        document.getElementById('studyHours').textContent = '120';
        document.getElementById('achievements').textContent = '8';
    } catch (error) {
        console.error('載入統計數據錯誤:', error);
    }
}

// 載入個人學習統計
async function loadPersonalStats() {
    try {
        // 模擬個人學習統計數據
        const stats = {
            studyDays: 45,
            totalNotes: 23,
            studyHours: 120,
            achievements: 8
        };
        
        // 更新統計顯示
        document.getElementById('studyDays').textContent = stats.studyDays;
        document.getElementById('totalNotes').textContent = stats.totalNotes;
        document.getElementById('studyHours').textContent = stats.studyHours;
        document.getElementById('achievements').textContent = stats.achievements;
    } catch (error) {
        console.error('載入個人統計錯誤:', error);
    }
}

// 顯示課程詳情
async function showCourseDetails(courseId) {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
        const data = await response.json();

        if (response.ok) {
            renderCourseModal(data.course);
            showModal(courseModal);
        }
    } catch (error) {
        console.error('獲取課程詳情錯誤:', error);
        showNotification('獲取課程詳情失敗', 'error');
    }
}

// 渲染課程模態框
function renderCourseModal(course) {
    const content = document.getElementById('courseModalContent');
    
    content.innerHTML = `
        <div class="course-detail">
            <div class="course-header">
                <img src="${course.thumbnail}" alt="${course.title}" class="course-detail-image">
                <div class="course-detail-info">
                    <h2>${course.title}</h2>
                    <p class="course-detail-description">${course.description}</p>
                    <div class="course-detail-meta">
                        <div class="instructor-info">
                            <img src="${course.instructor.avatar}" alt="${course.instructor.username}" class="instructor-avatar">
                            <span>${course.instructor.username}</span>
                        </div>
                        <div class="course-stats">
                            <span><i class="fas fa-users"></i> ${course.enrolledStudents.length} 學生</span>
                            <span><i class="fas fa-star"></i> ${course.averageRating.toFixed(1)} (${course.totalRatings} 評分)</span>
                            <span><i class="fas fa-clock"></i> ${course.totalDuration} 分鐘</span>
                        </div>
                    </div>
                    <div class="course-actions">
                        <button class="btn btn-primary" onclick="enrollCourse('${course._id}')">
                            ${course.isFree ? '免費報名' : `NT$ ${course.price} 報名`}
                        </button>
                        <button class="btn btn-outline" onclick="toggleFavorite('${course._id}')">
                            <i class="fas fa-heart"></i> 收藏
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="course-lessons">
                <h3>課程大綱</h3>
                <div class="lessons-list">
                    ${course.lessons.map((lesson, index) => `
                        <div class="lesson-item">
                            <div class="lesson-number">${index + 1}</div>
                            <div class="lesson-info">
                                <h4>${lesson.title}</h4>
                                <p>${lesson.description}</p>
                                <span class="lesson-duration">${lesson.duration} 分鐘</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="course-reviews">
                <h3>學員評價</h3>
                <div class="reviews-list">
                    ${course.ratings.map(rating => `
                        <div class="review-item">
                            <div class="review-header">
                                <img src="${rating.user.avatar}" alt="${rating.user.username}" class="reviewer-avatar">
                                <div class="reviewer-info">
                                    <span class="reviewer-name">${rating.user.username}</span>
                                    <span class="review-rating">${generateStars(rating.rating)}</span>
                                </div>
                            </div>
                            <p class="review-text">${rating.review}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// 報名課程
async function enrollCourse(courseId) {
    if (!token) {
        showModal(loginModal);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('報名成功！', 'success');
        } else {
            showNotification(data.message || '報名失敗', 'error');
        }
    } catch (error) {
        console.error('報名課程錯誤:', error);
        showNotification('報名失敗，請稍後再試', 'error');
    }
}

// 切換收藏狀態
async function toggleFavorite(courseId) {
    if (!token) {
        showModal(loginModal);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/favorite`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message || '操作失敗', 'error');
        }
    } catch (error) {
        console.error('收藏操作錯誤:', error);
        showNotification('操作失敗，請稍後再試', 'error');
    }
}

// 生成星級評分
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}

// 顯示通知
function showNotification(message, type = 'info') {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加樣式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // 根據類型設置背景色
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#333';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 3秒後自動移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 添加動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .no-data {
        text-align: center;
        color: #666;
        font-style: italic;
        grid-column: 1 / -1;
        padding: 40px;
    }
    
    .btn-sm {
        padding: 8px 16px;
        font-size: 14px;
    }
    
    .course-detail {
        max-height: 70vh;
        overflow-y: auto;
    }
    
    .course-detail-image {
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 15px;
        margin-bottom: 20px;
    }
    
    .course-detail-info h2 {
        margin-bottom: 15px;
        color: #333;
    }
    
    .course-detail-description {
        color: #666;
        line-height: 1.6;
        margin-bottom: 20px;
    }
    
    .course-detail-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .instructor-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .course-stats {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
    }
    
    .course-stats span {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #666;
    }
    
    .course-actions {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .course-lessons,
    .course-reviews {
        margin-top: 30px;
    }
    
    .course-lessons h3,
    .course-reviews h3 {
        margin-bottom: 20px;
        color: #333;
    }
    
    .lessons-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .lesson-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .lesson-number {
        width: 30px;
        height: 30px;
        background: #667eea;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        flex-shrink: 0;
    }
    
    .lesson-info h4 {
        margin-bottom: 5px;
        color: #333;
    }
    
    .lesson-info p {
        color: #666;
        margin-bottom: 5px;
    }
    
    .lesson-duration {
        font-size: 14px;
        color: #999;
    }
    
    .reviews-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .review-item {
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
    }
    
    .review-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .reviewer-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }
    
    .reviewer-name {
        font-weight: 600;
        color: #333;
    }
    
    .review-rating {
        color: #ffc107;
    }
    
    .review-text {
        color: #666;
        line-height: 1.5;
    }
`;
document.head.appendChild(style); 