// ══════════════════════════════════════════════
// SOCIAL CONNECT — ADS 2025-26
// Pure JS implementation mirroring C++ code exactly
// Covers: BST, AVL, B-Tree, BFS, DFS, Dijkstra, Prim MST
// ══════════════════════════════════════════════

// ── SHARED DATA (mirrors C++ SocialNetwork) ──
const USERS = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"];
const EDGES = [[0,1,1],[0,2,2],[1,3,1],[2,4,3],[3,5,2],[4,6,1],[5,6,2]];
const adj = Array.from({length: 7}, () => []);
EDGES.forEach(([u,v,w]) => { adj[u].push({v,w}); adj[v].push({v:u,w}); });

// ── TAB SYSTEM ──
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('tab-' + tab + '-btn').classList.add('active');
    if (tab === 'bst') { setTimeout(() => renderBSTTree(), 50); }
    if (tab === 'avl') { setTimeout(() => renderAVLTree(), 50); }
    if (tab === 'btree') { setTimeout(() => renderBTree(), 50); }
    if (tab === 'graph') { setTimeout(() => renderGraph(), 50); }
}

// ── LOG HELPERS ──
function log(boxId, html) {
    const box = document.getElementById(boxId);
    const div = document.createElement('div');
    div.className = 'log-line'; div.innerHTML = html;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
function glog(html) { log('graph-log', html); }
function blog(html) { log('bst-log', html); }
function alog(html) { log('avl-log', html); }
function btlog(html) { log('bt-log', html); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ══════════════════════════════════════════════
// TAB 1: BINARY SEARCH TREE
// Mirrors C++ UserBST class exactly
// ══════════════════════════════════════════════
class BSTNode { constructor(n) { this.name = n; this.left = null; this.right = null; } }
class UserBST {
    constructor() { this.root = null; }
    _insert(node, name) {
        if (!node) return new BSTNode(name);
        if (name < node.name) node.left = this._insert(node.left, name);
        else if (name > node.name) node.right = this._insert(node.right, name);
        return node;
    }
    _search(node, name) {
        if (!node) return false;
        if (node.name === name) return true;
        return name < node.name ? this._search(node.left, name) : this._search(node.right, name);
    }
    _inorder(node, out) { if (!node) return; this._inorder(node.left, out); out.push(node.name); this._inorder(node.right, out); }
    _preorder(node, out) { if (!node) return; out.push(node.name); this._preorder(node.left, out); this._preorder(node.right, out); }
    _minNode(node) { let c = node; while (c.left) c = c.left; return c; }
    _delete(node, name) {
        if (!node) return null;
        if (name < node.name) { node.left = this._delete(node.left, name); }
        else if (name > node.name) { node.right = this._delete(node.right, name); }
        else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;
            const succ = this._minNode(node.right);
            node.name = succ.name;
            node.right = this._delete(node.right, succ.name);
        }
        return node;
    }
    _height(node) { if (!node) return 0; return 1 + Math.max(this._height(node.left), this._height(node.right)); }
    _count(node) { if (!node) return 0; return 1 + this._count(node.left) + this._count(node.right); }
    insert(name) { this.root = this._insert(this.root, name); }
    search(name) { return this._search(this.root, name); }
    delete(name) { this.root = this._delete(this.root, name); }
    inorder() { const r = []; this._inorder(this.root, r); return r; }
    preorder() { const r = []; this._preorder(this.root, r); return r; }
    height() { return this._height(this.root); }
    count() { return this._count(this.root); }
}

const bst = new UserBST();
const DEFAULT_USERS = ["Alice","Bob","Charlie","Diana","Eve","Frank","Grace"];
DEFAULT_USERS.forEach(u => bst.insert(u));

// BST tree layout (Reingold-Tilford simplified)
let bstHighlight = null;
function computeLayout(node, depth, counter) {
    if (!node) return;
    computeLayout(node.left, depth + 1, counter);
    node._x = counter.val++;
    node._y = depth;
    computeLayout(node.right, depth + 1, counter);
}

function renderBSTTree() {
    const svg = document.getElementById('bst-svg');
    const g = document.getElementById('bst-group');
    g.innerHTML = '';
    if (!bst.root) { document.getElementById('bst-stat-nodes').textContent = '0'; document.getElementById('bst-stat-height').textContent = '0'; return; }

    const counter = {val: 0};
    computeLayout(bst.root, 0, counter);

    const W = svg.clientWidth || 700, H = svg.clientHeight || 420;
    const totalNodes = counter.val;
    const maxDepth = bst.height() - 1;
    const hPad = 50, vPad = 60;
    const xScale = totalNodes > 1 ? (W - 2*hPad) / (totalNodes - 1) : 0;
    const yScale = maxDepth > 0 ? (H - 2*vPad) / maxDepth : 0;
    const NR = Math.max(18, Math.min(28, xScale / 2.5, 90));

    function px(xi) { return totalNodes === 1 ? W/2 : hPad + xi * xScale; }
    function py(yi) { return maxDepth === 0 ? H/2 : vPad + yi * yScale; }

    // Draw edges
    function drawEdges(node) {
        if (!node) return;
        if (node.left) {
            const line = makeSVG('line');
            line.setAttribute('x1', px(node._x)); line.setAttribute('y1', py(node._y));
            line.setAttribute('x2', px(node.left._x)); line.setAttribute('y2', py(node.left._y));
            line.setAttribute('class', 'tree-edge'); g.appendChild(line);
            drawEdges(node.left);
        }
        if (node.right) {
            const line = makeSVG('line');
            line.setAttribute('x1', px(node._x)); line.setAttribute('y1', py(node._y));
            line.setAttribute('x2', px(node.right._x)); line.setAttribute('y2', py(node.right._y));
            line.setAttribute('class', 'tree-edge'); g.appendChild(line);
            drawEdges(node.right);
        }
    }
    drawEdges(bst.root);

    // Draw nodes
    function drawNodes(node) {
        if (!node) return;
        const x = px(node._x), y = py(node._y);
        const isHighlight = bstHighlight && bstHighlight.name === node.name;
        const cls = isHighlight ? `tree-node-circle ${bstHighlight.cls}` : 'tree-node-circle';

        const circle = makeSVG('circle');
        circle.setAttribute('cx', x); circle.setAttribute('cy', y);
        circle.setAttribute('r', NR); circle.setAttribute('class', cls);
        g.appendChild(circle);

        const label = makeSVG('text');
        label.setAttribute('x', x); label.setAttribute('y', y);
        label.setAttribute('class', 'tree-node-label');
        label.setAttribute('font-size', Math.max(9, Math.min(13, NR * 0.55)));
        label.textContent = node.name.length > 5 ? node.name.slice(0,5) : node.name;
        g.appendChild(label);

        const idx = makeSVG('text');
        idx.setAttribute('x', x); idx.setAttribute('y', y + NR + 13);
        idx.setAttribute('class', 'tree-node-idx'); idx.textContent = node.name;
        g.appendChild(idx);

        drawNodes(node.left); drawNodes(node.right);
    }
    drawNodes(bst.root);

    document.getElementById('bst-stat-nodes').textContent = bst.count();
    document.getElementById('bst-stat-height').textContent = bst.height();
}

function bstInsert() {
    const val = document.getElementById('bst-insert-input').value.trim();
    if (!val) { blog('<span class="log-err">[ERROR] Enter a username.</span>'); return; }
    if (bst.search(val)) { blog(`<span class="log-info">[INFO] "${val}" already in BST.</span>`); return; }
    bst.insert(val);
    bstHighlight = {name: val, cls: 'highlighted'};
    renderBSTTree();
    blog(`<span class="log-ok">INSERT:</span> "${val}" added to BST`);
    document.getElementById('bst-stat-op').textContent = 'INSERT';
    document.getElementById('bst-insert-input').value = '';
    setTimeout(() => { bstHighlight = null; renderBSTTree(); }, 1500);
}

function bstSearchUser() {
    const val = document.getElementById('bst-search-input').value.trim();
    if (!val) { blog('<span class="log-err">[ERROR] Enter a username.</span>'); return; }
    const found = bst.search(val);
    bstHighlight = {name: val, cls: found ? 'found' : 'not-found'};
    renderBSTTree();
    if (found) blog(`Search "<b>${val}</b>" → <span class="log-ok">FOUND ✓</span>`);
    else blog(`Search "<b>${val}</b>" → <span class="log-err">NOT FOUND ✗</span>`);
    document.getElementById('bst-stat-op').textContent = found ? 'FOUND' : 'NOT FOUND';
    setTimeout(() => { bstHighlight = null; renderBSTTree(); }, 2000);
}

function bstDelete() {
    const val = document.getElementById('bst-delete-input').value.trim();
    if (!val) { blog('<span class="log-err">[ERROR] Enter a username.</span>'); return; }
    if (!bst.search(val)) { blog(`<span class="log-err">[ERROR] "${val}" not in BST.</span>`); return; }
    bst.delete(val);
    bstHighlight = null;
    renderBSTTree();
    blog(`<span class="log-info">DELETE:</span> "${val}" removed from BST`);
    document.getElementById('bst-stat-op').textContent = 'DELETE';
    document.getElementById('bst-delete-input').value = '';
}

function bstListAll() {
    const sorted = bst.inorder();
    blog('══ Inorder Traversal (A → Z) ══');
    sorted.forEach(n => blog(`&nbsp;&nbsp;<span class="log-path">>> ${n}</span>`));
    blog('══════════════════════════════');
}

function bstPreorder() {
    const pre = bst.preorder();
    blog('══ Preorder Traversal (Root→L→R) ══');
    blog(`&nbsp;&nbsp;<span class="log-cyan">${pre.join(' → ')}</span>`);
}

function bstReset() {
    bst.root = null;
    DEFAULT_USERS.forEach(u => bst.insert(u));
    bstHighlight = null;
    renderBSTTree();
    blog('<span class="log-dim">// BST reset to 7 default users.</span>');
}

// ══════════════════════════════════════════════
// TAB 2: AVL TREE
// Mirrors C++ AVL implementation with rotations
// ══════════════════════════════════════════════
class AVLNode { constructor(k) { this.key = k; this.left = null; this.right = null; this.h = 1; } }
class AVLTree {
    constructor() { this.root = null; this.totalRotations = 0; this.lastRotations = []; }
    h(n) { return n ? n.h : 0; }
    bf(n) { return n ? this.h(n.left) - this.h(n.right) : 0; }
    upd(n) { if (n) n.h = 1 + Math.max(this.h(n.left), this.h(n.right)); }

    rotRight(y) {
        const x = y.left, T2 = x.right;
        x.right = y; y.left = T2;
        this.upd(y); this.upd(x);
        this.lastRotations.push({type:'LL (Right Rotation)', at: y.key});
        this.totalRotations++;
        return x;
    }
    rotLeft(x) {
        const y = x.right, T2 = y.left;
        y.left = x; x.right = T2;
        this.upd(x); this.upd(y);
        this.lastRotations.push({type:'RR (Left Rotation)', at: x.key});
        this.totalRotations++;
        return y;
    }

    _insert(node, k) {
        if (!node) return new AVLNode(k);
        if (k < node.key) node.left = this._insert(node.left, k);
        else if (k > node.key) node.right = this._insert(node.right, k);
        else return node;
        this.upd(node);
        const b = this.bf(node);
        if (b > 1 && k < node.left.key) return this.rotRight(node);          // LL
        if (b < -1 && k > node.right.key) return this.rotLeft(node);          // RR
        if (b > 1 && k > node.left.key) {                                      // LR
            this.lastRotations.push({type:'LR (Left-Right)', at: node.key});
            this.totalRotations++;
            node.left = this.rotLeft(node.left); return this.rotRight(node);
        }
        if (b < -1 && k < node.right.key) {                                    // RL
            this.lastRotations.push({type:'RL (Right-Left)', at: node.key});
            this.totalRotations++;
            node.right = this.rotRight(node.right); return this.rotLeft(node);
        }
        return node;
    }

    _minNode(n) { let c = n; while (c.left) c = c.left; return c; }
    _delete(node, k) {
        if (!node) return null;
        if (k < node.key) node.left = this._delete(node.left, k);
        else if (k > node.key) node.right = this._delete(node.right, k);
        else {
            if (!node.left || !node.right) node = node.left || node.right;
            else { const s = this._minNode(node.right); node.key = s.key; node.right = this._delete(node.right, s.key); }
        }
        if (!node) return null;
        this.upd(node);
        const b = this.bf(node);
        if (b > 1 && this.bf(node.left) >= 0) return this.rotRight(node);
        if (b > 1 && this.bf(node.left) < 0) { node.left = this.rotLeft(node.left); return this.rotRight(node); }
        if (b < -1 && this.bf(node.right) <= 0) return this.rotLeft(node);
        if (b < -1 && this.bf(node.right) > 0) { node.right = this.rotRight(node.right); return this.rotLeft(node); }
        return node;
    }
    _height(n) { return n ? n.h : 0; }
    _count(n) { if (!n) return 0; return 1 + this._count(n.left) + this._count(n.right); }

    insert(k) { this.lastRotations = []; this.root = this._insert(this.root, k); }
    delete(k) { this.lastRotations = []; this.root = this._delete(this.root, k); }
    height() { return this._height(this.root); }
    count() { return this._count(this.root); }
}

const avl = new AVLTree();

function renderAVLTree() {
    const svg = document.getElementById('avl-svg');
    const g = document.getElementById('avl-group');
    g.innerHTML = '';
    if (!avl.root) return;

    const counter = {val: 0};
    computeLayoutGeneric(avl.root, 0, counter, 'left', 'right');

    const W = svg.clientWidth || 700, H = svg.clientHeight || 420;
    const total = counter.val;
    const maxD = avl.height() - 1;
    const hPad = 55, vPad = 60;
    const xScale = total > 1 ? (W - 2*hPad) / (total - 1) : 0;
    const yScale = maxD > 0 ? (H - 2*vPad - 20) / maxD : 0;
    const NR = Math.max(18, Math.min(26, xScale / 2.5));

    function px(xi) { return total === 1 ? W/2 : hPad + xi * xScale; }
    function py(yi) { return maxD === 0 ? H/2 : vPad + yi * yScale; }

    function drawEdgesAVL(node) {
        if (!node) return;
        ['left','right'].forEach(side => {
            if (node[side]) {
                const line = makeSVG('line');
                line.setAttribute('x1', px(node._x)); line.setAttribute('y1', py(node._y));
                line.setAttribute('x2', px(node[side]._x)); line.setAttribute('y2', py(node[side]._y));
                line.setAttribute('class', 'tree-edge'); g.appendChild(line);
                drawEdgesAVL(node[side]);
            }
        });
    }
    drawEdgesAVL(avl.root);

    function drawNodesAVL(node) {
        if (!node) return;
        const x = px(node._x), y = py(node._y);
        const bf = avl.bf(node);
        const balanced = Math.abs(bf) <= 1;

        const circle = makeSVG('circle');
        circle.setAttribute('cx', x); circle.setAttribute('cy', y);
        circle.setAttribute('r', NR);
        circle.setAttribute('class', 'tree-node-circle');
        circle.setAttribute('style', balanced
            ? 'stroke: rgba(16,185,129,0.7); fill: rgba(16,185,129,0.1);'
            : 'stroke: #ef4444; fill: rgba(239,68,68,0.15);');
        g.appendChild(circle);

        const label = makeSVG('text');
        label.setAttribute('x', x); label.setAttribute('y', y);
        label.setAttribute('class', 'tree-node-label');
        label.setAttribute('font-size', Math.max(9, Math.min(13, NR * 0.6)));
        label.textContent = node.key;
        g.appendChild(label);

        // Balance factor badge
        const bfText = makeSVG('text');
        bfText.setAttribute('x', x + NR - 4); bfText.setAttribute('y', y - NR + 4);
        bfText.setAttribute('class', balanced ? 'tree-node-bf' : 'tree-node-bf bad');
        bfText.setAttribute('font-size', '10');
        bfText.textContent = bf;
        g.appendChild(bfText);

        // Height label below
        const hText = makeSVG('text');
        hText.setAttribute('x', x); hText.setAttribute('y', y + NR + 13);
        hText.setAttribute('class', 'tree-node-idx');
        hText.textContent = `h=${node.h}`;
        g.appendChild(hText);

        drawNodesAVL(node.left); drawNodesAVL(node.right);
    }
    drawNodesAVL(avl.root);

    document.getElementById('avl-stat-nodes').textContent = avl.count();
    document.getElementById('avl-stat-height').textContent = avl.height();
    document.getElementById('avl-stat-rot').textContent = avl.totalRotations;
}

function computeLayoutGeneric(node, depth, counter, leftKey, rightKey) {
    if (!node) return;
    computeLayoutGeneric(node[leftKey], depth+1, counter, leftKey, rightKey);
    node._x = counter.val++;
    node._y = depth;
    computeLayoutGeneric(node[rightKey], depth+1, counter, leftKey, rightKey);
}

function avlInsertKey() {
    const val = parseInt(document.getElementById('avl-insert-input').value);
    if (isNaN(val)) { alog('<span class="log-err">[ERROR] Enter a valid integer.</span>'); return; }
    avl.insert(val);
    renderAVLTree();
    alog(`<span class="log-ok">INSERT</span> ${val} → height=${avl.height()}, BF(root)=${avl.bf(avl.root)}`);
    avl.lastRotations.forEach(r => alog(`  ↻ <span class="log-purple">${r.type}</span> at node <b>${r.at}</b>`));
    if (!avl.lastRotations.length) alog(`  <span class="log-dim">// No rotation needed</span>`);
    document.getElementById('avl-insert-input').value = '';
}

function avlDeleteKey() {
    const val = parseInt(document.getElementById('avl-delete-input').value);
    if (isNaN(val)) { alog('<span class="log-err">[ERROR] Enter a valid integer.</span>'); return; }
    avl.delete(val);
    renderAVLTree();
    alog(`<span class="log-info">DELETE</span> ${val} → height=${avl.height()}`);
    avl.lastRotations.forEach(r => alog(`  ↻ <span class="log-purple">${r.type}</span> at node <b>${r.at}</b>`));
    document.getElementById('avl-delete-input').value = '';
}

function avlDemo(type) {
    avl.root = null; avl.totalRotations = 0;
    const sequences = {
        1: [3,2,1],   // LL
        2: [1,2,3],   // RR
        3: [3,1,2],   // LR
        4: [1,3,2]    // RL
    };
    const names = {1:'LL (Right Rotation)',2:'RR (Left Rotation)',3:'LR (Double)',4:'RL (Double)'};
    const seq = sequences[type];
    alog(`══ Demo: ${names[type]} ══`);
    alog(`Inserting: <b>${seq.join(' → ')}</b>`);
    seq.forEach(k => {
        avl.insert(k);
        alog(`Insert <b>${k}</b>: BF=${avl.bf(avl.root)} ${avl.lastRotations.length ? '→ <span class="log-purple">ROTATION!</span>' : ''}`);
    });
    renderAVLTree();
    alog(`<span class="log-ok">Result: height=${avl.height()}, balanced ✓</span>`);
}

function avlReset() { avl.root = null; avl.totalRotations = 0; renderAVLTree(); alog('<span class="log-dim">// AVL Tree cleared.</span>'); }

// ══════════════════════════════════════════════
// TAB 3: B-TREE
// Mirrors C++ B-Tree (min-degree t=2, max 3 keys)
// ══════════════════════════════════════════════
class BTreeNode {
    constructor(leaf = false) { this.keys = []; this.children = []; this.leaf = leaf; }
}
class BTree {
    constructor(t) { this.t = t; this.root = new BTreeNode(true); this.keyCount = 0; }

    search(k, node) {
        node = node || this.root;
        let i = 0;
        while (i < node.keys.length && k > node.keys[i]) i++;
        if (i < node.keys.length && k === node.keys[i]) return {node, i};
        if (node.leaf) return null;
        return this.search(k, node.children[i]);
    }

    insert(k) {
        this.keyCount++;
        const root = this.root;
        if (root.keys.length === 2 * this.t - 1) {
            const s = new BTreeNode(false);
            this.root = s;
            s.children.push(root);
            this._splitChild(s, 0);
            this._insertNonFull(s, k);
        } else {
            this._insertNonFull(root, k);
        }
    }

    _insertNonFull(node, k) {
        let i = node.keys.length - 1;
        if (node.leaf) {
            node.keys.push(null);
            while (i >= 0 && k < node.keys[i]) { node.keys[i+1] = node.keys[i]; i--; }
            node.keys[i+1] = k;
        } else {
            while (i >= 0 && k < node.keys[i]) i--;
            i++;
            if (node.children[i].keys.length === 2 * this.t - 1) {
                this._splitChild(node, i);
                if (k > node.keys[i]) i++;
            }
            this._insertNonFull(node.children[i], k);
        }
    }

    _splitChild(parent, i) {
        const t = this.t;
        const y = parent.children[i];
        const z = new BTreeNode(y.leaf);
        z.keys = y.keys.splice(t);      // z gets upper half
        const median = y.keys.pop();     // median key
        if (!y.leaf) z.children = y.children.splice(t);
        parent.keys.splice(i, 0, median);
        parent.children.splice(i+1, 0, z);
    }

    _height(node) {
        if (!node || node.leaf) return 1;
        return 1 + this._height(node.children[0]);
    }
    _nodeCount(node) {
        if (!node) return 0;
        let c = 1;
        node.children.forEach(ch => c += this._nodeCount(ch));
        return c;
    }
    height() { return this._height(this.root); }
    nodeCount() { return this._nodeCount(this.root); }
}

const btree = new BTree(2);
let btHighlight = null;

function renderBTree() {
    const svg = document.getElementById('bt-svg');
    const g = document.getElementById('bt-group');
    g.innerHTML = '';
    const W = svg.clientWidth || 700, H = svg.clientHeight || 420;

    if (!btree.root || btree.root.keys.length === 0) return;

    // BFS to get levels
    const levels = [];
    let queue = [{node: btree.root, parentInfo: null}];
    while (queue.length) {
        const level = [];
        const next = [];
        queue.forEach(item => {
            item.node._levelIdx = level.length;
            item.node._levelTotal = queue.length;
            level.push(item);
            if (!item.node.leaf) {
                item.node.children.forEach((child, ci) => {
                    next.push({node: child, parentInfo: {parent: item.node, childIdx: ci}});
                });
            }
        });
        levels.push(level);
        queue = next;
    }

    const CELL_W = 38, CELL_H = 36, levelH = 90;
    const vPad = 40;

    // Assign positions
    levels.forEach((level, li) => {
        const nodeCount = level.length;
        level.forEach((item, ni) => {
            const nodeW = item.node.keys.length * CELL_W;
            const totalW = level.reduce((s, it) => s + it.node.keys.length * CELL_W + 20, -20);
            let startX = W/2 - totalW/2;
            for (let k = 0; k < ni; k++) startX += level[k].node.keys.length * CELL_W + 20;
            item.node._bx = startX;
            item.node._by = vPad + li * levelH;
            item.node._bw = nodeW;
        });
    });

    // Draw edges first
    levels.forEach(level => {
        level.forEach(item => {
            const node = item.node;
            if (!node.leaf) {
                node.children.forEach((child, ci) => {
                    const px1 = node._bx + node._bw/2;
                    const py1 = node._by + CELL_H;
                    const px2 = child._bx + child._bw/2;
                    const py2 = child._by;
                    const path = makeSVG('path');
                    const mx = (px1 + px2) / 2;
                    path.setAttribute('d', `M${px1},${py1} C${px1},${py1+30} ${px2},${py2-30} ${px2},${py2}`);
                    path.setAttribute('class', 'bt-edge');
                    g.appendChild(path);
                });
            }
        });
    });

    // Draw nodes
    levels.forEach(level => {
        level.forEach(item => {
            const node = item.node;
            const x = node._bx, y = node._by, nw = node._bw;
            const isHL = btHighlight && node.keys.includes(btHighlight);

            // Node background rect
            const rect = makeSVG('rect');
            rect.setAttribute('x', x); rect.setAttribute('y', y);
            rect.setAttribute('width', nw); rect.setAttribute('height', CELL_H);
            rect.setAttribute('rx', 7); rect.setAttribute('ry', 7);
            rect.setAttribute('class', isHL ? 'bt-node-rect found' : 'bt-node-rect');
            g.appendChild(rect);

            // Draw key cells and separators
            node.keys.forEach((key, ki) => {
                const cx = x + ki * CELL_W + CELL_W/2;
                const cy = y + CELL_H/2;

                // Separator
                if (ki > 0) {
                    const sep = makeSVG('line');
                    sep.setAttribute('x1', x + ki*CELL_W); sep.setAttribute('y1', y);
                    sep.setAttribute('x2', x + ki*CELL_W); sep.setAttribute('y2', y + CELL_H);
                    sep.setAttribute('class', 'bt-separator');
                    g.appendChild(sep);
                }

                const kt = makeSVG('text');
                kt.setAttribute('x', cx); kt.setAttribute('y', cy);
                kt.setAttribute('class', 'bt-key-text');
                if (btHighlight === key && isHL) kt.setAttribute('fill', '#06b6d4');
                kt.textContent = key;
                g.appendChild(kt);
            });

            // Leaf label
            const lbl = makeSVG('text');
            lbl.setAttribute('x', x + nw/2); lbl.setAttribute('y', y + CELL_H + 13);
            lbl.setAttribute('class', 'bt-label');
            lbl.textContent = node.leaf ? '(leaf)' : '';
            g.appendChild(lbl);
        });
    });

    document.getElementById('bt-stat-keys').textContent = btree.keyCount;
    document.getElementById('bt-stat-nodes').textContent = btree.nodeCount();
    document.getElementById('bt-stat-height').textContent = btree.height();
}

function btreeInsert() {
    const val = parseInt(document.getElementById('bt-insert-input').value);
    if (isNaN(val)) { btlog('<span class="log-err">[ERROR] Enter a valid integer.</span>'); return; }
    btree.insert(val);
    btHighlight = val;
    renderBTree();
    btlog(`<span class="log-ok">INSERT</span> key <b>${val}</b> → height=${btree.height()}, nodes=${btree.nodeCount()}`);
    document.getElementById('bt-insert-input').value = '';
    setTimeout(() => { btHighlight = null; renderBTree(); }, 1800);
}

function btreeSearch() {
    const val = parseInt(document.getElementById('bt-search-input').value);
    if (isNaN(val)) { btlog('<span class="log-err">[ERROR] Enter a valid integer.</span>'); return; }
    const res = btree.search(val);
    btHighlight = res ? val : null;
    renderBTree();
    if (res) btlog(`Search <b>${val}</b> → <span class="log-ok">FOUND ✓ (at depth ${btree.height()})</span>`);
    else btlog(`Search <b>${val}</b> → <span class="log-err">NOT FOUND ✗</span>`);
    setTimeout(() => { btHighlight = null; renderBTree(); }, 2000);
}

async function btreeDemo() {
    btree.root = new BTreeNode(true); btree.keyCount = 0;
    btlog('══ Demo: Insert 1 through 10 ══');
    for (let i = 1; i <= 10; i++) {
        btree.insert(i);
        btHighlight = i;
        renderBTree();
        btlog(`Insert <b>${i}</b> → <span class="log-cyan">h=${btree.height()}, nodes=${btree.nodeCount()}</span>`);
        await sleep(500);
    }
    btHighlight = null; renderBTree();
    btlog('<span class="log-ok">Done! Notice how splits propagated upward.</span>');
}

function btreeReset() {
    btree.root = new BTreeNode(true); btree.keyCount = 0; btHighlight = null;
    renderBTree();
    btlog('<span class="log-dim">// B-Tree reset.</span>');
    document.getElementById('bt-stat-keys').textContent = '0';
    document.getElementById('bt-stat-nodes').textContent = '0';
    document.getElementById('bt-stat-height').textContent = '—';
}

// ══════════════════════════════════════════════
// TAB 4: GRAPH ALGORITHMS
// BFS, DFS, Dijkstra, Prim's MST
// Mirrors C++ SocialNetwork + GraphAlgos
// ══════════════════════════════════════════════
let pathEdges = [], pathNodes = [], srcNode = -1, dstNode = -1;
let nodeStates = {};   // node index → CSS class
let edgeStates = {};   // "u-v" key → CSS class
let graphMode = 'none';

// ── Graph render ──
let svgW = 800, svgH = 500;
function getPos() {
    const cx = svgW/2, cy = svgH/2, r = Math.min(svgW,svgH) * 0.33;
    return USERS.map((_,i) => ({
        x: cx + r * Math.cos(2*Math.PI*i/USERS.length - Math.PI/2),
        y: cy + r * Math.sin(2*Math.PI*i/USERS.length - Math.PI/2)
    }));
}

function renderGraph() {
    const svg = document.getElementById('graph');
    if (!svg) return;
    const g = document.getElementById('graphGroup');
    const rect = svg.getBoundingClientRect();
    svgW = rect.width || 800; svgH = rect.height || 500;
    const pos = getPos();
    g.innerHTML = '';

    // Edges
    EDGES.forEach(([u,v,w]) => {
        const pu = pos[u], pv = pos[v];
        const key1 = `${u}-${v}`, key2 = `${v}-${u}`;
        const eCls = edgeStates[key1] || edgeStates[key2] || '';
        const inDijkPath = pathEdges.some(e => (e[0]===u&&e[1]===v)||(e[0]===v&&e[1]===u));
        let cls = 'edge-line' + (inDijkPath ? ' path-edge' : (eCls ? ' '+eCls : ''));
        const line = makeSVG('line');
        line.setAttribute('x1',pu.x); line.setAttribute('y1',pu.y);
        line.setAttribute('x2',pv.x); line.setAttribute('y2',pv.y);
        line.setAttribute('class', cls);
        g.appendChild(line);

        // Weight
        const tx=(pu.x+pv.x)/2, ty=(pu.y+pv.y)/2;
        const wt = makeSVG('text');
        wt.setAttribute('x',tx); wt.setAttribute('y',ty-8);
        wt.setAttribute('class','edge-weight'); wt.textContent = w;
        g.appendChild(wt);
    });

    // Nodes
    const NR = 28;
    USERS.forEach((name,i) => {
        const {x,y} = pos[i];
        let nCls = 'node-circle';
        if (i===srcNode && graphMode==='dijkstra') nCls += ' selected-src';
        else if (i===dstNode && graphMode==='dijkstra') nCls += ' selected-dst';
        else if (pathNodes.includes(i) && i!==srcNode && i!==dstNode) nCls += ' on-path';
        else if (nodeStates[i]) nCls += ' ' + nodeStates[i];

        const wrapper = makeSVG('g');
        wrapper.setAttribute('transform', `translate(${x},${y})`);
        const grp = makeSVG('g');
        grp.setAttribute('class','node-group');
        grp.addEventListener('click', () => onNodeClick(i));

        const circle = makeSVG('circle');
        circle.setAttribute('r', NR); circle.setAttribute('class', nCls);
        grp.appendChild(circle);

        const label = makeSVG('text');
        label.setAttribute('class','node-label'); label.setAttribute('font-size','11');
        label.textContent = name;
        grp.appendChild(label);

        const idx = makeSVG('text');
        idx.setAttribute('y', NR+14); idx.setAttribute('class','node-index');
        idx.textContent = `[${i}]`;
        grp.appendChild(idx);

        wrapper.appendChild(grp);
        g.appendChild(wrapper);
    });
}

function onNodeClick(i) {
    srcNode = i;
    const srcSel = document.getElementById('srcSelect');
    if (srcSel) srcSel.value = USERS[i];
    renderGraph();
    glog(`Node clicked → <span class="log-path">${USERS[i]}</span> set as source`);
}

// ── BFS — Breadth First Search ──
let animating = false;
async function runBFS() {
    if (animating) return;
    animating = true;
    graphMode = 'bfs';
    nodeStates = {}; edgeStates = {}; pathEdges = []; pathNodes = [];
    document.getElementById('statMode').textContent = 'BFS';
    const startIdx = USERS.indexOf(document.getElementById('bfs-src').value);
    glog(`══ BFS from <span class="log-path">${USERS[startIdx]}</span> ══`);

    const visited = new Array(USERS.length).fill(false);
    const queue = [startIdx];
    visited[startIdx] = true;
    const order = [];
    let step = 0;

    while (queue.length > 0) {
        const u = queue.shift();
        order.push(u);
        nodeStates[u] = 'bfs-visiting';
        renderGraph();
        glog(`Step ${++step}: Visit <span class="log-path">${USERS[u]}</span> | Queue: [${queue.map(i=>USERS[i]).join(', ')}]`);
        await sleep(700);

        for (const {v} of adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                queue.push(v);
                edgeStates[`${u}-${v}`] = 'bfs-edge';
                nodeStates[v] = 'bfs-visited';
                renderGraph();
                await sleep(300);
            }
        }
        nodeStates[u] = 'bfs-visited';
        renderGraph();
    }
    glog(`<span class="log-ok">BFS Order: ${order.map(i=>USERS[i]).join(' → ')}</span>`);
    animating = false;
}

