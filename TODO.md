# TODO 🚧

### **1. Introduce Power-Ups and Bonuses**

**Objective:** Add interactive elements that provide temporary advantages or special effects to the player, such as speed boosts, shields, or score multipliers.

**Benefits:**

- **Enhanced Gameplay:** Power-ups add strategic depth and variety.
- **Increased Engagement:** Players are motivated to seek out power-ups, making the game more interactive.
- **Visual Interest:** Different power-ups can introduce new visual elements to the game.

---

#### **A. Define Power-Up Types**

Let's implement two types of power-ups:

1. **Speed Boost:** Temporarily increases the player's car speed.
2. **Shield:** Grants temporary invincibility against collisions.

#### **B. Add Power-Up Images**

Ensure you have images for each power-up type. For demonstration, we'll use placeholder images.

```html
<!-- Add within the <body> tag, preferably after the obstacleTruckImg -->
<!-- Load Power-Up Sprites -->
<script>
  const speedBoostImg = new Image();
  const shieldImg = new Image();

  speedBoostImg.src =
    "https://cdn.glitch.global/your-project-id/speed-boost.png"; // Replace with actual URL
  shieldImg.src = "https://cdn.glitch.global/your-project-id/shield.png"; // Replace with actual URL

  // Update totalImages count and load handlers
  const totalImages = 5; // Existing 3 + 2 power-ups

  speedBoostImg.onload = checkAllImagesLoaded;
  shieldImg.onload = checkAllImagesLoaded;

  speedBoostImg.onerror = onImageError;
  shieldImg.onerror = onImageError;
</script>
```

**Note:** Replace `'https://cdn.glitch.global/your-project-id/speed-boost.png'` and `'https://cdn.glitch.global/your-project-id/shield.png'` with the actual URLs of your power-up images.

#### **C. Define Power-Up Properties and Management**

Add the following code to manage power-ups within your game:

```javascript
// Power-Up Variables
let powerUps = [];
const powerUpTypes = ["speed", "shield"];
const powerUpWidth = 30;
const powerUpHeight = 30;
const powerUpSpeed = 2; // Speed at which power-ups descend

// Power-Up Images
const powerUpImages = {
  speed: speedBoostImg,
  shield: shieldImg,
};

// Power-Up Class
class PowerUp {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = powerUpWidth;
    this.height = powerUpHeight;
    this.image = powerUpImages[type];
    this.collected = false;
  }

  update() {
    this.y += powerUpSpeed;
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

// Function to Spawn Power-Ups
function spawnPowerUp() {
  const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  const lane = Math.floor(Math.random() * lanes.length);
  const x = lanes[lane] - powerUpWidth / 2;
  const y = -powerUpHeight;
  powerUps.push(new PowerUp(type, x, y));
}

// Integrate Power-Up Spawning in the Game Loop
function gameLoop() {
  if (!isGameRunning || isPaused) return; // Stop the loop if the game is not running or is paused

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw moving gradient background
  drawMovingGradient();

  // Draw and move road stripes
  ctx.fillStyle = "yellow";
  for (let i = 0; i < stripes.length; i++) {
    const stripe = stripes[i];
    stripe.y += stripeSpeed;
    ctx.fillRect(
      stripe.x - stripeWidth - 2,
      stripe.y,
      stripeWidth,
      stripeHeight
    ); // Left line
    ctx.fillRect(
      stripe.x + stripeWidth + 2,
      stripe.y,
      stripeWidth,
      stripeHeight
    ); // Right line

    // Reset stripe position when out of view
    if (stripe.y > canvas.height) {
      stripe.y = -stripeHeight;
    }
  }

  // Update car lane smoothly
  if (leftPressed && targetLane > 0) {
    targetLane--;
    leftPressed = false;
  } else if (rightPressed && targetLane < lanes.length - 1) {
    targetLane++;
    rightPressed = false;
  }

  if (currentLane !== targetLane) {
    if (laneTransition < 1) {
      laneTransition += laneTransitionSpeed / 100;
    } else {
      laneTransition = 0;
      currentLane = targetLane;
    }
  }

  const carX =
    lanes[currentLane] * (1 - laneTransition) +
    lanes[targetLane] * laneTransition;

  // Draw player car
  ctx.drawImage(
    playerCarImg,
    carX - carWidth / 2,
    canvas.height - carHeight - 10,
    carWidth,
    carHeight
  );

  // Update and Draw Health Bar
  updateHealthBar();

  // Draw score on canvas at top-center to avoid overlapping with pause button
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center"; // Center the text horizontally
  ctx.fillText("Score: " + score, canvas.width / 2, 30);
  ctx.fillText("High Score: " + highScore, canvas.width / 2, 60);
  ctx.textAlign = "start"; // Reset alignment to default

  // Draw and move obstacles
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.y += obs.speed;
    ctx.save();
    ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
    if (obs.speed > 5) {
      ctx.rotate(Math.PI); // Rotate for oncoming obstacles
    }
    ctx.drawImage(
      obs.image,
      -obs.width / 2,
      -obs.height / 2,
      obs.width,
      obs.height
    );
    ctx.restore();

    // Check for collision
    if (
      carX - carWidth / 2 < obs.x + obs.width &&
      carX + carWidth / 2 > obs.x &&
      canvas.height - carHeight - 10 < obs.y + obs.height &&
      canvas.height - 10 > obs.y
    ) {
      health -= 1;
      // Create particles at collision point
      createParticles(carX, canvas.height - carHeight - 10);

      // Play collision sound
      collisionSound.currentTime = 0; // Reset sound to start
      collisionSound.play();

      obstacles.splice(i, 1);
      i--;
      if (health <= 0) {
        endGame();
        return;
      }
    }
  }

  // Remove obstacles that are out of view
  obstacles = obstacles.filter((obs) => obs.y < canvas.height);

  // Spawn new obstacles
  if (Math.random() < 0.02 * difficultyLevel) {
    // Adjust spawn rate with difficulty
    if (obstacles.length < 10) {
      // Increased limit for more obstacles
      const lane = Math.floor(Math.random() * lanes.length);
      let obstacleX;
      let obstacleSpeed;
      let obstacleType = Math.random() < 0.7 ? "car" : "truck"; // 70% cars, 30% trucks

      if (obstacleType === "car") {
        obstacleX = lanes[lane] - obstacleWidth / 2;
        obstacleSpeed = Math.random() * 3 + 4 + difficultyLevel; // Base speed + difficulty
        obstacles.push({
          x: obstacleX,
          y: -obstacleHeight,
          speed: obstacleSpeed,
          image: obstacleCarImg,
          width: obstacleWidth,
          height: obstacleHeight,
        });
      } else {
        const truckWidth = 40;
        const truckHeight = 60;
        obstacleX = lanes[lane] - truckWidth / 2;
        obstacleSpeed = Math.random() * 2 + 3 + difficultyLevel; // Slightly slower
        obstacles.push({
          x: obstacleX,
          y: -truckHeight,
          speed: obstacleSpeed,
          image: obstacleTruckImg,
          width: truckWidth,
          height: truckHeight,
        });
      }
    }
  }

  // Spawn power-ups at intervals
  if (Math.random() < 0.005 * difficultyLevel) {
    // Adjust spawn rate with difficulty
    spawnPowerUp();
  }

  // Update and Draw Power-Ups
  for (let i = 0; i < powerUps.length; i++) {
    const pu = powerUps[i];
    pu.update();
    pu.draw();

    // Check for collection
    if (
      carX - carWidth / 2 < pu.x + pu.width &&
      carX + carWidth / 2 > pu.x &&
      canvas.height - carHeight - 10 < pu.y + pu.height &&
      canvas.height - 10 > pu.y
    ) {
      activatePowerUp(pu.type);
      powerUps.splice(i, 1);
      i--;
    }

    // Remove power-ups that are out of view
    if (pu.y > canvas.height) {
      powerUps.splice(i, 1);
      i--;
    }
  }

  // Activate and Manage Active Power-Ups
  manageActivePowerUps();

  // Difficulty Scaling
  if (Date.now() - lastDifficultyIncreaseTime > difficultyIncreaseInterval) {
    difficultyLevel++;
    stripeSpeed += 0.5; // Increase stripe speed
    lastDifficultyIncreaseTime = Date.now();
    console.log("Difficulty increased to level:", difficultyLevel);
  }

  // Update and Draw Particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.update();
    p.draw();

    // Remove particles that are fully transparent
    if (p.opacity <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }

  // Increase score
  score++;

  requestAnimationFrame(gameLoop);
}
```

#### **D. Define Active Power-Ups and Their Effects**

To manage active power-ups, introduce an array to track them and implement their effects.

```javascript
// Active Power-Ups Array
let activePowerUps = [];
const powerUpDuration = 5000; // 5 seconds duration for each power-up

// Function to Activate Power-Up
function activatePowerUp(type) {
  if (type === "speed") {
    // Increase car speed temporarily
    stripeSpeed += 2; // Example: Increase stripe speed
    activePowerUps.push({
      type: "speed",
      endTime: Date.now() + powerUpDuration,
    });
  } else if (type === "shield") {
    // Activate shield
    isShieldActive = true;
    activePowerUps.push({
      type: "shield",
      endTime: Date.now() + powerUpDuration,
    });
  }
}

// Function to Manage Active Power-Ups
function manageActivePowerUps() {
  const currentTime = Date.now();
  for (let i = 0; i < activePowerUps.length; i++) {
    const pu = activePowerUps[i];
    if (currentTime > pu.endTime) {
      // Deactivate power-up
      if (pu.type === "speed") {
        stripeSpeed -= 2; // Revert stripe speed
      } else if (pu.type === "shield") {
        isShieldActive = false;
      }
      activePowerUps.splice(i, 1);
      i--;
    }
  }
}

// Shield Status Variable
let isShieldActive = false;

// Modify Collision Detection to Account for Shield
if (
  !isShieldActive &&
  carX - carWidth / 2 < obs.x + obs.width &&
  carX + carWidth / 2 > obs.x &&
  canvas.height - carHeight - 10 < obs.y + obs.height &&
  canvas.height - 10 > obs.y
) {
  health -= 1;
  // Create particles at collision point
  createParticles(carX, canvas.height - carHeight - 10);

  // Play collision sound
  collisionSound.currentTime = 0; // Reset sound to start
  collisionSound.play();

  obstacles.splice(i, 1);
  i--;
  if (health <= 0) {
    endGame();
    return;
  }
} else if (
  isShieldActive &&
  carX - carWidth / 2 < obs.x + obs.width &&
  carX + carWidth / 2 > obs.x &&
  canvas.height - carHeight - 10 < obs.y + obs.height &&
  canvas.height - 10 > obs.y
) {
  // Optional: Flash shield or provide feedback
  obstacles.splice(i, 1);
  i--;
}
```

**Explanation:**

- **`activePowerUps` Array:** Keeps track of currently active power-ups and their expiration times.
- **`activatePowerUp(type)`:** Activates a power-up by applying its effect and adding it to the `activePowerUps` array with an end time.
- **`manageActivePowerUps()`:** Checks if any active power-ups have expired and reverts their effects accordingly.
- **`isShieldActive` Variable:** Indicates whether the shield is currently active, preventing damage from collisions.

#### **E. Visual Indicators for Active Power-Ups**

Provide visual feedback to players when a power-up is active, such as a glowing shield around the car.

```javascript
// Modify the drawPlayerCar section in the game loop
// After drawing the player car
if (isShieldActive) {
  ctx.save();
  ctx.strokeStyle = "rgba(0, 255, 255, 0.7)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(carX, canvas.height - carHeight / 2 - 10, carWidth, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
```

**Explanation:**

- When the shield is active, a semi-transparent cyan circle is drawn around the player's car, indicating invincibility.

---

### **2. Implement a Leaderboard**

**Objective:** Allow players to see and compare their scores with others, fostering competition and replayability.

**Benefits:**

- **Motivation:** Encourages players to achieve higher scores.
- **Community Engagement:** Builds a sense of community among players.
- **Replayability:** Players return to improve their standings.

**Implementation Steps:**

#### **A. Choose a Backend Service**

To store and retrieve leaderboard data, you can use services like:

- **Firebase Firestore:** Real-time database service by Google.
- **Local Server:** Set up a simple backend using Node.js, Express, and a database like MongoDB or SQLite.
- **Third-Party APIs:** Utilize existing leaderboard APIs.

For simplicity, we'll use **Firebase Firestore**.

#### **B. Set Up Firebase Firestore**

1. **Create a Firebase Project:**

   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Create a new project or use an existing one.

2. **Enable Firestore:**

   - In the Firebase console, navigate to **Firestore Database**.
   - Click **Create Database** and follow the prompts to set it up in **Production Mode**.

3. **Add Firebase SDK to Your Project:**

   - Include Firebase scripts in your HTML.

   ```html
   <!-- Add within the <head> tag -->
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
   ```

4. **Initialize Firebase:**

   ```javascript
   // Add your Firebase configuration
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
   };

   // Initialize Firebase
   firebase.initializeApp(firebaseConfig);
   const db = firebase.firestore();
   ```

**Note:** Replace the placeholder values in `firebaseConfig` with your actual Firebase project configuration. You can find these details in your Firebase project settings.

#### **C. Submit and Retrieve Scores**

```javascript
// Function to Submit Score
function submitScore(name, score) {
  db.collection("leaderboard")
    .add({
      name: name,
      score: score,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      console.log("Score submitted successfully!");
    })
    .catch((error) => {
      console.error("Error submitting score: ", error);
    });
}

// Function to Retrieve and Display Leaderboard
function displayLeaderboard() {
  db.collection("leaderboard")
    .orderBy("score", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      const leaderboard = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboard.push({ name: data.name, score: data.score });
      });
      // Display the leaderboard in the Game Over Screen
      const leaderboardHTML = leaderboard
        .map((entry) => `<p>${entry.name}: ${entry.score}</p>`)
        .join("");
      finalScoreText.innerHTML += `<h2>Leaderboard</h2>${leaderboardHTML}`;
    })
    .catch((error) => {
      console.error("Error fetching leaderboard: ", error);
    });
}

// Update the endGame function to handle leaderboard submission
function endGame() {
  isGameRunning = false;
  backgroundMusic.pause();

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    // Prompt for player's name and submit to leaderboard
    const playerName =
      prompt("New High Score! Enter your name:") || "Anonymous";
    submitScore(playerName, score);
  }
  finalScoreText.textContent = `Your Score: ${score}`;
  displayLeaderboard();
  gameOverScreen.classList.remove("hidden");
}
```

