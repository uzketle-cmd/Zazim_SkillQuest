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

// Authentication System for Zazim SkillQuest Demo
// This system uses localStorage for demo purposes (no backend required)

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadUserStats();
    setupEventListeners();
    checkExistingSession();
});

// Global variables
let currentUser = null;
let verificationCode = null;
let verificationTimer = null;
let pendingVerificationEmail = null;

// Initialize application
function initializeApp() {
    // Initialize localStorage if empty
    if (!localStorage.getItem('zazim_users')) {
        localStorage.setItem('zazim_users', JSON.stringify({}));
    }
    
    if (!localStorage.getItem('zazim_stats')) {
        localStorage.setItem('zazim_stats', JSON.stringify({
            totalUsers: 0,
            verifiedUsers: 0,
            pendingVerifications: 0,
            totalModulesCompleted: 0
        }));
    }
    
    // Create test account if it doesn't exist
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    if (!users['test@zazim.com']) {
        users['test@zazim.com'] = {
            name: 'Test User',
            email: 'test@zazim.com',
            password: 'Password123',
            verified: true,
            industry: 'manufacturing',
            createdAt: new Date().toISOString(),
            stats: {
                points: 500,
                level: 2,
                completedModules: 3,
                learningTime: 25,
                streak: 7,
                achievements: ['safety-first', 'quick-learner']
            }
        };
        localStorage.setItem('zazim_users', JSON.stringify(users));
        updateStats();
    }
}

// Load user statistics
function loadUserStats() {
    const stats = JSON.parse(localStorage.getItem('zazim_stats'));
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    
    // Count verified and pending users
    let verifiedCount = 0;
    let pendingCount = 0;
    Object.values(users).forEach(user => {
        if (user.verified) verifiedCount++;
        else pendingCount++;
    });
    
    document.getElementById('totalUsers').textContent = Object.keys(users).length;
    document.getElementById('verifiedUsers').textContent = verifiedCount;
    document.getElementById('pendingVerifications').textContent = pendingCount;
    
    // Update stats
    stats.totalUsers = Object.keys(users).length;
    stats.verifiedUsers = verifiedCount;
    stats.pendingVerifications = pendingCount;
    localStorage.setItem('zazim_stats', JSON.stringify(stats));
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        loginUser(email, password);
    });
    
    // Signup form
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignup();
    });
    
    // Password strength checker
    document.getElementById('signupPassword').addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
    
    // Reset password form
    document.getElementById('resetForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handlePasswordReset();
    });
    
    // Verification form
    document.getElementById('verificationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        verifyEmailCode();
    });
    
    // Check for password match
    document.getElementById('signupConfirmPassword').addEventListener('input', function() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = this.value;
        const submitBtn = document.querySelector('#signupForm button[type="submit"]');
        
        if (password !== confirmPassword && confirmPassword.length > 0) {
            this.style.borderColor = 'var(--danger)';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        } else {
            this.style.borderColor = '';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });
}

// Check password strength
function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let text = 'Weak';
    let className = 'weak';
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    
    switch(strength) {
        case 0:
        case 1:
            text = 'Weak';
            className = 'weak';
            break;
        case 2:
            text = 'Medium';
            className = 'medium';
            break;
        case 3:
            text = 'Strong';
            className = 'strong';
            break;
        case 4:
            text = 'Very Strong';
            className = 'very-strong';
            break;
    }
    
    strengthBar.className = `strength-bar ${className}`;
    strengthText.textContent = text;
}

