document.addEventListener('DOMContentLoaded', () => {
    const difficultySelect = document.getElementById('difficulty');
    const quizForm = document.getElementById('quiz-form');
    const questionContainer = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');
    const resultContainer = document.getElementById('result');
    const resultMessage = document.getElementById('result-message');
    const nextQuestionButton = document.getElementById('next-question');
    const resetScoreButton = document.getElementById('reset-score');
    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');

    let quizData = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    // Event listener for quiz form submission
    quizForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const difficulty = difficultySelect.value;
        quizData = await fetchQuizQuestions(difficulty);
        startQuiz();
    });

    // Function to fetch quiz questions based on difficulty
    async function fetchQuizQuestions(difficulty) {
        const apiUrl = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}&type=multiple`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.results;
    }

    // Function to start quiz
    function startQuiz() {
        quizForm.classList.add('hidden');
        questionContainer.classList.remove('hidden');
        loadQuestion();
    }

    // Function to load question and answers
    function loadQuestion() {
        const question = quizData[currentQuestionIndex];
        questionElement.innerHTML = decodeHTML(question.question);
        answersElement.innerHTML = '';
        const allAnswers = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(allAnswers); // Shuffle answers to display randomly

        allAnswers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.innerHTML = decodeHTML(answer); // Decode HTML entities
            answerButton.classList.add('btn', 'btn-primary');
            answerButton.addEventListener('click', () => checkAnswer(answer === question.correct_answer));
            answersElement.appendChild(answerButton);
        });
    }

    // Function to decode HTML entities
    function decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    // Function to check if selected answer is correct
    function checkAnswer(isCorrect) {
        if (isCorrect) {
            correctAnswers++;
            resultMessage.textContent = 'Correct!';
        } else {
            incorrectAnswers++;
            resultMessage.textContent = 'Incorrect!';
        }
        showResult();
    }

    // Function to display result and show next question or end quiz
    function showResult() {
        questionContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        updateScore();
    }

    // Function to update score display
    function updateScore() {
        resultMessage.textContent += ` Score: ${correctAnswers} correct, ${incorrectAnswers} incorrect.`;
        localStorage.setItem('quizScore', JSON.stringify({ correct: correctAnswers, incorrect: incorrectAnswers }));
    }

    // Event listener for next question button
    nextQuestionButton.addEventListener('click', () => {
        resultContainer.classList.add('hidden');
        questionContainer.classList.remove('hidden');
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    });

    // Function to end the quiz
    function endQuiz() {
        resultMessage.textContent = `Quiz ended. Final score: ${correctAnswers} correct, ${incorrectAnswers} incorrect.`;
        resultContainer.innerHTML += `<button id="restart-quiz">Restart Quiz</button>`;
        const restartButton = document.getElementById('restart-quiz');
        restartButton.addEventListener('click', () => {
            restartQuiz();
        });
    }

    // Function to restart the quiz
    function restartQuiz() {
        currentQuestionIndex = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        resultContainer.classList.add('hidden');
        quizForm.classList.remove('hidden');
    }

    // Event listener for reset score button
    resetScoreButton.addEventListener('click', () => {
        localStorage.removeItem('quizScore');
        correctAnswers = 0;
        incorrectAnswers = 0;
        restartQuiz();
    });

    // Shuffle array function (Fisher-Yates shuffle)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Check for previous quiz score in local storage on page load
    const quizScore = JSON.parse(localStorage.getItem('quizScore'));
    if (quizScore) {
        correctAnswers = quizScore.correct;
        incorrectAnswers = quizScore.incorrect;
        updateScore();
        quizForm.classList.add('hidden');
        endQuiz();
    }

    // Event listener for search functionality
    searchButton.addEventListener('click', () => {
        alert(`Searching for: ${searchInput.value}`);
    });
});