**Explanation:**

- **`submitScore(name, score)`:** Sends the player's name and score to the Firestore `leaderboard` collection.
- **`displayLeaderboard()`:** Retrieves the top 10 scores from Firestore and displays them in the Game Over screen.
- **`endGame()`:** Checks if the current score is a new high score. If so, prompts the player for their name and submits the score to the leaderboard.

**Security Consideration:**

- **Firestore Rules:** Ensure your Firestore rules prevent unauthorized access or malicious submissions. For public leaderboards, you might allow reads but restrict writes to authenticated users or implement validation.

#### **D. Enhance Leaderboard Display**

Customize the leaderboard display for better aesthetics and clarity.

```javascript
// Modify displayLeaderboard function to clear previous leaderboard entries
function displayLeaderboard() {
  db.collection("leaderboard")
    .orderBy("score", "desc")
    .limit(10)
    .get()
    .then((querySnapshot) => {
      let leaderboardHTML = "<h2>Leaderboard</h2>";
      querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        leaderboardHTML += `<p>${index + 1}. ${data.name}: ${data.score}</p>`;
      });
      finalScoreText.innerHTML += leaderboardHTML;
    })
    .catch((error) => {
      console.error("Error fetching leaderboard: ", error);
    });
}
```

**Enhancements:**

- **Numbered Entries:** Display ranks alongside player names and scores.
- **Styling:** Use CSS to style the leaderboard for better readability.

**Example CSS:**

```css
/* Add within the <style> tag */

#gameOverScreen p,
#gameOverScreen h2 {
  margin: 5px 0;
}
```

---

### **3. Add Different Game Modes**

**Objective:** Introduce various game modes to increase replayability and cater to different player preferences.

**Benefits:**

- **Variety:** Different modes keep the game fresh and engaging.
- **Challenge:** Modes can offer varying levels of difficulty or unique challenges.

**Implementation Steps:**

#### **A. Define Game Modes**

Let's implement two modes:

1. **Endless Mode:** The current game mode where the game continues indefinitely until the player loses.
2. **Time Attack Mode:** Players aim to achieve the highest score within a fixed time limit.

#### **B. Modify Start Menu to Select Game Mode**

```html
<!-- Modify the Start Menu to include game mode selection -->
<div id="startMenu">
  <h1>8-bit Car Racing Game</h1>
  <div>
    <button id="startEndless" class="menu-button">Endless Mode</button>
    <button id="startTimeAttack" class="menu-button">Time Attack Mode</button>
  </div>
</div>
```

#### **C. Update JavaScript to Handle Game Modes**

```javascript
// Game Mode Variables
let gameMode = "endless"; // Default mode
let timeLimit = 60000; // 60 seconds for Time Attack
let timeRemaining = timeLimit;
let gameStartTime;

// Update Start and Restart Functions
function startEndlessMode() {
  startMenu.classList.add("hidden");
  resetGame();
  gameMode = "endless";
  isGameRunning = true;
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
  gameStartTime = Date.now();
  gameLoop();
}

function startTimeAttackMode() {
  startMenu.classList.add("hidden");
  resetGame();
  gameMode = "timeAttack";
  isGameRunning = true;
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
  gameStartTime = Date.now();
  timeRemaining = timeLimit;
  gameLoop();
}

// Attach Event Listeners to Mode Buttons
const startEndlessButton = document.getElementById("startEndless");
const startTimeAttackButton = document.getElementById("startTimeAttack");

startEndlessButton.addEventListener("click", startEndlessMode);
startTimeAttackButton.addEventListener("click", startTimeAttackMode);

// Update Game Loop to Handle Time Attack Mode
function gameLoop() {
  if (!isGameRunning || isPaused) return; // Stop the loop if the game is not running or is paused

  // Calculate time remaining for Time Attack mode
  if (gameMode === "timeAttack") {
    const elapsedTime = Date.now() - gameStartTime;
    timeRemaining = timeLimit - elapsedTime;
    if (timeRemaining <= 0) {
      endGame();
      return;
    }
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw moving gradient background
  drawMovingGradient();

  // Draw and move road stripes
  ctx.fillStyle = "yellow";
  for (let i = 0; i < stripes.length; i++) {
    const stripe = stripes[i];
    stripe.y += stripeSpeed;
    ctx.fillRect(
      stripe.x - stripeWidth - 2,
      stripe.y,
      stripeWidth,
      stripeHeight
    ); // Left line
    ctx.fillRect(
      stripe.x + stripeWidth + 2,
      stripe.y,
      stripeWidth,
      stripeHeight
    ); // Right line

    // Reset stripe position when out of view
    if (stripe.y > canvas.height) {
      stripe.y = -stripeHeight;
    }
  }

  // Update car lane smoothly
  if (leftPressed && targetLane > 0) {
    targetLane--;
    leftPressed = false;
  } else if (rightPressed && targetLane < lanes.length - 1) {
    targetLane++;
    rightPressed = false;
  }

  if (currentLane !== targetLane) {
    if (laneTransition < 1) {
      laneTransition += laneTransitionSpeed / 100;
    } else {
      laneTransition = 0;
      currentLane = targetLane;
    }
  }

  const carX =
    lanes[currentLane] * (1 - laneTransition) +
    lanes[targetLane] * laneTransition;

  // Draw player car
  ctx.drawImage(
    playerCarImg,
    carX - carWidth / 2,
    canvas.height - carHeight - 10,
    carWidth,
    carHeight
  );

  // Update and Draw Health Bar
  updateHealthBar();

  // Draw score on canvas at top-center to avoid overlapping with pause button
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center"; // Center the text horizontally
  ctx.fillText("Score: " + score, canvas.width / 2, 30);
  if (gameMode === "timeAttack") {
    ctx.fillText(
      "Time: " + Math.ceil(timeRemaining / 1000) + "s",
      canvas.width / 2,
      60
    );
  } else {
    ctx.fillText("High Score: " + highScore, canvas.width / 2, 60);
  }
  ctx.textAlign = "start"; // Reset alignment to default

  // Draw and move obstacles
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    obs.y += obs.speed;
    ctx.save();
    ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
    if (obs.speed > 5) {
      ctx.rotate(Math.PI); // Rotate for oncoming obstacles
    }
    ctx.drawImage(
      obs.image,
      -obs.width / 2,
      -obs.height / 2,
      obs.width,
      obs.height
    );
    ctx.restore();

    // Check for collision
    if (
      !isShieldActive &&
      carX - carWidth / 2 < obs.x + obs.width &&
      carX + carWidth / 2 > obs.x &&
      canvas.height - carHeight - 10 < obs.y + obs.height &&
      canvas.height - 10 > obs.y
    ) {
      health -= 1;
      // Create particles at collision point
      createParticles(carX, canvas.height - carHeight - 10);

      // Play collision sound
      collisionSound.currentTime = 0; // Reset sound to start
      collisionSound.play();

      obstacles.splice(i, 1);
      i--;
      if (health <= 0) {
        endGame();
        return;
      }
    }
  }

  // Remove obstacles that are out of view
  obstacles = obstacles.filter((obs) => obs.y < canvas.height);

  // Spawn power-ups at intervals
  if (Math.random() < 0.005 * difficultyLevel) {
    // Adjust spawn rate with difficulty
    spawnPowerUp();
  }

  // Update and Draw Power-Ups
  for (let i = 0; i < powerUps.length; i++) {
    const pu = powerUps[i];
    pu.update();
    pu.draw();

    // Check for collection
    if (
      carX - carWidth / 2 < pu.x + pu.width &&
      carX + carWidth / 2 > pu.x &&
      canvas.height - carHeight - 10 < pu.y + pu.height &&
      canvas.height - 10 > pu.y
    ) {
      activatePowerUp(pu.type);
      powerUps.splice(i, 1);
      i--;
    }

    // Remove power-ups that are out of view
    if (pu.y > canvas.height) {
      powerUps.splice(i, 1);
      i--;
    }
  }

  // Activate and Manage Active Power-Ups
  manageActivePowerUps();

  // Spawn new obstacles
  if (Math.random() < 0.02 * difficultyLevel) {
    // Adjust spawn rate with difficulty
    if (obstacles.length < 10) {
      // Increased limit for more obstacles
      const lane = Math.floor(Math.random() * lanes.length);
      let obstacleX;
      let obstacleSpeed;
      let obstacleType = Math.random() < 0.7 ? "car" : "truck"; // 70% cars, 30% trucks

      if (obstacleType === "car") {
        obstacleX = lanes[lane] - obstacleWidth / 2;
        obstacleSpeed = Math.random() * 3 + 4 + difficultyLevel; // Base speed + difficulty
        obstacles.push({
          x: obstacleX,
          y: -obstacleHeight,
          speed: obstacleSpeed,
          image: obstacleCarImg,
          width: obstacleWidth,
          height: obstacleHeight,
        });
      } else {
        const truckWidth = 40;
        const truckHeight = 60;
        obstacleX = lanes[lane] - truckWidth / 2;
        obstacleSpeed = Math.random() * 2 + 3 + difficultyLevel; // Slightly slower
        obstacles.push({
          x: obstacleX,
          y: -truckHeight,
          speed: obstacleSpeed,
          image: obstacleTruckImg,
          width: truckWidth,
          height: truckHeight,
        });
      }
    }
  }

  // Difficulty Scaling
  if (Date.now() - lastDifficultyIncreaseTime > difficultyIncreaseInterval) {
    difficultyLevel++;
    stripeSpeed += 0.5; // Increase stripe speed
    lastDifficultyIncreaseTime = Date.now();
    console.log("Difficulty increased to level:", difficultyLevel);
  }

  // Update and Draw Particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.update();
    p.draw();

    // Remove particles that are fully transparent
    if (p.opacity <= 0) {
      particles.splice(i, 1);
      i--;
    }
  }

  // Handle Time Attack Countdown
  if (gameMode === "timeAttack") {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Time: " + Math.ceil(timeRemaining / 1000) + "s",
      canvas.width / 2,
      60
    );
    ctx.textAlign = "start";
  }

  // Increase score
  score++;

  requestAnimationFrame(gameLoop);
}
```

**Explanation:**

- **Game Modes:** Users can select between Endless Mode and Time Attack Mode from the start menu.
- **Time Attack Mode:** Players aim to achieve the highest score within a 60-second timeframe.
- **Dynamic Score Display:** In Time Attack Mode, display the remaining time instead of the high score.
- **Score Submission:** Adjusted the `endGame()` function to handle different modes appropriately.

**Enhancement:**

- **Different UI Elements:** The score and time are displayed based on the selected game mode, ensuring clarity and preventing UI overlap.

---

### **4. Implement Touch Controls for Mobile Devices**

**Objective:** Make your game accessible and playable on touch-enabled devices by adding swipe controls.

**Benefits:**

- **Wider Audience:** Increases the potential player base by supporting mobile users.
- **Enhanced Accessibility:** Provides intuitive controls for touch interactions.

**Implementation Steps:**

#### **A. Add Touch Event Listeners**

```javascript
// Touch Control Variables
let touchStartX = null;
let touchStartY = null;

// Touch Event Handlers
canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchmove", handleTouchMove, false);

function handleTouchStart(evt) {
  const firstTouch = evt.touches[0];
  touchStartX = firstTouch.clientX;
  touchStartY = firstTouch.clientY;
}

function handleTouchMove(evt) {
  if (!touchStartX || !touchStartY) {
    return;
  }

  const touchEndX = evt.touches[0].clientX;
  const touchEndY = evt.touches[0].clientY;

  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (diffX > 50 && targetLane < lanes.length - 1) {
      targetLane++;
      touchStartX = null;
      touchStartY = null;
    } else if (diffX < -50 && targetLane > 0) {
      targetLane--;
      touchStartX = null;
      touchStartY = null;
    }
  }

  touchStartX = null;
  touchStartY = null;
}
```

**Explanation:**

- **Swipe Detection:** Detects horizontal swipes to move the player's car left or right.
- **Threshold:** Only registers a swipe if the movement exceeds 50 pixels to prevent accidental lane changes.

**Optional Enhancements:**

- **Visual Indicators:** Show swipe animations or indicators to provide feedback to the player.
- **Vertical Swipes:** Optionally, handle vertical swipes for additional controls (e.g., pausing).

---

### **5. Add Achievements and Unlockables**

**Objective:** Introduce achievements for players to strive for, unlocking rewards like new car skins or badges.

**Benefits:**

- **Increased Engagement:** Provides goals for players to achieve, encouraging prolonged play.
- **Personalization:** Allows players to customize their experience based on unlocked content.

**Implementation Steps:**

#### **A. Define Achievement Criteria**

Example Achievements:

1. **First Collision:** Achieve a collision without any power-ups.
2. **Score Milestones:** Reach scores like 100, 500, 1000.
3. **Perfect Run:** Complete the game without taking damage.

#### **B. Track Achievements**

Add an array to store unlocked achievements and functions to handle them.

```javascript
// Achievement Variables
const achievements = [
  {
    id: 1,
    name: "First Collision",
    description: "Get hit by your first obstacle.",
    unlocked: false,
  },
  {
    id: 2,
    name: "Century Club",
    description: "Reach a score of 100.",
    unlocked: false,
  },
  {
    id: 3,
    name: "Half-Thousand Hero",
    description: "Reach a score of 500.",
    unlocked: false,
  },
  {
    id: 4,
    name: "Thousand Master",
    description: "Reach a score of 1000.",
    unlocked: false,
  },
  {
    id: 5,
    name: "Impenetrable Shield",
    description: "Complete a game without taking damage.",
    unlocked: false,
  },
];
let shieldUsed = false;

// Function to Check and Unlock Achievements
function checkAchievements() {
  achievements.forEach((achievement) => {
    if (!achievement.unlocked) {
      if (achievement.id === 1 && health < 5) {
        unlockAchievement(achievement);
      }
      if (achievement.id === 2 && score >= 100) {
        unlockAchievement(achievement);
      }
      if (achievement.id === 3 && score >= 500) {
        unlockAchievement(achievement);
      }
      if (achievement.id === 4 && score >= 1000) {
        unlockAchievement(achievement);
      }
      if (
        achievement.id === 5 &&
        gameMode === "endless" &&
        health === 5 &&
        obstacles.length === 0
      ) {
        unlockAchievement(achievement);
      }
    }
  });
}

// Function to Unlock Achievement
function unlockAchievement(achievement) {
  achievement.unlocked = true;
  alert(
    `Achievement Unlocked: ${achievement.name} - ${achievement.description}`
  );
  // Optionally, save achievements to localStorage or backend
}

// Call checkAchievements within the game loop
function gameLoop() {
  // Existing game loop code...

  // After increasing score
  score++;

  // Check achievements
  checkAchievements();

  requestAnimationFrame(gameLoop);
}

// Modify endGame to handle achievements like "Impenetrable Shield"
function endGame() {
  isGameRunning = false;
  backgroundMusic.pause();

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  finalScoreText.textContent = `Your Score: ${score}`;
  displayLeaderboard();
  gameOverScreen.classList.remove("hidden");
}
```

