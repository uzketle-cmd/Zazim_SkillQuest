// Global variables
let selectedAnswers = {
    1: null,
    2: null
};

let userPoints = 1250;
let streakDays = 42;
let currentUser = null;
let verificationCode = null;
let verificationTimer = null;
let pendingVerificationEmail = null;

// Add these to your global scope
window.openQuiz = openQuiz;
window.closeQuiz = closeQuiz;
window.restartQuiz = restartQuiz;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    initializeApp();
    
    // Setup form submissions
    setupForms();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    // Initialize dashboard if user is logged in
    checkUserSession();
    
    // Initialize animations
    animateProgressBars();

     // Initialize quiz engine and UI
    if (!window.quizEngine) {
        window.quizEngine = new QuizEngine();
    }
    if (!window.quizUI) {
        window.quizUI = new QuizUI();
    }
    
    // Update dashboard on load
    if (window.currentUser) {
        updateModuleButtons();
        updateProgressBars();
    }
});

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
    
    // Initialize quiz system
    initializeQuizSystem();
    
    // Create test account if it doesn't exist
    createTestAccount();
    updateUserStatsDisplay();
}

// Initialize quiz system
function initializeQuizSystem() {
    // Ensure quiz services are available
    if (!window.llmService) {
        console.log('Initializing LLM Service...');
        window.llmService = new LLMService();
    }
    
    if (!window.quizEngine) {
        console.log('Initializing Quiz Engine...');
        window.quizEngine = new QuizEngine();
    }
    
    if (!window.quizUI) {
        console.log('Initializing Quiz UI...');
        window.quizUI = new QuizUI();
    }
    
    // Set up quiz-related event listeners
    setupQuizEventListeners();
}

// Set up quiz event listeners
function setupQuizEventListeners() {
    // Close quiz when clicking outside modal
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('quizModal');
        if (modal && e.target === modal) {
            closeQuiz();
        }
    });
    
    // Close quiz with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuiz();
        }
    });
}

// Create test account
function createTestAccount() {
    const users = JSON.parse(localStorage.getItem('zazim_users') || '{}');
    
    if (!users['test@example.com']) {
        users['test@example.com'] = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            verified: true,
            points: 1250,
            streakDays: 42,
            stats: {
                modules: {
                    'fire-safety': {
                        progress: 75,
                        lastAttempt: new Date().toISOString(),
                        score: 85
                    },
                    'health-safety': {
                        progress: 100,
                        lastAttempt: new Date().toISOString(),
                        score: 92
                    },
                    'gdpr': {
                        progress: 0,
                        lastAttempt: null,
                        score: 0
                    }
                },
                totalQuizzes: 15,
                averageScore: 78,
                badges: ['Safety First', 'Quiz Master', 'Consistent Learner']
            },
            preferences: {
                notifications: true,
                darkMode: false,
                soundEffects: true
            }
        };
        
        localStorage.setItem('zazim_users', JSON.stringify(users));
        
        // Update global stats
        const stats = JSON.parse(localStorage.getItem('zazim_stats') || '{}');
        stats.totalUsers = Object.keys(users).length;
        stats.verifiedUsers++;
        localStorage.setItem('zazim_stats', JSON.stringify(stats));
    }
}

// Update user stats display in hero
function updateUserStatsDisplay() {
    const stats = JSON.parse(localStorage.getItem('zazim_stats')) || {
        totalUsers: 0,
        verifiedUsers: 0,
        pendingVerifications: 0
    };
    
    // Update the hero stats with animation
    const totalUsersElement = document.getElementById('totalUsers');
    if (totalUsersElement) {
        let count = 0;
        const target = stats.totalUsers || 0;
        const increment = Math.max(1, Math.ceil(target / 50));
        
        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                count = target;
                clearInterval(timer);
            }
            totalUsersElement.textContent = count;
        }, 30);
    }
}

// Update stats
function updateStats() {
    const users = JSON.parse(localStorage.getItem('zazim_users')) || {};
    const stats = JSON.parse(localStorage.getItem('zazim_stats')) || {};
    
    stats.totalUsers = Object.keys(users).length;
    stats.verifiedUsers = Object.values(users).filter(u => u.verified).length;
    stats.pendingVerifications = Object.values(users).filter(u => !u.verified).length;
    
    localStorage.setItem('zazim_stats', JSON.stringify(stats));
    updateUserStatsDisplay();
}

