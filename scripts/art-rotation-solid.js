{
    class ThreeDWorld {
        constructor() {
            this.figures = [];
            this.FOV = 1000;
            this.drawEdges = true;
            this.figureTypes = [];
            this.setFigureTypes();
            this.figureInfo = {};
        }

        shouldDrawFace = (vertices) => {
            const vector1 = Utils.subtractVectors(vertices[1], vertices[0]);
            const vector2 = Utils.subtractVectors(vertices[2], vertices[0]);
    
            const normal = Utils.crossProduct(vector1, vector2);
    
            const cameraDirection = [0, 0, 1];
    
            return Utils.dotProduct(normal, cameraDirection) > 0;
        }

        draw = () => {

            this.figures.forEach(figure => {
                
                figure.faces.forEach(face => {
                    const faceVertices = face.map(index => figure.vertices[index]);
                    if (this.shouldDrawFace(faceVertices)) {

                
                        ctx.fillStyle = "#0080f0";
                        ctx.beginPath();
                        ctx.moveTo(figure.vertices[face[0]][0], figure.vertices[face[0]][1]);
                        ctx.lineTo(figure.vertices[face[1]][0], figure.vertices[face[1]][1]);
                        ctx.lineTo(figure.vertices[face[2]][0], figure.vertices[face[2]][1]);
                        ctx.lineTo(figure.vertices[face[3]][0], figure.vertices[face[3]][1]);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        
                    }
                });

            });

        }

        setFigureTypes = () => {
            let cube = {
                vertices: [
                    [16, 16, 16],
                    [16, -16, 16],
                    [-16, -16, 16],
                    [-16, 16, 16],
                    [16, 16, -16],
                    [16, -16, -16],
                    [-16, -16, -16],
                    [-16, 16, -16]
                ],
                edges: [
                    [0, 1],
                    [1, 2],
                    [2, 3],
                    [3, 0],
                    [0, 4],
                    [1, 5],
                    [2, 6],
                    [3, 7],
                    [4, 5],
                    [5, 6],
                    [6, 7],
                    [7, 4]
                ],
                faces: [
                    [0, 1, 2, 3],
                    [4, 5, 6, 7],
                    [0, 1, 5, 4],
                    [1, 2, 6, 5],
                    [2, 3, 7, 6],
                    [3, 0, 4, 7]
                ]

            };

            this.figureTypes.push(cube);
        }

        worldToScreen = (point) => {
            const scaleFactor = this.FOV / (this.FOV + point[2]);
            const projectedX = point[0] * scaleFactor;
            const projectedY = point[1] * scaleFactor;
            return [projectedX, projectedY];
        }

        worldToScreenOblique = (point, angleX, angleY) => {
            const radianX = (angleX * Math.PI) / 180;
            const radianY = (angleY * Math.PI) / 180;

            const projectedX = point[0] + point[2] * Math.tan(radianY);
            const projectedY = point[1] + point[2] * Math.tan(radianX);

            let p1 = {
                'x': projectedX,
                'y': projectedY
            };

            return p1;
        }

        worldToScreenIsometric = (point) => {
            const isoMatrix = [
                Math.sqrt(3) / 2, -1 / 2, 0,
                Math.sqrt(3) / 2, 1 / 2, 0,
                0, 0, 1
            ];

            const projectedX = isoMatrix[0] * point[0] + isoMatrix[1] * point[1] + isoMatrix[2] * point[2];
            const projectedY = isoMatrix[3] * point[0] + isoMatrix[4] * point[1] + isoMatrix[5] * point[2];
            const projectedZ = isoMatrix[6] * point[0] + isoMatrix[7] * point[1] + isoMatrix[8] * point[2];

            let p1 = {
                'x': projectedX,
                'y': projectedY
            };

            return p1;
        }

        addDistance = (distance) => {
            if (this.FOV + distance > 0)
                this.FOV += distance;
        }

        drawFigures = () => {
            for (let i = this.figures.length - 1; i >= 0; i--) {
                this.figures[i].drawFigure(ctx);
            }
        }

        drawFiguresVertices = () => {
            for (let i = this.figures.length - 1; i >= 0; i--) {
                this.figures[i].drawVertices(ctx);
            }
        }

        addFigure = (x, y) => {
            let figure = new Figure();

            figure.vertices = Utils.clone(this.figureInfo.vertices);
            figure.edges = Utils.clone(this.figureInfo.edges);
            figure.faces = Utils.clone(this.figureInfo.faces);

            figure.translateX(x);
            figure.translateY(y);

            this.figures.push(figure);
        }
    }

    class Figure {
        constructor() {
            this.vertices = [];
            this.edges = [];
        }

        rotateZ = (angle) => {
            angle = Utils.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][1] * (-Math.sin(angle));
                this.vertices[i][1] = this.vertices[i][0] * Math.sin(angle) + this.vertices[i][1] * Math.cos(angle); //Y
                this.vertices[i][0] = x;
            }
        }

        rotateY = (angle) => {
            angle = Utils.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let x = this.vertices[i][0] * Math.cos(angle) + this.vertices[i][2] * Math.sin(angle);
                this.vertices[i][2] = this.vertices[i][0] * (-Math.sin(angle)) + this.vertices[i][2] * Math.cos(angle); //Z
                this.vertices[i][0] = x;
            }
        }

        rotateX = (angle) => {
            angle = Utils.sexagesimalToRadian(angle);

            for (let i = this.vertices.length - 1; i >= 0; i--) {
                let y = this.vertices[i][1] * Math.cos(angle) + this.vertices[i][2] * (-Math.sin(angle));
                this.vertices[i][2] = this.vertices[i][1] * Math.sin(angle) + this.vertices[i][2] * Math.cos(angle); //Z
                this.vertices[i][1] = y;
            }
        }

        translateX = (distance) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] += distance;
            }
        }

        translateY = (distance) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] += distance;
            }
        }

        translateZ = (distance) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][2] += distance;
            }
        }

        scale = (factor) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] *= factor;
                this.vertices[i][1] *= factor;
                this.vertices[i][2] *= factor;
            }
        }

        scaleX = (factor) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] *= factor;
            }
        }

        scaleY = (factor) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] *= factor;
            }
        }

        scaleZ = (factor) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][2] *= factor;
            }
        }

        shearX = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][1] = this.vertices[i][1] + amount * this.vertices[i][0];
                this.vertices[i][2] = this.vertices[i][2] + amount * this.vertices[i][0];
            }
        }

        shearY = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] = this.vertices[i][0] + amount * this.vertices[i][1];
                this.vertices[i][2] = this.vertices[i][2] + amount * this.vertices[i][1];
            }
        }

        shearZ = (amount) => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.vertices[i][0] = this.vertices[i][0] + amount * this.vertices[i][2];
                this.vertices[i][1] = this.vertices[i][1] + amount * this.vertices[i][2];
            }
        }

        drawEdge = (p0, p1, color) => {
            let point2d0 = world.worldToScreen(p0);
            let point2d1 = world.worldToScreen(p1);

            Utils.drawLine(ctx, point2d0[0], point2d0[1], point2d1[0], point2d1[1], 1, color);
        }

        drawVertex = (point, color) => {
            let vertex = world.worldToScreen(point);

            let newColor = `hsl(${Utils.scale(point[2], -500, 500, 300, 360)}, ${100}%, ${50}%)`;

            Utils.drawDot(ctx, vertex[0], vertex[1], newColor);
        }

        drawFigure = () => {
            for (let i = this.edges.length - 1; i >= 0; i--) {
                this.drawEdge(this.vertices[this.edges[i][0]], this.vertices[this.edges[i][1]]);
            }
        }

        drawVertices = () => {
            for (let i = this.vertices.length - 1; i >= 0; i--) {
                this.drawVertex(this.vertices[i]);
            }
        }
    }

    let init = () => {
        initCanvas();
        world = new ThreeDWorld();
        randomize();
        addEvents();
    }

    let addEvents = () => {
        canvas.addEventListener('click', e => {
            world.addFigure(e.offsetX, e.offsetY);
        }, false);

        canvas.addEventListener('mousemove', e => {
            trackMouse(e.offsetX, e.offsetY);
        }, false);

        canvas.addEventListener('touchstart', function (e) {
            world.addFigure(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        });

        canvas.addEventListener('touchmove', function (e) {
            e.preventDefault();
            trackMouse(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        });
    }

    let trackMouse = (x, y) => {
        if (lastPosX == 0) lastPosX = x;
        if (lastPosY == 0) lastPosY = y;

        let movX = lastPosX - x;
        let movY = lastPosY - y;

        world.figures.forEach(figure => {
            figure.translateX(-halfWidth);
            figure.translateY(-halfHeight);
            figure.rotateX(movY);
            figure.rotateY(movX);
            figure.translateX(halfWidth);
            figure.translateY(halfHeight);
        });

        lastPosX = x;
        lastPosY = y;
    }

    let randomize = () => {
        world.drawEdges = Utils.getRandomBool();
        world.figureInfo = world.figureTypes[Utils.getRandomInt(0, world.figureTypes.length - 1)];
    }

    let draw = () => {
        drawBackground(ctx, canvas);
        world.draw();
    }

    let loop = (timestamp) => {
        let progress = timestamp - lastRender;

        draw();

        lastRender = timestamp;
        window.requestAnimationFrame(loop);
    }

    init();

    window.requestAnimationFrame(loop);
}
