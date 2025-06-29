/*
  # Initial Gaming Platform Schema

  1. New Tables
    - `categories`
      - `id` (integer, primary key, auto-increment)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text, nullable)
      - `created_at` (timestamp)
    
    - `games`
      - `id` (integer, primary key, auto-increment)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `thumbnail_url` (text)
      - `category_id` (integer, foreign key to categories)
      - `is_premium` (boolean, default false)
      - `price` (decimal, nullable)
      - `game_data` (text, stores HTML/JS game content)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `purchases`
      - `id` (integer, primary key, auto-increment)
      - `user_id` (uuid, foreign key to auth.users)
      - `game_id` (integer, foreign key to games)
      - `purchase_date` (timestamp)
      - `amount_paid` (decimal)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to categories and games
    - Add policies for authenticated users to read their own purchases
    - Add policies for authenticated users to manage their profile

  3. Sample Data
    - Insert sample categories and games for testing
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  game_data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  game_id INTEGER NOT NULL REFERENCES games(id),
  purchase_date TIMESTAMPTZ DEFAULT now(),
  amount_paid DECIMAL(10,2) NOT NULL
);

-- Create users table for extended profile data
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read access)
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- Games policies (public read access)
CREATE POLICY "Games are viewable by everyone"
  ON games
  FOR SELECT
  TO public
  USING (true);

-- Purchases policies (users can only see their own purchases)
CREATE POLICY "Users can view own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users policies (users can manage their own profile)
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
  ('Arcade', 'arcade', 'Classic arcade-style games'),
  ('Puzzle', 'puzzle', 'Brain-teasing puzzle games'),
  ('Action', 'action', 'Fast-paced action games'),
  ('Strategy', 'strategy', 'Strategic thinking games'),
  ('Sports', 'sports', 'Sports and racing games')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample games
INSERT INTO games (title, slug, description, thumbnail_url, category_id, is_premium, price, game_data) VALUES
  (
    'Snake Classic',
    'snake-classic',
    'The classic snake game where you eat food and grow longer while avoiding walls and your own tail.',
    'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
    1,
    false,
    NULL,
    '<div style="width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center; color: white; font-family: Arial;"><h2>Snake Game</h2><p>Use arrow keys to play!</p><canvas id="gameCanvas" width="400" height="400" style="border: 2px solid white; background: #111;"></canvas><script>const canvas = document.getElementById("gameCanvas"); const ctx = canvas.getContext("2d"); let snake = [{x: 200, y: 200}]; let food = {x: 100, y: 100}; let dx = 20; let dy = 0; let score = 0; function drawSnake() { ctx.fillStyle = "#0f0"; snake.forEach(segment => { ctx.fillRect(segment.x, segment.y, 20, 20); }); } function drawFood() { ctx.fillStyle = "#f00"; ctx.fillRect(food.x, food.y, 20, 20); } function moveSnake() { const head = {x: snake[0].x + dx, y: snake[0].y + dy}; snake.unshift(head); if (head.x === food.x && head.y === food.y) { score += 10; generateFood(); } else { snake.pop(); } } function generateFood() { food.x = Math.floor(Math.random() * 20) * 20; food.y = Math.floor(Math.random() * 20) * 20; } function checkCollision() { const head = snake[0]; return head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400 || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y); } function gameLoop() { if (checkCollision()) { alert("Game Over! Score: " + score); snake = [{x: 200, y: 200}]; dx = 20; dy = 0; score = 0; generateFood(); } ctx.clearRect(0, 0, 400, 400); drawFood(); moveSnake(); drawSnake(); } document.addEventListener("keydown", (e) => { if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -20; } else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 20; } else if (e.key === "ArrowLeft" && dx === 0) { dx = -20; dy = 0; } else if (e.key === "ArrowRight" && dx === 0) { dx = 20; dy = 0; } }); setInterval(gameLoop, 150);</script></div>'
  ),
  (
    'Pong Retro',
    'pong-retro',
    'Classic Pong game for two players. Use W/S keys for left paddle and Up/Down arrows for right paddle.',
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    1,
    false,
    NULL,
    '<div style="width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center; color: white; font-family: Arial;"><div><h2>Pong Game</h2><p>Left: W/S keys | Right: Up/Down arrows</p><canvas id="pongCanvas" width="600" height="300" style="border: 2px solid white; background: #000;"></canvas></div><script>const canvas = document.getElementById("pongCanvas"); const ctx = canvas.getContext("2d"); const paddleHeight = 60; const paddleWidth = 10; let leftPaddle = {x: 10, y: 120, dy: 0}; let rightPaddle = {x: 580, y: 120, dy: 0}; let ball = {x: 300, y: 150, dx: 3, dy: 2}; let leftScore = 0; let rightScore = 0; const keys = {}; function drawRect(x, y, w, h) { ctx.fillStyle = "#fff"; ctx.fillRect(x, y, w, h); } function drawBall() { ctx.beginPath(); ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); } function update() { leftPaddle.y += leftPaddle.dy; rightPaddle.y += rightPaddle.dy; if (leftPaddle.y < 0) leftPaddle.y = 0; if (leftPaddle.y > 240) leftPaddle.y = 240; if (rightPaddle.y < 0) rightPaddle.y = 0; if (rightPaddle.y > 240) rightPaddle.y = 240; ball.x += ball.dx; ball.y += ball.dy; if (ball.y <= 0 || ball.y >= 300) ball.dy = -ball.dy; if (ball.x <= 20 && ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + paddleHeight) ball.dx = -ball.dx; if (ball.x >= 580 && ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight) ball.dx = -ball.dx; if (ball.x < 0) { rightScore++; ball.x = 300; ball.y = 150; ball.dx = 3; } if (ball.x > 600) { leftScore++; ball.x = 300; ball.y = 150; ball.dx = -3; } } function draw() { ctx.clearRect(0, 0, 600, 300); drawRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight); drawRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight); drawBall(); ctx.font = "20px Arial"; ctx.fillText(leftScore, 250, 30); ctx.fillText(rightScore, 330, 30); } function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); } document.addEventListener("keydown", (e) => { keys[e.key] = true; if (keys["w"] || keys["W"]) leftPaddle.dy = -3; if (keys["s"] || keys["S"]) leftPaddle.dy = 3; if (keys["ArrowUp"]) rightPaddle.dy = -3; if (keys["ArrowDown"]) rightPaddle.dy = 3; }); document.addEventListener("keyup", (e) => { keys[e.key] = false; if (!keys["w"] && !keys["W"] && !keys["s"] && !keys["S"]) leftPaddle.dy = 0; if (!keys["ArrowUp"] && !keys["ArrowDown"]) rightPaddle.dy = 0; }); gameLoop();</script></div>'
  ),
  (
    'Tetris Premium',
    'tetris-premium',
    'Classic Tetris with enhanced graphics and sound effects. Premium version includes special power-ups and themes.',
    'https://images.pexels.com/photos/1293261/pexels-photo-1293261.jpeg',
    2,
    true,
    4.99,
    '<div style="width: 100%; height: 100%; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-family: Arial;"><div style="text-align: center; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px;"><h2>Premium Tetris</h2><p>Enhanced version with special effects!</p><div style="width: 300px; height: 400px; background: #000; border: 3px solid #fff; margin: 20px auto; position: relative; overflow: hidden;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;"><div style="font-size: 24px; margin-bottom: 20px;">🎮</div><div>Premium Game Loaded!</div><div style="margin-top: 20px; font-size: 14px;">Use arrow keys to play</div></div></div></div></div>'
  ),
  (
    'Racing Thunder',
    'racing-thunder',
    'High-speed racing game with multiple tracks and vehicles. Premium features include custom cars and exclusive tracks.',
    'https://images.pexels.com/photos/358220/pexels-photo-358220.jpeg',
    5,
    true,
    7.99,
    '<div style="width: 100%; height: 100%; background: linear-gradient(180deg, #ff6b6b 0%, #ee5a24 100%); display: flex; align-items: center; justify-content: center; color: white; font-family: Arial;"><div style="text-align: center; background: rgba(0,0,0,0.8); padding: 40px; border-radius: 15px;"><h2>Racing Thunder</h2><p>Premium racing experience!</p><div style="width: 400px; height: 300px; background: #000; border: 3px solid #fff; margin: 20px auto; position: relative; overflow: hidden;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;"><div style="font-size: 24px; margin-bottom: 20px;">🏎️</div><div>Premium Racing Game</div><div style="margin-top: 20px; font-size: 14px;">Arrow keys to steer and accelerate</div></div></div></div></div>'
  ),
  (
    'Memory Master',
    'memory-master',
    'Test your memory with this challenging puzzle game. Remember the sequence and repeat it back.',
    'https://images.pexels.com/photos/1040157/pexels-photo-1040157.jpeg',
    2,
    false,
    NULL,
    '<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-family: Arial;"><div style="text-align: center;"><h2>Memory Master</h2><p>Watch the sequence, then repeat it!</p><div style="display: grid; grid-template-columns: repeat(2, 100px); gap: 10px; margin: 20px auto; justify-content: center;"><div style="width: 100px; height: 100px; background: #ff4757; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px;" onclick="playSound(1)">1</div><div style="width: 100px; height: 100px; background: #2ed573; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px;" onclick="playSound(2)">2</div><div style="width: 100px; height: 100px; background: #1e90ff; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px;" onclick="playSound(3)">3</div><div style="width: 100px; height: 100px; background: #ffa502; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px;" onclick="playSound(4)">4</div></div><button onclick="startGame()" style="background: #fff; color: #333; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">Start Game</button></div><script>let sequence = []; let playerSequence = []; let level = 1; function startGame() { sequence = []; playerSequence = []; level = 1; nextLevel(); } function nextLevel() { playerSequence = []; sequence.push(Math.floor(Math.random() * 4) + 1); showSequence(); } function showSequence() { let i = 0; const interval = setInterval(() => { if (i < sequence.length) { flashButton(sequence[i]); i++; } else { clearInterval(interval); } }, 800); } function flashButton(num) { const button = document.querySelector(`div[onclick="playSound(${num})"]`); const originalBg = button.style.background; button.style.background = "#fff"; button.style.color = "#000"; setTimeout(() => { button.style.background = originalBg; button.style.color = "#fff"; }, 400); } function playSound(num) { playerSequence.push(num); if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) { alert("Wrong! Game Over. Level reached: " + level); startGame(); return; } if (playerSequence.length === sequence.length) { if (playerSequence.length === sequence.length) { level++; setTimeout(nextLevel, 1000); } } }</script></div>'
  ),
  (
    'Space Invaders',
    'space-invaders',
    'Defend Earth from alien invasion in this classic arcade shooter. Move and shoot to destroy all enemies.',
    'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg',
    3,
    false,
    NULL,
    '<div style="width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center; color: white; font-family: Arial;"><div style="text-align: center;"><h2>Space Invaders</h2><p>Use arrow keys to move, spacebar to shoot!</p><canvas id="spaceCanvas" width="500" height="400" style="border: 2px solid white; background: #000;"></canvas></div><script>const canvas = document.getElementById("spaceCanvas"); const ctx = canvas.getContext("2d"); let player = {x: 225, y: 350, width: 50, height: 30}; let bullets = []; let enemies = []; let score = 0; let gameRunning = true; for (let row = 0; row < 5; row++) { for (let col = 0; col < 10; col++) { enemies.push({x: col * 45 + 25, y: row * 40 + 50, width: 30, height: 20, alive: true}); } } function drawPlayer() { ctx.fillStyle = "#0f0"; ctx.fillRect(player.x, player.y, player.width, player.height); } function drawBullets() { ctx.fillStyle = "#ff0"; bullets.forEach(bullet => { ctx.fillRect(bullet.x, bullet.y, 3, 10); }); } function drawEnemies() { ctx.fillStyle = "#f00"; enemies.forEach(enemy => { if (enemy.alive) { ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height); } }); } function updateBullets() { bullets.forEach((bullet, index) => { bullet.y -= 5; if (bullet.y < 0) { bullets.splice(index, 1); } }); } function checkCollisions() { bullets.forEach((bullet, bulletIndex) => { enemies.forEach((enemy, enemyIndex) => { if (enemy.alive && bullet.x < enemy.x + enemy.width && bullet.x + 3 > enemy.x && bullet.y < enemy.y + enemy.height && bullet.y + 10 > enemy.y) { enemy.alive = false; bullets.splice(bulletIndex, 1); score += 10; } }); }); } function gameLoop() { if (!gameRunning) return; ctx.clearRect(0, 0, 500, 400); drawPlayer(); drawBullets(); drawEnemies(); updateBullets(); checkCollisions(); ctx.fillStyle = "#fff"; ctx.font = "16px Arial"; ctx.fillText("Score: " + score, 10, 25); if (enemies.every(enemy => !enemy.alive)) { ctx.fillText("YOU WIN!", 200, 200); gameRunning = false; } requestAnimationFrame(gameLoop); } const keys = {}; document.addEventListener("keydown", (e) => { keys[e.key] = true; if (e.key === " ") { bullets.push({x: player.x + 23, y: player.y}); e.preventDefault(); } }); document.addEventListener("keyup", (e) => { keys[e.key] = false; }); setInterval(() => { if (keys["ArrowLeft"] && player.x > 0) player.x -= 5; if (keys["ArrowRight"] && player.x < 450) player.x += 5; }, 16); gameLoop();</script></div>'
  )
ON CONFLICT (slug) DO NOTHING;