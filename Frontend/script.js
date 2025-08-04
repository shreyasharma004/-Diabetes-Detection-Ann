// Place this function OUTSIDE the class, near the top of your script.js
async function getModelPrediction(data) {
    const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    // Adjust according to your backend response
    // If the backend returns probability [0,1], multiply by 100 and round
    // If the backend already returns percentage, remove the *100
    return Math.round(result.risk * 100); 
}

class DiabetesRiskAssessment {
    constructor() {
        this.form = document.getElementById('diabetesForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.progressFill = document.getElementById('progressFill');
        this.riskMeter = document.getElementById('riskMeter');
        this.meterFill = document.getElementById('meterFill');
        this.riskPercentage = document.getElementById('riskPercentage');
        this.riskLabel = document.getElementById('riskLabel');
        this.riskDetails = document.getElementById('riskDetails');
        this.riskIcon = document.getElementById('riskIcon');
        this.riskTitle = document.getElementById('riskTitle');
        this.riskDescription = document.getElementById('riskDescription');
        this.recommendationsList = document.getElementById('recommendationsList');

        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.form.addEventListener('input', () => this.updateProgress());
        this.updateProgress();
    }

    updateProgress() {
        const inputs = this.form.querySelectorAll('input[required]');
        const filledInputs = Array.from(inputs).filter(input => input.value.trim() !== '');
        const progress = (filledInputs.length / inputs.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Show loading state
        this.submitBtn.classList.add('loading');
        this.submitBtn.innerHTML = 'Calculating...';

        // Get form data
        const formData = new FormData(this.form);
        const data = {
            pregnancies: parseInt(formData.get('pregnancies')),
            glucose: parseInt(formData.get('glucose')),
            bloodPressure: parseInt(formData.get('bloodPressure')),
            skinThickness: parseInt(formData.get('skinThickness')),
            insulin: parseInt(formData.get('insulin')),
            bmi: parseFloat(formData.get('bmi')),
            diabetesPedigree: parseFloat(formData.get('diabetesPedigree')),
            age: parseInt(formData.get('age'))
        };

        // Get risk score from backend
        const riskScore = await getModelPrediction(data);

        // Show results
        this.displayResults(riskScore, data);

        // Reset button
        this.submitBtn.classList.remove('loading');
        this.submitBtn.innerHTML = '<span class="btn-text">Calculate Risk</span><i class="fas fa-calculator"></i>';
    }

    getRiskLevel(score) {
        if (score < 30) return 'low';
        if (score < 65) return 'medium';
        return 'high';
    }

    getRiskInfo(level, score) {
        const riskInfo = {
            low: {
                title: 'Low Risk',
                description: 'Based on your inputs, you have a relatively low risk of developing diabetes. Keep maintaining healthy lifestyle habits.',
                icon: 'fas fa-shield-alt',
                color: 'success'
            },
            medium: {
                title: 'Moderate Risk',
                description: 'Your assessment indicates a moderate risk for diabetes. Consider lifestyle improvements and regular health monitoring.',
                icon: 'fas fa-exclamation-triangle',
                color: 'warning'
            },
            high: {
                title: 'High Risk',
                description: 'Your results suggest a higher risk for diabetes. We strongly recommend consulting with a healthcare professional for proper evaluation.',
                icon: 'fas fa-exclamation-circle',
                color: 'error'
            }
        };

        return riskInfo[level];
    }

    getRecommendations(level, data) {
        const baseRecommendations = [
            'Maintain a balanced diet rich in vegetables, fruits, and whole grains',
            'Engage in regular physical activity - aim for 150 minutes per week',
            'Monitor your weight and maintain a healthy BMI',
            'Get regular health checkups and screenings'
        ];

        const specificRecommendations = {
            low: [
                'Continue your current healthy lifestyle',
                'Stay hydrated and limit sugary drinks',
                'Get adequate sleep (7-9 hours per night)',
                'Manage stress through relaxation techniques'
            ],
            medium: [
                'Consider consulting with a nutritionist for meal planning',
                'Increase physical activity gradually if currently sedentary',
                'Monitor blood glucose levels more frequently',
                'Limit processed foods and refined sugars',
                'Consider joining a diabetes prevention program'
            ],
            high: [
                'Schedule an appointment with your healthcare provider immediately',
                'Consider professional dietary counseling',
                'Implement a structured exercise program under medical guidance',
                'Monitor blood pressure and glucose levels regularly',
                'Discuss family history and genetic factors with your doctor',
                'Consider medication if recommended by your healthcare provider'
            ]
        };

        // Add specific recommendations based on individual risk factors
        const personalizedTips = [];

        if (data.bmi >= 25) {
            personalizedTips.push('Focus on gradual, sustainable weight loss');
        }

        if (data.glucose >= 100) {
            personalizedTips.push('Pay special attention to carbohydrate intake');
        }

        if (data.bloodPressure >= 80) {
            personalizedTips.push('Reduce sodium intake and manage blood pressure');
        }

        if (data.age > 45) {
            personalizedTips.push('Age-related risk requires more frequent health monitoring');
        }

        return [...baseRecommendations, ...specificRecommendations[level], ...personalizedTips];
    }

    displayResults(score, data) {
        const level = this.getRiskLevel(score);
        const riskInfo = this.getRiskInfo(level, score);
        const recommendations = this.getRecommendations(level, data);

        // Show results section with animation
        this.resultsSection.classList.add('show');

        // Update risk percentage and meter
        this.riskPercentage.textContent = `${score}%`;
        this.riskLabel.textContent = `${riskInfo.title}`;

        // Animate meter needle (0deg = left, 180deg = right)
        const rotation = (score / 100) * 180;
        this.meterFill.style.transform = `translate(-50%, -100%) rotate(${rotation}deg)`;

        // Update risk card
        const riskCard = this.riskDetails.querySelector('.risk-card');
        riskCard.className = `risk-card ${level}`;

        this.riskIcon.className = `risk-icon ${level}`;
        this.riskIcon.innerHTML = `<i class="${riskInfo.icon}"></i>`;

        this.riskTitle.textContent = riskInfo.title;
        this.riskDescription.textContent = riskInfo.description;

        // Update recommendations
        this.recommendationsList.innerHTML = recommendations
            .slice(0, 6) // Limit to 6 recommendations for better UX
            .map(rec => `<li>${rec}</li>`)
            .join('');

        // Scroll to results
        setTimeout(() => {
            this.resultsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);

        // Add analytics event (if you want to track usage)
        this.trackAnalytics(score, level, data);
    }

    trackAnalytics(score, level, data) {
        // Implement analytics tracking here if needed
        console.log('Risk Assessment Completed:', {
            score,
            level,
            timestamp: new Date().toISOString(),
            // Don't log personal health data in production
        });
    }
}

// ------ Rest of your code (form enhancements etc.) remains unchanged ------

class FormEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.addInputValidation();
        this.addTooltips();
        this.addKeyboardNavigation();
    }

    addInputValidation() {
        const inputs = document.querySelectorAll('input[type="number"]');

        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateInput(e.target));
            input.addEventListener('input', (e) => this.formatInput(e.target));
        });
    }

    validateInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        // Remove any existing validation classes
        input.classList.remove('invalid', 'valid');

        if (isNaN(value) || value < min || value > max) {
            input.classList.add('invalid');
            this.showValidationMessage(input, `Please enter a value between ${min} and ${max}`);
        } else {
            input.classList.add('valid');
            this.hideValidationMessage(input);
        }
    }

    formatInput(input) {
        // Auto-format BMI and Diabetes Pedigree Function to proper decimal places
        if (input.id === 'bmi' && input.value) {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                input.value = value.toFixed(1);
            }
        }

        if (input.id === 'diabetesPedigree' && input.value) {
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                input.value = value.toFixed(3);
            }
        }
    }

    showValidationMessage(input, message) {
        let errorElement = input.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    hideValidationMessage(input) {
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    addTooltips() {
        const tooltips = {
            pregnancies: 'Number of times pregnant (0 if never pregnant)',
            glucose: 'Plasma glucose concentration a 2 hours in an oral glucose tolerance test',
            bloodPressure: 'Diastolic blood pressure (mm Hg)',
            skinThickness: 'Triceps skin fold thickness (mm)',
            insulin: '2-Hour serum insulin (mu U/ml)',
            bmi: 'Body mass index (weight in kg/(height in m)^2)',
            diabetesPedigree: 'Diabetes pedigree function - a score of genetic influence',
            age: 'Age in years'
        };

        Object.entries(tooltips).forEach(([id, tooltip]) => {
            const input = document.getElementById(id);
            if (input) {
                input.title = tooltip;
            }
        });
    }

    addKeyboardNavigation() {
        const form = document.getElementById('diabetesForm');

        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
                const inputs = Array.from(form.querySelectorAll('input'));
                const currentIndex = inputs.indexOf(e.target);
                const nextInput = inputs[currentIndex + 1];

                if (nextInput) {
                    nextInput.focus();
                } else {
                    document.getElementById('submitBtn').focus();
                }
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DiabetesRiskAssessment();
    new FormEnhancements();

    // Add some nice entrance animations
    setTimeout(() => {
        document.querySelector('.header-content').classList.add('fade-in');
    }, 100);

    setTimeout(() => {
        document.querySelector('.form-section').classList.add('slide-up');
    }, 300);

    setTimeout(() => {
        document.querySelector('.info-section').classList.add('fade-in');
    }, 500);
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add resize handler for responsive meter
window.addEventListener('resize', () => {
    // Recalculate meter dimensions if needed
    const meter = document.getElementById('riskMeter');
    if (meter && window.innerWidth < 768) {
        meter.style.transform = 'scale(0.8)';
    } else if (meter) {
        meter.style.transform = 'scale(1)';
    }
});
