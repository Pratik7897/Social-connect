// ══════════════════════════════════════════
// BINARY SEARCH TREE — mirrors C++ UserBST
// ══════════════════════════════════════════

class BSTNode {
    constructor(name) { this.name = name; this.left = null; this.right = null; }
}

class UserBST {
    constructor() { this.root = null; }

    _insert(node, name) {
        if (!node) return new BSTNode(name);
        if (name < node.name) node.left  = this._insert(node.left,  name);
        else if (name > node.name) node.right = this._insert(node.right, name);
        return node;
    }
    _search(node, name) {
        if (!node) return false;
        if (node.name === name) return true;
        return name < node.name ? this._search(node.left, name) : this._search(node.right, name);
    }
    _minNode(node) { let c = node; while (c.left) c = c.left; return c; }
    _delete(node, name) {
        if (!node) return null;
        if (name < node.name)      node.left  = this._delete(node.left,  name);
        else if (name > node.name) node.right = this._delete(node.right, name);
        else {
            if (!node.left)  return node.right;
            if (!node.right) return node.left;
            const succ = this._minNode(node.right);
            node.name  = succ.name;
            node.right = this._delete(node.right, succ.name);
        }
        return node;
    }
    _inorder(node, out)  { if (!node) return; this._inorder(node.left, out);  out.push(node.name); this._inorder(node.right, out); }
    _preorder(node, out) { if (!node) return; out.push(node.name); this._preorder(node.left, out); this._preorder(node.right, out); }
    _height(node)  { return node ? 1 + Math.max(this._height(node.left), this._height(node.right)) : 0; }
    _count(node)   { return node ? 1 + this._count(node.left) + this._count(node.right) : 0; }

    insert(name)   { this.root = this._insert(this.root, name); }
    search(name)   { return this._search(this.root, name); }
    delete(name)   { this.root = this._delete(this.root, name); }
    inorder()      { const r = []; this._inorder(this.root, r);  return r; }
    preorder()     { const r = []; this._preorder(this.root, r); return r; }
    height()       { return this._height(this.root); }
    count()        { return this._count(this.root); }
}

// ── State ──
const DEFAULT_USERS = ["Alice","Bob","Charlie","Diana","Eve","Frank","Grace"];
const bst = new UserBST();
DEFAULT_USERS.forEach(u => bst.insert(u));
let bstHighlight = null;

// ── Renderer ──
function renderBSTTree() {
    const svg = document.getElementById('bst-svg');
    const g   = document.getElementById('bst-group');
    g.innerHTML = '';
    if (!bst.root) {
        document.getElementById('bst-stat-nodes').textContent = '0';
        document.getElementById('bst-stat-height').textContent = '0';
        return;
    }
    const counter = {val: 0};
    computeTreeLayout(bst.root, 0, counter);

    const W = svg.clientWidth || 700, H = svg.clientHeight || 400;
    const total = counter.val, maxD = bst.height() - 1;
    const hPad = 55, vPad = 58;
    const xScale = total > 1 ? (W - 2*hPad) / (total - 1) : 0;
    const yScale = maxD  > 0 ? (H - 2*vPad) / maxD : 0;
    const NR = Math.max(17, Math.min(26, xScale / 2.8));

    const px = xi => total === 1 ? W/2 : hPad + xi * xScale;
    const py = yi => maxD  === 0 ? H/2 : vPad + yi * yScale;

    function drawEdges(node) {
        if (!node) return;
        ['left','right'].forEach(side => {
            if (!node[side]) return;
            const line = makeSVG('line');
            line.setAttribute('x1', px(node._x));       line.setAttribute('y1', py(node._y));
            line.setAttribute('x2', px(node[side]._x)); line.setAttribute('y2', py(node[side]._y));
            line.setAttribute('class', 'tree-edge');
            g.appendChild(line);
            drawEdges(node[side]);
        });
    }
    function drawNodes(node) {
        if (!node) return;
        const x = px(node._x), y = py(node._y);
        const isHL = bstHighlight && bstHighlight.name === node.name;
        const cls  = isHL ? `tree-node-circle ${bstHighlight.cls}` : 'tree-node-circle';

        const circle = makeSVG('circle');
        circle.setAttribute('cx', x); circle.setAttribute('cy', y);
        circle.setAttribute('r', NR); circle.setAttribute('class', cls);
        g.appendChild(circle);

        const label = makeSVG('text');
        label.setAttribute('x', x); label.setAttribute('y', y);
        label.setAttribute('class', 'tree-node-label');
        label.setAttribute('font-size', Math.max(9, Math.min(13, NR * 0.58)));
        label.textContent = node.name.length > 6 ? node.name.slice(0,5)+'…' : node.name;
        g.appendChild(label);

        const idx = makeSVG('text');
        idx.setAttribute('x', x); idx.setAttribute('y', y + NR + 14);
        idx.setAttribute('class', 'tree-node-idx');
        idx.textContent = node.name;
        g.appendChild(idx);

        drawNodes(node.left); drawNodes(node.right);
    }
    drawEdges(bst.root);
    drawNodes(bst.root);

    document.getElementById('bst-stat-nodes').textContent  = bst.count();
    document.getElementById('bst-stat-height').textContent = bst.height();
}