// Handle user signup
function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const industry = document.getElementById('signupIndustry').value;
    
    // Validation
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    if (users[email]) {
        showNotification('An account with this email already exists', 'error');
        return;
    }
    
    // Generate verification code
    verificationCode = generateVerificationCode();
    pendingVerificationEmail = email;
    
    // Store user temporarily (unverified)
    users[email] = {
        name: name,
        email: email,
        password: password, // In production, this should be hashed
        industry: industry,
        verified: false,
        verificationCode: verificationCode,
        createdAt: new Date().toISOString(),
        stats: {
            points: 0,
            level: 1,
            completedModules: 0,
            learningTime: 0,
            streak: 1,
            achievements: [],
            lastLogin: null,
            modules: {
                'fire-safety': { progress: 0, completed: false },
                'gdpr': { progress: 0, completed: false },
                'health-safety': { progress: 0, completed: false },
                'manual-handling': { progress: 0, completed: false }
            }
        }
    };
    
    localStorage.setItem('zazim_users', JSON.stringify(users));
    updateStats();
    
    // Send verification email
    sendVerificationEmail(email, verificationCode);
    
    // Show verification modal
    closeModal();
    openVerificationModal(email);
    
    showNotification('Verification code sent to your email', 'success');
}

// Generate 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email (using EmailJS)
async function sendVerificationEmail(email, code) {
    try {
        // For demo purposes, we'll use EmailJS
        // You need to sign up at https://www.emailjs.com/ and configure it
        
        const templateParams = {
            to_email: email,
            verification_code: code,
            app_name: 'Zazim SkillQuest',
            user_name: email.split('@')[0]
        };
        
        // EmailJS configuration (replace with your actual values)
        const serviceID = 'YOUR_SERVICE_ID';
        const templateID = 'YOUR_TEMPLATE_ID';
        
        // Uncomment and configure when you have EmailJS setup
        // await emailjs.send(serviceID, templateID, templateParams);
        
        // For demo, we'll log the code to console
        console.log(`📧 Verification code for ${email}: ${code}`);
        console.log(`📧 In production, this would be sent via email using EmailJS`);
        
        // Start verification timer
        startVerificationTimer();
        
    } catch (error) {
        console.error('Failed to send verification email:', error);
        // For demo, we'll still proceed and show the code
        showNotification(`Verification code: ${code} (Check console for demo)`, 'info');
        startVerificationTimer();
    }
}

// Start verification timer (5 minutes)
function startVerificationTimer() {
    let timeLeft = 300; // 5 minutes in seconds
    const timerElement = document.getElementById('countdown');
    const timerContainer = document.getElementById('timer');
    
    if (verificationTimer) {
        clearInterval(verificationTimer);
    }
    
    verificationTimer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 60) {
            timerContainer.classList.add('expiring');
        }
        
        if (timeLeft <= 0) {
            clearInterval(verificationTimer);
            showNotification('Verification code has expired', 'error');
            document.querySelectorAll('.code-input').forEach(input => {
                input.disabled = true;
            });
        }
    }, 1000);
}

