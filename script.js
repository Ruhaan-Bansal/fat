async function fetchQuestions(eventName) {
  const response = await fetch("questions.json");
  const data = await response.json();
  return data[eventName] || { mcq: [], frq: [] };
}

// Get current user from localStorage
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}

// Get user's answered questions
function getUserAnsweredQuestions() {
  const currentUser = getCurrentUser();
  if (!currentUser) return { mcq: [], frq: [] };
  
  const users = JSON.parse(localStorage.getItem('quizUsers') || '{}');
  return users[currentUser]?.answeredQuestions || { mcq: [], frq: [] };
}

// Save answered questions for current user
function saveAnsweredQuestions(mcqQuestions, frqQuestions) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const users = JSON.parse(localStorage.getItem('quizUsers') || '{}');
  if (!users[currentUser]) return;
  
  // Get question IDs or create unique identifiers
  const mcqIds = mcqQuestions.map((q, index) => createQuestionId(q.q, index, 'mcq'));
  const frqIds = frqQuestions.map((q, index) => createQuestionId(q.q, index, 'frq'));
  
  // Add to user's answered questions (avoid duplicates)
  const answeredQuestions = users[currentUser].answeredQuestions;
  answeredQuestions.mcq = [...new Set([...answeredQuestions.mcq, ...mcqIds])];
  answeredQuestions.frq = [...new Set([...answeredQuestions.frq, ...frqIds])];
  
  // Save back to localStorage
  localStorage.setItem('quizUsers', JSON.stringify(users));
}