// Setup event listeners for forms
function setupForms() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Use the new login system
            loginUser(email, password);
        });
        
        // Add demo credentials note
        addDemoCredentialsToLoginForm();
    }
    
    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }
    
    // Password strength checker
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Reset password form
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePasswordReset();
        });
    }
    
    // Verification form
    const verificationForm = document.getElementById('verificationForm');
    if (verificationForm) {
        verificationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            verifyEmailCode();
        });
    }
    
    // Check for password match
    const confirmPassword = document.getElementById('signupConfirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            const password = document.getElementById('signupPassword')?.value;
            const confirmPassword = this.value;
            const submitBtn = document.querySelector('#signupForm button[type="submit"]');
            
            if (password !== confirmPassword && confirmPassword.length > 0) {
                this.style.borderColor = 'var(--danger)';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.5';
                }
            } else {
                this.style.borderColor = '';
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }
            }
        });
    }
    
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Demo request submitted! We\'ll contact you shortly.', 'success');
            this.reset();
        });
    }
}

// Add demo credentials to login form
function addDemoCredentialsToLoginForm() {
    const loginTab = document.getElementById('loginTab');
    if (!loginTab) return;
    
    // Remove existing demo note if it exists
    const existingNote = loginTab.querySelector('.demo-credentials-note');
    if (existingNote) existingNote.remove();
    
    const demoNote = document.createElement('div');
    demoNote.className = 'demo-credentials-note';
    demoNote.style.marginTop = '20px';
    demoNote.style.padding = '15px';
    demoNote.style.backgroundColor = 'var(--light)';
    demoNote.style.borderRadius = 'var(--radius)';
    demoNote.style.textAlign = 'center';
    demoNote.innerHTML = `
        <p style="margin: 0 0 10px 0; font-weight: 500;">Demo Account:</p>
        <p style="margin: 0 0 10px 0; font-size: 0.9rem;">
            <strong>Email:</strong> test@zazim.com<br>
            <strong>Password:</strong> Password123
        </p>
        <button onclick="useDemoAccount()" 
                style="width: 100%; padding: 10px; background: var(--primary); color: white; border: none; border-radius: var(--radius); cursor: pointer;">
            <i class="fas fa-user"></i> Use Demo Account
        </button>
    `;
    
    // Insert before the submit button
    const submitButton = loginTab.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.parentNode.insertBefore(demoNote, submitButton);
    }
}

// Use demo account
function useDemoAccount() {
    document.getElementById('loginEmail').value = 'test@zazim.com';
    document.getElementById('loginPassword').value = 'Password123';
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

// Modal Functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    switchTab('login');
    
    // Add demo credentials
    setTimeout(addDemoCredentialsToLoginForm, 100);
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
        'reset': 2
    };
    
    const tabElements = document.querySelectorAll('.tab');
    if (tabElements[tabs[tabName]]) {
        tabElements[tabs[tabName]].classList.add('active');
    }
    
    const contentElement = document.getElementById(tabName + 'Tab');
    if (contentElement) {
        contentElement.classList.add('active');
    }
}

// Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
}

// Quiz Functions (keep these as they are)
function selectAnswer(element, answerId, quizId) {
    const parent = element.parentElement;
    parent.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    element.classList.add('selected');
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
        quizContainer.style.display = 'none';
        resultDiv.style.display = 'block';
        
        const pointsElement = document.querySelector(`#quiz${quizId}`).closest('.game-demo').querySelector('.points');
        pointsElement.innerHTML = '<i class="fas fa-star"></i> Completed!';
        pointsElement.style.color = '#4CAF50';
        pointsElement.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
        
        showNotification(`Correct! +${quizId === 1 ? 50 : 75} points earned!`, 'success');
        
        // Update user points if logged in
        if (currentUser) {
            currentUser.stats.points += quizId === 1 ? 50 : 75;
            updateUserInDatabase();
            updateUserPoints();
        }
    } else {
        showNotification('Not quite right. Try again!', 'error');
    }
}

