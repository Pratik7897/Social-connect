// ══════════════════════════════════════════
// AVL TREE — mirrors C++ AVL implementation
// Self-balancing BST with LL/RR/LR/RL rotations
// ══════════════════════════════════════════

class AVLNode {
    constructor(key) { this.key = key; this.left = null; this.right = null; this.h = 1; }
}

class AVLTree {
    constructor() { this.root = null; this.totalRotations = 0; this.lastRotations = []; }

    h(n)   { return n ? n.h : 0; }
    bf(n)  { return n ? this.h(n.left) - this.h(n.right) : 0; }
    upd(n) { if (n) n.h = 1 + Math.max(this.h(n.left), this.h(n.right)); }

    rotRight(y) {   // LL case
        const x = y.left, T2 = x.right;
        x.right = y; y.left = T2;
        this.upd(y); this.upd(x);
        this.lastRotations.push({type: 'LL — Right Rotation', at: y.key});
        this.totalRotations++;
        return x;
    }
    rotLeft(x) {    // RR case
        const y = x.right, T2 = y.left;
        y.left = x; x.right = T2;
        this.upd(x); this.upd(y);
        this.lastRotations.push({type: 'RR — Left Rotation', at: x.key});
        this.totalRotations++;
        return y;
    }

    _insert(node, k) {
        if (!node) return new AVLNode(k);
        if (k < node.key)      node.left  = this._insert(node.left,  k);
        else if (k > node.key) node.right = this._insert(node.right, k);
        else return node;   // duplicate
        this.upd(node);
        const b = this.bf(node);
        // LL
        if (b > 1  && k < node.left.key)  return this.rotRight(node);
        // RR
        if (b < -1 && k > node.right.key) return this.rotLeft(node);
        // LR
        if (b > 1  && k > node.left.key) {
            this.lastRotations.push({type: 'LR — Left-Right Rotation', at: node.key});
            this.totalRotations++;
            node.left = this.rotLeft(node.left);
            return this.rotRight(node);
        }
        // RL
        if (b < -1 && k < node.right.key) {
            this.lastRotations.push({type: 'RL — Right-Left Rotation', at: node.key});
            this.totalRotations++;
            node.right = this.rotRight(node.right);
            return this.rotLeft(node);
        }
        return node;
    }

    _minNode(n) { let c = n; while (c.left) c = c.left; return c; }
    _delete(node, k) {
        if (!node) return null;
        if (k < node.key)      node.left  = this._delete(node.left,  k);
        else if (k > node.key) node.right = this._delete(node.right, k);
        else {
            if (!node.left || !node.right) node = node.left || node.right;
            else {
                const s = this._minNode(node.right);
                node.key = s.key;
                node.right = this._delete(node.right, s.key);
            }
        }
        if (!node) return null;
        this.upd(node);
        const b = this.bf(node);
        if (b > 1  && this.bf(node.left) >= 0)  return this.rotRight(node);
        if (b > 1  && this.bf(node.left)  < 0) { node.left = this.rotLeft(node.left);  return this.rotRight(node); }
        if (b < -1 && this.bf(node.right) <= 0) return this.rotLeft(node);
        if (b < -1 && this.bf(node.right)  > 0) { node.right = this.rotRight(node.right); return this.rotLeft(node); }
        return node;
    }

    _count(n) { return n ? 1 + this._count(n.left) + this._count(n.right) : 0; }

    insert(k) { this.lastRotations = []; this.root = this._insert(this.root, k); }
    delete(k) { this.lastRotations = []; this.root = this._delete(this.root, k); }
    height()  { return this.h(this.root); }
    count()   { return this._count(this.root); }
}

// ── State ──
const avl = new AVLTree();

