// frontend/src/components/PersonalityQuiz.tsx
import React, { useState } from 'react';
import { ChevronLeft, Brain } from 'lucide-react';
import type { PersonalityResults } from '../types';

interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  options: {
    text: string;
    value: number;
    trait: string;
  }[];
}

const personalityQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "When choosing a book, I prefer...",
    category: "reading_preference",
    options: [
      { text: "Complex, challenging narratives", value: 5, trait: "openness" },
      { text: "Familiar genres I know I'll enjoy", value: 3, trait: "conscientiousness" },
      { text: "Popular bestsellers", value: 2, trait: "extraversion" },
      { text: "Unique, experimental stories", value: 4, trait: "openness" }
    ]
  },
  {
    id: 2,
    question: "I'm most drawn to stories with...",
    category: "content_preference",
    options: [
      { text: "Deep character development", value: 5, trait: "agreeableness" },
      { text: "Fast-paced action", value: 4, trait: "extraversion" },
      { text: "Emotional depth and complexity", value: 4, trait: "neuroticism" },
      { text: "Clear moral lessons", value: 3, trait: "conscientiousness" }
    ]
  },
  {
    id: 3,
    question: "When reading, I prefer...",
    category: "reading_style",
    options: [
      { text: "Complete silence", value: 2, trait: "introversion" },
      { text: "Background music", value: 3, trait: "openness" },
      { text: "Busy environments like cafes", value: 4, trait: "extraversion" },
      { text: "Nature sounds", value: 3, trait: "agreeableness" }
    ]
  },
  {
    id: 4,
    question: "I'm most likely to finish a book if...",
    category: "completion_style",
    options: [
      { text: "I set a specific reading schedule", value: 5, trait: "conscientiousness" },
      { text: "The story grabs me immediately", value: 4, trait: "openness" },
      { text: "Friends are also reading it", value: 3, trait: "extraversion" },
      { text: "It helps me understand myself better", value: 4, trait: "neuroticism" }
    ]
  },
  {
    id: 5,
    question: "My ideal book length is...",
    category: "length_preference",
    options: [
      { text: "Short stories or novellas (under 200 pages)", value: 2, trait: "efficiency" },
      { text: "Standard novels (200-400 pages)", value: 3, trait: "balanced" },
      { text: "Epic novels (400+ pages)", value: 4, trait: "conscientiousness" },
      { text: "It doesn't matter if the story is good", value: 5, trait: "openness" }
    ]
  },
  // Add more questions...
];

export const PersonalityQuiz: React.FC<{
  onComplete: (results: PersonalityResults) => void;
}> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswer = (questionId: number, option: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));

    if (currentQuestion < personalityQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    setIsCompleted(true);

    // Calculate personality scores
    const results = calculatePersonalityScores(answers);

    // Send results to backend for analysis
    try {
      const response = await fetch('/api/personality/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ answers, results })
      });

      if (response.ok) {
        const analysisResults = await response.json();
        onComplete(analysisResults);
      }
    } catch (error) {
      console.error('Failed to submit personality quiz:', error);
    }
  };

  const calculatePersonalityScores = (answers: Record<number, any>) => {
    const traits = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    const traitCounts = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    Object.values(answers).forEach((answer: any) => {
      if (traits.hasOwnProperty(answer.trait)) {
        traits[answer.trait as keyof typeof traits] += answer.value;
        traitCounts[answer.trait as keyof typeof traitCounts]++;
      }
    });

    // Normalize scores
    Object.keys(traits).forEach(trait => {
      const key = trait as keyof typeof traits;
      if (traitCounts[key] > 0) {
        traits[key] = traits[key] / (traitCounts[key] * 5); // Normalize to 0-1
      }
    });

    return traits;
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / personalityQuestions.length) * 100;

  if (isCompleted) {
    return (
      <div className="personality-quiz-complete">
        <div className="completion-animation">
          <Brain className="w-16 h-16 text-amber-600 animate-pulse" />
          <h3>Analyzing Your Reading Personality...</h3>
          <p>We're processing your responses to create personalized recommendations.</p>
        </div>
      </div>
    );
  }

  const question = personalityQuestions[currentQuestion];

  return (
    <div className="personality-quiz">
      <div className="quiz-header">
        <h2>Reading Personality Assessment</h2>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">
          Question {currentQuestion + 1} of {personalityQuestions.length}
        </span>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <h3>{question.question}</h3>

          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className="option-button"
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="nav-button"
          >
            <ChevronLeft /> Back
          </button>

          <span className="question-counter">
            {currentQuestion + 1} / {personalityQuestions.length}
          </span>
        </div>
      </div>
    </div>
  );
};