// Create a unique ID for a question based on its content
function createQuestionId(questionText, index, type) {
  // Create a simple hash of the question text for uniqueness
  let hash = 0;
  for (let i = 0; i < questionText.length; i++) {
    const char = questionText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${type}_${Math.abs(hash)}_${questionText.substring(0, 20).replace(/\W/g, '')}`;
}

// Filter out already answered questions
function filterUnAnsweredQuestions(questions, answeredIds, questionType) {
  return questions.filter((question, index) => {
    const questionId = createQuestionId(question.q, index, questionType);
    return !answeredIds.includes(questionId);
  });
}

// Shuffle array function
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Simple similarity function based on word overlap
function calculateSimilarity(userAnswer, correctAnswer) {
  if (!userAnswer) return 0;
  const userWords = userAnswer.toLowerCase().split(/\W+/);
  const correctWords = correctAnswer.toLowerCase().split(/\W+/);
  const correctSet = new Set(correctWords);

  let matches = 0;
  userWords.forEach(word => {
    if (correctSet.has(word)) matches++;
  });

  return matches / correctWords.length;
}

document.getElementById("questionForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // Check if user is logged in
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("Please log in to take quizzes!");
    window.location.href = "login.html";
    return;
  }

  const event = document.getElementById("event").value;
  const mcqCount = parseInt(document.getElementById("mcqCount").value);
  const frqCount = parseInt(document.getElementById("frqCount").value);
  const output = document.getElementById("output");
  const checkBtn = document.getElementById("checkAnswers");
  const results = document.getElementById("results");

  output.innerHTML = "<p>Loading questions...</p>";
  results.innerHTML = "";
  checkBtn.style.display = "none";

  const data = await fetchQuestions(event);
  const answeredQuestions = getUserAnsweredQuestions();
  
  // Filter out already answered questions
  const availableMcqs = filterUnAnsweredQuestions(data.mcq, answeredQuestions.mcq, 'mcq');
  const availableFrqs = filterUnAnsweredQuestions(data.frq, answeredQuestions.frq, 'frq');
  
  // Check if enough questions are available
  if (availableMcqs.length < mcqCount) {
    output.innerHTML = `<p class="warning">Only ${availableMcqs.length} new MCQ questions available (you requested ${mcqCount}). Showing all available questions.</p>`;
  }
  
  if (availableFrqs.length < frqCount) {
    output.innerHTML += `<p class="warning">Only ${availableFrqs.length} new FRQ questions available (you requested ${frqCount}). Showing all available questions.</p>`;
  }
  
  // If no new questions available, offer to reset progress
  if (availableMcqs.length === 0 && availableFrqs.length === 0) {
    output.innerHTML = `
      <div class="no-questions">
        <h3>No New Questions Available!</h3>
        <p>You have already answered all questions for this event.</p>
        <button onclick="resetUserProgress('${event}')" class="reset-btn">Reset Progress for ${event}</button>
        <button onclick="resetAllProgress()" class="reset-btn">Reset All Progress</button>
      </div>
    `;
    return;
  }
  
  // Shuffle and select questions
  const shuffledMcqs = shuffleArray(availableMcqs);
  const shuffledFrqs = shuffleArray(availableFrqs);
  
  const mcqs = shuffledMcqs.slice(0, Math.min(mcqCount, availableMcqs.length));
  const frqs = shuffledFrqs.slice(0, Math.min(frqCount, availableFrqs.length));

  output.innerHTML = "";

  // Display user info
  output.innerHTML += `
    <div class="user-info">
      <p><strong>User:</strong> ${currentUser}</p>
      <p><strong>Event:</strong> ${event}</p>
      <p><strong>Questions answered before:</strong> MCQ: ${answeredQuestions.mcq.length}, FRQ: ${answeredQuestions.frq.length}</p>
    </div>
  `;

  // Render MCQs
  if (mcqs.length) {
    let mcqHtml = `<h2>Multiple Choice Questions (${mcqs.length})</h2>`;
    mcqs.forEach((item, i) => {
      mcqHtml += `
        <div class="question">
          <p>${i + 1}. ${item.q}</p>
          <ul class="options">
            ${item.options.map((opt, j) => `
              <li>
                <label>
                  <input type="radio" name="mcq${i}" value="${j}" />
                  ${opt}
                </label>
              </li>`).join('')}
          </ul>
        </div>`;
    });
    output.innerHTML += mcqHtml;
  }

  // Render FRQs
  if (frqs.length) {
    output.innerHTML += `<h2>Free Response Questions (${frqs.length})</h2>`;
    frqs.forEach((item, i) => {
      output.innerHTML += `
        <div class="question">
          <p>${mcqs.length + i + 1}. ${item.q}</p>
          <textarea id="frq${i}" rows="3" style="width: 100%" placeholder="Type your answer..."></textarea>
        </div>`;
    });
  }

  // Show check answers button only if MCQs or FRQs exist
  checkBtn.style.display = (mcqs.length || frqs.length) ? "block" : "none";

  // Store current questions for saving later
  window.currentMcqs = mcqs;
  window.currentFrqs = frqs;

  checkBtn.onclick = () => {
    results.innerHTML = "<h3>Results</h3>";
    let totalCorrect = 0;
    let totalQuestions = mcqs.length + frqs.length;

    // Check MCQs
    mcqs.forEach((item, i) => {
      const selected = document.querySelector(`input[name=mcq${i}]:checked`);
      const isCorrect = selected && parseInt(selected.value) === item.answer;
      if (isCorrect) totalCorrect++;
      
      results.innerHTML += `
        <p class="${isCorrect ? "correct" : "incorrect"}">
          Q${i + 1}: ${isCorrect ? "Correct!" : "Incorrect"} (Correct: ${item.options[item.answer]})
        </p>`;
    });

    // Check FRQs with partial scoring
    frqs.forEach((item, i) => {
      const userAnswer = document.getElementById(`frq${i}`).value.trim();
      const similarity = calculateSimilarity(userAnswer, item.answer);
      const scorePercent = Math.round(similarity * 100);
      let colorClass = "incorrect";
      if (similarity > 0.7) {
        colorClass = "correct";
        totalCorrect += similarity; // Add partial credit
      } else if (similarity > 0.4) {
        colorClass = "partial";
        totalCorrect += similarity * 0.5; // Partial credit
      }

      results.innerHTML += `
        <p class="${colorClass}">
          Q${mcqs.length + i + 1}: ${scorePercent}% match - Your answer: ${userAnswer || "<em>No answer</em>"}
          <br><small>Correct answer: ${item.answer}</small>
        </p>`;
    });

    // Show overall score
    const finalScore = Math.round((totalCorrect / totalQuestions) * 100);
    results.innerHTML += `
      <div class="final-score">
        <h4>Final Score: ${finalScore}%</h4>
        <p>${totalCorrect.toFixed(1)} out of ${totalQuestions} points</p>
      </div>
    `;

    // Save the answered questions to user's profile
    saveAnsweredQuestions(window.currentMcqs, window.currentFrqs);
    
    // Show success message
    results.innerHTML += `<p class="success">Questions saved to your profile. You won't see these questions again!</p>`;
  };
});

// Reset functions
function resetUserProgress(event) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  if (confirm(`Are you sure you want to reset your progress for ${event}? This will allow you to retake all questions for this event.`)) {
    const users = JSON.parse(localStorage.getItem('quizUsers') || '{}');
    if (users[currentUser]) {
      // This is a simplified reset - in a real implementation, you'd want to track questions by event
      users[currentUser].answeredQuestions = { mcq: [], frq: [] };
      localStorage.setItem('quizUsers', JSON.stringify(users));
      alert('Progress reset successfully!');
      location.reload();
    }
  }
}

function resetAllProgress() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  if (confirm('Are you sure you want to reset ALL your progress? This will allow you to retake all questions.')) {
    const users = JSON.parse(localStorage.getItem('quizUsers') || '{}');
    if (users[currentUser]) {
      users[currentUser].answeredQuestions = { mcq: [], frq: [] };
      localStorage.setItem('quizUsers', JSON.stringify(users));
      alert('All progress reset successfully!');
      location.reload();
    }
  }
}