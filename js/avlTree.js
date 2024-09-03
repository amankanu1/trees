class AVLNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    getBalanceFactor(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    rightRotate(y) {
        let x = y.left;
        let T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        return x;
    }

    leftRotate(x) {
        let y = x.right;
        let T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y;
    }

    insertNode(node, value) {
        if (!node) return new AVLNode(value);

        if (value < node.value) {
            node.left = this.insertNode(node.left, value);
        } else if (value > node.value) {
            node.right = this.insertNode(node.right, value);
        } else {
            return node; // Duplicate values not allowed
        }

        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        let balanceFactor = this.getBalanceFactor(node);

        // Left Left Case
        if (balanceFactor > 1 && value < node.left.value) {
            return this.rightRotate(node);
        }

        // Right Right Case
        if (balanceFactor < -1 && value > node.right.value) {
            return this.leftRotate(node);
        }

        // Left Right Case
        if (balanceFactor > 1 && value > node.left.value) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Left Case
        if (balanceFactor < -1 && value < node.right.value) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    deleteNode(node, value) {
        if (!node) return node;

        if (value < node.value) {
            node.left = this.deleteNode(node.left, value);
        } else if (value > node.value) {
            node.right = this.deleteNode(node.right, value);
        } else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            let temp = this.getMinValueNode(node.right);
            node.value = temp.value;
            node.right = this.deleteNode(node.right, temp.value);
        }

        if (!node) return node;

        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        let balanceFactor = this.getBalanceFactor(node);

        if (balanceFactor > 1 && this.getBalanceFactor(node.left) >= 0) {
            return this.rightRotate(node);
        }

        if (balanceFactor > 1 && this.getBalanceFactor(node.left) < 0) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        if (balanceFactor < -1 && this.getBalanceFactor(node.right) <= 0) {
            return this.leftRotate(node);
        }

        if (balanceFactor < -1 && this.getBalanceFactor(node.right) > 0) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    getMinValueNode(node) {
        while (node.left) node = node.left;
        return node;
    }

    insert(value) {
        this.root = this.insertNode(this.root, value);
        this.render();
    }

    delete(value) {
        this.root = this.deleteNode(this.root, value);
        this.render();
    }

    render() {
        const width = 800;
        const height = 600;
        const margin = { top: 20, right: 40, bottom: 20, left: 40 };

        const svg = d3.select("#avl-tree").select("svg");
        if (svg.empty()) {
            d3.select("#avl-tree").append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet");
        }

        const root = d3.hierarchy(this.root, d => (d ? [d.left, d.right].filter(n => n) : []));

        const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
        treeLayout(root);

        const g = d3.select("svg g");
        if (g.empty()) {
            d3.select("svg").append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
        }

        const link = g.selectAll(".link")
            .data(root.links(), d => `${d.source.data.value}-${d.target.data.value}`);

        link.enter().append("line")
            .attr("class", "link")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 2)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.source.x)
            .attr("y2", d => d.source.y)
            .merge(link)
            .transition().duration(500)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        link.exit().transition().duration(500)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.source.x)
            .attr("y2", d => d.source.y)
            .remove();

        const node = g.selectAll(".node")
            .data(root.descendants(), d => d.data.value);

        const nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        nodeEnter.append("circle")
            .attr("r", 20)
            .attr("fill", "#69b3a2")
            .attr("stroke", "#333")
            .attr("stroke-width", 3);

        nodeEnter.append("text")
            .attr("dy", -25)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "#333")
            .text(d => d.data.value);

        nodeEnter.merge(node)
            .transition().duration(500)
            .attr("transform", d => `translate(${d.x},${d.y})`);

        node.exit().transition().duration(500)
            .attr("transform", d => `translate(${root.x},${root.y})`)
            .remove();
    }
}

const avlTree = new AVLTree();
const valueList = document.getElementById("value-list");

function setupInputListener() {
    const input = document.getElementById("insertValue");

    input.addEventListener("change", () => {
        const value = parseInt(input.value);
        if (!isNaN(value) && !isInList(value)) {
            avlTree.insert(value);
            addValueToList(value);
            input.value = "";
        }
    });
}

function addValueToList(value) {
    const li = document.createElement("li");
    li.textContent = value;
    li.contentEditable = true;
    li.dataset.value = value;
    valueList.appendChild(li);
}

function isInList(value) {
    return Array.from(valueList.children).some(li => parseInt(li.dataset.value) === value);
}

function setupValueListListener() {
    valueList.addEventListener("blur", (event) => {
        const li = event.target;
        const newValue = parseInt(li.textContent.trim());

        if (!isNaN(newValue) && li.dataset.value !== newValue.toString()) {
            avlTree.delete(parseInt(li.dataset.value));
            avlTree.insert(newValue);
            li.dataset.value = newValue;
        }
    }, true);

    valueList.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" || event.key === "Delete") {
            const li = event.target;
            if (li.contentEditable === "true" && !li.textContent.trim()) {
                avlTree.delete(parseInt(li.dataset.value));
                li.remove();
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupInputListener();
    setupValueListListener();
});