**Explanation:**

- **Achievements Array:** Stores the list of achievements with their status.
- **`checkAchievements()`:** Evaluates if any achievement criteria are met and unlocks them.
- **`unlockAchievement(achievement)`:** Handles the unlocking process, such as displaying alerts.

**Optional Enhancements:**

- **Visual Representation:** Display a dedicated achievements screen where players can view all achievements and their statuses.
- **Persistent Storage:** Save unlocked achievements using `localStorage` or a backend to maintain progress across sessions.

---

### **6. Enhance Visual Effects and Animations**

**Objective:** Improve the game's aesthetics by adding animations, dynamic backgrounds, and more detailed visual elements.

**Benefits:**

- **Immersion:** Enhanced visuals create a more engaging and immersive experience.
- **Aesthetic Appeal:** Makes the game more attractive and enjoyable to play.

**Implementation Steps:**

#### **A. Add Side Barriers or Road Details**

```javascript
// Draw Side Barriers within the game loop, after drawing road stripes
ctx.fillStyle = "#555"; // Dark gray for barriers
const barrierWidth = 20;

// Left Barrier
ctx.fillRect(0, 0, barrierWidth, canvas.height);

// Right Barrier
ctx.fillRect(canvas.width - barrierWidth, 0, barrierWidth, canvas.height);
```

**Explanation:**

- Adds dark gray barriers on both sides of the road to define the playable area and prevent the player's car from moving off-screen.

#### **B. Animate Power-Up Collection**

Provide visual feedback when a player collects a power-up, such as a brief glow around the car.

```javascript
// Modify the activatePowerUp function to add visual effects
function activatePowerUp(type) {
  if (type === "speed") {
    // Increase car speed temporarily
    stripeSpeed += 2; // Example: Increase stripe speed
    activePowerUps.push({
      type: "speed",
      endTime: Date.now() + powerUpDuration,
    });
  } else if (type === "shield") {
    // Activate shield
    isShieldActive = true;
    activePowerUps.push({
      type: "shield",
      endTime: Date.now() + powerUpDuration,
    });
    // Add a visual effect, e.g., glowing shield
  }
}

// Add visual effect for shield
if (isShieldActive) {
  ctx.save();
  ctx.strokeStyle = "rgba(0, 255, 255, 0.7)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(
    carX,
    canvas.height - carHeight / 2 - 10,
    carWidth + 10,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  ctx.restore();
}
```

**Explanation:**

- When a shield is active, a semi-transparent cyan circle is drawn around the player's car, indicating invincibility.

#### **C. Dynamic Background Elements**

Add dynamic elements like moving clouds or changing weather to make the background more lively.

```javascript
// Define cloud properties
let clouds = [];
const cloudCount = 5;

// Initialize clouds
function initializeClouds() {
  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: (Math.random() * canvas.height) / 2,
      speed: Math.random() * 1 + 0.5,
      size: Math.random() * 30 + 20,
    });
  }
}

// Function to Draw and Move Clouds
function drawClouds() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  clouds.forEach((cloud) => {
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      cloud.x + cloud.size / 2,
      cloud.y + cloud.size / 3,
      cloud.size / 1.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      cloud.x - cloud.size / 2,
      cloud.y + cloud.size / 3,
      cloud.size / 1.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Move cloud
    cloud.x += cloud.speed;
    if (cloud.x - cloud.size > canvas.width) {
      cloud.x = -cloud.size;
      cloud.y = (Math.random() * canvas.height) / 2;
    }
  });
}

// Initialize clouds on load
initializeClouds();

// Call drawClouds within your gameLoop
function gameLoop() {
  if (!isGameRunning || isPaused) return; // Stop the loop if the game is not running or is paused

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw moving gradient background
  drawMovingGradient();

  // Draw clouds
  drawClouds();

  // ... rest of the game loop code ...
}
```

**Explanation:**

- **Clouds Array:** Stores cloud positions, speeds, and sizes.
- **`initializeClouds()`:** Populates the clouds array with random positions and properties.
- **`drawClouds()`:** Draws clouds as overlapping circles to create a fluffy appearance and moves them horizontally across the screen. Clouds wrap around when they move off-screen.

**Optional Enhancements:**

- **Weather Effects:** Introduce rain, snow, or lightning for additional challenge and visual variety.
- **Day/Night Cycle:** Change the background colors and add stars or a moon during nighttime.

---

### **5. Implement Car Selection and Upgrades**

**Objective:** Allow players to choose from different cars, each with unique attributes like speed, handling, or appearance.

**Benefits:**

- **Personalization:** Players can select a car that suits their playstyle.
- **Replayability:** Unlocking and experimenting with different cars encourages multiple playthroughs.

**Implementation Steps:**

#### **A. Add Car Selection to the Start Menu**

```html
<!-- Modify the Start Menu to include car selection -->
<div id="startMenu">
  <h1>8-bit Car Racing Game</h1>

  <!-- Car Selection -->
  <div
    id="carSelection"
    style="display: flex; justify-content: center; margin: 20px;"
  >
    <div class="car-option">
      <img
        src="https://cdn.glitch.global/your-project-id/car1.png"
        alt="Car 1"
        width="60"
      />
      <button class="select-car-button menu-button" data-car="car1">
        Select Car 1
      </button>
    </div>
    <div class="car-option">
      <img
        src="https://cdn.glitch.global/your-project-id/car2.png"
        alt="Car 2"
        width="60"
      />
      <button class="select-car-button menu-button" data-car="car2">
        Select Car 2
      </button>
    </div>
    <!-- Add more car options as needed -->
  </div>

  <button id="startEndless" class="menu-button">Endless Mode</button>
  <button id="startTimeAttack" class="menu-button">Time Attack Mode</button>
</div>
```

**Explanation:**

- **Car Options:** Display different car images with corresponding "Select" buttons.
- **Data Attributes:** Use `data-car` to identify which car is selected.

#### **B. Update CSS for Car Selection**

```css
/* Add within the <style> tag */

/* Car Option Styles */
.car-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
}

.select-car-button {
  margin-top: 5px;
  padding: 10px 20px;
  font-size: 14px;
}
```

#### **C. Manage Car Selection in JavaScript**

```javascript
// Car Selection Variables
let selectedCar = "car1"; // Default car

// Load additional car images
const carImages = {
  car1: playerCarImg,
  car2: new Image(),
};

// Set sources for additional cars
carImages["car2"].src = "https://cdn.glitch.global/your-project-id/car2.png"; // Replace with actual URL

carImages["car2"].onload = checkAllImagesLoaded;
carImages["car2"].onerror = onImageError;

// Handle Car Selection
const selectCarButtons = document.querySelectorAll(".select-car-button");

selectCarButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCar = button.getAttribute("data-car");
    // Highlight selected car (optional)
    selectCarButtons.forEach((btn) => (btn.style.backgroundColor = "#444"));
    button.style.backgroundColor = "#666";
  });
});
```

**Explanation:**

- **`selectedCar` Variable:** Tracks which car the player has selected.
- **`carImages` Object:** Stores references to different car images.
- **Event Listeners:** Update `selectedCar` based on user selection and optionally highlight the selected car.

#### **D. Update Player Car Rendering**

Modify the player car rendering to use the selected car image.

```javascript
// Draw player car with selected image
ctx.drawImage(
  carImages[selectedCar],
  carX - carWidth / 2,
  canvas.height - carHeight - 10,
  carWidth,
  carHeight
);
```

**Explanation:**

- **Dynamic Car Image:** Uses the image corresponding to the `selectedCar` variable.

#### **E. Unlockable Cars and Upgrades (Advanced)**

Implement a system to unlock new cars based on achievements or scores.

**Implementation Steps:**

1. **Define Unlock Criteria:**

   - Example: Unlock Car 2 after reaching a score of 500.

2. **Manage Unlocks:**

   - Check if the criteria are met and unlock the new car.
   - Update the start menu to enable selection of unlocked cars.

3. **Persist Unlocks:**
   - Use `localStorage` to save unlocked cars across sessions.

**Example Code:**

```javascript
// Unlock Criteria for Cars
const carUnlocks = {
  car2: { requiredScore: 500, unlocked: false },
  // Add more cars as needed
};

// Check and Unlock Cars
function checkCarUnlocks() {
  for (const car in carUnlocks) {
    if (!carUnlocks[car].unlocked && score >= carUnlocks[car].requiredScore) {
      carUnlocks[car].unlocked = true;
      alert(`Congratulations! You've unlocked ${car}`);
      // Optionally, save unlocks to localStorage
      localStorage.setItem("carUnlocks", JSON.stringify(carUnlocks));
    }
  }
}

// Initialize Unlocks from localStorage
function initializeCarUnlocks() {
  const savedUnlocks = localStorage.getItem("carUnlocks");
  if (savedUnlocks) {
    const parsedUnlocks = JSON.parse(savedUnlocks);
    for (const car in parsedUnlocks) {
      if (carUnlocks[car]) {
        carUnlocks[car].unlocked = parsedUnlocks[car].unlocked;
      }
    }
  }
}

// Call initializeCarUnlocks on load
initializeCarUnlocks();

// Update checkAchievements function to include car unlocks
function checkAchievements() {
  achievements.forEach((achievement) => {
    if (!achievement.unlocked) {
      if (achievement.id === 1 && health < 5) {
        unlockAchievement(achievement);
      }
      if (achievement.id === 2 && score >= 100) {
        unlockAchievement(achievement);
      }
      if (achievement.id === 3 && score >= 500) {
        unlockAchievement(achievement);
        // Unlock Car 2
        if (carUnlocks["car2"] && !carUnlocks["car2"].unlocked) {
          carUnlocks["car2"].unlocked = true;
          alert(
            "Achievement Unlocked: Half-Thousand Hero! You've unlocked Car 2."
          );
          localStorage.setItem("carUnlocks", JSON.stringify(carUnlocks));
        }
      }
      if (achievement.id === 4 && score >= 1000) {
        unlockAchievement(achievement);
      }
      if (
        achievement.id === 5 &&
        gameMode === "endless" &&
        health === 5 &&
        obstacles.length === 0
      ) {
        unlockAchievement(achievement);
      }
    }
  });
}
```

**Explanation:**

- **`carUnlocks` Object:** Defines the criteria for unlocking additional cars.
- **`checkCarUnlocks()`:** Checks if any cars meet their unlock criteria and updates their status.
- **Persistence:** Uses `localStorage` to remember unlocked cars across game sessions.
- **User Feedback:** Alerts notify players when they unlock a new car.

---

### **6. Optimize Performance and Code Structure**

**Objective:** Improve the game's performance and maintainability by optimizing rendering and organizing code effectively.

**Benefits:**

- **Smooth Gameplay:** Ensures the game runs smoothly, especially on lower-end devices.
- **Maintainability:** Organized code is easier to debug, update, and extend.
- **Scalability:** Facilitates the addition of new features without causing code bloat.

**Implementation Steps:**

#### **A. Use `requestAnimationFrame` Efficiently**

Ensure that `requestAnimationFrame` is only called once per frame and not recursively in unintended scenarios.

**Best Practices:**

- **Single Game Loop Invocation:** Avoid multiple instances of the game loop running simultaneously.
- **Cancel Animation Frames When Not Needed:** Use `cancelAnimationFrame` when pausing or ending the game to free resources.

**Example Code:**

```javascript
let animationId;

function gameLoop() {
  if (!isGameRunning || isPaused) return; // Stop the loop if the game is not running or is paused

  // ... existing game loop code ...

  animationId = requestAnimationFrame(gameLoop);
}

// Modify pauseGame and endGame to cancel animation frames
function pauseGame() {
  isPaused = true;
  pausedOverlay.classList.remove("hidden");
  backgroundMusic.pause();
  cancelAnimationFrame(animationId);
}

function resumeGame() {
  pausedOverlay.classList.add("hidden");
  isPaused = false;
  backgroundMusic.play();
  gameLoop();
}

function endGame() {
  isGameRunning = false;
  backgroundMusic.pause();
  cancelAnimationFrame(animationId);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  finalScoreText.textContent = `Your Score: ${score}`;
  displayLeaderboard();
  gameOverScreen.classList.remove("hidden");
}
```

#### **B. Optimize Rendering Order**

Render background elements first, followed by moving elements like obstacles and power-ups, and finally UI elements.

**Reasoning:**

- **Layered Rendering:** Ensures that UI elements are always on top and not obscured by other game elements.

**Example Code Structure:**

```javascript
function gameLoop() {
  if (!isGameRunning || isPaused) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background elements
  drawMovingGradient();
  drawClouds();
  drawSideBarriers();

  // Draw road stripes
  drawRoadStripes();

  // Draw power-ups
  updateAndDrawPowerUps();

  // Draw obstacles
  updateAndDrawObstacles();

  // Draw player car
  drawPlayerCar();

  // Update and Draw Health Bar
  updateHealthBar();

  // Draw score and other UI elements
  drawUI();

  // Update particles
  updateAndDrawParticles();

  // Manage power-ups and achievements
  manageActivePowerUps();
  checkAchievements();

  // Increase score and handle difficulty
  updateScoreAndDifficulty();

  // Request next frame
  animationId = requestAnimationFrame(gameLoop);
}
```

**Explanation:**

- **Structured Rendering:** Organizes rendering into logical sections for clarity and efficiency.

#### **C. Minimize Canvas State Changes**

Reducing the number of state changes (like changing `fillStyle`, `strokeStyle`, etc.) can enhance performance.

**Implementation Tips:**

- **Batch Similar Draw Calls:** Group drawing operations that share the same style.
- **Cache Static Elements:** Pre-render static backgrounds or elements that don't change frequently.

---

### **7. Implement User Feedback and Tutorials**

**Objective:** Guide new players on how to play the game and provide feedback during gameplay.

**Benefits:**

- **Improved Usability:** Helps new players understand game mechanics quickly.
- **Enhanced Experience:** Provides feedback for actions, making the game more intuitive.

**Implementation Steps:**

#### **A. Add an Instructions Section**

Provide players with a brief tutorial or instructions on how to play.

```html
<!-- Modify the Start Menu to include instructions -->
<div id="startMenu">
  <h1>8-bit Car Racing Game</h1>

  <!-- Instructions -->
  <div
    id="instructions"
    style="text-align: center; max-width: 300px; margin-bottom: 20px;"
  >
    <p>
      Use the <strong>left</strong> and <strong>right arrow keys</strong> or
      <strong>swipe left/right</strong> on mobile to move your car.
    </p>
    <p>Avoid obstacles and collect power-ups to increase your score!</p>
  </div>

  <!-- Car Selection and Game Mode Buttons -->
  <div
    id="carSelection"
    style="display: flex; justify-content: center; margin: 20px;"
  >
    <!-- Car Options -->
  </div>

  <button id="startEndless" class="menu-button">Endless Mode</button>
  <button id="startTimeAttack" class="menu-button">Time Attack Mode</button>
