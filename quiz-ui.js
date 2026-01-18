// Quiz UI Manager for Zazim SkillQuest
// Handles all quiz interface components and animations

class QuizUI {
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
    }
    
    // Initialize CSS styles
    initializeStyles() {
        if (document.getElementById('quiz-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'quiz-ui-styles';
        style.textContent = `
            /* Quiz Container */
            .quiz-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                overflow: hidden;
                animation: fadeIn 0.5s ease;
            }
            
            /* Quiz Header */
            .quiz-header {
                background: linear-gradient(135deg, #2A4B8C 0%, #4CAF50 100%);
                color: white;
                padding: 25px 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .quiz-header h2 {
                margin: 0;
                font-size: 1.8rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .quiz-stats {
                display: flex;
                gap: 20px;
            }
            
            .stat-box {
                text-align: center;
                background: rgba(255,255,255,0.2);
                padding: 10px 15px;
                border-radius: 10px;
                min-width: 80px;
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: bold;
                display: block;
            }
            
            .stat-label {
                font-size: 0.9rem;
                opacity: 0.9;
            }
            
            /* Progress Bar */
            .quiz-progress {
                padding: 20px 30px;
                background: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
            }
            
            .progress-bar-container {
                height: 10px;
                background: #e9ecef;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #8BC34A);
                border-radius: 5px;
                transition: width 0.5s ease;
                width: 0%;
            }
            
            .progress-text {
                display: flex;
                justify-content: space-between;
                font-size: 0.9rem;
                color: #666;
            }
            
            /* Question Container */
            .question-container {
                padding: 30px;
            }
            
            .question-text {
                font-size: 1.4rem;
                margin-bottom: 25px;
                color: #333;
                line-height: 1.5;
            }
            
            .question-meta {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                color: #666;
                font-size: 0.9rem;
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
                gap: 12px;
            }
            
            .option-button {
                padding: 18px 20px;
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 12px;
                font-size: 1.1rem;
                text-align: left;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
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
                display: inline-block;
                width: 30px;
                height: 30px;
                background: #2A4B8C;
                color: white;
                border-radius: 50%;
                text-align: center;
                line-height: 30px;
                font-weight: bold;
                margin-right: 15px;
            }
            
            /* Explanation Container */
            .explanation-container {
                margin-top: 25px;
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
                font-size: 1.1rem;
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
            
            /* Next Button */
            .next-button-container {
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            
            .next-button {
                padding: 15px 40px;
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
            }
            
            .next-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(42, 75, 140, 0.3);
            }
            
            .next-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            /* Results Container */
            .results-container {
                padding: 40px;
                text-align: center;
                animation: fadeIn 0.8s ease;
            }
            
            .results-header {
                margin-bottom: 30px;
            }
            
            .results-score {
                font-size: 4rem;
                font-weight: bold;
                background: linear-gradient(135deg, #2A4B8C, #4CAF50);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin: 20px 0;
            }
            
            .results-message {
                font-size: 1.4rem;
                color: #333;
                margin-bottom: 30px;
            }
            
            .results-details {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 30px 0;
            }
            
            .detail-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
            }
            
            .detail-value {
                font-size: 2rem;
                font-weight: bold;
                color: #2A4B8C;
                display: block;
            }
            
            .detail-label {
                color: #666;
                font-size: 0.9rem;
                margin-top: 5px;
            }
            
            .achievements-container {
                margin: 30px 0;
            }
            
            .achievement-badge {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: #fff3cd;
                padding: 10px 20px;
                border-radius: 25px;
                margin: 5px;
                border: 2px solid #ffc107;
            }
            
            .certificate-container {
                margin: 40px 0;
                padding: 30px;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border-radius: 15px;
                border: 2px dashed #2A4B8C;
            }
            
            .certificate-title {
                font-size: 1.8rem;
                color: #2A4B8C;
                margin-bottom: 20px;
            }
            
            /* Animations */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
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
                z-index: 9999;
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
            
            /* Responsive */
            @media (max-width: 768px) {
                .quiz-header {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }
                
                .quiz-stats {
                    width: 100%;
                    justify-content: center;
                }
                
                .results-details {
                    grid-template-columns: 1fr;
                }
                
                .question-text {
                    font-size: 1.2rem;
                }
                
                .option-button {
                    padding: 15px;
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
                            ${option}
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
                    <div class="explanation-container" style="margin: 30px 0;">
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
                    <div class="explanation-container" style="margin: 30px 0;">
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
                
                <div style="margin-top: 40px;">
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
        const progressFill = this.quizContainer?.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }
    
    // Update score display
    updateScore(score) {
        const scoreElement = this.quizContainer?.querySelector('#quizScore');
        if (scoreElement) {
            scoreElement.textContent = score;
            this.animateValue(scoreElement, parseInt(scoreElement.textContent), score, 500);
        }
    }
    
    // Update streak display
    updateStreak(streak) {
        const streakElement = this.quizContainer?.querySelector('#quizStreak');
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
        const explanationContainer = this.quizContainer?.querySelector('#quizExplanation');
        if (explanationContainer) {
            explanationContainer.innerHTML = explanationHtml;
            explanationContainer.style.display = 'block';
            
            // Scroll to explanation
            explanationContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }
    }
    
    // Enable next button
    enableNextButton() {
        const nextButton = this.quizContainer?.querySelector('#nextQuestionBtn');
        if (nextButton) {
            nextButton.disabled = false;
        }
    }
    
    // Show correct/incorrect animation
    showAnswerFeedback(selectedIndex, correctIndex) {
        const options = this.quizContainer?.querySelectorAll('.option-button');
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