// Verify email code
function verifyEmailCode() {
    const codeInputs = document.querySelectorAll('.code-input');
    let enteredCode = '';
    
    codeInputs.forEach(input => {
        enteredCode += input.value;
    });
    
    if (enteredCode.length !== 6) {
        showNotification('Please enter the full 6-digit code', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    const user = users[pendingVerificationEmail];
    
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    // For demo, also accept the displayed code
    if (enteredCode === verificationCode || enteredCode === '123456') {
        // Mark user as verified
        user.verified = true;
        delete user.verificationCode;
        
        // Update user stats
        const stats = JSON.parse(localStorage.getItem('zazim_stats'));
        stats.verifiedUsers++;
        stats.pendingVerifications--;
        
        localStorage.setItem('zazim_users', JSON.stringify(users));
        localStorage.setItem('zazim_stats', JSON.stringify(stats));
        
        // Clear timer
        clearInterval(verificationTimer);
        
        // Close verification modal
        closeVerificationModal();
        
        // Show success modal
        showSuccessModal(user);
        
        // Update UI
        loadUserStats();
        
        showNotification('Email verified successfully!', 'success');
    } else {
        showNotification('Invalid verification code', 'error');
        // Shake animation for wrong code
        codeInputs.forEach(input => {
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        });
    }
}

// Resend verification code
function resendVerificationCode() {
    if (!pendingVerificationEmail) {
        showNotification('No email pending verification', 'error');
        return;
    }
    
    verificationCode = generateVerificationCode();
    
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    const user = users[pendingVerificationEmail];
    
    if (user) {
        user.verificationCode = verificationCode;
        localStorage.setItem('zazim_users', JSON.stringify(users));
    }
    
    sendVerificationEmail(pendingVerificationEmail, verificationCode);
    showNotification('New verification code sent', 'success');
}

// Handle password reset
function handlePasswordReset() {
    const email = document.getElementById('resetEmail').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    
    if (!users[email]) {
        showNotification('No account found with this email', 'error');
        return;
    }
    
    // In production, send password reset email
    // For demo, we'll just show a message
    showNotification(`Password reset instructions sent to ${email}`, 'success');
    
    // Switch back to login tab
    setTimeout(() => {
        switchTab('login');
        document.getElementById('resetForm').reset();
    }, 2000);
}

// Login user
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    const user = users[email];
    
    if (!user) {
        showNotification('Account not found. Please sign up first.', 'error');
        return;
    }
    
    if (!user.verified) {
        showNotification('Please verify your email first', 'error');
        pendingVerificationEmail = email;
        closeModal();
        openVerificationModal(email);
        return;
    }
    
    if (user.password !== password) {
        showNotification('Invalid password', 'error');
        return;
    }
    
    // Successful login
    currentUser = user;
    
    // Update last login
    user.stats.lastLogin = new Date().toISOString();
    localStorage.setItem('zazim_users', JSON.stringify(users));
    
    // Store session
    sessionStorage.setItem('currentUser', email);
    if (document.getElementById('rememberMe').checked) {
        localStorage.setItem('rememberedUser', email);
    }
    
    // Close modal and open dashboard
    closeModal();
    openDashboard();
    
    showNotification(`Welcome back, ${user.name}!`, 'success');
}

// Open dashboard
function openDashboard() {
    if (!currentUser) {
        showNotification('Please log in first', 'error');
        openLoginModal();
        return;
    }
    
    // Hide main content
    document.querySelectorAll('section, footer').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelector('header').style.display = 'none';
    
    // Show dashboard
    document.getElementById('dashboardPage').style.display = 'block';
    
    // Load user data
    loadDashboardData();
}

// Load dashboard data
function loadDashboardData() {
    if (!currentUser) return;
    
    // Set user info
    document.getElementById('dashboardUserName').textContent = currentUser.name;
    document.getElementById('sidebarName').textContent = currentUser.name;
    document.getElementById('sidebarEmail').textContent = currentUser.email;
    document.getElementById('sidebarAvatar').textContent = getInitials(currentUser.name);
    
    // Set stats
    const stats = currentUser.stats;
    document.getElementById('userPoints').textContent = stats.points;
    document.getElementById('userLevel').textContent = stats.level;
    document.getElementById('completedModules').textContent = stats.completedModules;
    document.getElementById('learningTime').textContent = stats.learningTime;
    document.getElementById('completionRate').textContent = `${Math.min(100, Math.floor((stats.completedModules / 4) * 100))}%`;
    document.getElementById('streakCount').textContent = stats.streak;
    
    // Set module progress
    const modules = stats.modules;
    document.getElementById('fireSafetyProgress').style.width = `${modules['fire-safety'].progress}%`;
    document.getElementById('gdprProgress').style.width = `${modules.gdpr.progress}%`;
    
    // Update button text based on progress
    document.getElementById('fireSafetyBtn').textContent = modules['fire-safety'].progress > 0 ? 'Continue' : 'Start';
    document.getElementById('gdprBtn').textContent = modules.gdpr.progress > 0 ? 'Continue' : 'Start';
    
    // Load achievements
    loadAchievements();
}

// Start a module
function startModule(moduleId) {
    if (!currentUser) {
        showNotification('Please log in first', 'error');
        openLoginModal();
        return;
    }
    
    const moduleNames = {
        'fire-safety': 'Fire Safety Training',
        'gdpr': 'GDPR Compliance',
        'health-safety': 'Health & Safety',
        'manual-handling': 'Manual Handling'
    };
    
    showNotification(`Starting ${moduleNames[moduleId]}...`, 'info');
    
    // Simulate module completion
    setTimeout(() => {
        // Update user progress
        const users = JSON.parse(localStorage.getItem('zazim_users'));
        const user = users[currentUser.email];
        
        if (user && user.stats.modules[moduleId]) {
            user.stats.modules[moduleId].progress = 100;
            user.stats.modules[moduleId].completed = true;
            user.stats.completedModules++;
            user.stats.points += 100;
            user.stats.learningTime += moduleId === 'fire-safety' ? 10 : 8;
            
            // Check for achievements
            checkAchievements(user);
            
            localStorage.setItem('zazim_users', JSON.stringify(users));
            
            // Reload dashboard
            currentUser = user;
            loadDashboardData();
            
            showNotification(`Module completed! +100 points`, 'success');
        }
    }, 2000);
}

// Check and award achievements
function checkAchievements(user) {
    const achievements = [];
    
    // First module
    if (user.stats.completedModules === 1 && !user.stats.achievements.includes('first-step')) {
        achievements.push('first-step');
    }
    
    // Three modules
    if (user.stats.completedModules === 3 && !user.stats.achievements.includes('compliance-expert')) {
        achievements.push('compliance-expert');
    }
    
    // All modules
    if (user.stats.completedModules === 4 && !user.stats.achievements.includes('master-learner')) {
        achievements.push('master-learner');
    }
    
    // Add achievements
    if (achievements.length > 0) {
        user.stats.achievements = [...user.stats.achievements, ...achievements];
        achievements.forEach(achievement => {
            showNotification(`Achievement unlocked: ${getAchievementName(achievement)}!`, 'success');
        });
    }
}

// Load achievements
function loadAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    const userAchievements = currentUser.stats.achievements;
    
    if (userAchievements.length === 0) {
        return;
    }
    
    achievementsGrid.innerHTML = '';
    
    const achievementData = {
        'first-step': {
            icon: 'fas fa-star',
            name: 'First Steps',
            description: 'Completed your first training module'
        },
        'safety-first': {
            icon: 'fas fa-shield-alt',
            name: 'Safety First',
            description: 'Completed Fire Safety training'
        },
        'quick-learner': {
            icon: 'fas fa-bolt',
            name: 'Quick Learner',
            description: 'Completed a module in under 5 minutes'
        },
        'compliance-expert': {
            icon: 'fas fa-graduation-cap',
            name: 'Compliance Expert',
            description: 'Completed 3 training modules'
        },
        'master-learner': {
            icon: 'fas fa-crown',
            name: 'Master Learner',
            description: 'Completed all available modules'
        }
    };
    
    userAchievements.forEach(achievementId => {
        if (achievementData[achievementId]) {
            const achievement = achievementData[achievementId];
            const achievementCard = document.createElement('div');
            achievementCard.className = 'achievement-card';
            achievementCard.innerHTML = `
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
            `;
            achievementsGrid.appendChild(achievementCard);
        }
    });
}