// ── DFS — Depth First Search ──
async function runDFS() {
    if (animating) return;
    animating = true;
    graphMode = 'dfs';
    nodeStates = {}; edgeStates = {}; pathEdges = []; pathNodes = [];
    document.getElementById('statMode').textContent = 'DFS';
    const startIdx = USERS.indexOf(document.getElementById('dfs-src').value);
    glog(`══ DFS from <span class="log-path">${USERS[startIdx]}</span> ══`);

    const visited = new Array(USERS.length).fill(false);
    const order = [];
    let step = 0;

    async function dfsVisit(u) {
        visited[u] = true;
        nodeStates[u] = 'dfs-visiting';
        renderGraph();
        glog(`Step ${++step}: Enter <span class="log-purple">${USERS[u]}</span>`);
        await sleep(700);
        for (const {v} of adj[u]) {
            if (!visited[v]) {
                edgeStates[`${u}-${v}`] = 'dfs-edge';
                renderGraph();
                await sleep(200);
                await dfsVisit(v);
            }
        }
        order.push(u);
        nodeStates[u] = 'dfs-visited';
        renderGraph();
    }

    await dfsVisit(startIdx);
    glog(`<span class="log-ok">DFS Finish Order: ${order.map(i=>USERS[i]).join(' → ')}</span>`);
    animating = false;
}