function resetQuiz(quizId) {
    const quizContainer = document.getElementById(`quiz${quizId}`);
    const resultDiv = document.getElementById(`result${quizId}`);
    
    quizContainer.style.display = 'block';
    resultDiv.style.display = 'none';
    
    quizContainer.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    selectedAnswers[quizId] = null;
    
    // Update points display
    const pointsElement = document.querySelector(`#quiz${quizId}`).closest('.game-demo').querySelector('.points');
    pointsElement.innerHTML = quizId === 1 ? '+50 points' : '+75 points';
    pointsElement.style.color = '';
    pointsElement.style.backgroundColor = '';
}

// Progress Simulation
function simulateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        progressFill.style.width = progress + '%';
        progressPercent.textContent = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            showNotification('Daily module completed! +25 points', 'success');
        }
    }, 50);
}

// Authentication Functions
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('zazim_users')) || {};
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
    users[email] = user;
    localStorage.setItem('zazim_users', JSON.stringify(users));
    
    // Store session
    sessionStorage.setItem('currentUser', email);
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe && rememberMe.checked) {
        localStorage.setItem('rememberedUser', email);
    }
    
    // Close modal and open dashboard
    closeModal();
    openDashboard();
    
    showNotification(`Welcome back, ${user.name}!`, 'success');
}

// Check user session
function checkUserSession() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    const sessionUser = sessionStorage.getItem('currentUser');
    
    if (rememberedUser || sessionUser) {
        const email = rememberedUser || sessionUser;
        const users = JSON.parse(localStorage.getItem('zazim_users')) || {};
        const user = users[email];
        
        if (user && user.verified) {
            currentUser = user;
            setTimeout(() => openDashboard(), 100);
        }
    }
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
    document.getElementById('userPoints').textContent = stats.points || 0;
    document.getElementById('userLevel').textContent = stats.level || 1;
    document.getElementById('completedModules').textContent = stats.completedModules || 0;
    document.getElementById('learningTime').textContent = stats.learningTime || 0;
    document.getElementById('completionRate').textContent = `${Math.min(100, Math.floor(((stats.completedModules || 0) / 3) * 100))}%`;
    document.getElementById('streakCount').textContent = stats.streak || 1;
    
    // Set module progress
    const modules = stats.modules || {};
    if (modules['fire-safety']) {
        document.getElementById('fireSafetyProgress').style.width = `${modules['fire-safety'].progress}%`;
    }
    if (modules.gdpr) {
        document.getElementById('gdprProgress').style.width = `${modules.gdpr.progress}%`;
    }
    if (modules['health-safety']) {
        document.getElementById('healthSafetyProgress').style.width = `${modules['health-safety'].progress}%`;
    }
    
    // Update button states based on progress
    updateModuleButtons();
    
    // Load achievements
    loadAchievements();
}

// Update module buttons
// Update module buttons
function updateModuleButtons() {
    const modules = currentUser.stats.modules || {};
    
    // Define all modules for easier management
    const moduleConfigs = [
        { 
            id: 'fire-safety', 
            startBtn: 'fireSafetyStartBtn', 
            continueBtn: 'fireSafetyContinueBtn',
            name: 'Fire Safety Training'
        },
        { 
            id: 'health-safety', 
            startBtn: 'healthSafetyStartBtn', 
            continueBtn: 'healthSafetyContinueBtn',
            name: 'Health and Safety'
        },
        { 
            id: 'gdpr', 
            startBtn: 'gdprStartBtn', 
            continueBtn: 'gdprContinueBtn',
            name: 'GDPR Compliance'
        }
    ];
    
    moduleConfigs.forEach(config => {
        const startBtn = document.getElementById(config.startBtn);
        const continueBtn = document.getElementById(config.continueBtn);
        const progress = modules[config.id]?.progress || 0;
        
        if (startBtn && continueBtn) {
            if (progress === 0) {
                // Not started - show Start, hide Continue
                startBtn.style.display = 'flex';
                continueBtn.style.display = 'none';
                
                // Update Start button to open quiz
                startBtn.onclick = () => openQuiz(config.id, config.name);
                continueBtn.onclick = null;
            } else if (progress === 100) {
                // Completed - hide Start, show Review
                startBtn.style.display = 'none';
                continueBtn.style.display = 'flex';
                continueBtn.innerHTML = '<i class="fas fa-redo"></i> Review';
                continueBtn.className = 'btn btn-review';
                
                // Update Review button to open quiz
                continueBtn.onclick = () => openQuiz(config.id, config.name, true);
            } else {
                // In progress - hide Start, show Continue
                startBtn.style.display = 'none';
                continueBtn.style.display = 'flex';
                continueBtn.innerHTML = '<i class="fas fa-redo"></i> Continue';
                continueBtn.className = 'btn btn-secondary';
                
                // Update Continue button to open quiz
                continueBtn.onclick = () => openQuiz(config.id, config.name);
            }
        }
    });
}

