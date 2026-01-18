// Gamified Quiz Engine for Zazim SkillQuest
// Integrates with LLM Service for AI-generated questions and explanations

class QuizEngine {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.startTime = null;
        this.quizQuestions = [];
        this.userAnswers = [];
        this.quizResults = null;
        
        // Gamification settings
        this.settings = {
            questionsPerQuiz: 10,
            timeLimit: null, // No time limit by default
            showExplanations: true,
            adaptiveDifficulty: true,
            allowRetry: true,
            soundEffects: true
        };
        
        // Initialize audio for gamification
        this.sounds = {
            correct: this.createSound(800, 0.3),
            incorrect: this.createSound(400, 0.2),
            streak: this.createSound(1200, 0.4),
            levelUp: this.createSound(1000, 0.5, 'sine')
        };
        
        // Achievement tracker
        this.achievements = {
            perfectScore: false,
            speedRun: false,
            comeback: false,
            streakMaster: false
        };
    }
    
    // Initialize a new quiz
    async startQuiz(moduleId) {
        this.resetQuiz();
        
        // Generate questions using LLM service
        this.quizQuestions = llmService.generateQuestions(moduleId, this.settings.questionsPerQuiz);
        
        if (this.quizQuestions.length === 0) {
            throw new Error("No questions available for this module");
        }
        
        this.currentQuiz = {
            moduleId: moduleId,
            totalQuestions: this.quizQuestions.length,
            startTime: new Date(),
            questions: this.quizQuestions
        };
        
        this.startTime = Date.now();
        
        // Show loading animation
        await this.showLoadingAnimation();
        
        return {
            success: true,
            totalQuestions: this.quizQuestions.length,
            firstQuestion: this.getCurrentQuestion()
        };
    }
    
    // Get current question
    getCurrentQuestion() {
        if (this.currentQuestionIndex >= this.quizQuestions.length) {
            return null;
        }
        
        const question = this.quizQuestions[this.currentQuestionIndex];
        return {
            ...question,
            questionNumber: this.currentQuestionIndex + 1,
            totalQuestions: this.quizQuestions.length,
            streak: this.streak,
            score: this.score
        };
    }
    
    // Submit answer for current question
    async submitAnswer(answerIndex) {
        if (this.currentQuestionIndex >= this.quizQuestions.length) {
            return { error: "Quiz completed" };
        }
        
        const question = this.quizQuestions[this.currentQuestionIndex];
        const isCorrect = answerIndex === question.correctAnswer;
        const timeTaken = Date.now() - this.startTime;
        
        // Record answer
        this.userAnswers.push({
            questionId: question.id,
            userAnswer: answerIndex,
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            timeTaken: timeTaken,
            timestamp: new Date().toISOString()
        });
        
        // Update score and streak
        if (isCorrect) {
            this.score += 10;
            this.streak++;
            
            // Bonus for streaks
            if (this.streak >= 3) {
                this.score += 5; // Streak bonus
                if (this.settings.soundEffects) {
                    this.sounds.streak.play();
                }
            }
            
            if (this.settings.soundEffects) {
                this.sounds.correct.play();
            }
        } else {
            this.streak = 0;
            if (this.settings.soundEffects) {
                this.sounds.incorrect.play();
            }
        }
        
        // Generate AI explanation
        const explanation = llmService.generateExplanation(
            question, 
            answerIndex, 
            isCorrect
        );
        
        // Check for achievements
        this.checkAchievements();
        
        // Move to next question
        this.currentQuestionIndex++;
        this.startTime = Date.now();
        
        // Prepare next question (if any)
        const nextQuestion = this.getCurrentQuestion();
        const isLastQuestion = !nextQuestion;
        
        // If last question, calculate final results
        if (isLastQuestion) {
            await this.calculateFinalResults();
        }
        
        return {
            isCorrect: isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: explanation,
            updatedScore: this.score,
            updatedStreak: this.streak,
            nextQuestion: nextQuestion,
            isComplete: isLastQuestion,
            achievementsUnlocked: this.getNewAchievements()
        };
    }
    
    // Calculate final results
    async calculateFinalResults() {
        const totalTime = Date.now() - this.startTime;
        const accuracy = (this.score / (this.quizQuestions.length * 10)) * 100;
        
        // Generate AI insights
        const aiInsights = await llmService.generateAISummary({
            score: this.score / 10, // Convert to number of correct answers
            total: this.quizQuestions.length,
            timeSpent: totalTime,
            questions: this.quizQuestions.map((q, i) => ({
                ...q,
                userCorrect: this.userAnswers[i]?.isCorrect || false
            }))
        });
        
        // Calculate category performance
        const categoryPerformance = this.calculateCategoryPerformance();
        
        // Generate certificate if score is high enough
        const certificate = accuracy >= 70 ? this.generateCertificate(accuracy) : null;
        
        this.quizResults = {
            finalScore: this.score,
            maxScore: this.quizQuestions.length * 10,
            accuracy: accuracy,
            totalTime: totalTime,
            averageTimePerQuestion: totalTime / this.quizQuestions.length,
            questionsAnswered: this.quizQuestions.length,
            correctAnswers: this.score / 10,
            streak: this.streak,
            achievements: this.achievements,
            categoryPerformance: categoryPerformance,
            aiInsights: aiInsights,
            certificate: certificate,
            timestamp: new Date().toISOString()
        };
        
        return this.quizResults;
    }
    
    // Calculate performance by category
    calculateCategoryPerformance() {
        const performance = {};
        
        this.quizQuestions.forEach((question, index) => {
            const category = question.category;
            if (!performance[category]) {
                performance[category] = {
                    total: 0,
                    correct: 0,
                    averageTime: 0
                };
            }
            
            performance[category].total++;
            if (this.userAnswers[index]?.isCorrect) {
                performance[category].correct++;
            }
            performance[category].averageTime += this.userAnswers[index]?.timeTaken || 0;
        });
        
        // Calculate percentages and averages
        Object.keys(performance).forEach(category => {
            const cat = performance[category];
            cat.accuracy = (cat.correct / cat.total) * 100;
            cat.averageTime = cat.averageTime / cat.total;
            cat.performance = cat.accuracy >= 80 ? 'Excellent' : 
                             cat.accuracy >= 60 ? 'Good' : 
                             cat.accuracy >= 40 ? 'Needs Practice' : 'Review Required';
        });
        
        return performance;
    }
    
    // Generate certificate
    generateCertificate(accuracy) {
        const userName = window.currentUser?.name || "Learner";
        const moduleName = this.currentQuiz.moduleId.replace('-', ' ').toUpperCase();
        const date = new Date().toLocaleDateString('en-GB');
        
        return {
            userName: userName,
            moduleName: moduleName,
            score: Math.round(accuracy),
            date: date,
            certificateId: `ZAZIM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            certificateText: llmService.generateCertificateText(
                userName, 
                moduleName, 
                Math.round(accuracy), 
                date
            ),
            qrCode: `https://zazimskillquest.com/verify/${Date.now()}`,
            issuedBy: "Zazim SkillQuest Training Academy",
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB') // 1 year
        };
    }
    
    // Check for achievements
    checkAchievements() {
        const correctCount = this.userAnswers.filter(a => a.isCorrect).length;
        const totalAnswered = this.userAnswers.length;
        
        // Perfect score (so far)
        if (correctCount === totalAnswered && totalAnswered > 0) {
            this.achievements.perfectScore = true;
        }
        
        // Speed run (average < 15 seconds per question)
        const totalTime = this.userAnswers.reduce((sum, a) => sum + a.timeTaken, 0);
        const averageTime = totalTime / totalAnswered;
        if (averageTime < 15000 && totalAnswered >= 5) {
            this.achievements.speedRun = true;
        }
        
        // Comeback (get 3 correct after a wrong answer)
        if (this.streak >= 3 && this.userAnswers.some(a => !a.isCorrect)) {
            this.achievements.comeback = true;
        }
        
        // Streak master
        if (this.streak >= 5) {
            this.achievements.streakMaster = true;
        }
    }
    
    // Get newly unlocked achievements
    getNewAchievements() {
        // This would track which achievements were just unlocked
        // For simplicity, return all achievements for now
        return Object.entries(this.achievements)
            .filter(([_, unlocked]) => unlocked)
            .map(([name, _]) => name);
    }
    
    // Show loading animation
    async showLoadingAnimation() {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'quiz-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">AI is generating your personalized quiz...</div>
                <div class="loading-subtext">Analyzing industry standards and creating engaging questions</div>
            </div>
        `;
        
        document.body.appendChild(loadingOverlay);
        
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Remove overlay
        loadingOverlay.remove();
    }
    
    // Create sound effects for gamification
    createSound(frequency, duration, type = 'sine') {
        if (!window.AudioContext) return { play: () => {} };
        
        return {
            play: () => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = frequency;
                    oscillator.type = type;
                    
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration);
                } catch (e) {
                    console.log('Audio not supported:', e);
                }
            }
        };
    }
    
    // Reset quiz state
    resetQuiz() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.startTime = null;
        this.quizQuestions = [];
        this.userAnswers = [];
        this.quizResults = null;
        
        // Reset achievements
        this.achievements = {
            perfectScore: false,
            speedRun: false,
            comeback: false,
            streakMaster: false
        };
    }
    
    // Get quiz statistics
    getStatistics() {
        return {
            totalQuizzesTaken: parseInt(localStorage.getItem('totalQuizzes') || '0'),
            averageScore: parseFloat(localStorage.getItem('averageScore') || '0'),
            bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
            totalQuestionsAnswered: parseInt(localStorage.getItem('totalQuestions') || '0'),
            totalLearningTime: parseInt(localStorage.getItem('totalLearningTime') || '0')
        };
    }
    
    // Save quiz results
    saveResults() {
        if (!this.quizResults) return;
        
        // Update statistics
        const stats = this.getStatistics();
        stats.totalQuizzesTaken++;
        stats.totalQuestionsAnswered += this.quizResults.questionsAnswered;
        stats.totalLearningTime += this.quizResults.totalTime;
        
        // Update average score
        const totalScore = (stats.averageScore * (stats.totalQuizzesTaken - 1)) + this.quizResults.accuracy;
        stats.averageScore = totalScore / stats.totalQuizzesTaken;
        
        // Update best score
        if (this.quizResults.accuracy > stats.bestScore) {
            stats.bestScore = this.quizResults.accuracy;
        }
        
        // Save to localStorage
        localStorage.setItem('totalQuizzes', stats.totalQuizzesTaken.toString());
        localStorage.setItem('averageScore', stats.averageScore.toFixed(2));
        localStorage.setItem('bestScore', stats.bestScore.toString());
        localStorage.setItem('totalQuestions', stats.totalQuestionsAnswered.toString());
        localStorage.setItem('totalLearningTime', stats.totalLearningTime.toString());
        
        // Save detailed results
        const userResults = JSON.parse(localStorage.getItem('userQuizResults') || '[]');
        userResults.push({
            ...this.quizResults,
            moduleId: this.currentQuiz.moduleId,
            userId: window.currentUser?.email || 'anonymous'
        });
        localStorage.setItem('userQuizResults', JSON.stringify(userResults.slice(-50))); // Keep last 50 results
    }
}

// Initialize quiz engine
const quizEngine = new QuizEngine();
window.quizEngine = quizEngine;