// ── Renderer ──
function renderAVLTree() {
    const svg = document.getElementById('avl-svg');
    const g   = document.getElementById('avl-group');
    g.innerHTML = '';
    if (!avl.root) {
        document.getElementById('avl-stat-nodes').textContent  = '0';
        document.getElementById('avl-stat-height').textContent = '—';
        return;
    }
    const counter = {val: 0};
    computeTreeLayout(avl.root, 0, counter);

    const W = svg.clientWidth || 700, H = svg.clientHeight || 400;
    const total = counter.val, maxD = avl.height() - 1;
    const hPad = 55, vPad = 62;
    const xScale = total > 1 ? (W - 2*hPad) / (total - 1) : 0;
    const yScale = maxD  > 0 ? (H - 2*vPad - 20) / maxD : 0;
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
            g.appendChild(line); drawEdges(node[side]);
        });
    }
    function drawNodes(node) {
        if (!node) return;
        const x = px(node._x), y = py(node._y);
        const bf = avl.bf(node), balanced = Math.abs(bf) <= 1;

        const circle = makeSVG('circle');
        circle.setAttribute('cx', x); circle.setAttribute('cy', y); circle.setAttribute('r', NR);
        circle.setAttribute('class', 'tree-node-circle');
        circle.setAttribute('style', balanced
            ? 'stroke:rgba(16,185,129,0.75);fill:rgba(16,185,129,0.1);'
            : 'stroke:#ef4444;fill:rgba(239,68,68,0.15);');
        g.appendChild(circle);

        const label = makeSVG('text');
        label.setAttribute('x', x); label.setAttribute('y', y); label.setAttribute('class', 'tree-node-label');
        label.setAttribute('font-size', Math.max(9, Math.min(13, NR * 0.62)));
        label.textContent = node.key;
        g.appendChild(label);

        // Balance factor badge (top-right of node)
        const bfTxt = makeSVG('text');
        bfTxt.setAttribute('x', x + NR - 2); bfTxt.setAttribute('y', y - NR + 6);
        bfTxt.setAttribute('class', balanced ? 'tree-node-bf' : 'tree-node-bf bad');
        bfTxt.setAttribute('font-size', '10'); bfTxt.textContent = bf;
        g.appendChild(bfTxt);

        // Height label below
        const hTxt = makeSVG('text');
        hTxt.setAttribute('x', x); hTxt.setAttribute('y', y + NR + 14);
        hTxt.setAttribute('class', 'tree-node-idx'); hTxt.textContent = `h=${node.h}`;
        g.appendChild(hTxt);

        drawNodes(node.left); drawNodes(node.right);
    }
    drawEdges(avl.root); drawNodes(avl.root);

    document.getElementById('avl-stat-nodes').textContent  = avl.count();
    document.getElementById('avl-stat-height').textContent = avl.height();
    document.getElementById('avl-stat-rot').textContent    = avl.totalRotations;
}

// ── Operations ──
function avlInsertKey() {
    const val = parseInt(document.getElementById('avl-insert-input').value);
    if (isNaN(val)) { alog('<span class="log-err">[ERROR] Enter a valid integer.</span>'); return; }
    avl.insert(val);
    renderAVLTree();
    alog(`<span class="log-ok">INSERT</span> ${val} → height=${avl.height()}, BF(root)=${avl.bf(avl.root)}`);
    avl.lastRotations.forEach(r => alog(`  ↻ <span class="log-purple">${r.type}</span> at node <b>${r.at}</b>`));
    if (!avl.lastRotations.length) alog('  <span class="log-dim">// No rotation needed</span>');
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
    const demos = {
        1: {seq:[3,2,1],  name:'LL Rotation'},
        2: {seq:[1,2,3],  name:'RR Rotation'},
        3: {seq:[3,1,2],  name:'LR Rotation'},
        4: {seq:[1,3,2],  name:'RL Rotation'},
        5: {seq:[5,3,7,1,4,6,8,2], name:'Balanced Tree (multi-insert)'}
    };
    const d = demos[type];
    alog(`══ Demo: ${d.name} ══`);
    alog(`Inserting: <b>${d.seq.join(' → ')}</b>`);
    d.seq.forEach(k => {
        avl.insert(k);
        const rotStr = avl.lastRotations.map(r => `<span class="log-purple">${r.type}</span>`).join(', ');
        alog(`Insert <b>${k}</b>: BF=${avl.bf(avl.root)} ${rotStr ? '→ ' + rotStr : ''}`);
    });
    renderAVLTree();
    alog(`<span class="log-ok">Result: height=${avl.height()}, balanced ✓</span>`);
}

function avlReset() {
    avl.root = null; avl.totalRotations = 0;
    renderAVLTree();
    alog('<span class="log-dim">// AVL Tree cleared.</span>');
}
