async function fetchQuestions(eventName) {
  const response = await fetch("questions.json");
  const data = await response.json();
  return data[eventName] || { mcq: [], frq: [] };
}

document.getElementById("questionForm").addEventListener("submit", async function (e) {
  e.preventDefault();

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
  const mcqs = data.mcq.slice(0, mcqCount);
  const frqs = data.frq.slice(0, frqCount);

  output.innerHTML = "";
  let mcqHtml = "";

  if (mcqs.length) {
    mcqHtml += `<h2>Multiple Choice Questions</h2>`;
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
              </li>`).join("")}
          </ul>
        </div>`;
    });
    output.innerHTML += mcqHtml;
  }

  if (frqs.length) {
    output.innerHTML += `<h2>Free Response Questions</h2>`;
    frqs.forEach((item, i) => {
      output.innerHTML += `
        <div class="question">
          <p>${i + 1}. ${item}</p>
          <textarea rows="3" style="width: 100%" placeholder="Type your answer..."></textarea>
        </div>`;
    });
  }

  checkBtn.style.display = mcqs.length ? "block" : "none";

  checkBtn.onclick = () => {
    results.innerHTML = "<h3>Results</h3>";
    mcqs.forEach((item, i) => {
      const selected = document.querySelector(`input[name=mcq${i}]:checked`);
      const isCorrect = selected && parseInt(selected.value) === item.answer;
      results.innerHTML += `
        <p class="${isCorrect ? "correct" : "incorrect"}">
          Q${i + 1}: ${isCorrect ? "Correct!" : "Incorrect"} (Correct: ${item.options[item.answer]})
        </p>
      `;
    });
  };
});