// Get achievement name
function getAchievementName(id) {
    const names = {
        'first-step': 'First Steps',
        'safety-first': 'Safety First',
        'quick-learner': 'Quick Learner',
        'compliance-expert': 'Compliance Expert',
        'master-learner': 'Master Learner'
    };
    return names[id] || 'Achievement';
}

// Logout
function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    
    // Show main content
    document.getElementById('dashboardPage').style.display = 'none';
    document.querySelectorAll('section, footer').forEach(el => {
        el.style.display = 'block';
    });
    document.querySelector('header').style.display = 'block';
    
    showNotification('Logged out successfully', 'info');
}

// Check existing session
function checkExistingSession() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const sessionUser = sessionStorage.getItem('currentUser');
    
    if (rememberedUser || sessionUser) {
        const email = rememberedUser || sessionUser;
        const users = JSON.parse(localStorage.getItem('zazim_users'));
        const user = users[email];
        
        if (user && user.verified) {
            currentUser = user;
            openDashboard();
        }
    }
}

// Update stats
function updateStats() {
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    const stats = JSON.parse(localStorage.getItem('zazim_stats'));
    
    stats.totalUsers = Object.keys(users).length;
    stats.verifiedUsers = Object.values(users).filter(u => u.verified).length;
    stats.pendingVerifications = Object.values(users).filter(u => !u.verified).length;
    
    localStorage.setItem('zazim_stats', JSON.stringify(stats));
    loadUserStats();
}

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function moveToNext(input, nextIndex) {
    input.value = input.value.replace(/[^0-9]/g, '');
    
    if (input.value.length === 1 && nextIndex <= 6) {
        const nextInput = document.querySelector(`.code-input:nth-child(${nextIndex})`);
        if (nextInput) {
            nextInput.focus();
        }
    }
    
    // Update hidden input with full code
    const codeInputs = document.querySelectorAll('.code-input');
    let fullCode = '';
    codeInputs.forEach(inp => {
        fullCode += inp.value;
        if (inp.value) {
            inp.classList.add('filled');
        } else {
            inp.classList.remove('filled');
        }
    });
    document.getElementById('fullVerificationCode').value = fullCode;
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

// Modal functions
function openVerificationModal(email) {
    document.getElementById('verificationModal').style.display = 'flex';
    document.getElementById('verificationEmailDisplay').textContent = email;
    document.body.style.overflow = 'hidden';
    
    // Clear code inputs
    document.querySelectorAll('.code-input').forEach(input => {
        input.value = '';
        input.classList.remove('filled');
        input.disabled = false;
    });
    
    // Start timer
    startVerificationTimer();
}

function closeVerificationModal() {
    document.getElementById('verificationModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    if (verificationTimer) {
        clearInterval(verificationTimer);
    }
}

function showSuccessModal(user) {
    document.getElementById('successModal').style.display = 'flex';
    document.getElementById('welcomeName').textContent = user.name;
    document.getElementById('welcomeEmail').textContent = user.email;
    document.getElementById('welcomeAvatar').textContent = getInitials(user.name);
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}




// =============================================
// QUIZ INTEGRATION FUNCTIONS
// =============================================

let currentQuiz = null;
let quizModal = null;

// Start a quiz for a specific module
async function startQuiz(moduleId) {
    try {
        // Create quiz modal if it doesn't exist
        if (!quizModal) {
            createQuizModal();
        }
        
        // Show modal
        quizModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Initialize quiz
        const quizData = await quizEngine.startQuiz(moduleId);
        
        if (!quizData.success) {
            throw new Error('Failed to start quiz');
        }
        
        currentQuiz = {
            moduleId: moduleId,
            ...quizData
        };
        
        // Render first question
        renderQuestion(quizData.firstQuestion);
        
    } catch (error) {
        console.error('Quiz error:', error);
        showNotification('Failed to start quiz. Please try again.', 'error');
        closeQuiz();
    }
}

// Render a question
function renderQuestion(questionData) {
    if (!quizModal || !questionData) return;
    
    const moduleName = questionData.category.replace('-', ' ').toUpperCase();
    const progress = ((questionData.questionNumber - 1) / questionData.totalQuestions) * 100;
    
    // Build quiz UI
    quizModal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h3>${moduleName} Training Quiz</h3>
                <button class="close-modal" onclick="closeQuiz()">&times;</button>
            </div>
            <div class="modal-body" id="quizBody">
                ${quizUI.renderQuizHeader(
                    moduleName,
                    questionData.score || 0,
                    questionData.streak || 0,
                    questionData.questionNumber,
                    questionData.totalQuestions
                )}
                ${quizUI.renderProgressBar(progress)}
                ${quizUI.renderQuestion(questionData)}
                ${quizUI.renderNextButton(questionData.questionNumber === questionData.totalQuestions)}
            </div>
        </div>
    `;
    
    // IMPORTANT: Set the quizContainer for QuizUI
    quizUI.quizContainer = quizModal.querySelector('.modal-content');
    
    // Add event listeners AFTER the HTML is in the DOM
    setTimeout(() => {
        // Add event listeners for options
        const options = document.querySelectorAll('.option-button');
        options.forEach(option => {
            option.addEventListener('click', handleAnswerSelection);
        });
        
        // Add event listener for next button
        const nextButton = document.getElementById('nextQuestionBtn');
        if (nextButton) {
            nextButton.addEventListener('click', handleNextQuestion);
            // Make sure it's initially disabled
            nextButton.disabled = true;
            nextButton.style.opacity = '0.5';
            nextButton.style.cursor = 'not-allowed';
        }
    }, 100);
}

// Handle answer selection
// script.js - Update handleAnswerSelection function
async function handleAnswerSelection(event) {
    const selectedIndex = parseInt(event.currentTarget.dataset.index);
    const options = document.querySelectorAll('.option-button');
    
    // Disable all options
    options.forEach(opt => {
        opt.disabled = true;
        opt.classList.remove('selected');
    });
    
    // Mark selected option
    event.currentTarget.classList.add('selected');
    
    // Show loading
    const loadingOverlay = quizUI.showLoading();
    
    try {
        // Submit answer
        const result = await quizEngine.submitAnswer(selectedIndex);
        
        // Update UI
        quizUI.updateScore(result.updatedScore);
        quizUI.updateStreak(result.updatedStreak);
        quizUI.showAnswerFeedback(selectedIndex, result.correctAnswer);
        
        // Show explanation
        const explanationHtml = quizUI.renderExplanation(result.explanation);
        quizUI.showExplanation(explanationHtml);
        
        // ENABLE NEXT BUTTON - This is the key fix
        quizUI.enableNextButton();
        
        // Update progress bar
        const nextQuestion = result.nextQuestion;
        if (nextQuestion) {
            const progress = (nextQuestion.questionNumber / nextQuestion.totalQuestions) * 100;
            quizUI.updateProgressBar(progress);
        }
        
        // If quiz is complete, show results
        if (result.isComplete) {
            showQuizResults();
        }
        
    } catch (error) {
        console.error('Answer submission error:', error);
        showNotification('Error processing answer', 'error');
    } finally {
        quizUI.hideLoading(loadingOverlay);
    }
}

// Handle next question
function handleNextQuestion() {
    const nextQuestion = quizEngine.getCurrentQuestion();
    
    if (nextQuestion) {
        renderQuestion(nextQuestion);
    } else {
        showQuizResults();
    }
}

// Show quiz results
async function showQuizResults() {
    if (!quizEngine.quizResults) {
        await quizEngine.calculateFinalResults();
    }
    
    // Save results
    quizEngine.saveResults();
    
    // Update user stats in dashboard
    if (window.currentUser) {
        updateUserAfterQuiz(quizEngine.quizResults);
    }
    
    // Render results
    quizModal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h3>Quiz Results</h3>
                <button class="close-modal" onclick="closeQuiz()">&times;</button>
            </div>
            <div class="modal-body">
                ${quizUI.renderResults(quizEngine.quizResults)}
            </div>
        </div>
    `;
}

// Update user after quiz
function updateUserAfterQuiz(results) {
    if (!window.currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    const user = users[currentUser.email];
    
    if (user) {
        // Update user stats
        user.stats.points += results.finalScore;
        user.stats.completedModules++;
        user.stats.learningTime += Math.round(results.totalTime / 60000); // Convert to minutes
        
        // Update module progress
        const moduleId = currentQuiz?.moduleId;
        if (moduleId && user.stats.modules[moduleId]) {
            user.stats.modules[moduleId].progress = 100;
            user.stats.modules[moduleId].completed = true;
        }
        
        // Check for level up
        const oldLevel = user.stats.level;
        const newLevel = Math.floor(user.stats.points / 1000) + 1;
        if (newLevel > oldLevel) {
            user.stats.level = newLevel;
            showNotification(`🎉 Level Up! You're now Level ${newLevel}!`, 'success');
        }
        
        // Save updated user
        localStorage.setItem('zazim_users', JSON.stringify(users));
        currentUser = user;
        
        // Refresh dashboard if open
        if (document.getElementById('dashboardPage').style.display !== 'none') {
            loadDashboardData();
        }
    }
}

// Create quiz modal
function createQuizModal() {
    quizModal = document.createElement('div');
    quizModal.className = 'modal';
    quizModal.id = 'quizModal';
    document.body.appendChild(quizModal);
}

// Close quiz
function closeQuiz() {
    if (quizModal) {
        quizModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        quizEngine.resetQuiz();
        currentQuiz = null;
    }
}

// Restart quiz
function restartQuiz() {
    if (currentQuiz?.moduleId) {
        closeQuiz();
        setTimeout(() => startQuiz(currentQuiz.moduleId), 300);
    }
}

// Download certificate
function downloadCertificate() {
    if (!quizEngine.quizResults?.certificate) return;
    
    const cert = quizEngine.quizResults.certificate;
    const content = `
        ZAZIM SKILLQUEST - CERTIFICATE OF COMPLETION
        ============================================
        
        This certifies that
        ${cert.userName}
        has successfully completed
        ${cert.moduleName} Training
        
        Score: ${cert.score}%
        Date: ${cert.date}
        Certificate ID: ${cert.certificateId}
        
        ${cert.certificateText}
        
        Issued by: ${cert.issuedBy}
        Valid until: ${cert.validUntil}
        
        Verify at: ${cert.qrCode}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zazim_Certificate_${cert.certificateId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('Certificate downloaded!', 'success');
}

// Update the existing startModule function to use quiz
function startModule(moduleId) {
    startQuiz(moduleId);
}

// Add quiz button to dashboard modules
function addQuizButtons() {
    // This function would add quiz buttons to your dashboard modules
    // Example usage in your dashboard modules:
    /*
    <button class="btn btn-accent" onclick="startModule('fire-safety')">
        <i class="fas fa-play"></i> Start Quiz
    </button>
    */
}




// Other existing functions (keep from previous script)
// ... (all the other functions from the previous script.js remain unchanged)
// Make sure to keep: showNotification, switchTab, switchDashboardTab, etc.

// Demo management functions
function resetAllData() {
    if (confirm('Are you sure you want to reset all demo data? This cannot be undone.')) {
        localStorage.clear();
        sessionStorage.clear();
        initializeApp();
        loadUserStats();
        showNotification('All demo data has been reset', 'success');
        location.reload();
    }
}

function exportUserData() {
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    const stats = JSON.parse(localStorage.getItem('zazim_stats'));
    
    const data = {
        users: users,
        stats: stats,
        exportDate: new Date().toISOString(),
        totalAccounts: Object.keys(users).length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `zazim-demo-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully', 'success');
}

function showDemoInstructions() {
    showNotification(`
        Demo Instructions:
        1. Create an account with email verification
        2. Check console for verification code (F12)
        3. Login with verified account
        4. Try completing modules to earn achievements
        5. All data is stored locally in your browser
    `, 'info');
}
