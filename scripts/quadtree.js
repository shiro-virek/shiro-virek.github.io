class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }

    getWidth = () => this.width;
    getHeight = () => this.height;
    getX = () => this.x;
    getY = () => this.y;
    getTop = () => this.y;
    getBottom = () => this.y + this.height;
    getLeft = () => this.x;
    getRight = () => this.x + this.width;
}

class Quadtree {
    constructor(level, bounds) {
        this.MAX_OBJECTS = 5;
        this.MAX_LEVELS = 6;

        this.lines = [];

        this.level = level;
        this.bounds = bounds;
        this.nodes = new Array(4);
    }

    clear = () => {
        this.lines = [];

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] != null) {
                this.nodes[i] = null;
            }
        }
    }

    split = () => {
        let subWidth = Math.floor(this.bounds.getWidth() / 2);
        let subHeight = Math.floor(this.bounds.getHeight() / 2);
        let x = this.bounds.getX();
        let y = this.bounds.getY();

        this.nodes[0] = new Quadtree(this.level + 1, new Rectangle(x + subWidth, y, subWidth, subHeight));
        this.nodes[1] = new Quadtree(this.level + 1, new Rectangle(x, y, subWidth, subHeight));
        this.nodes[2] = new Quadtree(this.level + 1, new Rectangle(x, y + subHeight, subWidth, subHeight));
        this.nodes[3] = new Quadtree(this.level + 1, new Rectangle(x + subWidth, y + subHeight, subWidth, subHeight));
    }

    getIndex = (rectangle) => {
        let index = -1;
        let verticalMidsegment = this.bounds.getX() + (this.bounds.getWidth() / 2);
        let horizontalMidsegment = this.bounds.getY() + (this.bounds.getHeight() / 2);

        let topQuadrant = (rectangle.getTop() < horizontalMidsegment && rectangle.getBottom() < horizontalMidsegment);
        let bottomQuadrant = (rectangle.getTop() > horizontalMidsegment);

        if (rectangle.getLeft() < verticalMidsegment && rectangle.getRight() < verticalMidsegment) {
            if (topQuadrant) {
                index = 1;
            }
            else if (bottomQuadrant) {
                index = 2;
            }
        }

        else if (rectangle.getLeft() > verticalMidsegment) {
            if (topQuadrant) {
                index = 0;
            }
            else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    }

    insert = (rectangle) => {
        if (this.nodes[0] != null) {
            let index = this.getIndex(rectangle);

            if (index != -1) {
                this.nodes[index].insert(rectangle);

                return;
            }
        }

        this.lines.push(rectangle);

        if (this.lines.length > this.MAX_OBJECTS && this.level < this.MAX_LEVELS) {
            if (this.nodes[0] == null) {
                this.split();
            }

            let i = 0;
            while (i < this.lines.length) {
                let index = this.getIndex(this.lines[i]);
                if (index != -1) {
                    let removedItem = this.lines[i];
                    this.lines.splice(i, 1);
                    this.nodes[index].insert(removedItem);
                }
                else {
                    i++;
                }
            }
        }
    }

    retrieve = (returnObjects, rectangle) => {
        let index = this.getIndex(rectangle);
        if (index != -1 && this.nodes[0] != null) {
            this.nodes[index].retrieve(returnObjects, rectangle);
        }

        returnObjects.push(...this.lines);

        return returnObjects;
    }

    static generateQuadtree = (width, height) => {
        return new Quadtree(0, new Rectangle(0, 0, width, height));
    }

    drawQuadtree = (ctx, quadtree) => {
        if (quadtree != null) {
            if (quadtree.bounds != null) {
                ctx.strokeStyle = "#333";
                ctx.lineWidth = 2;
                ctx.strokeRect(quadtree.bounds.x, quadtree.bounds.y, quadtree.bounds.width, quadtree.bounds.height);
            }
            if (quadtree.nodes != null) {
                quadtree.nodes.forEach(function (node) {
                    quadtree.drawQuadtree(ctx, node);
                });
            }
        }
    }
}
