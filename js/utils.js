// ── ANIMATION SPEED CONTROL ──
let ANIM_DELAY = 700; // ms per step, default Normal

function setAnimSpeed(val) {
    ANIM_DELAY = parseInt(val);
}

// Promisified delay — uses global ANIM_DELAY if no arg given
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms !== undefined ? ms : ANIM_DELAY));
}

// ── SVG HELPER ──
function makeSVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

// ── LOG HELPERS — one per tab ──
function log(boxId, html) {
    const box = document.getElementById(boxId);
    if (!box) return;
    const div = document.createElement('div');
    div.className = 'log-line';
    div.innerHTML = html;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
const blog  = html => log('bst-log',   html);
const alog  = html => log('avl-log',   html);
const btlog = html => log('bt-log',    html);
const glog  = html => log('graph-log', html);

// ── GENERIC BINARY TREE LAYOUT (Reingold-Tilford simplified) ──
// Works for both BST nodes (name) and AVL nodes (key)
// Assigns _x (inorder index) and _y (depth) to each node
function computeTreeLayout(node, depth, counter, L = 'left', R = 'right') {
    if (!node) return;
    computeTreeLayout(node[L], depth + 1, counter, L, R);
    node._x = counter.val++;
    node._y = depth;
    computeTreeLayout(node[R], depth + 1, counter, L, R);
}
