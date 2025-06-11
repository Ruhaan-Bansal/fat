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

  output.innerHTML = "<p>Loading questions...</p>";

  const data = await fetchQuestions(event);
  const mcqs = data.mcq.slice(0, mcqCount);
  const frqs = data.frq.slice(0, frqCount);

  output.innerHTML = "";

  if (mcqs.length) {
    output.innerHTML += `<h2 class="text-xl font-semibold">Multiple Choice Questions</h2>`;
    mcqs.forEach((item, i) => {
      output.innerHTML += `
        <div class="mb-4">
          <p class="font-medium">${i + 1}. ${item.q}</p>
          <ul class="list-disc ml-6">
            ${item.options.map(opt => `<li>${opt}</li>`).join("")}
          </ul>
        </div>
      `;
    });
  }

  if (frqs.length) {
    output.innerHTML += `<h2 class="text-xl font-semibold mt-4">Free Response Questions</h2>`;
    frqs.forEach((item, i) => {
      output.innerHTML += `
        <div class="mb-4">
          <p class="font-medium">${i + 1}. ${item}</p>
        </div>
      `;
    });
  }
});