</div>
```

**Explanation:**

- **Instructions Div:** Clearly communicates game controls and objectives to the player.

#### **B. Provide In-Game Feedback**

Implement visual or auditory feedback for player actions, such as collecting a power-up or achieving a milestone.

**Example: Flashing Effect on Power-Up Collection**

```javascript
// Add a variable to trigger flashing
let isFlashing = false;
let flashEndTime = 0;

// Modify the activatePowerUp function
function activatePowerUp(type) {
  if (type === "speed") {
    // Increase car speed temporarily
    stripeSpeed += 2; // Example: Increase stripe speed
    activePowerUps.push({
      type: "speed",
      endTime: Date.now() + powerUpDuration,
    });
  } else if (type === "shield") {
    // Activate shield
    isShieldActive = true;
    activePowerUps.push({
      type: "shield",
      endTime: Date.now() + powerUpDuration,
    });
  }

  // Trigger flashing effect
  isFlashing = true;
  flashEndTime = Date.now() + 500; // Flash for 0.5 seconds
}

// Modify the game loop to handle flashing
function gameLoop() {
  // Existing game loop code...

  // Handle Flashing Effect
  if (isFlashing) {
    if (Date.now() < flashEndTime) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      isFlashing = false;
    }
  }

  // Existing game loop code...
}
```

**Explanation:**

- **Flashing Effect:** Overlays a semi-transparent white rectangle to create a flash when a power-up is collected.

**Optional Enhancements:**

- **Sound Notifications:** Play a unique sound when collecting different types of power-ups.
- **Visual Indicators:** Display icons or messages indicating the activation of a power-up.

---

### **8. Add Visual Parallax Scrolling**

**Objective:** Create a parallax scrolling effect with multiple background layers moving at different speeds to add depth.

**Benefits:**

- **Enhanced Visual Depth:** Makes the game environment feel more dynamic and three-dimensional.
- **Improved Aesthetics:** Adds a professional touch to the game's visuals.

**Implementation Steps:**

#### **A. Define Multiple Background Layers**

Add additional layers, such as distant hills or buildings, that move slower than the road.

```javascript
// Define background layers
let backgroundLayers = [
  { image: new Image(), x: 0, y: 0, speed: 0.2 }, // Distant hills
  { image: new Image(), x: 0, y: 0, speed: 0.4 }, // Closer trees
];

// Load background images
backgroundLayers[0].image.src =
  "https://cdn.glitch.global/your-project-id/hills.png"; // Replace with actual URL
backgroundLayers[1].image.src =
  "https://cdn.glitch.global/your-project-id/trees.png"; // Replace with actual URL

backgroundLayers.forEach((layer) => {
  layer.image.onload = checkAllImagesLoaded;
  layer.image.onerror = onImageError;
});
```

#### **B. Draw and Move Background Layers in the Game Loop**

```javascript
// Function to draw background layers
function drawBackgroundLayers() {
  backgroundLayers.forEach((layer) => {
    layer.y += layer.speed;
    if (layer.y >= canvas.height) {
      layer.y = 0;
    }
    ctx.drawImage(layer.image, layer.x, layer.y, canvas.width, canvas.height);
    ctx.drawImage(
      layer.image,
      layer.x,
      layer.y - canvas.height,
      canvas.width,
      canvas.height
    );
  });
}

// Call drawBackgroundLayers within the gameLoop
function gameLoop() {
  if (!isGameRunning || isPaused) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background layers
  drawBackgroundLayers();

  // Draw moving gradient road
  drawMovingGradient();

  // Draw clouds
  drawClouds();

  // Draw side barriers
  drawSideBarriers();

  // ... rest of the game loop code ...
}
```

**Explanation:**

- **Layer Speeds:** Distant layers move slower to create a sense of depth.
- **Seamless Looping:** Draw each layer twice vertically to ensure continuous scrolling without gaps.

**Note:** Ensure that the background images (`hills.png`, `trees.png`, etc.) are designed to tile seamlessly vertically.

---

### **9. Implement Smooth Animations and Transitions**

**Objective:** Enhance the game's visual appeal by adding smooth animations and transitions for UI elements and game states.

**Benefits:**

- **Professional Look:** Smooth transitions make the game feel polished.
- **Improved User Experience:** Enhances the flow between different game states like pausing or game over.

**Implementation Steps:**

#### **A. Fade-In and Fade-Out Effects for Overlays**

Use CSS transitions to smoothly show and hide overlays like the Game Over screen or Paused overlay.

```css
/* Update existing overlay styles */

#startMenu,
#gameOverScreen,
#pausedOverlay {
  opacity: 0;
  transition: opacity 0.5s ease;
}

#startMenu:not(.hidden),
#gameOverScreen:not(.hidden),
#pausedOverlay:not(.hidden) {
  opacity: 1;
}
```

**Explanation:**

- **Initial State:** Overlays are hidden with `opacity: 0`.
- **Visible State:** When the `.hidden` class is removed, `opacity` transitions to `1`, creating a fade-in effect.

#### **B. Animate Car Movement**

Add subtle animations to the player's car, such as tilting during lane changes.

```javascript
// Add tilting effect variables
let tiltAngle = 0;
const maxTilt = 15; // Degrees
const tiltSpeed = 2; // Degrees per frame

// Modify lane transition to include tilt
if (currentLane !== targetLane) {
  if (laneTransition < 1) {
    laneTransition += laneTransitionSpeed / 100;
    tiltAngle = targetLane > currentLane ? maxTilt : -maxTilt;
  } else {
    laneTransition = 0;
    currentLane = targetLane;
    tiltAngle = 0;
  }
} else {
  tiltAngle = 0;
}

// Draw player car with tilt
ctx.save();
ctx.translate(carX, canvas.height - carHeight / 2 - 10);
ctx.rotate((tiltAngle * Math.PI) / 180);
ctx.drawImage(
  carImages[selectedCar],
  -carWidth / 2,
  -carHeight / 2,
  carWidth,
  carHeight
);
ctx.restore();
```

**Explanation:**

- **`tiltAngle`:** Determines the rotation angle of the car during lane changes.
- **`maxTilt`:** Maximum tilt angle to prevent excessive rotation.
- **Animation Logic:** Tilt the car left or right based on the direction of the lane change.

#### **C. Smooth Particle Effects**

Enhance particle effects with smoother animations and varied colors.

```javascript
// Modify the Particle class to include color variation
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 2;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.opacity = 1;
    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Random color
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= 0.02;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
```

**Explanation:**

- **Dynamic Colors:** Assigns each particle a random hue, resulting in colorful explosions.
- **Smoother Fading:** The gradual decrease in opacity creates a smooth fade-out effect.

---

### **10. Add a Mini-Map or Radar**

**Objective:** Provide players with a mini-map or radar that shows upcoming obstacles and power-ups, enhancing situational awareness.

**Benefits:**

- **Strategic Advantage:** Helps players anticipate and react to upcoming challenges.
- **Enhanced Gameplay:** Adds an extra layer of strategy and control.

**Implementation Steps:**

#### **A. Define Mini-Map Properties**

```javascript
// Mini-Map Properties
const miniMapWidth = 150;
const miniMapHeight = 200;
const miniMapX = canvas.width - miniMapWidth - 20;
const miniMapY = 20;
const miniMapScale = 0.1; // Scale down positions

// Function to Draw Mini-Map
function drawMiniMap() {
  // Draw mini-map background
  ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
  ctx.fillRect(miniMapX, miniMapY, miniMapWidth, miniMapHeight);

  // Draw mini-map road
  ctx.fillStyle = "#333";
  ctx.fillRect(
    miniMapX + miniMapWidth / 4,
    miniMapY,
    miniMapWidth / 2,
    miniMapHeight
  );

  // Draw mini-map obstacles
  ctx.fillStyle = "red";
  obstacles.forEach((obs) => {
    const mapX =
      miniMapX +
      lanes[Math.floor(obs.x / (canvas.width / lanes.length))] * miniMapScale;
    const mapY = miniMapY + obs.y * miniMapScale;
    ctx.fillRect(mapX - 2, mapY - 2, 4, 4);
  });

  // Draw mini-map power-ups
  ctx.fillStyle = "yellow";
  powerUps.forEach((pu) => {
    const mapX = miniMapX + pu.x * miniMapScale;
    const mapY = miniMapY + pu.y * miniMapScale;
    ctx.fillRect(mapX - 2, mapY - 2, 4, 4);
  });

  // Draw player car on mini-map
  ctx.fillStyle = "green";
  const mapCarX = miniMapX + carX * miniMapScale;
  const mapCarY = miniMapY + (canvas.height - carHeight - 10) * miniMapScale;
  ctx.beginPath();
  ctx.arc(mapCarX, mapCarY, 3, 0, Math.PI * 2);
  ctx.fill();
}
```

**Explanation:**

- **Mini-Map Layout:** Represents the game area with a scaled-down version of lanes and obstacles.
- **Obstacle and Power-Up Indicators:** Small colored squares indicate their positions on the mini-map.
- **Player Car Indicator:** A distinct green dot represents the player's car.

#### **B. Integrate Mini-Map into the Game Loop**

```javascript
function gameLoop() {
  if (!isGameRunning || isPaused) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background layers
  drawBackgroundLayers();

  // Draw moving gradient road
  drawMovingGradient();

  // Draw clouds
  drawClouds();

  // Draw side barriers
  drawSideBarriers();

  // Draw road stripes
  drawRoadStripes();

  // Draw power-ups
  updateAndDrawPowerUps();

  // Draw obstacles
  updateAndDrawObstacles();

  // Draw player car
  drawPlayerCar();

  // Update and Draw Health Bar
  updateHealthBar();

  // Draw score and other UI elements
  drawUI();

  // Draw Mini-Map
  drawMiniMap();

  // Update particles
  updateAndDrawParticles();

  // Manage power-ups and achievements
  manageActivePowerUps();
  checkAchievements();

  // Increase score and handle difficulty
  updateScoreAndDifficulty();

  // Request next frame
  animationId = requestAnimationFrame(gameLoop);
}
```

**Explanation:**

- **Positioning:** The mini-map is drawn within the main game loop, ensuring it updates in real-time alongside other game elements.
- **Layering:** Positioned after dynamic elements to overlay appropriately.

---

### **11. Refactor Code for Maintainability**

**Objective:** Organize your codebase using modular patterns or object-oriented principles to enhance readability and ease future development.

**Benefits:**

- **Scalability:** Easier to add new features without cluttering the code.
- **Maintainability:** Simplifies debugging and updates.
- **Reusability:** Promotes code reuse across different parts of the game.

**Implementation Steps:**

#### **A. Use JavaScript Classes**

Organize game entities like the player car, obstacles, power-ups, and particles into classes.

**Example: Player Car Class**

```javascript
class PlayerCar {
  constructor(image, x, y, width, height) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.isShieldActive = false;
  }

  update(targetLane, laneTransition, speedBoost) {
    // Update position based on laneTransition
    this.x =
      lanes[targetLane] * (1 - laneTransition) +
      lanes[targetLane] * laneTransition;

    // Apply speed boost if active
    this.speed = speedBoost ? 2 : 1;
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.x - this.width / 2,
      this.y,
      this.width,
      this.height
    );
    if (this.isShieldActive) {
      ctx.save();
      ctx.strokeStyle = "rgba(0, 255, 255, 0.7)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x, this.y + this.height / 2, this.width, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  activateShield() {
    this.isShieldActive = true;
    setTimeout(() => {
      this.isShieldActive = false;
    }, powerUpDuration);
  }
}

// Initialize Player Car
const playerCar = new PlayerCar(
  carImages[selectedCar],
  lanes[currentLane],
  canvas.height - carHeight - 10,
  carWidth,
  carHeight
);

// Modify the game loop to use the PlayerCar class
function gameLoop() {
  if (!isGameRunning || isPaused) return;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background layers
  drawBackgroundLayers();

  // Draw moving gradient road
  drawMovingGradient();

  // Draw clouds
  drawClouds();

  // Draw side barriers
  drawSideBarriers();

  // Draw road stripes
  drawRoadStripes();

  // Draw power-ups
  updateAndDrawPowerUps();

  // Draw obstacles
  updateAndDrawObstacles();

  // Update and Draw Player Car
  playerCar.update(targetLane, laneTransition, isSpeedBoostActive);
  playerCar.draw();

  // Update and Draw Health Bar
  updateHealthBar();

  // Draw score and other UI elements
  drawUI();

  // Draw Mini-Map
  drawMiniMap();

  // Update particles
  updateAndDrawParticles();

  // Manage power-ups and achievements
  manageActivePowerUps();
  checkAchievements();

  // Increase score and handle difficulty
  updateScoreAndDifficulty();

  // Request next frame
  animationId = requestAnimationFrame(gameLoop);
}
```

**Explanation:**

- **`PlayerCar` Class:** Encapsulates properties and methods related to the player's car, promoting code reuse and clarity.
- **Modular Design:** Separates concerns by organizing related functionalities within classes.

#### **B. Organize Code into Modules**

For larger projects, consider splitting your code into separate JavaScript modules or files. However, for simplicity and to maintain compatibility with browser environments without a build process, you can still organize your code using Immediately Invoked Function Expressions (IIFEs) or namespace patterns.

---

### **12. Implement Persistent Game States**

**Objective:** Save the game's state (e.g., player progress, unlocked cars) so that players can resume where they left off.

**Benefits:**

- **User Convenience:** Enhances user experience by allowing players to continue their progress across sessions.
- **Engagement:** Encourages players to return to the game to continue their progress.

**Implementation Steps:**

#### **A. Use `localStorage` for Persistence**

```javascript
// Save Game State
function saveGameState() {
  const gameState = {
    highScore: highScore,
    carUnlocks: carUnlocks,
    achievements: achievements,
    // Add other state variables as needed
  };
  localStorage.setItem("gameState", JSON.stringify(gameState));
}

