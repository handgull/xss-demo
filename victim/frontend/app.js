const saveTokenBtn = document.getElementById("token-btn");
const badCodeBtn = document.getElementById("bad-code-btn");
const userInput = document.getElementById("new-bad-code");
const inputForm = document.querySelector("form");
const userOutputElement = document.getElementById("user-output");

badCodeBtn.addEventListener("click", renderUserOutput);
saveTokenBtn.addEventListener("click", getToken);

inputForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const enteredScript = userInput.value;

  sendUserInput(enteredScript);
});

function renderUserOutput() {
  fetch("/bad-code")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      userOutputElement.innerHTML = data.badCode;
    });
}

function getToken() {
  fetch("/get-token")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      localStorage.setItem("token", data.token);
    });
}

function sendUserInput(enteredScript) {
  fetch("/inject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "badCode": enteredScript }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}
