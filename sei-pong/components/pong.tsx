import React, { useEffect, useRef } from 'react';

const Pong: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const playerPaddleDirection = useRef<number>(0);
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        
        const paddleSpeed = 850;
        const aiSpeed = 850;
        let playerScore = 0;
        let aiScore = 0;
        let lastTime = Date.now();

        interface Ball {
            x: number;
            y: number;
            radius: number;
            speedX: number;
            speedY: number;
        }

        const ball: Ball = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 10,
            speedX: 850,
            speedY: 850
        };

        const paddleWidth = 10;
        const paddleHeight = 100;

        interface Paddle {
            x: number;
            y: number;
        }

        const playerPaddle: Paddle = {
            x: 0,
            y: canvas.height / 2 - paddleHeight / 2
        };

        const aiPaddle: Paddle = {
            x: canvas.width - paddleWidth,
            y: canvas.height / 2 - paddleHeight / 2
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            playerPaddle.y = canvas.height / 2; 
            aiPaddle.y = canvas.height / 2;
            aiPaddle.x = canvas.width - paddleWidth
        }
        resizeCanvas();

        function drawBall() {
            if (!ctx) return;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();
        }
        
        function drawPaddle(x: number, y: number) {
            if (!ctx) return;
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, paddleWidth, paddleHeight);
        }
        
        function checkCollision(ball: Ball, paddle: Paddle): boolean {
            return ball.x < paddle.x + paddleWidth &&
                ball.x + ball.radius > paddle.x &&
                ball.y < paddle.y + paddleHeight &&
                ball.y + ball.radius > paddle.y;
        }
        
       

        function drawDottedLine() {
            if (!ctx) return;
            ctx.beginPath();
            ctx.setLineDash([10, 15]);
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.strokeStyle = 'white';
            ctx.stroke();
            ctx.closePath();
        }
        
        function drawScore() {
            if (!ctx) return;
            ctx.font = '35px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(playerScore.toString(), canvas.width / 4, 50);
            ctx.fillText(aiScore.toString(), 3 * canvas.width / 4, 50);
        }
        
        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.speedX = -(ball.speedX/ball.speedX) * 850;
            ball.speedY = 5 * (Math.random() > 0.5 ? 1 : -1);
        }
        
        function adjustBallSpeedY(ball: Ball, paddle: Paddle) {
            let relativeIntersectY = (paddle.y + (paddleHeight / 2)) - ball.y;
            let normalizedRelativeIntersectionY = (relativeIntersectY / (paddleHeight / 2));
            let maxBounceAngle = 5 * Math.PI / 12; // 75 degrees
            let bounceAngle = normalizedRelativeIntersectionY * maxBounceAngle;
            let totalSpeed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
            ball.speedY = -totalSpeed * Math.sin(bounceAngle);
            ball.speedX = ball.speedX > 0 ? -totalSpeed * Math.cos(bounceAngle) : totalSpeed * Math.cos(bounceAngle);
        }
        

        function draw() {
            if (!ctx) return;
            let now = Date.now();
            let deltaTime = (now - lastTime) / 1000;
            lastTime = now;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawDottedLine();
            drawBall();
            drawScore();
            // Update player paddle position
            playerPaddle.y += playerPaddleDirection.current * paddleSpeed * deltaTime;
            // Ensure the paddle stays within the canvas boundaries
            playerPaddle.y = Math.max(Math.min(playerPaddle.y, canvas.height - paddleHeight), 0);
            drawPaddle(playerPaddle.x, playerPaddle.y);

            // AI Paddle Movement
            aiPaddle.y += aiSpeed * (ball.y < aiPaddle.y + paddleHeight / 2 ? -1 : 1) * deltaTime;
            // Prevent the AI paddle from going out of bounds
            aiPaddle.y = Math.max(Math.min(aiPaddle.y, canvas.height - paddleHeight), 0);
            drawPaddle(aiPaddle.x, aiPaddle.y);

            // Ball collision with top and bottom
            if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
                ball.speedY = -ball.speedY;
            }

            // Ball collision with paddles
            if (checkCollision(ball, playerPaddle)) {
                adjustBallSpeedY(ball, playerPaddle);
            }
            if (checkCollision(ball, aiPaddle)) {
                adjustBallSpeedY(ball, aiPaddle);
            }

            // Update ball position
            ball.x += ball.speedX * deltaTime;
            ball.y += ball.speedY * deltaTime;

            // Score update
            if (ball.x - ball.radius > canvas.width) {
                playerScore++;
                resetBall();
            } else if (ball.x + ball.radius < 0) {
                aiScore++;
                resetBall();
            }

            requestAnimationFrame(draw);
        }
        // Event handlers remain the same, but they modify the .current property
        const keyDownHandler = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowUp':
                    playerPaddleDirection.current = -1;
                    break;
                case 'ArrowDown':
                    playerPaddleDirection.current = 1;
                    break;
            }
        };

        const keyUpHandler = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                    playerPaddleDirection.current = 0;
                    break;
            }
        };
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        window.addEventListener('resize', resizeCanvas);
        // Start the game loop
        draw();

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
            window.removeEventListener('resize', resizeCanvas)
        };
    }, []);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '86vh', display: 'block', border: '1px solid black' }}></canvas>;
};

export default Pong;