// ── Operations ──
function bstInsert() {
    const val = document.getElementById('bst-insert-input').value.trim();
    if (!val) { blog('<span class="log-err">[ERROR] Enter a username.</span>'); return; }
    if (bst.search(val)) { blog(`<span class="log-info">[INFO] "${val}" already exists.</span>`); return; }
    bst.insert(val);
    bstHighlight = {name: val, cls: 'highlighted'};
    renderBSTTree();
    blog(`<span class="log-ok">INSERT:</span> "${val}" added → height=${bst.height()}`);
    document.getElementById('bst-stat-op').textContent = 'INSERT';
    document.getElementById('bst-insert-input').value = '';
    setTimeout(() => { bstHighlight = null; renderBSTTree(); }, 1800);
}

function bstSearchUser() {
    const val = document.getElementById('bst-search-input').value.trim();
    if (!val) { blog('<span class="log-err">[ERROR] Enter a username.</span>'); return; }
    const found = bst.search(val);
    bstHighlight = {name: val, cls: found ? 'found' : 'not-found'};
    renderBSTTree();
    blog(found
        ? `Search "<b>${val}</b>" → <span class="log-ok">FOUND ✓</span>`
        : `Search "<b>${val}</b>" → <span class="log-err">NOT FOUND ✗</span>`);
    document.getElementById('bst-stat-op').textContent = found ? 'FOUND' : 'NOT FOUND';
    setTimeout(() => { bstHighlight = null; renderBSTTree(); }, 2200);
}

function bstDelete() {
    const val = document.getElementById('bst-delete-input').value.trim();
    if (!val) { blog('<span class="log-err">[ERROR] Enter a username.</span>'); return; }
    if (!bst.search(val)) { blog(`<span class="log-err">[ERROR] "${val}" not in BST.</span>`); return; }
    bst.delete(val); bstHighlight = null;
    renderBSTTree();
    blog(`<span class="log-info">DELETE:</span> "${val}" removed → height=${bst.height()}`);
    document.getElementById('bst-stat-op').textContent = 'DELETE';
    document.getElementById('bst-delete-input').value = '';
}

function bstListAll() {
    const sorted = bst.inorder();
    blog('══ Inorder Traversal (A → Z) ══');
    sorted.forEach(n => blog(`&nbsp;&nbsp;<span class="log-path">>> ${n}</span>`));
    blog('═══════════════════════════════');
}

function bstPreorder() {
    const pre = bst.preorder();
    blog('══ Preorder (Root → L → R) ══');
    blog(`&nbsp;&nbsp;<span class="log-cyan">${pre.join(' → ')}</span>`);
}

function bstReset() {
    bst.root = null;
    DEFAULT_USERS.forEach(u => bst.insert(u));
    bstHighlight = null;
    renderBSTTree();
    blog('<span class="log-dim">// BST reset to default 7 users.</span>');
    document.getElementById('bst-stat-op').textContent = '—';
}
