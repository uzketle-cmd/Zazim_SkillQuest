// Quiz UI Manager for Zazim SkillQuest
// Handles all quiz interface components and animations

class QuizUI {

    // Handle window resize for responsive scrolling
    handleWindowResize() {
    const modalContent = document.querySelector('#quizModal .modal-content');
        const modal = document.getElementById('quizModal');
    
        if (!modalContent || !modal) return;
    
        const viewportHeight = window.innerHeight;
        // leave a small margin so sticky header/footer remain visible
        const allowed = Math.max(200, viewportHeight - 40);
        modalContent.style.maxHeight = allowed + 'px';
        modal.style.alignItems = (modalContent.scrollHeight > viewportHeight - 40) ? 'flex-start' : 'center';
        // ensure modalContent is scrollable
        modalContent.style.overflowY = 'auto';
    }
    
    // Initialize resize handler and mutation observer
    initScrollHandling() {
        // Debounced resize listener
        let t;
        const onResize = () => {
            clearTimeout(t);
            t = setTimeout(() => this.handleWindowResize(), 80);
        };
        window.addEventListener('resize', onResize);
    
        // Initial check after styles applied
        setTimeout(() => this.handleWindowResize(), 60);
        setTimeout(() => this.handleWindowResize(), 400);
    
        // Observe changes inside modal-content (dynamic insertions)
        const modalContent = document.querySelector('#quizModal .modal-content');
        if (modalContent && window.MutationObserver) {
            const mo = new MutationObserver(() => {
                // small delay to allow DOM to settle
                clearTimeout(t);
                t = setTimeout(() => this.handleWindowResize(), 60);
            });
            mo.observe(modalContent, { childList: true, subtree: true, characterData: true });
            // store it so we can disconnect later if needed
            this._modalMutationObserver = mo;
        }
    }
    
    // Update the showExplanation method to scroll properly
    showExplanation(explanationHtml) {
        const explanationContainer = document.getElementById('quizExplanation');
        const modalContent = document.querySelector('#quizModal .modal-content');
    
        if (!explanationContainer || !modalContent) return;
    
        explanationContainer.innerHTML = explanationHtml;
        explanationContainer.style.display = 'block';
    
        // allow layout to update then scroll modal-content so explanation is visible
        setTimeout(() => {
            this.handleWindowResize();
    
            // compute top of explanation relative to modalContent scrollTop
            const modalRect = modalContent.getBoundingClientRect();
            const targetRect = explanationContainer.getBoundingClientRect();
            const offset = 16; // small padding above the target
            const targetTop = (targetRect.top - modalRect.top) + modalContent.scrollTop - offset;
    
            modalContent.scrollTo({
                top: Math.max(0, targetTop),
                behavior: 'smooth'
            });
        }, 120);
    }

    constructor() {
        this.quizContainer = null;
        this.currentQuestionElement = null;
        this.progressBar = null;
        this.scoreElement = null;
        this.streakElement = null;
        this.timerElement = null;
        this.explanationElement = null;
        
        // Animation states
        this.animations = {
            correct: 'correct-answer-animation',
            incorrect: 'incorrect-answer-animation',
            streak: 'streak-animation',
            levelUp: 'level-up-animation'
        };
        
        // Initialize UI components
        this.initializeStyles();

        // Initialize scroll handling
        setTimeout(() => this.initScrollHandling(), 100);
    }
    
