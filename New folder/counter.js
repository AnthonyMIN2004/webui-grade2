let counter = 0;

function incrementCounter() {
    counter++;
    document.getElementById("counterValue").textContent = counter;
}

function reset() {
    counter = 0;
    document.getElementById("counterValue").textContent = counter;
}   