// ── DIJKSTRA ──
function dijkstra(src, dst) {
    const V = USERS.length;
    const dist = Array(V).fill(Infinity);
    const parent = Array(V).fill(-1);
    dist[src] = 0;
    const pq = [{d:0, u:src}];
    while (pq.length) {
        pq.sort((a,b) => a.d - b.d);
        const {d, u} = pq.shift();
        if (d > dist[u]) continue;
        for (const {v,w} of adj[u]) {
            if (dist[u]+w < dist[v]) { dist[v]=dist[u]+w; parent[v]=u; pq.push({d:dist[v],u:v}); }
        }
    }
    if (dist[dst] === Infinity) return null;
    const path = [];
    for (let n = dst; n !== -1; n = parent[n]) path.push(n);
    path.reverse();
    return {path, score: dist[dst]};
}

function runDijkstra() {
    graphMode = 'dijkstra';
    nodeStates = {}; edgeStates = {};
    document.getElementById('statMode').textContent = 'Dijkstra';
    const srcName = document.getElementById('srcSelect').value;
    const dstName = document.getElementById('dstSelect').value;
    const src = USERS.indexOf(srcName), dst = USERS.indexOf(dstName);
    if (src === dst) { glog(`<span class="log-info">[INFO] Source = Destination. No path needed.</span>`); return; }
    const result = dijkstra(src, dst);
    srcNode = src; dstNode = dst;
    if (!result) {
        pathEdges = []; pathNodes = [];
        glog(`<span class="log-err">[RESULT] "${srcName}" and "${dstName}" are NOT connected.</span>`);
        document.getElementById('statPath').textContent = '∞';
    } else {
        const {path, score} = result;
        pathNodes = [...path]; pathEdges = [];
        for (let i = 0; i < path.length-1; i++) pathEdges.push([path[i], path[i+1]]);
        const pathStr = path.map(i => USERS[i]).join(' → ');
        glog('──────────────────────────────');
        glog(`<span class="log-path">${srcName}</span> ──► <span class="log-path">${dstName}</span>`);
        glog(`Path: <span class="log-ok">${pathStr}</span>`);
        glog(`Degrees: <b>${path.length-1}</b> | Score: <b>${score}</b>`);
        glog('──────────────────────────────');
        document.getElementById('statPath').textContent = `${path.length-1} hops`;
    }
    renderGraph();
}

