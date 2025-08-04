document.addEventListener("DOMContentLoaded", () => {
  const counterButton = document.getElementById("counter");
  let counter = 0;

  function setCounter(count) {
    counter = count;
    counterButton.textContent = `count is ${counter}`;
  }

  counterButton.addEventListener("click", () => {
    setCounter(counter + 1);
  });

  setCounter(0);
});