// Load Game State
function loadGameState() {
  const savedState = localStorage.getItem("gameState");
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    if (parsedState.highScore) highScore = parsedState.highScore;
    if (parsedState.carUnlocks) {
      for (const car in parsedState.carUnlocks) {
        if (carUnlocks[car]) {
          carUnlocks[car].unlocked = parsedState.carUnlocks[car].unlocked;
        }
      }
    }
    if (parsedState.achievements) {
      for (const ach of parsedState.achievements) {
        const localAch = achievements.find((a) => a.id === ach.id);
        if (localAch) {
          localAch.unlocked = ach.unlocked;
        }
      }
    }
    // Load other state variables as needed
  }
}

// Call loadGameState on page load
window.onload = () => {
  loadGameState();
  initializeCarUnlocks();
};

// Save game state when the window is about to unload
window.addEventListener("beforeunload", saveGameState);
```

**Explanation:**

- **`saveGameState()`:** Serializes and stores essential game data in `localStorage`.
- **`loadGameState()`:** Retrieves and deserializes the stored game data, restoring the player's progress.
- **Event Listeners:** Automatically save the game state when the player leaves the page and load it upon page load.

**Optional Enhancements:**

- **Auto-Save:** Periodically save the game state during gameplay.
- **Manual Save/Load:** Provide options for players to manually save or load their progress.

---

### **13. Implement Dynamic Difficulty Based on Player Performance**

**Objective:** Adjust the game's difficulty dynamically based on the player's performance to maintain an optimal challenge level.

**Benefits:**

- **Balanced Gameplay:** Prevents the game from becoming too easy or too hard, keeping players engaged.
- **Adaptive Challenge:** Responds to the player's skill level, providing a tailored experience.

**Implementation Steps:**

#### **A. Define Performance Metrics**

Identify metrics that indicate the player's performance, such as:

- **Score Rate:** How quickly the player is accumulating points.
- **Survival Time:** How long the player has survived without losing health.
- **Accuracy:** Percentage of obstacles avoided.

#### **B. Adjust Difficulty Parameters**

Based on performance metrics, adjust parameters like obstacle spawn rate, speed, and power-up frequency.

```javascript
// Example: Adjust obstacle speed based on score rate
function updateDifficulty() {
  const currentTime = Date.now();
  const elapsedTime = (currentTime - gameStartTime) / 1000; // in seconds
  const scoreRate = score / elapsedTime; // points per second

  if (scoreRate > 5 && difficultyLevel < 10) {
    difficultyLevel++;
    stripeSpeed += 0.5;
    console.log("Dynamic Difficulty Increased to level:", difficultyLevel);
  } else if (scoreRate < 2 && difficultyLevel > 1) {
    difficultyLevel--;
    stripeSpeed = Math.max(3, stripeSpeed - 0.5);
    console.log("Dynamic Difficulty Decreased to level:", difficultyLevel);
  }
}

// Call updateDifficulty within the game loop
function gameLoop() {
  // Existing game loop code...

  // Update difficulty based on performance
  updateDifficulty();

  // Existing game loop code...
}
```

**Explanation:**

- **`updateDifficulty()`:** Evaluates the player's score rate and adjusts the difficulty level accordingly.
- **Balanced Adjustments:** Ensures that difficulty changes are gradual to maintain gameplay balance.

**Optional Enhancements:**

- **Advanced Metrics:** Incorporate more sophisticated performance indicators.
- **Thresholds:** Define specific thresholds for difficulty adjustments to prevent frequent toggling.

---

### **14. Incorporate Responsive Design Enhancements**

**Objective:** Ensure that the game scales appropriately across various devices and screen sizes, providing a consistent experience.

**Benefits:**

- **Wider Accessibility:** Makes the game playable on desktops, tablets, and smartphones.
- **Improved User Experience:** Ensures that UI elements are always visible and appropriately sized.

**Implementation Steps:**

#### **A. Dynamic Canvas Resizing**

Ensure the canvas resizes based on the viewport while maintaining aspect ratio.

```javascript
function resizeCanvas() {
  const aspectRatio = canvas.width / canvas.height;
  let newWidth = window.innerWidth;
  let newHeight = window.innerHeight;

  if (newWidth / newHeight > aspectRatio) {
    newWidth = newHeight * aspectRatio;
  } else {
    newHeight = newWidth / aspectRatio;
  }

  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;
}

// Call resizeCanvas on load and on window resize
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);
```

**Explanation:**

- **Aspect Ratio Preservation:** Ensures that the game's proportions remain consistent across different screen sizes.
- **Responsive UI Elements:** Adjusts the canvas size dynamically, maintaining the game's layout and element positions.

#### **B. Scale UI Elements Relative to Canvas Size**

Adjust positions and sizes of UI elements like the health bar, score, and buttons based on the canvas size.

**Example:**

```javascript
// Update Health Bar Position Based on Canvas Size
function updateHealthBarPosition() {
  const healthContainer = document.getElementById("healthContainer");
  healthContainer.style.top = `${canvas.offsetTop + 20}px`;
  healthContainer.style.left = `${canvas.offsetLeft + 10}px`;
}

// Call updateHealthBarPosition within the resizeCanvas function
function resizeCanvas() {
  // Existing resize logic...

  // Update health bar position
  updateHealthBarPosition();
}
```

**Explanation:**

- **Dynamic Positioning:** Ensures that UI elements remain correctly positioned relative to the canvas after resizing.

---

### **15. Provide Multiple Car Skins and Customization**

**Objective:** Allow players to customize their cars with different skins or colors, enhancing personalization.

**Benefits:**

- **Personalization:** Players can choose aesthetics that reflect their preferences.
- **Replayability:** Unlocking new skins encourages continued play.

**Implementation Steps:**

#### **A. Define Car Skins**

Define different car skins with unique images.

```javascript
// Define available car skins
const carSkins = {
  car1: playerCarImg,
  car2: new Image(),
  car3: new Image(),
};

// Set image sources for additional car skins
carSkins["car2"].src = "https://cdn.glitch.global/your-project-id/car2.png"; // Replace with actual URL
carSkins["car3"].src = "https://cdn.glitch.global/your-project-id/car3.png"; // Replace with actual URL

// Update totalImages count and load handlers
const totalImages = 5; // Existing 3 + 2 power-ups
carSkins["car2"].onload = checkAllImagesLoaded;
carSkins["car3"].onload = checkAllImagesLoaded;
carSkins["car2"].onerror = onImageError;
carSkins["car3"].onerror = onImageError;
```

#### **B. Update Car Selection UI**

Allow players to select from unlocked car skins.

```html
<!-- Modify the Start Menu's Car Selection -->
<div
  id="carSelection"
  style="display: flex; justify-content: center; margin: 20px;"
>
  <div class="car-option">
    <img
      src="https://cdn.glitch.global/your-project-id/car1.png"
      alt="Car 1"
      width="60"
    />
    <button class="select-car-button menu-button" data-car="car1">
      Select Car 1
    </button>
  </div>
  <div class="car-option">
    <img
      src="https://cdn.glitch.global/your-project-id/car2.png"
      alt="Car 2"
      width="60"
    />
    <button class="select-car-button menu-button" data-car="car2" disabled>
      Unlock Car 2
    </button>
  </div>
  <div class="car-option">
    <img
      src="https://cdn.glitch.global/your-project-id/car3.png"
      alt="Car 3"
      width="60"
    />
    <button class="select-car-button menu-button" data-car="car3" disabled>
      Unlock Car 3
    </button>
  </div>
</div>
```

**Explanation:**

- **Disabled Buttons:** Initially disable selection buttons for locked cars.
- **Unlock Mechanism:** Enable buttons when cars are unlocked based on achievements or milestones.

#### **C. Update Achievement Unlocks to Include Car Skins**

Modify the `checkAchievements` function to unlock car skins based on achievements.

```javascript
function checkAchievements() {
  achievements.forEach((achievement) => {
    if (!achievement.unlocked) {
      if (achievement.id === 1 && health < 5) {
        unlockAchievement(achievement);
      }
      if (achievement.id === 2 && score >= 100) {
        unlockAchievement(achievement);
      }
      if (achievement.id === 3 && score >= 500) {
        unlockAchievement(achievement);
        // Unlock Car 2
        if (carUnlocks["car2"] && !carUnlocks["car2"].unlocked) {
          carUnlocks["car2"].unlocked = true;
          alert(
            "Achievement Unlocked: Half-Thousand Hero! You've unlocked Car 2."
          );
          document.querySelector(
            '.select-car-button[data-car="car2"]'
          ).disabled = false;
          localStorage.setItem("carUnlocks", JSON.stringify(carUnlocks));
        }
      }
      if (achievement.id === 4 && score >= 1000) {
        unlockAchievement(achievement);
        // Unlock Car 3
        if (carUnlocks["car3"] && !carUnlocks["car3"].unlocked) {
          carUnlocks["car3"].unlocked = true;
          alert(
            "Achievement Unlocked: Thousand Master! You've unlocked Car 3."
          );
          document.querySelector(
            '.select-car-button[data-car="car3"]'
          ).disabled = false;
          localStorage.setItem("carUnlocks", JSON.stringify(carUnlocks));
        }
      }
      if (
        achievement.id === 5 &&
        gameMode === "endless" &&
        health === 5 &&
        obstacles.length === 0
      ) {
        unlockAchievement(achievement);
      }
    }
  });
}
```

**Explanation:**

- **Unlock Conditions:** Unlock new car skins when certain achievements are met.
- **Enable Selection Buttons:** Enable the corresponding car selection buttons when cars are unlocked.

---

### **16. Provide Save and Load Functionality**

**Objective:** Allow players to save their game progress and load it later, enhancing convenience and user experience.

**Benefits:**

- **User Convenience:** Players can continue their progress without losing data.
- **Encourages Continued Play:** Increases the likelihood of players returning to the game.

**Implementation Steps:**

#### **A. Save Game State**

Use `localStorage` to save essential game data such as score, health, unlocked cars, and achievements.

```javascript
// Function to Save Game State
function saveGameState() {
  const gameState = {
    highScore: highScore,
    carUnlocks: carUnlocks,
    achievements: achievements,
    selectedCar: selectedCar,
    // Add other state variables as needed
  };
  localStorage.setItem("gameState", JSON.stringify(gameState));
}

// Function to Load Game State
function loadGameState() {
  const savedState = localStorage.getItem("gameState");
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    if (parsedState.highScore) highScore = parsedState.highScore;
    if (parsedState.carUnlocks) {
      for (const car in parsedState.carUnlocks) {
        if (carUnlocks[car]) {
          carUnlocks[car].unlocked = parsedState.carUnlocks[car].unlocked;
          // Enable select buttons if unlocked
          if (carUnlocks[car].unlocked) {
            document.querySelector(
              `.select-car-button[data-car="${car}"]`
            ).disabled = false;
          }
        }
      }
    }
    if (parsedState.achievements) {
      for (const ach of parsedState.achievements) {
        const localAch = achievements.find((a) => a.id === ach.id);
        if (localAch) {
          localAch.unlocked = ach.unlocked;
        }
      }
    }
    if (parsedState.selectedCar) {
      selectedCar = parsedState.selectedCar;
      // Highlight the selected car button
      document.querySelectorAll(".select-car-button").forEach((btn) => {
        if (btn.getAttribute("data-car") === selectedCar) {
          btn.style.backgroundColor = "#666";
        } else {
          btn.style.backgroundColor = "#444";
        }
      });
    }
    // Load other state variables as needed
  }
}

// Call loadGameState on page load
window.onload = () => {
  loadGameState();
  initializeCarUnlocks();
};

// Save game state periodically or at specific events
setInterval(saveGameState, 5000); // Save every 5 seconds
```

**Explanation:**

- **Persistent Storage:** Saves and retrieves game data using `localStorage`.
- **Periodic Saving:** Uses `setInterval` to save the game state every 5 seconds.
- **Manual Saving:** Optionally, provide a "Save Game" button for players to manually save their progress.

**Optional Enhancements:**

- **Export/Import Saves:** Allow players to export their save data and import it on different devices.
- **Advanced Storage:** Use IndexedDB for more complex data storage needs.

---

### **17. Implement Multiplayer or Competitive Features**

**Objective:** Introduce multiplayer elements where players can compete against each other in real-time or asynchronously.

**Benefits:**

- **Social Interaction:** Encourages players to engage with friends or other players globally.
- **Increased Engagement:** Multiplayer features can significantly boost game replayability and user retention.

**Implementation Steps:**

#### **A. Choose a Multiplayer Framework or Service**

Options include:

- **Firebase Realtime Database:** For real-time multiplayer interactions.
- **WebSockets:** For low-latency communication between clients and servers.
- **Third-Party Services:** Such as [Photon Engine](https://www.photonengine.com/) or [Socket.io](https://socket.io/).

**Note:** Implementing multiplayer functionality is a complex task and may require setting up a backend server to handle real-time data synchronization.

#### **B. Implement Basic Multiplayer Functionality (Asynchronous Leaderboards)**

If real-time multiplayer is too complex, consider asynchronous competition via leaderboards.

**Explanation:**

- Players compete by achieving high scores, which are displayed on the global leaderboard.
- No real-time interaction is required between players.

**Implementation Steps:**

- This functionality is already partially implemented with the leaderboard integration using Firebase Firestore.

#### **C. Implement Real-Time Multiplayer (Advanced)**

For real-time competitive gameplay, such as racing against another player's car.

**Implementation Steps:**

1. **Set Up a Backend Server:**
   - Use Node.js with Socket.io for handling real-time communication.
2. **Handle Player Connections:**
   - Manage player sessions, matchmaking, and game state synchronization.
3. **Synchronize Game States:**
   - Ensure both players see consistent game states, including obstacle positions, power-ups, and scores.
4. **Handle Disconnections and Rejoins:**
   - Implement logic to manage players leaving mid-game or rejoining.

**Note:** Implementing real-time multiplayer requires significant development effort and knowledge of backend technologies. Consider starting with asynchronous features before moving to real-time interactions.

---

### **18. Add In-Game Tutorials and Help**

**Objective:** Provide players with guidance on how to play the game, understand controls, and utilize features effectively.

**Benefits:**

- **Improved Usability:** Helps new players get started quickly.
- **Reduced Frustration:** Prevents confusion about game mechanics.

**Implementation Steps:**

#### **A. Add an Instructions Section**

Include a dedicated section in the start menu or as a separate overlay.

```html
<!-- Modify the Start Menu to include an Instructions button -->
<div id="startMenu">
  <h1>8-bit Car Racing Game</h1>

  <!-- Instructions Button -->
  <button id="instructionsButton" class="menu-button">Instructions</button>

  <!-- Instructions Overlay -->
  <div
    id="instructionsOverlay"
    class="hidden"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.9); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 15;"
  >
    <h2>How to Play</h2>
    <p>
      Use the <strong>left</strong> and <strong>right arrow keys</strong> or
      <strong>swipe left/right</strong> on mobile to move your car.
    </p>
    <p>Avoid obstacles and collect power-ups to increase your score!</p>
    <button id="closeInstructions" class="menu-button">Close</button>
  </div>

  <!-- Car Selection and Game Mode Buttons -->
  <div
    id="carSelection"
    style="display: flex; justify-content: center; margin: 20px;"
  >
    <!-- Car Options -->
  </div>

  <button id="startEndless" class="menu-button">Endless Mode</button>
  <button id="startTimeAttack" class="menu-button">Time Attack Mode</button>