function clearPath() {
    pathEdges=[]; pathNodes=[]; srcNode=-1; dstNode=-1;
    nodeStates={}; edgeStates={}; graphMode='none';
    document.getElementById('statPath').textContent='—';
    document.getElementById('statMode').textContent='—';
    renderGraph();
    glog('<span class="log-dim">// Cleared.</span>');
}

// ── PRIM'S MST ──
async function runMST() {
    if (animating) return;
    animating = true;
    graphMode = 'mst';
    nodeStates = {}; edgeStates = {}; pathEdges = []; pathNodes = [];
    document.getElementById('statMode').textContent = "Prim's MST";
    const startIdx = USERS.indexOf(document.getElementById('mst-src').value);
    glog(`══ Prim's MST from <span class="log-path">${USERS[startIdx]}</span> ══`);

    const inMST = new Array(USERS.length).fill(false);
    const key = new Array(USERS.length).fill(Infinity);
    const parent = new Array(USERS.length).fill(-1);
    key[startIdx] = 0;
    let totalWeight = 0;

    for (let count = 0; count < USERS.length; count++) {
        // Find min key vertex not in MST
        let u = -1;
        key.forEach((k,i) => { if (!inMST[i] && (u===-1 || k < key[u])) u = i; });
        if (u === -1 || key[u] === Infinity) break;

        inMST[u] = true;
        totalWeight += key[u];
        nodeStates[u] = 'mst-node';
        if (parent[u] !== -1) edgeStates[`${parent[u]}-${u}`] = 'mst-edge';
        renderGraph();
        glog(`Add <span class="log-ok">${USERS[u]}</span> to MST (weight=${key[u]===0?0:key[u]})`);
        await sleep(700);

        for (const {v,w} of adj[u]) {
            if (!inMST[v] && w < key[v]) { key[v] = w; parent[v] = u; }
        }
    }
    glog(`<span class="log-ok">MST Total Weight: ${totalWeight}</span>`);
    animating = false;
}