// Add CSS for Review button
const style = document.createElement('style');
style.textContent = `
    .btn-review {
        background: linear-gradient(135deg, #FF9800, #FF5722);
        color: white;
        border: none;
    }
    .btn-review:hover {
        background: linear-gradient(135deg, #FF5722, #FF9800);
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 87, 34, 0.3);
    }
`;
document.head.appendChild(style);



// Function to open quiz for a module
async function openQuiz(moduleId, moduleName, isReview = false) {
    try {
        // Show loading state
        showQuizLoading(moduleName);
        
        // Start the quiz
        const result = await quizEngine.startQuiz(moduleId);
        
        if (result.success) {
            // Render the quiz modal
            renderQuizModal(moduleName, result.firstQuestion);
            
            // Set up event handlers
            setupQuizHandlers(moduleId, isReview);
        } else {
            alert('Failed to start quiz. Please try again.');
        }
    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('Error starting quiz. Please try again.');
    }
}

// Show loading animation for quiz
function showQuizLoading(moduleName) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'quiz-loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">Preparing ${moduleName} Quiz...</div>
            <div class="loading-subtext">AI is generating personalized questions</div>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
    
    // Remove after 1.5 seconds (simulated loading)
    setTimeout(() => {
        if (loadingOverlay.parentElement) {
            loadingOverlay.remove();
        }
    }, 1500);
}

