// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/mh69KXUKl/";

let model, webcam, labelContainer, maxPredictions;
let currentPredictions = [];
let userScore = 0;
let cpuScore = 0;

// Load the image model and setup the webcam
async function init() {
    const resultDisplay = document.getElementById("result");
    resultDisplay.textContent = "⌛ AIモデルを読み込み中...";

    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // 1. Load the model first
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // 2. Setup the webcam
        resultDisplay.textContent = "📷 カメラを起動中...";
        const flip = true;
        webcam = new tmImage.Webcam(200, 200, flip);
        
        // Using {} inside setup() is a trick to ensure more reliable camera activation 
        // across different browsers (Chrome, Safari, etc.)
        await webcam.setup({}); 
        await webcam.play();
        window.requestAnimationFrame(loop);

        // 3. Update the UI once ready
        const container = document.getElementById("webcam-container");
        if (container) {
            container.innerHTML = "";
            container.appendChild(webcam.canvas);
        }
        
        labelContainer = document.getElementById("label-container");
        if (labelContainer) {
            labelContainer.innerHTML = "";
            for (let i = 0; i < maxPredictions; i++) {
                labelContainer.appendChild(document.createElement("div"));
            }
        }

        document.getElementById("play-btn").disabled = false;
        resultDisplay.textContent = "✅ 準備完了！手を出してね。";
    } catch (err) {
        console.error("Initialization failed:", err);
        resultDisplay.textContent = "❌ エラー: " + (err.name === 'NotAllowedError' ? "カメラへのアクセスが拒否されました。" : err.message);
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    currentPredictions = prediction;
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(0) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

function playGame() {
    if (currentPredictions.length === 0) return;

    const best = currentPredictions.reduce((prev, current) => 
        (prev.probability > current.probability) ? prev : current
    );

    const userMove = best.className.toLowerCase();
    
    if (!["rock", "paper", "scissors"].includes(userMove)) {
        document.getElementById("result").textContent = "グー・チョキ・パーが見つかりません";
        return;
    }

    const moves = ["rock", "paper", "scissors"];
    const cpuMove = moves[Math.floor(Math.random() * 3)];
    
    // Define icons for the display
    const icons = {
        rock: "✊",
        paper: "✋",
        scissors: "✌️"
    };

    const jpMoves = {
        rock: "グー",
        paper: "パー",
        scissors: "チョキ"
    };

    // Update the CPU display
    document.getElementById("cpu-display").textContent = icons[cpuMove];

    let msg = "";
    if (userMove === cpuMove) {
        msg = `引き分け！ 二人とも${jpMoves[userMove]}でした。`;
    } else if (
        (userMove === "rock" && cpuMove === "scissors") ||
        (userMove === "paper" && cpuMove === "rock") ||
        (userMove === "scissors" && cpuMove === "paper")
    ) {
        msg = `あなたの勝ち！ ${jpMoves[userMove]}が${jpMoves[cpuMove]}に勝ちました！`;
        userScore++;
    } else {
        msg = `あなたの負け！ ${jpMoves[cpuMove]}が${jpMoves[userMove]}に勝ちました。`;
        cpuScore++;
    }

    document.getElementById("result").textContent = msg;
    document.getElementById("user-score").textContent = userScore;
    document.getElementById("cpu-score").textContent = cpuScore;
    
    // Call your UI function if you've set it up
    if (typeof updateUI === 'function') {
        updateUI(msg);
    }
}