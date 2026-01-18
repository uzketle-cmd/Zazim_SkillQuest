// Global variables
let selectedAnswers = {
    1: null,
    2: null
};

let userPoints = 1250;
let streakDays = 42;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    animateProgressBars();
    
    // Setup form submissions
    setupForms();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Initialize dashboard if user is logged in
    checkUserSession();
});

// Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    switchTab('login');
}

function openSignupModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    switchTab('signup');
}

function closeModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function switchTab(tabName) {
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activate selected tab
    const tabs = {
        'login': 0,
        'signup': 1,
        'demo': 2
    };
    
    document.querySelectorAll('.tab')[tabs[tabName]].classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
}

// Quiz Functions
function selectAnswer(element, answerId, quizId) {
    // Remove selection from all options in this quiz
    const parent = element.parentElement;
    parent.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select this option
    element.classList.add('selected');
    
    // Store selection
    selectedAnswers[quizId] = answerId;
}

function checkAnswer(quizId) {
    const correctAnswers = {
        1: 2, // Fire safety - Sound alarm and evacuate
        2: 6  // GDPR - Submit formal request
    };
    
    const quizContainer = document.getElementById(`quiz${quizId}`);
    const resultDiv = document.getElementById(`result${quizId}`);
    
    if (selectedAnswers[quizId] === null) {
        showNotification('Please select an answer first!', 'warning');
        return;
    }
    
    if (selectedAnswers[quizId] === correctAnswers[quizId]) {
        // Show success
        quizContainer.style.display = 'none';
        resultDiv.style.display = 'block';
        
        // Add points animation
        const pointsElement = document.querySelector(`#quiz${quizId}`).closest('.game-demo').querySelector('.points');
        pointsElement.innerHTML = '<i class="fas fa-star"></i> Completed!';
        pointsElement.style.color = '#4CAF50';
        pointsElement.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
        
        // Update user points
        userPoints += quizId === 1 ? 50 : 75;
        updateUserPoints();
        
        showNotification(`Correct! +${quizId === 1 ? 50 : 75} points earned!`, 'success');
    } else {
        showNotification('Not quite right. Try again!', 'error');
    }
}

function resetQuiz(quizId) {
    const quizContainer = document.getElementById(`quiz${quizId}`);
    const resultDiv = document.getElementById(`result${quizId}`);
    
    // Reset UI
    quizContainer.style.display = 'block';
    resultDiv.style.display = 'none';
    
    // Reset selection
    quizContainer.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    selectedAnswers[quizId] = null;
    
    // Change question for variety
    const questions = {
        1: [
            "What should you do if you discover a fire in the workplace?",
            "What is the first thing you should do in case of an emergency evacuation?",
            "How often should fire extinguishers be inspected?",
            "What does PASS stand for in fire extinguisher use?"
        ],
        2: [
            "A customer asks for a copy of all personal data you hold about them. How should you respond?",
            "How long do you have to respond to a Subject Access Request under GDPR?",
            "What should you do if you suspect a data breach has occurred?",
            "Which of these is NOT considered personal data under GDPR?"
        ]
    };
    
    const options = {
        1: [
            ["A) Try to extinguish it yourself", "B) Sound the alarm and evacuate immediately", "C) Finish your current task first", "D) Wait for instructions from a manager"],
            ["A) Collect your personal belongings", "B) Sound the alarm and follow evacuation routes", "C) Inform your manager first", "D) Continue working until told to stop"],
            ["A) Monthly", "B) Every 6 months", "C) Annually", "D) Every 3 years"],
            ["A) Pull, Aim, Squeeze, Sweep", "B) Push, Alert, Spray, Stop", "C) Point, Activate, Shoot, Swing", "D) Press, Aim, Shoot, Sweep"]
        ],
        2: [
            ["A) Provide it verbally over the phone", "B) Ask them to submit a formal Subject Access Request", "C) Send it by unencrypted email for speed", "D) Tell them you don't have that information"],
            ["A) 24 hours", "B) 7 days", "C) 30 days", "D) 3 months"],
            ["A) Ignore it if it's minor", "B) Report it to the ICO within 72 hours", "C) Tell the affected individuals after 30 days", "D) Only report if customers complain"],
            ["A) Name and address", "B) IP address", "C) Company registration number", "D) Email address"]
        ]
    };
    
    const correctIndexes = {
        1: [1, 1, 2, 0], // Index of correct answer for each question
        2: [1, 2, 1, 2]
    };
    
    const randomIndex = Math.floor(Math.random() * questions[quizId].length);
    document.getElementById(`question${quizId}`).textContent = questions[quizId][randomIndex];
    
    const optionElements = document.querySelectorAll(`#quiz${quizId} .quiz-option`);
    optionElements.forEach((opt, idx) => {
        opt.textContent = options[quizId][randomIndex][idx];
        // Update the onclick with new correct answer index
        const newCorrectAnswer = correctIndexes[quizId][randomIndex] + (quizId === 1 ? 1 : 5);
        opt.setAttribute('onclick', `selectAnswer(this, ${idx + (quizId === 1 ? 1 : 5)}, ${quizId})`);
    });
    
    // Reset points display
    const pointsElement = document.querySelector(`#quiz${quizId}`).closest('.game-demo').querySelector('.points');
    pointsElement.innerHTML = quizId === 1 ? '+50 points' : '+75 points';
    pointsElement.style.color = '';
    pointsElement.style.backgroundColor = '';
}