// Render quiz modal
function renderQuizModal(moduleName, questionData) {
    // Remove any existing quiz modal
    const existingModal = document.getElementById('quizModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'quizModal';
    modal.className = 'modal';
    
    const progress = (questionData.questionNumber / questionData.totalQuestions) * 100;
    
    modal.innerHTML = `
        <div class="modal-content">
            ${quizUI.renderQuizHeader(moduleName, 0, 0, questionData.questionNumber, questionData.totalQuestions)}
            ${quizUI.renderProgressBar(progress)}
            <div class="quiz-body-scrollable">
                ${quizUI.renderQuestion(questionData)}
                ${quizUI.renderNextButton(questionData.questionNumber === questionData.totalQuestions)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add close button functionality
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    `;
    closeBtn.onclick = closeQuiz;
    modal.querySelector('.quiz-header').appendChild(closeBtn);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
}

// Set up quiz event handlers
function setupQuizHandlers(moduleId, isReview) {
    // Handle option selection
    const optionButtons = document.querySelectorAll('.option-button');
    optionButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const selectedIndex = parseInt(e.currentTarget.dataset.index);
            
            // Disable all buttons during processing
            optionButtons.forEach(btn => btn.disabled = true);
            
            // Show loading
            const loadingOverlay = quizUI.showLoading();
            
            try {
                // Submit answer
                const result = await quizEngine.submitAnswer(selectedIndex);
                
                // Hide loading
                quizUI.hideLoading(loadingOverlay);
                
                // Show feedback
                quizUI.showAnswerFeedback(selectedIndex, result.correctAnswer);
                quizUI.updateScore(result.updatedScore);
                quizUI.updateStreak(result.updatedStreak);
                
                // Show explanation
                if (result.explanation) {
                    const explanationHtml = quizUI.renderExplanation(result.explanation);
                    quizUI.showExplanation(explanationHtml);
                }
                
                // Enable next button
                const nextButton = document.getElementById('nextQuestionBtn');
                if (nextButton) {
                    nextButton.disabled = false;
                    nextButton.style.opacity = '1';
                    nextButton.style.cursor = 'pointer';
                    
                    // Store result for next question
                    window.currentQuizResult = result;
                }
                
            } catch (error) {
                console.error('Error submitting answer:', error);
                quizUI.hideLoading(loadingOverlay);
                optionButtons.forEach(btn => btn.disabled = false);
            }
        });
    });
    
    // Handle next button
    const nextButton = document.getElementById('nextQuestionBtn');
    if (nextButton) {
        nextButton.addEventListener('click', async () => {
            const result = window.currentQuizResult;
            
            if (result.isComplete) {
                // Show results
                const results = await quizEngine.calculateFinalResults();
                
                // Update user progress
                updateUserProgress(moduleId, results.accuracy);
                
                // Save results
                quizEngine.saveResults();
                
                // Display results
                const modalContent = document.querySelector('#quizModal .modal-content');
                modalContent.innerHTML = quizUI.renderResults(results);
                
                // Add close and restart buttons
                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = `
                    padding: 20px;
                    text-align: center;
                    background: white;
                `;
                buttonContainer.innerHTML = `
                    <button class="btn btn-primary" onclick="restartQuiz('${moduleId}')" style="margin-right: 10px;">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                    <button class="btn btn-outline" onclick="closeQuiz()">
                        <i class="fas fa-times"></i> Close Quiz
                    </button>
                `;
                modalContent.appendChild(buttonContainer);
            } else {
                // Move to next question
                const nextQuestion = result.nextQuestion;
                const progress = (nextQuestion.questionNumber / nextQuestion.totalQuestions) * 100;
                
                // Update UI
                quizUI.updateProgressBar(progress);
                
                // Update header
                const header = document.querySelector('.quiz-header');
                header.innerHTML = quizUI.renderQuizHeader(
                    moduleName || 'Quiz',
                    result.updatedScore,
                    result.updatedStreak,
                    nextQuestion.questionNumber,
                    nextQuestion.totalQuestions
                );
                
                // Update question
                const questionContainer = document.querySelector('.question-container');
                questionContainer.innerHTML = quizUI.renderQuestion(nextQuestion);
                
                // Update next button
                const nextButtonContainer = document.querySelector('.next-button-container');
                nextButtonContainer.innerHTML = quizUI.renderNextButton(
                    nextQuestion.questionNumber === nextQuestion.totalQuestions
                );
                
                // Re-attach event handlers
                setupQuizHandlers(moduleId, isReview);
            }
        });
    }
}

// Update user progress after quiz
function updateUserProgress(moduleId, accuracy) {
    if (!currentUser.stats.modules) {
        currentUser.stats.modules = {};
    }
    
    // Convert accuracy to progress (0-100)
    const newProgress = Math.min(100, Math.max(0, accuracy));
    
    // Only update if new score is higher (for progress tracking)
    const currentProgress = currentUser.stats.modules[moduleId]?.progress || 0;
    if (newProgress > currentProgress) {
        currentUser.stats.modules[moduleId] = {
            progress: newProgress,
            lastAttempt: new Date().toISOString(),
            score: newProgress
        };
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update dashboard UI
        updateModuleButtons();
        updateProgressBars();
    }
}

// Close quiz modal
function closeQuiz() {
    const modal = document.getElementById('quizModal');
    if (modal) {
        modal.remove();
    }
    document.body.style.overflow = 'auto';
    
    // Reset quiz engine if quiz was incomplete
    if (quizEngine.currentQuiz && !quizEngine.quizResults) {
        quizEngine.resetQuiz();
    }
}

// Restart quiz
function restartQuiz(moduleId) {
    closeQuiz();
    const moduleName = getModuleName(moduleId);
    openQuiz(moduleId, moduleName);
}

// Helper function to get module name
function getModuleName(moduleId) {
    const modules = {
        'fire-safety': 'Fire Safety Training',
        'health-safety': 'Health and Safety',
        'gdpr': 'GDPR Compliance'
    };
    return modules[moduleId] || moduleId.replace('-', ' ');
}

