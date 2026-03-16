class Collisions {
    static checkCircleCollision = (ball1, ball2) => {
        let catX = Math.abs(ball1.x - ball2.x);
        let catY = Math.abs(ball1.y - ball2.y);
        let distance = Math.sqrt(catX * catX + catY * catY);

        return distance < ball1.radius + ball2.radius;
    }
}
