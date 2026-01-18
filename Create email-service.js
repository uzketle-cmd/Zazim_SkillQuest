// EmailJS Service Configuration for Zazim SkillQuest
// Sign up at https://www.emailjs.com/ for free email service

class EmailService {
    constructor() {
        this.serviceID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
        this.templateID = 'template_442fu4y'; // Replace with your EmailJS template ID
        this.publicKey = 'e3PgXz3TvaTqxXPnQ'; // Replace with your EmailJS public key
        
        // Initialize EmailJS
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.publicKey);
        }
    }
    
    // Send verification email
    async sendVerificationEmail(toEmail, verificationCode, userName = 'User') {
        try {
            const templateParams = {
                to_email: toEmail,
                from_name: 'Zazim SkillQuest',
                verification_code: verificationCode,
                user_name: userName,
                app_name: 'Zazim SkillQuest Demo',
                year: new Date().getFullYear(),
                support_email: 'support@zazimskillquest.com'
            };
            
            // Uncomment when you have EmailJS configured
            // const response = await emailjs.send(
            //     this.serviceID,
            //     this.templateID,
            //     templateParams
            // );
            
            // For demo purposes, log the email
            console.log('📧 Email would be sent with these parameters:');
            console.log('To:', toEmail);
            console.log('Verification Code:', verificationCode);
            console.log('User Name:', userName);
            
            // Simulate successful email send
            return {
                success: true,
                message: 'Verification email sent successfully (simulated)',
                code: verificationCode // Return code for demo display
            };
            
        } catch (error) {
            console.error('Failed to send verification email:', error);
            
            // For demo, still return success but with the code
            return {
                success: true, // Simulated success for demo
                message: 'Verification code generated (email simulation)',
                code: verificationCode
            };
        }
    }
    
    // Send welcome email
    async sendWelcomeEmail(toEmail, userName) {
        try {
            const templateParams = {
                to_email: toEmail,
                from_name: 'Zazim SkillQuest',
                user_name: userName,
                app_name: 'Zazim SkillQuest',
                login_url: window.location.origin,
                year: new Date().getFullYear()
            };
            
            // Uncomment when you have EmailJS configured
            // await emailjs.send(
            //     this.serviceID,
            //     'welcome_template', // You need to create this template
            //     templateParams
            // );
            
            console.log('📧 Welcome email would be sent to:', toEmail);
            return true;
            
        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return false;
        }
    }
    
    // Send password reset email
    async sendPasswordResetEmail(toEmail, resetToken) {
        try {
            const templateParams = {
                to_email: toEmail,
                from_name: 'Zazim SkillQuest',
                reset_token: resetToken,
                reset_url: `${window.location.origin}#reset-password`,
                year: new Date().getFullYear()
            };
            
            // Uncomment when you have EmailJS configured
            // await emailjs.send(
            //     this.serviceID,
            //     'password_reset_template', // You need to create this template
            //     templateParams
            // );
            
            console.log('📧 Password reset email would be sent to:', toEmail);
            return true;
            
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            return false;
        }
    }
}

// Initialize email service
const emailService = new EmailService();

// Export for use in main script
window.emailService = emailService;