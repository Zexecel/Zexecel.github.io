window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1600; 
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameOver = false;
    let lives = 3;
    let enemyInterval = 1000; 
    let randomEnemyInterval = Math.random() * 1000 + 500;
    let enemySpeedIncrease = 1; 

    // Sound elements
    const soundtrack = document.getElementById('soundtrack');
    soundtrack.volume = 0.1; // Adjust the volume of the soundtrack
    const damageSound = document.getElementById('damageSound');
    const deathSound = document.getElementById('deathSound');
    const jumpSound = document.getElementById('jumpSound');
    const menuNavigationSound = document.getElementById('menuNavigationSound');
    const menuClickSound = document.getElementById('menuClickSound'); // New sound element for menu clicks
    const spiderSound = document.getElementById('spiderSound');
    const wormSound = document.getElementById('wormSound');

    function resizeCanvas() {
        const aspectRatio = 1600 / 720;
        let width = window.innerWidth;
        let height = window.innerHeight;
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class InputHandler {
        constructor() {
            this.keys = {};
            window.addEventListener('keydown', e => {
                this.keys[e.key] = true;
            });
            window.addEventListener('keyup', e => {
                delete this.keys[e.key];
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 10;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.invincible = false;
            this.invincibleTimer = 0;
            this.invincibleDuration = 3000;
        }

        draw(context) {
            if (this.invincible) {
                if (Math.floor(this.invincibleTimer / 100) % 2) {
                    context.globalAlpha = 0.5;
                } else {
                    context.globalAlpha = 1;
                }
            }
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            context.globalAlpha = 1;
        }

        update(input, deltaTime, enemies) {
            if (this.invincible) {
                this.invincibleTimer += deltaTime;
                if (this.invincibleTimer > this.invincibleDuration) {
                    this.invincible = false;
                    this.invincibleTimer = 0;
                }
            }

            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.colliderWidth / 2) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.colliderHeight / 2) - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.colliderWidth / 2 + this.width / 2 && !this.invincible) {
                    lives--;
                    enemy.markedForDeletion = true;
                    damageSound.play(); // Play damage sound
                    this.invincible = true;
                    if (lives <= 0) {
                        gameOver = true;
                        deathSound.play(); // Play death sound
                        soundtrack.pause(); // Stop the soundtrack
                    }
                }
            });

            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            if (input.keys['ArrowRight']) {
                this.speed = 5;
            } else if (input.keys['ArrowLeft']) {
                this.speed = -5;
            } else {
                this.speed = 0;
            }

            if (input.keys['ArrowUp'] && this.onGround()) {
                this.vy -= 32;
                jumpSound.play(); // Play jump sound
            }

            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;

            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }

            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }

        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 7;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }

        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 100; 
            this.markedForDeletion = false;
            this.colliderWidth = this.width * 0.6;
            this.colliderHeight = this.height * 0.6;
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }

        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            this.x -= this.speed / deltaTime * enemySpeedIncrease;
            if (this.x < 0 - this.width) this.markedForDeletion = true;
            score++;
        }
    }

    class Ghost extends Enemy {
        constructor(gameWidth, gameHeight) {
            super(gameWidth, gameHeight);
            this.image = document.getElementById('ghostImage');
            this.width = 261;
            this.height = 209;
            this.x = gameWidth;
            this.y = Math.random() * gameHeight * 0.4;
            this.speed = (Math.random() * 4 + 1) * (Math.random() > 0.5 ? 1.5 : 1);
            this.angle = 0;
            this.curve = Math.random() * 3;
            this.timer = 0;
            this.alpha = 1;
            this.horizontalRange = Math.random() * 100 + 50;
        }

        draw(context) {
            context.save();
            context.globalAlpha = this.alpha;
            super.draw(context);
            context.restore();
        }

        update(deltaTime) {
            super.update(deltaTime);
            this.x -= this.speed / deltaTime * enemySpeedIncrease;
            this.y += Math.sin(this.angle) * this.curve;
            this.angle += 0.1 * enemySpeedIncrease;
            if (this.x < this.gameWidth / 2 - this.horizontalRange) {
                this.x = this.gameWidth / 2 - this.horizontalRange;
            }
            this.timer += deltaTime;
            if (this.timer > 8000) {
                this.alpha -= 0.02;
                if (this.alpha <= 0) this.markedForDeletion = true;
            }
            if (this.x < 0 - this.width) this.markedForDeletion = true;
        }
    }

    class Spider extends Enemy {
        constructor(gameWidth, gameHeight) {
            super(gameWidth, gameHeight);
            this.image = document.getElementById('spiderImage');
            this.width = 155;
            this.height = 88;
            this.x = (gameWidth / 2 - this.width / 2) + Math.random() * (gameWidth * 0.25 - this.width / 2);
            this.y = 0 - this.height;
            this.speedY = Math.random() * 5 + 5;
            this.maxLength = Math.random() * gameHeight * 0.4;
            this.vy = Math.random() * 1 + 1;
            this.colliderWidth = this.width / 4;
            this.colliderHeight = this.height / 4;
        }

        draw(context) {
            context.beginPath();
            context.moveTo(this.x + this.width / 2, 0);
            context.lineTo(this.x + this.width / 2, this.y + 50);
            context.stroke();
            super.draw(context);
        }

        update(deltaTime) {
            super.update(deltaTime);
            this.y += this.vy * deltaTime * enemySpeedIncrease;
            if (this.y > this.maxLength) this.vy *= -1;
            if (this.y < 0 - this.height * 2) this.markedForDeletion = true;
        }

        detectCollision(player) {
            const dx = (this.x + this.colliderWidth / 2) - (player.x + player.width / 2);
            const dy = (this.y + this.colliderHeight / 2) - (player.y + player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < this.colliderWidth / 2 + player.width / 2;
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            const randomEnemy = Math.random();
            if (randomEnemy < 0.4) {
                enemies.push(new Enemy(canvas.width, canvas.height));
                wormSound.play(); // Play worm sound
            } else if (randomEnemy < 0.7) {
                enemies.push(new Ghost(canvas.width, canvas.height));
            } else {
                enemies.push(new Spider(canvas.width, canvas.height));
                spiderSound.play(); // Play spider sound
            }
            randomEnemyInterval = Math.random() * 1000 + 500;
            enemyTimer = 0;
            if (enemyInterval > 300) {
                enemyInterval -= 10;
            }
            enemySpeedIncrease += 0.01;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
            if (enemy instanceof Spider && enemy.detectCollision(player)) {
                lives--;
                enemy.markedForDeletion = true;
                damageSound.play(); // Play damage sound
                if (lives <= 0) {
                    gameOver = true;
                    deathSound.play(); // Play death sound
                    soundtrack.pause(); // Stop the soundtrack
                }
            }
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function displayStatusText(context) {
        context.font = '40px Helvetica';
        context.textAlign = 'left'; // Set text alignment to left
        context.fillStyle = 'black';
        context.fillText('Score ' + score, 50, 50); // Adjust to position the score text
        context.fillStyle = 'white';
        context.fillText('Score ' + score, 53, 53); // Adjust to position the score text
        document.getElementById('currentScore').innerText = 'Score: ' + score;
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, try again!', canvas.width / 2, 200);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, try again!', canvas.width / 2 + 2, 203);
            document.getElementById('retryButton').style.display = 'block';
            document.getElementById('quitButton').style.display = 'block';
            document.getElementById('scoreContainer').style.display = 'block';
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
            document.getElementById('highScore').innerText = 'High Score: ' + highScore;
        }
        context.textAlign = 'right';
        for (let i = 0; i < lives; i++) {
            context.drawImage(document.getElementById('heartImage'), canvas.width - 50 - (i * 30), 20, 25, 25);
        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;

    function animate(timeStamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
        if (!gameOver) {
            requestAnimationFrame(animate);
        }
    }

    document.getElementById('confirmButton').addEventListener('click', function () {
        document.getElementById('tutorial').style.display = 'none';
        menuClickSound.play(); // Play menu click sound on click
        soundtrack.play(); // Play the soundtrack
        animate(0); // Start the game animation
    });

    document.getElementById('retryButton').addEventListener('click', function () {
        menuClickSound.play(); // Play menu click sound on click
        window.location.reload();
    });

    document.getElementById('quitButton').addEventListener('click', function () {
        menuClickSound.play(); // Play menu click sound on click
        const videoContainer = document.getElementById('videoContainer');
        videoContainer.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
        videoContainer.style.display = 'block';
    });

    // Add mouseover event listeners for the buttons
    document.getElementById('retryButton').addEventListener('mouseover', function () {
        menuNavigationSound.play(); // Play menu navigation sound on hover
    });

    document.getElementById('quitButton').addEventListener('mouseover', function () {
        menuNavigationSound.play(); // Play menu navigation sound on hover
    });

    document.getElementById('confirmButton').addEventListener('mouseover', function () {
        menuNavigationSound.play(); // Play menu navigation sound on hover
    });

    // Draw the initial background and player for the standby phase
    background.draw(ctx);
    player.draw(ctx);
});