// Progress Simulation
function simulateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    // Animate progress from 0% to 100%
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        progressFill.style.width = progress + '%';
        progressPercent.textContent = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Update streak
            streakDays++;
            document.getElementById('streakCount').textContent = streakDays;
            
            // Update user points
            userPoints += 25;
            updateUserPoints();
            
            // Update streak display
            const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
            const streakDaysElements = document.querySelectorAll('.streak-day');
            
            // Mark today as active
            if (today >= 1 && today <= 5) { // Weekdays
                streakDaysElements[today - 1].classList.add('active');
            }
            
            showNotification('Daily module completed! +25 points', 'success');
        }
    }, 50);
}

// Form Handling
function setupForms() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Demo login - any password works
        loginUser(email.split('@')[0] || 'User', email);
    });
    
    // Signup Form
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const company = document.getElementById('signupCompany').value;
        const industry = document.getElementById('signupIndustry').value;
        const employees = document.getElementById('signupEmployees').value;
        
        // Basic validation
        if (!name || !email || !company || !industry || !employees) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Demo signup
        showNotification(`Welcome ${name}! Your 14-day free trial has started.`, 'success');
        loginUser(name.split(' ')[0], email, company, industry);
    });
    
    // Contact Form
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        showNotification('Demo request submitted! We\'ll contact you shortly.', 'success');
        this.reset();
    });
}

function useDemoCredentials() {
    loginUser('Demo', 'demo@zazimskillquest.com', 'Demo Company Ltd', 'manufacturing');
}

function loginUser(userName, email, company = 'Demo Company', industry = 'Manufacturing') {
    // Set user data
    document.getElementById('userName').textContent = userName;
    document.getElementById('userPoints').textContent = userPoints.toLocaleString();
    document.getElementById('streakCount').textContent = streakDays;
    
    // Show dashboard
    document.getElementById('dashboardPage').style.display = 'block';
    
    // Hide main content
    document.querySelectorAll('section, footer').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelector('header').style.display = 'none';
    
    // Close modal
    closeModal();
    
    // Show welcome message
    showNotification(`Welcome back, ${userName}!`, 'success');
}

function returnToHome() {
    // Show main content again
    document.getElementById('dashboardPage').style.display = 'none';
    document.querySelectorAll('section, footer').forEach(el => {
        el.style.display = 'block';
    });
    document.querySelector('header').style.display = 'block';
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
    
    showNotification('Logged out successfully', 'info');
}

// Dashboard Functions
function switchDashboardTab(tabName) {
    // Update sidebar
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.sidebar-menu a[onclick*="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`dashboard${capitalizeFirstLetter(tabName)}`).classList.add('active');
}

function startModule(moduleId) {
    const moduleTitles = {
        'manual-handling': 'Manual Handling Safety',
        'cybersecurity': 'Cybersecurity Awareness'
    };
    
    showNotification(`Starting "${moduleTitles[moduleId]}" module...`, 'info');
    
    // Simulate module completion after delay
    setTimeout(() => {
        userPoints += 50;
        updateUserPoints();
        showNotification(`Module completed! +50 points`, 'success');
        
        // Update progress bar for this module
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            if (bar.style.width === '0%' || bar.style.width === '40%') {
                bar.style.width = '100%';
            }
        });
    }, 2000);
}

// Helper Functions
function scrollToDemo() {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
}

function animateProgressBars() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressFill = entry.target.querySelector('.progress-fill');
                if (progressFill) {
                    const width = progressFill.style.width;
                    progressFill.style.width = '0%';
                    setTimeout(() => {
                        progressFill.style.width = width;
                    }, 300);
                }
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all progress bars
    document.querySelectorAll('.progress-bar').forEach(bar => {
        observer.observe(bar);
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function updateUserPoints() {
    document.getElementById('userPoints').textContent = userPoints.toLocaleString();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-global ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles for notification
    if (!document.querySelector('.notification-global')) {
        const style = document.createElement('style');
        style.textContent = `
            .notification-global {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                z-index: 9999;
                animation: slideIn 0.3s;
                max-width: 400px;
                border-left: 4px solid #2A4B8C;
            }
            .notification-global.success { border-left-color: #4CAF50; }
            .notification-global.error { border-left-color: #DC3545; }
            .notification-global.warning { border-left-color: #FFC107; }
            .notification-global.info { border-left-color: #17A2B8; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification-global i {
                font-size: 1.2rem;
            }
            .notification-global.success i { color: #4CAF50; }
            .notification-global.error i { color: #DC3545; }
            .notification-global.warning i { color: #FFC107; }
            .notification-global.info i { color: #17A2B8; }
            .notification-global button {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #666;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function checkUserSession() {
    // Check if user was previously logged in (demo purposes)
    // In a real app, this would check localStorage or cookies
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('demo') === 'true') {
        useDemoCredentials();
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target == modal) {
        closeModal();
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key closes modals
    if (e.key === 'Escape') {
        closeModal();
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    }
    
    // Demo access shortcut (Ctrl+D)
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        useDemoCredentials();
    }
});