</div>
```

#### **B. Add Event Listeners for Instructions Overlay**

```javascript
// Instructions Overlay Elements
const instructionsButton = document.getElementById("instructionsButton");
const instructionsOverlay = document.getElementById("instructionsOverlay");
const closeInstructions = document.getElementById("closeInstructions");

// Show Instructions Overlay
instructionsButton.addEventListener("click", () => {
  instructionsOverlay.classList.remove("hidden");
});

// Close Instructions Overlay
closeInstructions.addEventListener("click", () => {
  instructionsOverlay.classList.add("hidden");
});
```

**Explanation:**

- **Instructions Button:** Opens the instructions overlay when clicked.
- **Close Button:** Hides the instructions overlay.

---

### **19. Add Visual Indicators for Active Power-Ups**

**Objective:** Provide players with clear visual cues indicating active power-ups, enhancing awareness and strategy.

**Benefits:**

- **Clarity:** Players can easily track active power-ups and their durations.
- **Strategic Planning:** Helps players decide when to use certain power-ups.

**Implementation Steps:**

#### **A. Display Active Power-Ups in the UI**

Add a section in the UI to show currently active power-ups with countdown timers.

```html
<!-- Add within the <body> tag, preferably above the canvas -->
<div
  id="activePowerUps"
  style="position: absolute; top: 20px; right: 20px; z-index: 5; color: white; font-size: 16px;"
>
  <p id="activePowerUpText">Active Power-Ups:</p>
</div>
```

#### **B. Update JavaScript to Manage and Display Active Power-Ups**

```javascript
// Active Power-Ups UI Elements
const activePowerUpsContainer = document.getElementById("activePowerUps");
const activePowerUpText = document.getElementById("activePowerUpText");

// Function to Update Active Power-Ups Display
function updateActivePowerUpsDisplay() {
  if (activePowerUps.length === 0) {
    activePowerUpText.textContent = "Active Power-Ups: None";
  } else {
    let text = "Active Power-Ups:\n";
    activePowerUps.forEach((pu) => {
      const timeLeft = Math.ceil((pu.endTime - Date.now()) / 1000);
      text += `${
        pu.type.charAt(0).toUpperCase() + pu.type.slice(1)
      } (${timeLeft}s)\n`;
    });
    activePowerUpText.textContent = text;
  }
}

// Modify manageActivePowerUps to include display updates
function manageActivePowerUps() {
  const currentTime = Date.now();
  for (let i = 0; i < activePowerUps.length; i++) {
    const pu = activePowerUps[i];
    if (currentTime > pu.endTime) {
      // Deactivate power-up
      if (pu.type === "speed") {
        stripeSpeed -= 2; // Revert stripe speed
      } else if (pu.type === "shield") {
        isShieldActive = false;
      }
      activePowerUps.splice(i, 1);
      i--;
    }
  }
  updateActivePowerUpsDisplay();
}

// Call updateActivePowerUpsDisplay within the game loop
function gameLoop() {
  // Existing game loop code...

  // Update and Draw Active Power-Ups
  updateActivePowerUpsDisplay();

  // Existing game loop code...
}
```

**Explanation:**

- **Active Power-Ups Display:** Shows a list of currently active power-ups with their remaining durations.
- **Dynamic Updates:** As power-ups are activated or expire, the display updates accordingly.

**Optional Enhancements:**

- **Icons:** Use icons to represent different power-up types for quicker recognition.
- **Progress Bars:** Show visual progress bars indicating the remaining duration of each power-up.

---

### **20. Enhance Collision Feedback**

**Objective:** Provide more immersive feedback upon collisions, making the event more impactful.

**Benefits:**

- **Player Feedback:** Reinforces the consequences of collisions.
- **Visual Appeal:** Adds dynamic effects that enhance the game's visual interest.

**Implementation Steps:**

#### **A. Add Screen Shake Effect on Collision**

Create a subtle screen shake to indicate a collision, enhancing the sense of impact.

```javascript
// Screen Shake Variables
let shake = { x: 0, y: 0 };
const shakeIntensity = 5;
const shakeDuration = 300; // in milliseconds
let shakeEndTime = 0;

// Function to Trigger Screen Shake
function triggerScreenShake() {
  shake.x = (Math.random() - 0.5) * shakeIntensity;
  shake.y = (Math.random() - 0.5) * shakeIntensity;
  shakeEndTime = Date.now() + shakeDuration;
}

// Modify collision detection to trigger screen shake
if (
  !isShieldActive &&
  carX - carWidth / 2 < obs.x + obs.width &&
  carX + carWidth / 2 > obs.x &&
  canvas.height - carHeight - 10 < obs.y + obs.height &&
  canvas.height - 10 > obs.y
) {
  health -= 1;
  // Create particles at collision point
  createParticles(carX, canvas.height - carHeight - 10);

  // Play collision sound
  collisionSound.currentTime = 0; // Reset sound to start
  collisionSound.play();

  // Trigger screen shake
  triggerScreenShake();

  obstacles.splice(i, 1);
  i--;
  if (health <= 0) {
    endGame();
    return;
  }
}