// Update progress bars on dashboard
function updateProgressBars() {
    const modules = currentUser.stats.modules || {};
    
    // Health Safety
    const healthSafetyProgress = document.getElementById('healthSafetyProgress');
    if (healthSafetyProgress) {
        const progress = modules['health-safety']?.progress || 0;
        healthSafetyProgress.style.width = `${progress}%`;
    }
    
    // Fire Safety
    const fireSafetyProgress = document.getElementById('fireSafetyProgress');
    if (fireSafetyProgress) {
        const progress = modules['fire-safety']?.progress || 0;
        fireSafetyProgress.style.width = `${progress}%`;
    }
    
    // GDPR
    const gdprProgress = document.getElementById('gdprProgress');
    if (gdprProgress) {
        const progress = modules.gdpr?.progress || 0;
        gdprProgress.style.width = `${progress}%`;
    }
}





    

// Update user points display
function updateUserPoints() {
    if (currentUser && currentUser.stats) {
        document.getElementById('userPoints').textContent = currentUser.stats.points;
    }
}

// Update user in database
function updateUserInDatabase() {
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem('zazim_users')) || {};
    users[currentUser.email] = currentUser;
    localStorage.setItem('zazim_users', JSON.stringify(users));
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
        'health-safety': 'Health & Safety'
    };
    
    showNotification(`Starting ${moduleNames[moduleId]}...`, 'info');
    
    // Update user progress
    setTimeout(() => {
        if (!currentUser.stats.modules) {
            currentUser.stats.modules = {};
        }
        
        if (!currentUser.stats.modules[moduleId]) {
            currentUser.stats.modules[moduleId] = { progress: 25, completed: false };
        } else {
            currentUser.stats.modules[moduleId].progress = Math.min(100, currentUser.stats.modules[moduleId].progress + 25);
        }
        
        // Add points
        currentUser.stats.points = (currentUser.stats.points || 0) + 50;
        currentUser.stats.learningTime = (currentUser.stats.learningTime || 0) + 10;
        
        // Check if module completed
        if (currentUser.stats.modules[moduleId].progress === 100) {
            currentUser.stats.modules[moduleId].completed = true;
            currentUser.stats.completedModules = (currentUser.stats.completedModules || 0) + 1;
            
            // Add achievement
            if (!currentUser.stats.achievements) currentUser.stats.achievements = [];
            if (!currentUser.stats.achievements.includes(moduleId + '-complete')) {
                currentUser.stats.achievements.push(moduleId + '-complete');
            }
            
            // Check for compliance expert
            if (currentUser.stats.completedModules >= 3 && !currentUser.stats.achievements.includes('compliance-expert')) {
                currentUser.stats.achievements.push('compliance-expert');
            }
        }
        
        // Update storage
        updateUserInDatabase();
        
        // Update UI
        loadDashboardData();
        
        showNotification(`Module progress updated! +50 points`, 'success');
    }, 1000);
}

// Continue module (same as start for demo)
function continueModule(moduleId) {
    startModule(moduleId);
}