    // Initialize CSS styles
    initializeStyles() {
        if (document.getElementById('quiz-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'quiz-ui-styles';
        style.textContent = `
            /* Full Screen Quiz Modal */
            #quizModal.modal {
            display: flex;
            position: fixed;
            inset: 0;
            background-color: rgba(0,0,0,0.85);
            z-index: 9999;
            align-items: flex-start;
            justify-content: center;
            padding: 20px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            animation: modalFadeIn 0.3s ease;
        }
            
            /* Quiz Modal Content */
            #quizModal .modal-content {
            width: 100%;
            max-width: 900px;
            background: white;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideUp 0.4s ease;
            margin: 10px auto;
            max-height: calc(100vh - 40px); /* limit to viewport */
            overflow-y: auto; /* <- single scroller */
            -webkit-overflow-scrolling: touch;
        }

            /* Make entire quiz container scrollable */
           .quiz-container {
            display: block;
        }

            
            /* Quiz Header - Fixed */
            .quiz-header {
                background: linear-gradient(135deg, #2A4B8C 0%, #4CAF50 100%);
                color: white;
                padding: 20px 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            
            .quiz-header h2 {
                margin: 0;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .quiz-stats {
                display: flex;
                gap: 15px;
            }
            
            .stat-box {
                text-align: center;
                background: rgba(255,255,255,0.2);
                padding: 8px 12px;
                border-radius: 8px;
                min-width: 70px;
            }
            
            .stat-value {
                font-size: 1.3rem;
                font-weight: bold;
                display: block;
            }
            
            .stat-label {
                font-size: 0.8rem;
                opacity: 0.9;
            }
            
            /* Progress Bar */
            .quiz-progress {
                padding: 15px 30px;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                flex-shrink: 0;
            }
            
            .progress-bar-container {
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                border-radius: 4px;
                transition: width 0.5s ease;
                width: 0%;
            }
            
            .progress-text {
                display: flex;
                justify-content: space-between;
                font-size: 0.85rem;
                color: #666;
            }
            
            /* Scrollable Quiz Content */
            .quiz-body-scrollable {
            display: block;
            padding: 0;
        }
            
            /* Question Container */
            .question-container {
                padding: 25px 30px;
            }
            
            .question-text {
                font-size: 1.3rem;
                margin-bottom: 25px;
                color: #333;
                line-height: 1.5;
            }
            
            .question-meta {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                color: #666;
                font-size: 0.85rem;
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            /* Options Container */
            .options-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .option-button {
                padding: 16px 20px;
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                font-size: 1rem;
                text-align: left;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                min-height: 60px;
                display: flex;
                align-items: center;
            }
            
            .option-button:hover:not(:disabled) {
                background: #e9ecef;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .option-button:disabled {
                cursor: not-allowed;
                opacity: 0.7;
            }
            
            .option-button.selected {
                border-color: #4CAF50;
                background: rgba(76, 175, 80, 0.1);
            }
            
            .option-button.correct {
                border-color: #4CAF50;
                background: rgba(76, 175, 80, 0.2);
                animation: pulse-green 0.5s ease;
            }
            
            .option-button.incorrect {
                border-color: #f44336;
                background: rgba(244, 67, 54, 0.1);
                animation: shake 0.5s ease;
            }
            
            .option-letter {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                background: #2A4B8C;
                color: white;
                border-radius: 50%;
                text-align: center;
                line-height: 30px;
                font-weight: bold;
                margin-right: 15px;
                flex-shrink: 0;
            }
            
            .option-text {
                flex: 1;
            }
            
            /* Explanation Container */
            .explanation-container {
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 12px;
                border-left: 4px solid #2A4B8C;
                animation: slideIn 0.5s ease;
            }
            
            .explanation-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .explanation-icon {
                font-size: 1.5rem;
            }
            
            .explanation-personality {
                font-weight: bold;
                color: #2A4B8C;
            }
            
            .explanation-text {
                font-size: 1.05rem;
                line-height: 1.6;
                margin-bottom: 15px;
                color: #333;
            }
            
            .explanation-tips {
                background: white;
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
            }
            
            .tips-title {
                font-weight: bold;
                color: #4CAF50;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .tip-item {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 8px;
                color: #666;
            }
            
            .tip-item:last-child {
                margin-bottom: 0;
            }
            
            /* Next Button - Fixed at bottom */
            .next-button-container {
                padding: 20px 30px;
                background: white;
                border-top: 1px solid #e9ecef;
                text-align: center;
                flex-shrink: 0;
                position: sticky;
                bottom: 0;
                z-index: 5;
                box-shadow: 0 -5px 15px rgba(0,0,0,0.05);
            }
            
            .next-button {
                padding: 14px 35px;
                font-size: 1.1rem;
                border-radius: 25px;
                background: linear-gradient(135deg, #2A4B8C, #4CAF50);
                color: white;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                min-width: 180px;
            }
            
            .next-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(42, 75, 140, 0.3);
            }
            
            .next-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                background: #cccccc;
            }
            
            /* Results Container */
            .results-container {
                padding: 30px;
                text-align: center;
                animation: fadeIn 0.8s ease;
                overflow-y: auto;
                max-height: none;
            }
            
            .results-header {
                margin-bottom: 25px;
            }
            
            .results-score {
                font-size: 3.5rem;
                font-weight: bold;
                background: linear-gradient(135deg, #2A4B8C, #4CAF50);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin: 15px 0;
            }
            
            .results-message {
                font-size: 1.3rem;
                color: #333;
                margin-bottom: 25px;
            }
            
            .results-details {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 25px 0;
            }
            
            .detail-card {
                background: #f8f9fa;
                padding: 18px;
                border-radius: 12px;
                text-align: center;
            }
            
            .detail-value {
                font-size: 1.8rem;
                font-weight: bold;
                color: #2A4B8C;
                display: block;
            }
            
            .detail-label {
                color: #666;
                font-size: 0.85rem;
                margin-top: 5px;
            }
            
            .achievements-container {
                margin: 25px 0;
            }
            
            .achievement-badge {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: #fff3cd;
                padding: 10px 18px;
                border-radius: 25px;
                margin: 5px;
                border: 2px solid #ffc107;
                font-size: 0.9rem;
            }
            
            .certificate-container {
                margin: 30px 0;
                padding: 25px;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border-radius: 15px;
                border: 2px dashed #2A4B8C;
            }
            
            .certificate-title {
                font-size: 1.6rem;
                color: #2A4B8C;
                margin-bottom: 15px;
            }

            /* For very small screens, adjust margins and padding */
            @media (max-height: 500px) {
                #quizModal.modal {
                    padding: 10px;
                    align-items: flex-start; /* Align to top on very short screens */
                }
                
                #quizModal .modal-content {
                    max-height: 98vh;
                    margin: 10px auto; /* Add margin on top/bottom */
                }
                
                .quiz-header {
                    padding: 12px 20px;
                }
                
                .question-container {
                    padding: 15px 20px;
                }
                
                .next-button-container {
                    padding: 15px 20px;
                }
            }
            
            /* Additional responsive adjustments */
            @media (max-width: 768px) {
                #quizModal.modal {
                    padding: 10px;
                    overflow-y: auto;
                    align-items: flex-start;
                }
                
                #quizModal .modal-content {
                    max-height: 98vh;
                    margin: 10px auto;
                }
                
                /* Ensure content is not too compressed */
                .question-text {
                    min-height: auto;
                }
                
                .options-container {
                    min-height: auto;
                }
            }
            
            /* For extremely small height screens */
            @media (max-height: 400px) {
                .quiz-header {
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .quiz-stats {
                    order: 2;
                    width: 100%;
                    justify-content: space-between;
                }
                
                .question-meta {
                    flex-wrap: wrap;
                    font-size: 0.75rem;
                }
                
                .option-button {
                    padding: 10px 15px;
                    min-height: 45px;
                }
                
                .option-letter {
                    width: 24px;
                    height: 24px;
                    font-size: 0.8rem;
                    margin-right: 10px;
                }
            }
            
            /* Animations */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes pulse-green {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            
            @keyframes streak-fire {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            /* Loading Overlay */
            .quiz-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255,255,255,0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .loading-content {
                text-align: center;
            }
            
            .loading-spinner {
                width: 60px;
                height: 60px;
                border: 5px solid #e9ecef;
                border-top: 5px solid #2A4B8C;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            .loading-text {
                font-size: 1.3rem;
                color: #2A4B8C;
                margin-bottom: 10px;
                font-weight: bold;
            }
            
            .loading-subtext {
                color: #666;
                font-size: 0.9rem;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Scrollbar Styling */
            .quiz-body-scrollable::-webkit-scrollbar {
                width: 8px;
            }
            
            .quiz-body-scrollable::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }
            
            .quiz-body-scrollable::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 4px;
            }
            
            .quiz-body-scrollable::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                #quizModal.modal {
                    padding: 10px;
                }
                
                #quizModal .modal-content {
                    height: 98vh;
                    max-height: 98vh;
                    border-radius: 15px;
                }
                
                .quiz-header {
                    padding: 15px 20px;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .quiz-stats {
                    width: 100%;
                    justify-content: space-between;
                }
                
                .stat-box {
                    flex: 1;
                    min-width: auto;
                    padding: 8px 10px;
                }
                
                .question-container {
                    padding: 20px;
                }
                
                .question-text {
                    font-size: 1.2rem;
                }
                
                .question-meta {
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .option-button {
                    padding: 14px 16px;
                    min-height: 55px;
                }
                
                .next-button {
                    padding: 12px 25px;
                    width: 100%;
                    min-width: auto;
                }
                
                .results-details {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
                
                .detail-card {
                    padding: 15px;
                }
                
                .detail-value {
                    font-size: 1.6rem;
                }
            }
            
            @media (max-width: 480px) {
                .quiz-header h2 {
                    font-size: 1.3rem;
                }
                
                .question-text {
                    font-size: 1.1rem;
                }
                
                .option-button {
                    font-size: 0.95rem;
                }
                
                .option-letter {
                    width: 26px;
                    height: 26px;
                    font-size: 0.9rem;
                    margin-right: 12px;
                }
                
                .explanation-text {
                    font-size: 1rem;
                }
                
                .results-score {
                    font-size: 3rem;
                }
            }
            
            /* Mobile Landscape Optimization */
            @media (max-height: 600px) and (orientation: landscape) {
                #quizModal .modal-content {
                    height: 98vh;
                    max-height: 98vh;
                }
                
                .quiz-header {
                    padding: 12px 20px;
                }
                
                .question-container {
                    padding: 15px 20px;
                }
                
                .question-text {
                    font-size: 1.1rem;
                    margin-bottom: 15px;
                }
                
                .option-button {
                    padding: 12px 16px;
                    min-height: 50px;
                }
                
                .next-button-container {
                    padding: 15px 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Create quiz container
    createQuizContainer() {
        this.quizContainer = document.createElement('div');
        this.quizContainer.className = 'quiz-container';
        return this.quizContainer;
    }
    
    // Render quiz header
    renderQuizHeader(moduleName, score, streak, questionNumber, totalQuestions) {
        return `
            <div class="quiz-header">
                <h2>
                    <i class="fas fa-brain"></i>
                    ${moduleName} Quiz
                </h2>
                <div class="quiz-stats">
                    <div class="stat-box">
                        <span class="stat-value" id="quizScore">${score}</span>
                        <span class="stat-label">SCORE</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value" id="quizStreak">${streak}</span>
                        <span class="stat-label">STREAK</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-value">${questionNumber}/${totalQuestions}</span>
                        <span class="stat-label">QUESTIONS</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Render progress bar
    renderProgressBar(progress) {
        return `
            <div class="quiz-progress">
                <div class="progress-bar-container">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">
                    <span>Progress</span>
                    <span>${Math.round(progress)}%</span>
                </div>
            </div>
        `;
    }
    
    // Render question
    renderQuestion(questionData) {
        const letters = ['A', 'B', 'C', 'D'];
        
        return `
            <div class="question-container">
                <div class="question-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        Estimated: ${questionData.estimatedTime || 2} min
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-signal"></i>
                        ${questionData.difficulty || 'Medium'}
                    </div>
                    <div class="meta-item">
                        <i class="fas ${questionData.personality?.emoji || '🤖'}"></i>
                        ${questionData.personality?.name || 'AI Assistant'}
                    </div>
                </div>
                
                <div class="question-text">
                    ${questionData.question}
                </div>
                
                <div class="options-container" id="quizOptions">
                    ${questionData.options.map((option, index) => `
                        <button class="option-button" data-index="${index}">
                            <span class="option-letter">${letters[index]}</span>
                            <span class="option-text">${option}</span>
                        </button>
                    `).join('')}
                </div>
                
                <div class="explanation-container" id="quizExplanation" style="display: none;">
                    <!-- Explanation will be inserted here -->
                </div>
            </div>
        `;
    }
    
    // Render next button
    renderNextButton(isLastQuestion = false) {
        return `
            <div class="next-button-container">
                <button class="next-button" id="nextQuestionBtn" disabled>
                    <i class="fas fa-arrow-right"></i>
                    ${isLastQuestion ? 'View Results' : 'Next Question'}
                </button>
            </div>
        `;
    }
    
    // Render explanation
    renderExplanation(explanationData) {
        return `
            <div class="explanation-container" id="quizExplanation">
                <div class="explanation-header">
                    <span class="explanation-icon">${explanationData.icon}</span>
                    <span class="explanation-personality">${explanationData.personality?.name || 'AI Assistant'}</span>
                    <span>(${explanationData.personality?.trait || 'Training Expert'})</span>
                </div>
                <div class="explanation-text">
                    ${explanationData.text}
                </div>
                
                ${explanationData.tips && explanationData.tips.length > 0 ? `
                    <div class="explanation-tips">
                        <div class="tips-title">
                            <i class="fas fa-lightbulb"></i>
                            Pro Tips:
                        </div>
                        ${explanationData.tips.map(tip => `
                            <div class="tip-item">
                                <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
                                ${tip}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${explanationData.funFact ? `
                    <div class="explanation-tips" style="margin-top: 15px; background: #e3f2fd;">
                        <div class="tips-title">
                            <i class="fas fa-star"></i>
                            Fun Fact:
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-info-circle" style="color: #2196F3;"></i>
                            ${explanationData.funFact}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Enable next button
    enableNextButton() {
        const nextButton = document.getElementById('nextQuestionBtn');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.style.opacity = '1';
            nextButton.style.cursor = 'pointer';
            nextButton.classList.remove('disabled');
        }
    }
    
    // Render results
    renderResults(results) {
        const accuracy = Math.round(results.accuracy);
        const timePerQuestion = Math.round(results.averageTimePerQuestion / 1000);
        
        // Determine performance message
        let performanceMessage = '';
        let performanceEmoji = '';
        
        if (accuracy >= 90) {
            performanceMessage = 'Outstanding Performance! 🏆';
            performanceEmoji = '🎖️';
        } else if (accuracy >= 75) {
            performanceMessage = 'Excellent Work! ⭐';
            performanceEmoji = '✨';
        } else if (accuracy >= 60) {
            performanceMessage = 'Good Job! 👍';
            performanceEmoji = '📚';
        } else {
            performanceMessage = 'Keep Learning! 💪';
            performanceEmoji = '📖';
        }
        
        return `
            <div class="results-container">
                <div class="results-header">
                    <h2>Quiz Complete! ${performanceEmoji}</h2>
                    <div class="results-score">${accuracy}%</div>
                    <div class="results-message">${performanceMessage}</div>
                </div>
                
                <div class="results-details">
                    <div class="detail-card">
                        <span class="detail-value">${results.correctAnswers}/${results.questionsAnswered}</span>
                        <span class="detail-label">Questions Correct</span>
                    </div>
                    <div class="detail-card">
                        <span class="detail-value">${timePerQuestion}s</span>
                        <span class="detail-label">Avg Time per Question</span>
                    </div>
                    <div class="detail-card">
                        <span class="detail-value">${results.streak}</span>
                        <span class="detail-label">Best Streak</span>
                    </div>
                    <div class="detail-card">
                        <span class="detail-value">${Math.round(results.totalTime / 1000)}s</span>
                        <span class="detail-label">Total Time</span>
                    </div>
                </div>
                
                ${results.aiInsights ? `
                    <div class="explanation-container" style="margin: 25px 0;">
                        <div class="explanation-header">
                            <i class="fas fa-robot"></i>
                            <span class="explanation-personality">AI Analysis</span>
                        </div>
                        <div class="explanation-text">
                            <p><strong>Summary:</strong> ${results.aiInsights.summary}</p>
                            <p><strong>Strengths:</strong> ${results.aiInsights.strengths.join(', ')}</p>
                            <p><strong>Recommendations:</strong> ${results.aiInsights.recommendations.join(', ')}</p>
                            <p><em>${results.aiInsights.motivationalMessage}</em></p>
                        </div>
                    </div>
                ` : ''}
                
                ${Object.keys(results.categoryPerformance || {}).length > 0 ? `
                    <div class="explanation-container" style="margin: 25px 0;">
                        <div class="explanation-header">
                            <i class="fas fa-chart-pie"></i>
                            <span class="explanation-personality">Category Performance</span>
                        </div>
                        <div class="explanation-text">
                            ${Object.entries(results.categoryPerformance).map(([category, data]) => `
                                <p><strong>${category.replace('-', ' ').toUpperCase()}:</strong> 
                                ${Math.round(data.accuracy)}% accuracy (${data.correct}/${data.total}) - ${data.performance}</p>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${results.certificate ? `
                    <div class="certificate-container">
                        <div class="certificate-title">
                            <i class="fas fa-certificate"></i>
                            Certificate of Completion
                        </div>
                        <p><strong>Congratulations ${results.certificate.userName}!</strong></p>
                        <p>You have successfully completed the ${results.certificate.moduleName} training with ${results.certificate.score}% proficiency.</p>
                        <p><small>Certificate ID: ${results.certificate.certificateId}</small></p>
                        <p><small>Issued: ${results.certificate.date} | Valid until: ${results.certificate.validUntil}</small></p>
                        <button class="btn btn-primary" onclick="downloadCertificate()" style="margin-top: 20px;">
                            <i class="fas fa-download"></i> Download Certificate
                        </button>
                    </div>
                ` : ''}
                
                <div style="margin-top: 30px;">
                    <button class="btn btn-primary" onclick="restartQuiz()" style="margin-right: 10px;">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                    <button class="btn btn-outline" onclick="closeQuiz()">
                        <i class="fas fa-times"></i> Close Quiz
                    </button>
                </div>
            </div>
        `;
    }
    
    // Update progress bar
    updateProgressBar(progress) {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    // Update score display
    updateScore(score) {
        const scoreElement = document.getElementById('quizScore');
        if (scoreElement) {
            scoreElement.textContent = score;
            this.animateValue(scoreElement, parseInt(scoreElement.textContent), score, 500);
        }
    }

    // Update streak display
    updateStreak(streak) {
        const streakElement = document.getElementById('quizStreak');
        if (streakElement) {
            streakElement.textContent = streak;
            
            // Animate streak for high values
            if (streak >= 3) {
                streakElement.parentElement.style.animation = 'streak-fire 0.5s ease';
                setTimeout(() => {
                    streakElement.parentElement.style.animation = '';
                }, 500);
            }
        }
    }
    
    // Show explanation
    showExplanation(explanationHtml) {
        const explanationContainer = document.getElementById('quizExplanation');
        if (explanationContainer) {
            explanationContainer.innerHTML = explanationHtml;
            explanationContainer.style.display = 'block';
            
            // Scroll to explanation smoothly
            setTimeout(() => {
                explanationContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 100);
        }
    }
    
    // Show correct/incorrect animation
    showAnswerFeedback(selectedIndex, correctIndex) {
        const options = document.querySelectorAll('.option-button');
        if (!options) return;
        
        // Mark correct answer
        options[correctIndex].classList.add('correct');
        
        // Mark incorrect if wrong answer selected
        if (selectedIndex !== correctIndex && selectedIndex !== undefined) {
            options[selectedIndex].classList.add('incorrect');
        }
        
        // Disable all options
        options.forEach(option => {
            option.disabled = true;
        });
    }
    
    // Animate numeric value
    animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }
    
    // Show loading state
    showLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'quiz-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Processing your answer...</div>
                <div class="loading-subtext">AI is generating personalized feedback</div>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
        return loadingOverlay;
    }
    
    // Hide loading state
    hideLoading(overlay) {
        if (overlay && overlay.parentElement) {
            overlay.remove();
        }
    }
    
    // Clear quiz container
    clear() {
        if (this.quizContainer) {
            this.quizContainer.innerHTML = '';
        }
    }
}

// Initialize UI manager
const quizUI = new QuizUI();
window.quizUI = quizUI;