// Modify draw functions to apply screen shake
function gameLoop() {
  if (!isGameRunning || isPaused) return;

  // Apply screen shake if active
  if (Date.now() < shakeEndTime) {
    ctx.save();
    ctx.translate(shake.x, shake.y);
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background layers
  drawBackgroundLayers();

  // Draw moving gradient road
  drawMovingGradient();

  // Draw clouds
  drawClouds();

  // Draw side barriers
  drawSideBarriers();

  // Draw road stripes
  drawRoadStripes();

  // Draw power-ups
  updateAndDrawPowerUps();

  // Draw obstacles
  updateAndDrawObstacles();

  // Draw player car
  playerCar.update(targetLane, laneTransition, isSpeedBoostActive);
  playerCar.draw();

  // Update and Draw Health Bar
  updateHealthBar();

  // Draw score and other UI elements
  drawUI();

  // Draw Mini-Map
  drawMiniMap();

  // Update particles
  updateAndDrawParticles();

  // Manage power-ups and achievements
  manageActivePowerUps();
  checkAchievements();

  // Increase score and handle difficulty
  updateScoreAndDifficulty();

  // Handle screen shake reset
  if (Date.now() >= shakeEndTime) {
    shake.x = 0;
    shake.y = 0;
    ctx.restore();
  }

  // Request next frame
  animationId = requestAnimationFrame(gameLoop);
}
```

**Explanation:**

- **`triggerScreenShake()`:** Initiates a screen shake by applying random translations to the canvas context.
- **Screen Shake Application:** The canvas is translated based on `shake.x` and `shake.y` during the shake duration.
- **Resetting:** After the shake duration, the canvas context is restored to its original state.

**Optional Enhancements:**

- **Intensity Variations:** Adjust the shake intensity based on the severity of the collision.
- **Direction-Based Shake:** Shake more intensely in a specific direction based on the collision angle.

---

### **21. Provide Visual and Audio Feedback for Achievements**

**Objective:** Enhance the experience of unlocking achievements by providing celebratory visual and audio cues.

**Benefits:**

- **Rewarding Experience:** Reinforces player achievements, making them feel accomplished.
- **Enhanced Engagement:** Motivates players to pursue achievements for added satisfaction.

**Implementation Steps:**

#### **A. Add Achievement Unlock Sound**

Include a distinct sound effect that plays when an achievement is unlocked.

```html
<!-- Add within the <body> tag, preferably after other audio elements -->
<!-- Achievement Unlock Sound Effect -->
<audio
  id="achievementSound"
  src="https://cdn.glitch.global/your-project-id/achievement-sound.mp3"
></audio>
```

**Note:** Replace `'https://cdn.glitch.global/your-project-id/achievement-sound.mp3'` with the actual URL of your achievement sound effect.

#### **B. Modify `unlockAchievement` Function to Play Sound**

```javascript
function unlockAchievement(achievement) {
  achievement.unlocked = true;
  alert(
    `Achievement Unlocked: ${achievement.name} - ${achievement.description}`
  );

  // Play achievement sound
  const achievementSound = document.getElementById("achievementSound");
  achievementSound.currentTime = 0; // Reset sound to start
  achievementSound.play();

  // Optionally, display a visual overlay or animation
}
```

#### **C. Add Visual Achievement Overlay**

Create a temporary overlay that displays the achievement information with animations.

```html
<!-- Add within the <body> tag, preferably after the pausedOverlay -->
<!-- Achievement Overlay -->
<div
  id="achievementOverlay"
  class="hidden"
  style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(255, 215, 0, 0.9); padding: 20px; border-radius: 10px; text-align: center; z-index: 20;"
>
  <h2 id="achievementTitle">Achievement Unlocked!</h2>
  <p id="achievementDescription">Description here.</p>
</div>
```

**Explanation:**

- **Achievement Overlay:** A centered overlay that briefly appears to showcase the unlocked achievement.
- **Dynamic Content:** Update the overlay's title and description based on the unlocked achievement.

**JavaScript to Handle Overlay Display:**

```javascript
// Achievement Overlay Elements
const achievementOverlay = document.getElementById("achievementOverlay");
const achievementTitle = document.getElementById("achievementTitle");
const achievementDescription = document.getElementById(
  "achievementDescription"
);

// Modify unlockAchievement to display the overlay
function unlockAchievement(achievement) {
  achievement.unlocked = true;

  // Update overlay content
  achievementTitle.textContent = `Achievement Unlocked: ${achievement.name}`;
  achievementDescription.textContent = achievement.description;

  // Show overlay
  achievementOverlay.classList.remove("hidden");

  // Play achievement sound
  const achievementSound = document.getElementById("achievementSound");
  achievementSound.currentTime = 0; // Reset sound to start
  achievementSound.play();

  // Hide overlay after 3 seconds
  setTimeout(() => {
    achievementOverlay.classList.add("hidden");
  }, 3000);

  // Optionally, use console.log instead of alert to prevent interrupting the game
  // console.log(`Achievement Unlocked: ${achievement.name} - ${achievement.description}`);
}
```

**Explanation:**

- **Dynamic Update:** Sets the overlay's title and description based on the unlocked achievement.
- **Timed Display:** The overlay appears for 3 seconds before hiding, ensuring it doesn't disrupt gameplay.

---

### **22. Provide Multiple Difficulty Levels**

**Objective:** Allow players to choose from different predefined difficulty levels, such as Easy, Medium, and Hard.

**Benefits:**

- **Player Choice:** Accommodates players of varying skill levels.
- **Replayability:** Encourages players to try different challenges.

**Implementation Steps:**

#### **A. Modify Start Menu to Include Difficulty Selection**

```html
<!-- Modify the Start Menu to include difficulty selection -->
<div id="startMenu">
  <h1>8-bit Car Racing Game</h1>

  <!-- Instructions Button -->
  <button id="instructionsButton" class="menu-button">Instructions</button>

  <!-- Car Selection -->
  <div
    id="carSelection"
    style="display: flex; justify-content: center; margin: 20px;"
  >
    <!-- Car Options -->
  </div>

  <!-- Difficulty Selection -->
  <div
    id="difficultySelection"
    style="display: flex; justify-content: center; margin: 20px;"
  >
    <button id="easyMode" class="menu-button" data-difficulty="easy">
      Easy
    </button>
    <button id="mediumMode" class="menu-button" data-difficulty="medium">
      Medium
    </button>
    <button id="hardMode" class="menu-button" data-difficulty="hard">
      Hard
    </button>
  </div>

  <button id="startEndless" class="menu-button">Endless Mode</button>
  <button id="startTimeAttack" class="menu-button">Time Attack Mode</button>
</div>
```

#### **B. Handle Difficulty Selection in JavaScript**

```javascript
// Difficulty Selection Elements
const easyModeButton = document.getElementById("easyMode");
const mediumModeButton = document.getElementById("mediumMode");
const hardModeButton = document.getElementById("hardMode");

let selectedDifficulty = "medium"; // Default difficulty

// Handle Difficulty Selection
function selectDifficulty(difficulty) {
  selectedDifficulty = difficulty;

  // Highlight selected difficulty
  document
    .querySelectorAll("#difficultySelection .menu-button")
    .forEach((btn) => {
      if (btn.getAttribute("data-difficulty") === difficulty) {
        btn.style.backgroundColor = "#666";
      } else {
        btn.style.backgroundColor = "#444";
      }
    });
}

// Add Event Listeners for Difficulty Buttons
easyModeButton.addEventListener("click", () => selectDifficulty("easy"));
mediumModeButton.addEventListener("click", () => selectDifficulty("medium"));
hardModeButton.addEventListener("click", () => selectDifficulty("hard"));

// Modify startGame functions to apply difficulty settings
function startEndlessMode() {
  startMenu.classList.add("hidden");
  resetGame();
  gameMode = "endless";

  // Apply difficulty settings
  applyDifficultySettings();

  isGameRunning = true;
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
  gameLoop();
}

function startTimeAttackMode() {
  startMenu.classList.add("hidden");
  resetGame();
  gameMode = "timeAttack";

  // Apply difficulty settings
  applyDifficultySettings();

  isGameRunning = true;
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
  gameStartTime = Date.now();
  timeRemaining = timeLimit;
  gameLoop();
}

// Function to Apply Difficulty Settings
function applyDifficultySettings() {
  switch (selectedDifficulty) {
    case "easy":
      stripeSpeed = 2;
      obstacleSpawnRate = 0.015; // Lower spawn rate
      powerUpSpawnRate = 0.007;
      break;
    case "medium":
      stripeSpeed = 3;
      obstacleSpawnRate = 0.02;
      powerUpSpawnRate = 0.005;
      break;
    case "hard":
      stripeSpeed = 4;
      obstacleSpawnRate = 0.025;
      powerUpSpawnRate = 0.003;
      break;
    default:
      stripeSpeed = 3;
      obstacleSpawnRate = 0.02;
      powerUpSpawnRate = 0.005;
  }
}

// Update Obstacle and Power-Up Spawn Rates
function gameLoop() {
  if (!isGameRunning || isPaused) return;

  // ... existing game loop code ...

  // Spawn new obstacles based on spawn rate
  if (Math.random() < obstacleSpawnRate * difficultyLevel) {
    // ... spawn obstacle ...
  }

  // Spawn power-ups based on spawn rate
  if (Math.random() < powerUpSpawnRate * difficultyLevel) {
    spawnPowerUp();
  }

  // ... rest of the game loop code ...
}
```

**Explanation:**

- **Difficulty Buttons:** Players can select their preferred difficulty level from the start menu.
- **Difficulty Settings:** Adjusts parameters like `stripeSpeed`, `obstacleSpawnRate`, and `powerUpSpawnRate` based on the selected difficulty.
- **Visual Feedback:** Highlights the selected difficulty button to indicate the current selection.

**Optional Enhancements:**

- **Custom Difficulty:** Allow players to customize difficulty settings beyond preset levels.
- **Difficulty Indicators:** Display the current difficulty level within the game UI.

---

### **23. Provide Responsive and Accessible Design**

**Objective:** Ensure that your game is accessible to all players, including those with disabilities, and that it functions well across various devices.

**Benefits:**

- **Inclusivity:** Makes your game available to a broader audience.
- **Enhanced User Experience:** Ensures that all players can enjoy and navigate the game effectively.

**Implementation Steps:**

#### **A. Ensure Keyboard Accessibility**

Allow players to navigate UI elements using the keyboard.

```javascript
// Add tabindex to buttons for keyboard navigation
// Example: <button id="startButton" class="menu-button" tabindex="0">Start Game</button>

// Add event listeners for 'Enter' key on buttons
startButton.addEventListener("keydown", (e) => {
  if (e.key === "Enter") startGame();
});
restartButton.addEventListener("keydown", (e) => {
  if (e.key === "Enter") restartGame();
});
resumeButton.addEventListener("keydown", (e) => {
  if (e.key === "Enter") resumeGame();
});
```

**Explanation:**

- **`tabindex="0"`:** Makes elements focusable via keyboard navigation.
- **'Enter' Key Handling:** Allows players to activate buttons using the 'Enter' key when focused.

#### **B. Provide Text Alternatives for Visual Elements**

Ensure that images and visual elements have appropriate `alt` text for screen readers.

```html
<!-- Example for Car Selection Images -->
<div class="car-option">
  <img
    src="https://cdn.glitch.global/your-project-id/car1.png"
    alt="Car 1"
    width="60"
  />
  <button class="select-car-button menu-button" data-car="car1">
    Select Car 1
  </button>
</div>
```

**Explanation:**

- **`alt` Attributes:** Provide descriptive text for images to aid visually impaired players.

#### **C. High Contrast Mode**

Offer a high contrast mode for better visibility.

```html
<!-- Add a High Contrast Toggle Button -->
<button
  id="highContrastButton"
  class="menu-button"
  style="position: absolute; bottom: 20px; right: 20px; z-index: 5;"
>
  High Contrast
</button>
```

**JavaScript to Toggle High Contrast Mode:**

```javascript
const highContrastButton = document.getElementById("highContrastButton");
let isHighContrast = false;

highContrastButton.addEventListener("click", () => {
  isHighContrast = !isHighContrast;
  if (isHighContrast) {
    document.body.style.backgroundColor = "#000";
    document.body.style.color = "#fff";
    canvas.style.borderColor = "#fff";
    // Adjust other elements as needed
    highContrastButton.textContent = "Normal Contrast";
  } else {
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
    canvas.style.borderColor = "white";
    // Revert other elements as needed
    highContrastButton.textContent = "High Contrast";
  }
});
```

**Explanation:**

- **Toggle Button:** Allows players to switch between normal and high contrast modes.
- **Style Adjustments:** Changes background and text colors to enhance visibility.

#### **D. Optimize Touch Targets**

Ensure that touch controls are large enough to be easily tapped on mobile devices.

```css
/* Update button styles for better touch accessibility */
.menu-button {
  padding: 15px 30px;
  margin: 20px;
  font-size: 20px;
  cursor: pointer;
  background-color: #444;
  border: none;
  color: white;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.menu-button:hover,
.menu-button:focus {
  background-color: #666;
}

@media (max-width: 420px) {
  .menu-button {
    padding: 20px 40px;
    font-size: 24px;
    margin: 15px;
  }
}
```

**Explanation:**

- **Increased Padding and Font Size:** Enhances tap accuracy and ease of use on smaller screens.

---

### **24. Implement Save Slots and Multiple Profiles**

**Objective:** Allow players to create multiple profiles and save their progress separately, catering to different users or playstyles.

**Benefits:**

- **User Personalization:** Players can maintain distinct profiles with unique progress and settings.
- **Flexibility:** Supports shared devices where multiple users can have their own game data.

**Implementation Steps:**

#### **A. Add Profile Management UI**

Include options for creating, selecting, and deleting profiles.

```html
<!-- Modify the Start Menu to include profile management -->
<div id="startMenu">
  <h1>8-bit Car Racing Game</h1>

  <!-- Profile Selection -->
  <div id="profileSelection" style="margin-bottom: 20px;">
    <select id="profileDropdown" class="menu-button">
      <option value="" disabled selected>Select Profile</option>
      <!-- Populate dynamically -->
    </select>
    <button id="createProfileButton" class="menu-button">Create Profile</button>
  </div>

  <!-- Car Selection and Game Mode Buttons -->
  <div
    id="carSelection"
    style="display: flex; justify-content: center; margin: 20px;"
  >
    <!-- Car Options -->
  </div>

  <div
    id="difficultySelection"
    style="display: flex; justify-content: center; margin: 20px;"
  >
    <!-- Difficulty Buttons -->
  </div>

  <button id="startEndless" class="menu-button">Endless Mode</button>
  <button id="startTimeAttack" class="menu-button">Time Attack Mode</button>
</div>
```

#### **B. Manage Profiles in JavaScript**

```javascript
// Profile Variables
let profiles = [];
let currentProfile = null;

// Load Profiles from localStorage
function loadProfiles() {
  const savedProfiles = localStorage.getItem("profiles");
  if (savedProfiles) {
    profiles = JSON.parse(savedProfiles);
  } else {
    // Create a default profile
    profiles.push({
      name: "Player1",
      highScore: 0,
      carUnlocks: { car1: true, car2: false, car3: false },
      achievements: achievements,
    });
    saveProfiles();
  }
  populateProfileDropdown();
}

// Save Profiles to localStorage
function saveProfiles() {
  localStorage.setItem("profiles", JSON.stringify(profiles));
}

// Populate Profile Dropdown
function populateProfileDropdown() {
  const profileDropdown = document.getElementById("profileDropdown");
  profileDropdown.innerHTML =
    '<option value="" disabled selected>Select Profile</option>';
  profiles.forEach((profile, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = profile.name;
    profileDropdown.appendChild(option);
  });
}

// Handle Profile Selection
const profileDropdown = document.getElementById("profileDropdown");
profileDropdown.addEventListener("change", (e) => {
  const selectedIndex = e.target.value;
  currentProfile = profiles[selectedIndex];
  console.log(`Selected Profile: ${currentProfile.name}`);
});

// Handle Create Profile
const createProfileButton = document.getElementById("createProfileButton");
createProfileButton.addEventListener("click", () => {
  const profileName = prompt("Enter new profile name:");
  if (profileName) {
    profiles.push({
      name: profileName,
      highScore: 0,
      carUnlocks: { car1: true, car2: false, car3: false },
      achievements: achievements,
    });
    saveProfiles();
    populateProfileDropdown();
    alert(`Profile "${profileName}" created successfully!`);
  }
});

// Initialize Profiles on Load
window.onload = () => {
  loadProfiles();
  initializeCarUnlocks();
};
```

**Explanation:**

- **Profiles Array:** Stores multiple user profiles with individual data.
- **Profile Dropdown:** Allows players to select their desired profile.
- **Create Profile:** Enables players to add new profiles dynamically.
- **Persistent Storage:** Saves profiles using `localStorage`, ensuring data persistence across sessions.

**Optional Enhancements:**

- **Delete Profiles:** Allow players to delete unwanted profiles.
- **Profile Images:** Let players assign avatars or images to their profiles for personalization.

#### **C. Adjust Game Functions to Use Current Profile**

Modify game functions to operate based on the `currentProfile` instead of global variables.

```javascript
// Modify loadGameState and saveGameState to handle currentProfile
function saveGameState() {
  if (currentProfile) {
    const gameState = {
      highScore: highScore,
      carUnlocks: carUnlocks,
      achievements: achievements,
      selectedCar: selectedCar,
      // Add other state variables as needed
    };
    currentProfile.gameState = gameState;
    saveProfiles();
  }
}

function loadGameState() {
  if (currentProfile && currentProfile.gameState) {
    const { highScore, carUnlocks, achievements, selectedCar } =
      currentProfile.gameState;
    if (highScore !== undefined) highScore = highScore;
    if (carUnlocks) {
      for (const car in carUnlocks) {
        if (carUnlocks[car]) {
          carUnlocks[car].unlocked = carUnlocks[car].unlocked;
          if (carUnlocks[car].unlocked) {
            document.querySelector(
              `.select-car-button[data-car="${car}"]`
            ).disabled = false;
          }
        }
      }
    }
    if (achievements) {
      for (const ach of achievements) {
        const localAch = achievements.find((a) => a.id === ach.id);
        if (localAch) {
          localAch.unlocked = ach.unlocked;
        }
      }
    }
    if (selectedCar) {
      selectedCar = selectedCar;
      // Highlight the selected car button
      document.querySelectorAll(".select-car-button").forEach((btn) => {
        if (btn.getAttribute("data-car") === selectedCar) {
          btn.style.backgroundColor = "#666";
        } else {
          btn.style.backgroundColor = "#444";
        }
      });
    }
  }
}

// Modify resetGame to load current profile's game state
function resetGame() {
  if (currentProfile && currentProfile.gameState) {
    const { highScore, carUnlocks, achievements, selectedCar } =
      currentProfile.gameState;
    if (highScore !== undefined) highScore = highScore;
    if (carUnlocks) {
      for (const car in carUnlocks) {
        if (carUnlocks[car]) {
          carUnlocks[car].unlocked = carUnlocks[car].unlocked;
          if (carUnlocks[car].unlocked) {
            document.querySelector(
              `.select-car-button[data-car="${car}"]`
            ).disabled = false;
          }
        }
      }
    }
    if (achievements) {
      for (const ach of achievements) {
        const localAch = achievements.find((a) => a.id === ach.id);
        if (localAch) {
          localAch.unlocked = ach.unlocked;
        }
      }
    }
    if (selectedCar) {
      selectedCar = selectedCar;
      // Highlight the selected car button
      document.querySelectorAll(".select-car-button").forEach((btn) => {
        if (btn.getAttribute("data-car") === selectedCar) {
          btn.style.backgroundColor = "#666";
        } else {
          btn.style.backgroundColor = "#444";
        }
      });
    }
  } else {
    // Default game state
    currentLane = 1;
    targetLane = currentLane;
    laneTransition = 0;
    health = 5;
    score = 0;
    obstacles = [];
    stripes = [];
    stripeSpeed = 3;
    difficultyLevel = 1;
    lastDifficultyIncreaseTime = Date.now();
    initializeStripes();
    updateScoreDisplay();
  }
}
```

**Explanation:**

- **Profile-Based State Management:** Ensures that each profile has its own game state, allowing multiple players to maintain separate progress.
- **Dynamic Loading:** Loads and saves game state based on the currently selected profile.

**Optional Enhancements:**

- **Profile Avatars:** Allow players to assign unique avatars to their profiles.
- **Settings Per Profile:** Customize game settings individually for each profile, such as audio preferences or difficulty.

---

### **25. Implement User Analytics**

**Objective:** Track player behavior and game performance to inform future improvements and understand player engagement.

**Benefits:**

- **Data-Driven Decisions:** Use insights to enhance game features and fix issues.
- **Player Insights:** Understand how players interact with your game, identifying popular features or common challenges.

**Implementation Steps:**

#### **A. Integrate Analytics Service**

Use services like **Google Analytics** or **Mixpanel** to track user interactions.

**Example with Google Analytics:**

1. **Set Up Google Analytics:**

   - Create a Google Analytics account and obtain the tracking ID.

2. **Add Google Analytics to Your Project:**

   ```html
   <!-- Add within the <head> tag -->
   <script
     async
     src="https://www.googletagmanager.com/gtag/js?id=YOUR_TRACKING_ID"
   ></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag() {
       dataLayer.push(arguments);
     }
     gtag("js", new Date());

     gtag("config", "YOUR_TRACKING_ID");
   </script>
   ```

**Note:** Replace `'YOUR_TRACKING_ID'` with your actual Google Analytics tracking ID.

#### **B. Track Important Events**

Log key events like game start, game over, achievements unlocked, and power-ups collected.

```javascript
// Track Game Start
function startGame() {
  startMenu.classList.add("hidden");
  resetGame();
  isGameRunning = true;
  backgroundMusic.currentTime = 0;
  backgroundMusic.play();
  gtag("event", "game_start", { event_category: "engagement" });
  gameLoop();
}

// Track Game Over
function endGame() {
  isGameRunning = false;
  backgroundMusic.pause();

  // Existing endGame code...

  gtag("event", "game_over", {
    event_category: "engagement",
    event_label: `Score: ${score}`,
  });
}

// Track Achievement Unlock
function unlockAchievement(achievement) {
  achievement.unlocked = true;

  // Existing unlockAchievement code...

  // Log to Google Analytics
  gtag("event", "achievement_unlocked", {
    event_category: "achievements",
    event_label: achievement.name,
  });
}

// Track Power-Up Collection
function activatePowerUp(type) {
  // Existing activation code...

  // Log to Google Analytics
  gtag("event", "power_up_collected", {
    event_category: "power_ups",
    event_label: type,
  });
}
```

**Explanation:**

- **Event Categories:** Organize events into categories like 'engagement', 'achievements', and 'power_ups' for better analysis.
- **Event Labels:** Provide specific identifiers like score values or power-up types for detailed insights.

**Optional Enhancements:**

- **User Sessions:** Track session durations to understand how long players engage with the game.
- **Custom Metrics:** Define and track custom metrics relevant to your game's success.

---

### **26. Enhance UI and UX with Animations and Feedback**

**Objective:** Make the user interface more interactive and responsive by adding animations and visual feedback for user actions.

**Benefits:**

- **Engaging Experience:** Animations can make the game feel more lively and dynamic.
- **User Satisfaction:** Responsive feedback helps users understand the impact of their actions.

**Implementation Steps:**

#### **A. Animate UI Elements**

Add CSS animations to UI elements like buttons or overlays to make them more interactive.

```css
/* Add within the <style> tag */

/* Button Hover Animation */
.menu-button {
  transition: background-color 0.3s, transform 0.2s;
}

.menu-button:hover {
  background-color: #666;
  transform: scale(1.05);
}

/* Achievement Overlay Animation */
#achievementOverlay {
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

#achievementOverlay:not(.hidden) {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

#achievementOverlay.hidden {
  transform: translate(-50%, -50%) scale(0.8);
}
```

**Explanation:**

- **Button Animations:** Buttons slightly enlarge on hover, providing a tactile response to user interaction.
- **Overlay Animations:** Achievement overlays smoothly fade and scale in/out, creating a polished appearance.

#### **B. Add Visual Feedback for Successful Actions**

Provide immediate visual confirmation when players perform successful actions, like collecting a power-up.

```javascript
// Flash the screen green briefly upon collecting a power-up
function collectPowerUpFeedback() {
  ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  setTimeout(() => {
    // No action needed; the next frame will clear the canvas
  }, 200); // Flash duration in milliseconds
}

// Modify power-up collection to include feedback
if (
  carX - carWidth / 2 < pu.x + pu.width &&
  carX + carWidth / 2 > pu.x &&
  canvas.height - carHeight - 10 < pu.y + pu.height &&
  canvas.height - 10 > pu.y
) {
  activatePowerUp(pu.type);
  collectPowerUpFeedback();
  powerUps.splice(i, 1);
  i--;
}
```

**Explanation:**

- **Green Flash:** Indicates successful collection of a power-up, reinforcing positive actions.

**Optional Enhancements:**

- **Particle Burst:** Create a brief particle burst effect when collecting a power-up.
- **Sound Feedback:** Play a unique sound for successful actions to complement visual feedback.

---

### **27. Implement a Comprehensive Help or Settings Menu**

**Objective:** Provide players with access to game settings, controls, and additional information to customize their experience.

**Benefits:**

- **Customization:** Allows players to adjust settings to their preferences.
- **Accessibility:** Enhances game accessibility by offering options like sound controls or difficulty adjustments.

**Implementation Steps:**

#### **A. Add a Settings Button and Overlay**

```html
<!-- Add a Settings Button within the <body> tag -->
<button
  id="settingsButton"
  class="menu-button"
  style="position: absolute; bottom: 20px; right: 20px; z-index: 5;"
>
  Settings
</button>

<!-- Settings Overlay -->
<div
  id="settingsOverlay"
  class="hidden"
  style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(0,0,0,0.9); padding: 20px; border-radius: 10px; text-align: center; z-index: 15;"
>
  <h2>Settings</h2>

  <!-- Sound Controls -->
  <div style="margin: 10px 0;">
    <label for="bgmVolume">Background Music:</label>
    <input type="range" id="bgmVolume" min="0" max="1" step="0.1" value="1" />
  </div>

  <div style="margin: 10px 0;">
    <label for="sfxVolume">Sound Effects:</label>
    <input type="range" id="sfxVolume" min="0" max="1" step="0.1" value="1" />
  </div>

  <!-- Close Settings Button -->
  <button id="closeSettings" class="menu-button">Close</button>
</div>
```

#### **B. Add Event Listeners for Settings**

```javascript
// Settings Overlay Elements
const settingsButton = document.getElementById("settingsButton");
const settingsOverlay = document.getElementById("settingsOverlay");
const closeSettings = document.getElementById("closeSettings");
const bgmVolume = document.getElementById("bgmVolume");
const sfxVolume = document.getElementById("sfxVolume");

// Open Settings Overlay
settingsButton.addEventListener("click", () => {
  settingsOverlay.classList.remove("hidden");
});

// Close Settings Overlay
closeSettings.addEventListener("click", () => {
  settingsOverlay.classList.add("hidden");
});

// Handle Background Music Volume Change
bgmVolume.addEventListener("input", (e) => {
  backgroundMusic.volume = e.target.value;
});

// Handle Sound Effects Volume Change
sfxVolume.addEventListener("input", (e) => {
  collisionSound.volume = e.target.value;
  // Adjust other sound effects if any
});
```

**Explanation:**

- **Volume Sliders:** Allow players to adjust the volume of background music and sound effects independently.
- **Overlay Management:** Players can open and close the settings overlay as needed.

**Optional Enhancements:**

- **Mute Buttons:** Provide quick mute/unmute options for sounds.
- **Difficulty Settings:** Allow players to adjust game difficulty from the settings menu.
- **Control Reminders:** Display a summary of controls for easy reference.

---

### **28. Implement a Comprehensive Game Over Summary**

**Objective:** After the game ends, provide a detailed summary that includes statistics like total score, time survived, number of obstacles avoided, and achievements unlocked.

**Benefits:**

- **Player Feedback:** Gives players insights into their performance.
- **Motivation:** Encourages players to improve and achieve better stats in subsequent games.
- **Engagement:** Enhances the post-game experience, making it more satisfying.

**Implementation Steps:**

#### **A. Modify Game Over Screen to Include Summary**

```html
<!-- Modify the Game Over Screen to include a summary section -->
<div id="gameOverScreen" class="hidden">
  <h1>Game Over!</h1>
  <p id="finalScore">Your Score: 0</p>

  <!-- Game Summary -->
  <div id="gameSummary" style="margin: 20px; text-align: left;">
    <h3>Game Summary:</h3>
    <p>Time Survived: <span id="timeSurvived">0</span> seconds</p>
    <p>Obstacles Avoided: <span id="obstaclesAvoided">0</span></p>
    <p>Power-Ups Collected: <span id="powerUpsCollected">0</span></p>
    <h3>Achievements Unlocked:</h3>
    <div id="achievementsUnlocked"></div>
  </div>

  <button id="restartButton" class="menu-button">Restart Game</button>
</div>
```

#### **B. Track Additional Statistics During Gameplay**

Add variables to track time survived, obstacles avoided, and power-ups collected.

```javascript
// Additional Statistics Variables
let obstaclesAvoided = 0;
let powerUpsCollected = 0;
let gameStartTime = null;

// Modify gameLoop to track time and stats
function gameLoop() {
  if (!isGameRunning || isPaused) return;

  if (!gameStartTime) gameStartTime = Date.now();

  const elapsedTime = Date.now() - gameStartTime;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ... existing game loop code ...

  // Track obstacles avoided
  obstacles.forEach((obs) => {
    if (obs.y > canvas.height) {
      obstaclesAvoided++;
    }
  });

  // Track power-ups collected
  // Increment powerUpsCollected in the power-up collection logic
  if (
    carX - carWidth / 2 < pu.x + pu.width &&
    carX + carWidth / 2 > pu.x &&
    canvas.height - carHeight - 10 < pu.y + pu.height &&
    canvas.height - 10 > pu.y
  ) {
    activatePowerUp(pu.type);
    powerUpsCollected++;
    powerUps.splice(i, 1);
    i--;
  }

  // ... rest of the game loop code ...

  // Update score and difficulty
  updateScoreAndDifficulty();

  // Existing game loop code...
}
```

#### **C. Update the `endGame` Function to Display Summary**

```javascript
function endGame() {
  isGameRunning = false;
  backgroundMusic.pause();
  cancelAnimationFrame(animationId);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  // Calculate statistics
  const timeSurvived = Math.floor((Date.now() - gameStartTime) / 1000);

  // Update Game Over Screen
  finalScoreText.textContent = `Your Score: ${score}`;
  document.getElementById("timeSurvived").textContent = timeSurvived;
  document.getElementById("obstaclesAvoided").textContent = obstaclesAvoided;
  document.getElementById("powerUpsCollected").textContent = powerUpsCollected;

  // Display Unlocked Achievements
  const achievementsUnlockedDiv = document.getElementById(
    "achievementsUnlocked"
  );
  achievementsUnlockedDiv.innerHTML = "";
  achievements.forEach((achievement) => {
    if (achievement.unlocked) {
      const p = document.createElement("p");
      p.textContent = achievement.name;
      achievementsUnlockedDiv.appendChild(p);
    }
  });

  // Submit score to leaderboard
  if (score > highScore) {
    const playerName =
      prompt("New High Score! Enter your name:") || "Anonymous";
    submitScore(playerName, score);
  }

  // Display leaderboard
  displayLeaderboard();

  // Show Game Over Screen
  gameOverScreen.classList.remove("hidden");

  // Reset additional statistics
  obstaclesAvoided = 0;
  powerUpsCollected = 0;
  gameStartTime = null;
}
```

**Explanation:**

- **Statistics Tracking:** Keeps count of how long the player survived, how many obstacles they avoided, and how many power-ups they collected.
- **Game Over Summary:** Displays detailed statistics and a list of unlocked achievements, providing comprehensive feedback to the player.

**Optional Enhancements:**

- **Graphical Charts:** Use canvas or libraries like Chart.js to visualize statistics.
- **Replay Option:** Offer a replay feature to watch the last few seconds of the game.

---

### **29. Implement Responsive Animations and Transitions**

**Objective:** Ensure that animations and transitions adapt smoothly across different devices and screen sizes, maintaining performance and visual consistency.

**Benefits:**

- **Consistent Experience:** Players enjoy the same quality of animations regardless of their device.
- **Performance Optimization:** Prevents lag or stutter on lower-end devices.

**Implementation Steps:**

#### **A. Optimize Animation Parameters Based on Device Performance**

Adjust animation speeds and effects based on the device's capabilities.

```javascript
// Detect device performance
const isLowPerformance = navigator.hardwareConcurrency <= 2;

// Adjust animation parameters
const particleCount = isLowPerformance ? 10 : 20;
const particleSpeed = isLowPerformance ? 1 : 2;

// Modify particle creation accordingly
function createParticles(x, y) {
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(x, y));
  }
}
```

**Explanation:**

- **Device Detection:** Uses `navigator.hardwareConcurrency` to estimate device performance.
- **Dynamic Adjustments:** Reduces particle count and speed on low-performance devices to maintain smooth gameplay.

#### **B. Use CSS for Hardware-Accelerated Animations**

Leverage CSS transforms and opacity changes for smoother and more efficient animations.

```css
/* Example: Animate the achievement overlay with CSS */
#achievementOverlay {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