// Load achievements
function loadAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    achievementsGrid.innerHTML = '';
    
    const userAchievements = currentUser.stats.achievements || [];
    
    if (userAchievements.length === 0) {
        achievementsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <p>Complete modules to earn achievements!</p>
            </div>
        `;
        return;
    }
    
    const achievementData = {
        'fire-safety-complete': {
            icon: 'fas fa-fire-extinguisher',
            name: 'Fire Safety Expert',
            description: 'Completed Fire Safety training'
        },
        'health-safety-complete': {
            icon: 'fas fa-heartbeat',
            name: 'Health & Safety Pro',
            description: 'Completed Health & Safety training'
        },
        'gdpr-complete': {
            icon: 'fas fa-database',
            name: 'GDPR Compliance',
            description: 'Completed GDPR training'
        },
        'compliance-expert': {
            icon: 'fas fa-graduation-cap',
            name: 'Compliance Expert',
            description: 'Completed 3 training modules'
        },
        'quick-learner': {
            icon: 'fas fa-bolt',
            name: 'Quick Learner',
            description: 'Completed first module'
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

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
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
}

// Dashboard Functions
function switchDashboardTab(tabName) {
    // Update sidebar
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    const tabLink = document.querySelector(`.sidebar-menu a[onclick*="${tabName}"]`);
    if (tabLink) {
        tabLink.classList.add('active');
    }
    
    // Update content
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const tabId = 'dashboard' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

// Return to home (logout)
function returnToHome() {
    logout();
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
        useDemoAccount();
    }
});

// Password strength checker
function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthBar || !strengthText) return;
    
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
        password: password,
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
            modules: {
                'fire-safety': { progress: 0, completed: false },
                'gdpr': { progress: 0, completed: false },
                'health-safety': { progress: 0, completed: false }
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

// Send verification email
function sendVerificationEmail(email, code) {
    console.log(`📧 Verification code for ${email}: ${code}`);
    console.log('For demo purposes, use code: 123456');
    startVerificationTimer();
}

// Start verification timer (5 minutes)
function startVerificationTimer() {
    let timeLeft = 300;
    const timerElement = document.getElementById('countdown');
    const timerContainer = document.getElementById('timer');
    
    if (verificationTimer) {
        clearInterval(verificationTimer);
    }
    
    verificationTimer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timerContainer && timeLeft <= 60) {
            timerContainer.classList.add('expiring');
        }
        
        if (timeLeft <= 0) {
            clearInterval(verificationTimer);
            showNotification('Verification code has expired', 'error');
            document.querySelectorAll('.code-input')?.forEach(input => {
                input.disabled = true;
            });
        }
    }, 1000);
}

// Open verification modal
function openVerificationModal(email) {
    const modal = document.getElementById('verificationModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        const emailDisplay = document.getElementById('verificationEmailDisplay');
        if (emailDisplay) {
            emailDisplay.textContent = email;
        }
        
        // Clear code inputs
        document.querySelectorAll('.code-input')?.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
            input.disabled = false;
        });
        
        startVerificationTimer();
    }
}

// Close verification modal
function closeVerificationModal() {
    const modal = document.getElementById('verificationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        if (verificationTimer) {
            clearInterval(verificationTimer);
        }
    }
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
    
    // For demo, accept 123456 or the generated code
    if (enteredCode === verificationCode || enteredCode === '123456') {
        // Mark user as verified
        user.verified = true;
        delete user.verificationCode;
        
        // Update stats
        const stats = JSON.parse(localStorage.getItem('zazim_stats'));
        stats.verifiedUsers++;
        stats.pendingVerifications--;
        
        localStorage.setItem('zazim_users', JSON.stringify(users));
        localStorage.setItem('zazim_stats', JSON.stringify(stats));
        
        // Clear timer
        clearInterval(verificationTimer);
        
        // Close verification modal
        closeVerificationModal();
        
        // Login the user
        currentUser = user;
        sessionStorage.setItem('currentUser', user.email);
        
        // Show success modal
        showSuccessModal(user);
        
        showNotification('Email verified successfully!', 'success');
    } else {
        showNotification('Invalid verification code', 'error');
        codeInputs.forEach(input => {
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        });
    }
}

// Show success modal
function showSuccessModal(user) {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        document.getElementById('welcomeName').textContent = user.name;
        document.getElementById('welcomeEmail').textContent = user.email;
        const welcomeAvatar = document.getElementById('welcomeAvatar');
        if (welcomeAvatar) {
            welcomeAvatar.textContent = getInitials(user.name);
        }
    }
}

// Close success modal
function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Handle password reset
function handlePasswordReset() {
    const email = document.getElementById('resetEmail')?.value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('zazim_users'));
    
    if (!users[email]) {
        showNotification('No account found with this email', 'error');
        return;
    }
    
    showNotification(`Password reset instructions sent to ${email}`, 'success');
    
    setTimeout(() => {
        switchTab('login');
        const resetForm = document.getElementById('resetForm');
        if (resetForm) {
            resetForm.reset();
        }
    }, 2000);
}

// Move to next code input
function moveToNext(input, nextIndex) {
    input.value = input.value.replace(/[^0-9]/g, '');
    
    if (input.value.length === 1 && nextIndex <= 6) {
        const nextInput = input.parentElement.querySelector(`.code-input:nth-child(${nextIndex})`);
        if (nextInput) {
            nextInput.focus();
        }
    }
    
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

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const button = input.parentElement.querySelector('.toggle-password i');
    if (!button) return;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
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

// Helper functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// Demo management functions
function resetAllData() {
    if (confirm('Are you sure you want to reset all demo data? This cannot be undone.')) {
        localStorage.clear();
        sessionStorage.clear();
        initializeApp();
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