// ── SVG helper ──
function makeSVG(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

// ── INIT ──
function initGraphSelects() {
    ['srcSelect','dstSelect','bfs-src','dfs-src','mst-src'].forEach(id => {
        const sel = document.getElementById(id);
        if (!sel) return;
        sel.innerHTML = '';
        USERS.forEach(u => { const o = document.createElement('option'); o.value = u; o.textContent = u; sel.appendChild(o); });
    });
    const dst = document.getElementById('dstSelect');
    if (dst) dst.value = 'Grace';
}

window.addEventListener('load', () => {
    initGraphSelects();
    // Build BST
    renderBSTTree();
    blog('<span class="log-ok">[DONE] BST built. 7 users loaded (Alice–Grace).</span>');
    blog('<span class="log-dim">// Inorder: Alice, Bob, Charlie, Diana, Eve, Frank, Grace</span>');
});

window.addEventListener('resize', () => {
    renderBSTTree(); renderAVLTree(); renderBTree(); renderGraph();
});

// Tab-specific resize
const tabObserver = new MutationObserver(() => {
    const active = document.querySelector('.tab-content.active');
    if (active) {
        const id = active.id;
        if (id==='tab-bst') renderBSTTree();
        if (id==='tab-avl') renderAVLTree();
        if (id==='tab-btree') renderBTree();
        if (id==='tab-graph') renderGraph();
    }
});
tabObserver.observe(document.body, {attributes: true, subtree: true, attributeFilter: ['class']});

// ══════════════════════════════════════════════
// TAB 5: ADS QUIZ ENGINE
// ══════════════════════════════════════════════
const QUIZ_QUESTIONS = [
    { topic:'BST', q:'What is the average time complexity of search in a Binary Search Tree?', opts:['O(1)','O(log n)','O(n)','O(n log n)'], ans:1, exp:'BST halves the search space each step → O(log n) average. Worst case (skewed tree) is O(n).' },
    { topic:'BST', q:'Which traversal of a BST yields nodes in sorted ascending order?', opts:['Preorder','Postorder','Inorder','Level-order'], ans:2, exp:'Inorder (Left→Root→Right) visits BST nodes in ascending order — used in sorted sets.' },
    { topic:'BST', q:'When deleting a node with TWO children, what replaces it?', opts:['Root node','Its left child','Inorder successor (min of right subtree)','Random leaf'], ans:2, exp:'The inorder successor replaces the deleted node to preserve BST ordering.' },
    { topic:'BST', q:'Which application directly uses BST-like structures?', opts:['Gmail inbox sorting','Autocomplete / Spell checkers','Video streaming buffers','Image compression'], ans:1, exp:'Autocomplete uses Tries (prefix trees, a BST variant) for O(L) prefix lookup.' },
    { topic:'AVL', q:'The Balance Factor of an AVL node is:', opts:['height(left)+height(right)','height(left)−height(right)','max(left,right)','depth of node'], ans:1, exp:'BF = h(left) − h(right). AVL enforces |BF| ≤ 1 at every node → O(log n) guaranteed.' },
    { topic:'AVL', q:'An LR imbalance (BF=+2, left child BF=−1) is fixed by:', opts:['Two right rotations','Left-rotate left child then Right-rotate root','Two left rotations','Right-rotate root only'], ans:1, exp:'LR = double rotation. Left-rotate left child, then right-rotate the root.' },
    { topic:'AVL', q:'Worst-case height of an AVL tree with n nodes:', opts:['O(n)','O(sqrt n)','O(log n)','O(n^2)'], ans:2, exp:'Balance ensures height ≤ 1.44·log₂(n). Worst = O(log n), unlike BST which can be O(n).' },
    { topic:'AVL', q:'Java TreeMap and C++ std::map internally use:', opts:['Hash Table','AVL Tree','Red-Black Tree','B-Tree'], ans:2, exp:'Both use Red-Black Trees — a relaxed balanced BST, slightly faster for inserts than strict AVL.' },
    { topic:'B-Tree', q:'In a B-Tree with min-degree t=2, maximum keys per node is:', opts:['t=2','t-1=1','2t=4','2t-1=3'], ans:3, exp:'Max keys = 2t-1 = 3. When a node gets 2t keys during insert, it splits at the median.' },
    { topic:'B-Tree', q:'Why are B-Trees preferred over AVL for disk storage?', opts:['Use less RAM','Each node maps to a disk page – minimises I/O reads','Simpler implementation','O(1) search'], ans:1, exp:'B-Tree nodes pack many keys per disk page. One page fetch = one disk read → massive I/O savings.' },
    { topic:'B-Tree', q:'When a B-Tree node overflows, what operation occurs?', opts:['LL Rotation','Node deleted','Split: median promoted to parent','Merge with sibling'], ans:2, exp:'Split: lower half stays, median goes to parent, upper half forms a new sibling node.' },
    { topic:'Graphs', q:'BFS uses which data structure internally?', opts:['Stack (LIFO)','Priority Queue','Queue (FIFO)','Hash Map'], ans:2, exp:'BFS uses a Queue. Level-by-level exploration guarantees shortest path in unweighted graphs.' },
    { topic:'Graphs', q:"Dijkstra's algorithm fails when the graph has:", opts:['Directed edges','Negative-weight edges','Cycles','Disconnected parts'], ans:1, exp:"Dijkstra requires non-negative weights. Negative edges break greedy relaxation. Use Bellman-Ford." },
    { topic:'Graphs', q:"Prim's MST algorithm works by:", opts:["Sort edges, add cheapest (Kruskal's)","Start from vertex, greedily add cheapest connecting edge","Run DFS from every vertex","Run Dijkstra from source"], ans:1, exp:"Prim's grows MST one vertex at a time, always picking the minimum outgoing edge." },
    { topic:'Graphs', q:'"Degrees of Separation" in social networks is computed using:', opts:["Dijkstra (weighted)","DFS traversal","BFS – shortest hops","Prim's MST"], ans:2, exp:'BFS finds min hops in unweighted graphs. "6 Degrees of Separation" is exactly BFS shortest path.' }
];

let quizCurrent=0,quizScore=0,quizTimer=null,quizSecs=30,quizAnswered=false;

function startQuiz(){
    quizCurrent=0;quizScore=0;quizAnswered=false;
    document.getElementById('quiz-start').style.display='none';
    document.getElementById('quiz-end').style.display='none';
    document.getElementById('quiz-active').style.display='block';
    showQuestion();
}

function showQuestion(){
    quizAnswered=false;
    const q=QUIZ_QUESTIONS[quizCurrent],total=QUIZ_QUESTIONS.length;
    document.getElementById('quiz-counter').textContent='Q '+(quizCurrent+1)+' / '+total;
    document.getElementById('quiz-progress').style.width=((quizCurrent/total)*100)+'%';
    document.getElementById('quiz-topic-chip').textContent='📌 '+q.topic;
    document.getElementById('quiz-question').textContent=q.q;
    document.getElementById('quiz-explanation').style.display='none';
    document.getElementById('quiz-next-btn').style.display='none';
    document.getElementById('quiz-score-mini').textContent='Score: '+quizScore+' / '+quizCurrent;
    const letters=['A','B','C','D'];
    const optBox=document.getElementById('quiz-options');
    optBox.innerHTML='';
    q.opts.forEach(function(opt,i){
        const btn=document.createElement('button');
        btn.className='quiz-option';
        btn.innerHTML='<span class="quiz-option-letter">'+letters[i]+'</span>'+opt;
        btn.onclick=function(){answerQuestion(i,btn);};
        optBox.appendChild(btn);
    });
    clearInterval(quizTimer);
    quizSecs=30;
    var tel=document.getElementById('quiz-timer');
    tel.textContent=30;tel.classList.remove('warning');
    quizTimer=setInterval(function(){
        quizSecs--;tel.textContent=quizSecs;
        if(quizSecs<=10)tel.classList.add('warning');
        if(quizSecs<=0){clearInterval(quizTimer);if(!quizAnswered)timeOut();}
    },1000);
}

function answerQuestion(chosen,btnEl){
    if(quizAnswered)return;
    quizAnswered=true;clearInterval(quizTimer);
    const q=QUIZ_QUESTIONS[quizCurrent];
    document.querySelectorAll('.quiz-option').forEach(function(b,i){
        b.classList.add('disabled');
        if(i===q.ans)b.classList.add('correct');
    });
    if(chosen===q.ans){quizScore++;btnEl.classList.add('correct');}
    else btnEl.classList.add('wrong');
    var expEl=document.getElementById('quiz-explanation');
    expEl.style.display='block';
    expEl.innerHTML='<b>💡 Explanation:</b> '+q.exp;
    document.getElementById('quiz-score-mini').textContent='Score: '+quizScore+' / '+(quizCurrent+1);
    var nb=document.getElementById('quiz-next-btn');
    nb.style.display='block';
    nb.textContent=quizCurrent<QUIZ_QUESTIONS.length-1?'Next Question →':'🏁 See Results';
}

function timeOut(){
    if(quizAnswered)return;quizAnswered=true;
    const q=QUIZ_QUESTIONS[quizCurrent];
    document.querySelectorAll('.quiz-option').forEach(function(b,i){b.classList.add('disabled');if(i===q.ans)b.classList.add('correct');});
    var expEl=document.getElementById('quiz-explanation');
    expEl.style.display='block';
    expEl.innerHTML='⏱ <b>Time up!</b> Correct: <b>'+q.opts[q.ans]+'</b><br>💡 '+q.exp;
    document.getElementById('quiz-score-mini').textContent='Score: '+quizScore+' / '+(quizCurrent+1);
    var nb=document.getElementById('quiz-next-btn');
    nb.style.display='block';
    nb.textContent=quizCurrent<QUIZ_QUESTIONS.length-1?'Next Question →':'🏁 See Results';
}

function nextQuestion(){
    quizCurrent++;
    if(quizCurrent>=QUIZ_QUESTIONS.length)showQuizEnd();
    else showQuestion();
}

function showQuizEnd(){
    clearInterval(quizTimer);
    document.getElementById('quiz-active').style.display='none';
    document.getElementById('quiz-end').style.display='block';
    var total=QUIZ_QUESTIONS.length,pct=Math.round((quizScore/total)*100);
    document.getElementById('quiz-final-num').textContent=quizScore;
    document.getElementById('quiz-progress').style.width='100%';
    document.getElementById('quiz-score-circle').style.setProperty('--score-pct',pct+'%');
    var title,badge,cls,msg;
    if(pct===100){title='🎉 Perfect Score!';badge='🥇 ADS Grandmaster';cls='badge-gold';msg='Flawless! You know ADS inside out. Brilliant!';}
    else if(pct>=80){title='🌟 Excellent!';badge='🥈 ADS Expert';cls='badge-silver';msg=quizScore+'/15 correct — strong ADS foundation!';}
    else if(pct>=60){title='�� Good Job!';badge='🥉 ADS Learner';cls='badge-bronze';msg=quizScore+'/15 correct. Review the topics you missed.';}
    else{title='📚 Keep Studying!';badge='🔁 Practice More';cls='badge-try';msg=quizScore+'/15 correct. Use the visualizations to practice!';}
    document.getElementById('quiz-end-title').textContent=title;
    document.getElementById('quiz-end-badge').textContent=badge;
    document.getElementById('quiz-end-badge').className='quiz-end-badge '+cls;
    document.getElementById('quiz-end-msg').textContent=msg;
}