#achievementOverlay.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
```

**Explanation:**

- **Hardware Acceleration:** CSS transitions using `transform` and `opacity` are often hardware-accelerated, leading to smoother animations.
- **Class-Based Animation:** Toggles a class to trigger the animation, ensuring consistency and maintainability.

---

### **30. Final Thoughts and Best Practices**

You've already implemented a robust set of features in your 8-bit car racing game, and the enhancements suggested above will further elevate its quality and player experience. Here are some best practices to keep in mind as you continue developing your game:

1. **Modular Code Structure:**

   - **Separation of Concerns:** Organize your code by separating different functionalities into distinct classes or modules.
   - **Reusability:** Write reusable functions and components to avoid code duplication.

2. **Performance Optimization:**

   - **Efficient Rendering:** Minimize canvas state changes and optimize drawing operations.
   - **Resource Management:** Load and manage resources like images and sounds efficiently to prevent memory leaks.

3. **Consistent Testing:**

   - **Cross-Device Testing:** Ensure that the game functions correctly across various devices and screen sizes.
   - **Bug Tracking:** Regularly test features to identify and fix bugs promptly.

4. **User Feedback:**

   - **Surveys and Feedback Forms:** Allow players to provide feedback to understand their preferences and pain points.
   - **Analytics:** Utilize analytics to gain insights into player behavior and game performance.

5. **Documentation:**

   - **Code Comments:** Maintain clear and concise comments within your code to explain complex logic.
   - **User Guides:** Provide documentation or in-game help to assist players in understanding game mechanics.

6. **Continuous Improvement:**

   - **Iterative Development:** Continuously refine and add features based on player feedback and your own creative ideas.
   - **Stay Updated:** Keep abreast of new technologies and best practices in game development to incorporate into your project.

7. **Accessibility:**

   - **Inclusivity:** Ensure that your game is accessible to players with disabilities by following accessibility guidelines.
   - **Customizable Settings:** Provide options for players to customize controls, audio, and visual settings to suit their needs.

8. **Monetization (Optional):**
   - **Ads or In-App Purchases:** If you plan to monetize your game, consider integrating ads or offering in-app purchases for cosmetic items.
   - **User Experience:** Ensure that monetization methods do not disrupt the gameplay experience.

---

### **Conclusion**

You've built a feature-rich 8-bit car racing game with a solid foundation. By implementing the enhancements outlined above, you can create a more engaging, dynamic, and polished game that offers players a rewarding and enjoyable experience. Remember to prioritize user experience, maintain a clean and organized codebase, and continuously seek feedback to iterate and improve your game.

If you have any specific features you'd like to implement next or encounter any challenges during development, feel free to reach out. I'm here to help you create an amazing game!

Happy coding and game development! 🚗💨🎮
