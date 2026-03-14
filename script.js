        // ─────────────────────────────────────────
        // DATA — mirrors the C++ code exactly
        // ─────────────────────────────────────────
        const USERS = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"];
        const EDGES = [
            [0, 1, 1], [0, 2, 2], [1, 3, 1], [2, 4, 3], [3, 5, 2], [4, 6, 1], [5, 6, 2]
        ];

        // Graph adjacency list
        const adj = Array.from({ length: 7 }, () => []);
        EDGES.forEach(([u, v, w]) => { adj[u].push({ v, w }); adj[v].push({ v: u, w }); });

        // ─────────────────────────────────────────
        // BST — mirrors C++ UserBST class
        // ─────────────────────────────────────────
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
            insert(name) { this.root = this._insert(this.root, name); }
            search(name) { return this._search(this.root, name); }
            inorder() { const r = []; this._inorder(this.root, r); return r; }
        }

        const bst = new UserBST();
        USERS.forEach(u => bst.insert(u));

        // ─────────────────────────────────────────
        // DIJKSTRA — mirrors C++ findShortestPath
        // ─────────────────────────────────────────
        function dijkstra(src, dst) {
            const V = USERS.length;
            const dist = Array(V).fill(Infinity);
            const parent = Array(V).fill(-1);
            dist[src] = 0;
            // simple min-heap via sorted array
            const pq = [{ d: 0, u: src }];
            while (pq.length) {
                pq.sort((a, b) => a.d - b.d);
                const { d, u } = pq.shift();
                if (d > dist[u]) continue;
                for (const { v, w } of adj[u]) {
                    if (dist[u] + w < dist[v]) {
                        dist[v] = dist[u] + w; parent[v] = u;
                        pq.push({ d: dist[v], u: v });
                    }
                }
            }
            if (dist[dst] === Infinity) return null;
            const path = [];
            for (let n = dst; n !== -1; n = parent[n]) path.push(n);
            path.reverse();
            return { path, score: dist[dst] };
        }

        // ─────────────────────────────────────────
        // GRAPH LAYOUT — circular positions
        // ─────────────────────────────────────────
        let svgW = 800, svgH = 500;
        function getPositions() {
            const cx = svgW / 2, cy = svgH / 2, r = Math.min(svgW, svgH) * 0.34;
            return USERS.map((_, i) => ({
                x: cx + r * Math.cos((2 * Math.PI * i / USERS.length) - Math.PI / 2),
                y: cy + r * Math.sin((2 * Math.PI * i / USERS.length) - Math.PI / 2)
            }));
        }

        // ─────────────────────────────────────────
        // RENDER GRAPH
        // ─────────────────────────────────────────
        let pathEdges = [], pathNodes = [], srcNode = -1, dstNode = -1;

        function renderGraph() {
            const svg = document.getElementById('graph');
            const g = document.getElementById('graphGroup');
            const rect = svg.getBoundingClientRect();
            svgW = rect.width || 800; svgH = rect.height || 500;
            const pos = getPositions();
            g.innerHTML = '';

            // Draw edges
            EDGES.forEach(([u, v, w]) => {
                const pu = pos[u], pv = pos[v];
                const onPath = pathEdges.some(e => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u));
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', pu.x); line.setAttribute('y1', pu.y);
                line.setAttribute('x2', pv.x); line.setAttribute('y2', pv.y);
                line.setAttribute('class', 'edge-line' + (onPath ? ' path-edge' : ''));
                g.appendChild(line);
                // weight label
                const tx = (pu.x + pv.x) / 2, ty = (pu.y + pv.y) / 2;
                const wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                wt.setAttribute('x', tx); wt.setAttribute('y', ty - 7);
                wt.setAttribute('class', 'edge-weight'); wt.textContent = w;
                g.appendChild(wt);
            });

            // Draw nodes
            const NR = 32;
            USERS.forEach((name, i) => {
                const { x, y } = pos[i];
                const isSrc = i === srcNode, isDst = i === dstNode;
                const onPath = pathNodes.includes(i) && !isSrc && !isDst;
                const cls = 'node-circle' + (isSrc ? ' selected-src' : (isDst ? ' selected-dst' : (onPath ? ' on-path pulse' : '')));

                // Glow ring for path nodes
                if (onPath || isSrc || isDst) {
                    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('r', NR + 8);
                    ring.setAttribute('fill', 'none');
                    ring.setAttribute('stroke', isSrc ? 'rgba(79,142,247,0.25)' : isDst ? 'rgba(167,139,250,0.25)' : 'rgba(52,211,153,0.2)');
                    ring.setAttribute('stroke-width', '2');
                    g.appendChild(ring);
                }

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x); circle.setAttribute('cy', y); circle.setAttribute('r', NR);
                circle.setAttribute('class', cls);
                circle.addEventListener('click', () => onNodeClick(i));
                g.appendChild(circle);

                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', x); label.setAttribute('y', y);
                label.setAttribute('class', 'node-label'); label.textContent = name;
                g.appendChild(label);

                const idx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                idx.setAttribute('x', x); idx.setAttribute('y', y + NR + 14);
                idx.setAttribute('class', 'node-index'); idx.textContent = '[' + i + ']';
                g.appendChild(idx);
            });
        }

        // Click node to set source
        function onNodeClick(i) {
            srcNode = i;
            document.getElementById('srcSelect').value = USERS[i];
            renderGraph();
            log(`Node clicked → <span class="log-path">${USERS[i]}</span> set as source`);
        }

        // ─────────────────────────────────────────
        // LOG
        // ─────────────────────────────────────────
        function log(html) {
            const box = document.getElementById('logBox');
            const div = document.createElement('div');
            div.className = 'log-line'; div.innerHTML = html;
            box.appendChild(div);
            box.scrollTop = box.scrollHeight;
        }

        // ─────────────────────────────────────────
        // OPERATIONS
        // ─────────────────────────────────────────
        function bstSearch() {
            const name = document.getElementById('searchInput').value.trim();
            if (!name) { log('<span class="log-err">[ERROR] Enter a username to search.</span>'); return; }
            const found = bst.search(name);
            if (found) {
                log(`Searching for "<b>${name}</b>" ... <span class="log-ok">FOUND in network. [OK]</span>`);
                // highlight node if exists
                const idx = USERS.indexOf(name);
                if (idx >= 0) { srcNode = idx; renderGraph(); }
            } else {
                log(`Searching for "<b>${name}</b>" ... <span class="log-err">NOT found in network. [NOT FOUND]</span>`);
            }
        }

        function runDijkstra() {
            const srcName = document.getElementById('srcSelect').value;
            const dstName = document.getElementById('dstSelect').value;
            const src = USERS.indexOf(srcName), dst = USERS.indexOf(dstName);
            if (src === dst) {
                log(`<span class="log-info">[INFO] "${srcName}" is the same as the destination. No path needed.</span>`);
                return;
            }
            const result = dijkstra(src, dst);
            if (!result) {
                log(`<span class="log-err">[RESULT] "${srcName}" and "${dstName}" are NOT connected.</span>`);
                pathEdges = []; pathNodes = []; srcNode = src; dstNode = dst;
                document.getElementById('statPath').textContent = '∞';
                document.getElementById('statScore').textContent = '∞';
            } else {
                const { path, score } = result;
                pathNodes = [...path]; srcNode = src; dstNode = dst;
                pathEdges = [];
                for (let i = 0; i < path.length - 1; i++) pathEdges.push([path[i], path[i + 1]]);
                const pathStr = path.map(i => USERS[i]).join(' → ');
                log(`------------------------------------------`);
                log(`Connection: <span class="log-path">${srcName}</span>  ──►  <span class="log-path">${dstName}</span>`);
                log(`Path &nbsp;&nbsp;&nbsp;: <span class="log-ok">${pathStr}</span>`);
                log(`Degrees of separation : <b>${path.length - 1}</b>`);
                log(`Connection score &nbsp;&nbsp;: <b>${score}</b>`);
                log(`------------------------------------------`);
                document.getElementById('statPath').textContent = path.length - 1;
                document.getElementById('statScore').textContent = score;
            }
            renderGraph();
        }

        function clearPath() {
            pathEdges = []; pathNodes = []; srcNode = -1; dstNode = -1;
            document.getElementById('statPath').textContent = '—';
            document.getElementById('statScore').textContent = '—';
            renderGraph();
            log('<span class="log-dim">// Path cleared.</span>');
        }

        function showFriends() {
            const name = document.getElementById('friendsSelect').value;
            const idx = USERS.indexOf(name);
            if (idx < 0) { log(`<span class="log-err">[ERROR] User not found.</span>`); return; }
            const friends = adj[idx].map(e => USERS[e.v]);
            if (friends.length === 0) {
                log(`Direct friends of <b>${name}</b> : <span class="log-info">No friends yet.</span>`);
            } else {
                log(`Direct friends of <b>${name}</b> : <span class="log-ok">${friends.join(', ')}</span>`);
            }
            // highlight node
            srcNode = idx; renderGraph();
        }

        function listAllUsers() {
            const sorted = bst.inorder();
            log(`========== All Registered Users (A to Z) ==========`);
            sorted.forEach(n => log(`   <span class="log-path">&gt;&gt; ${n}</span>`));
            log(`====================================================`);
        }

        // ─────────────────────────────────────────
        // INIT SELECTS & CHIPS
        // ─────────────────────────────────────────
        function initSelects() {
            ['srcSelect', 'dstSelect', 'friendsSelect'].forEach(id => {
                const sel = document.getElementById(id);
                USERS.forEach(u => { const o = document.createElement('option'); o.value = u; o.textContent = u; sel.appendChild(o); });
            });
            document.getElementById('dstSelect').value = 'Grace';

            const chips = document.getElementById('userChips');
            USERS.forEach(u => {
                const chip = document.createElement('span');
                chip.className = 'chip'; chip.textContent = u;
                chip.onclick = () => {
                    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    document.getElementById('searchInput').value = u;
                };
                chips.appendChild(chip);
            });
        }

        // ─────────────────────────────────────────
        // STARTUP
        // ─────────────────────────────────────────
        window.addEventListener('load', () => {
            initSelects();
            renderGraph();
            log('<span class="log-ok">[DONE] Social Connect initialized. 7 users, 7 friendships loaded.</span>');
            log('<span class="log-dim">// BST built with inorder: Alice, Bob, Charlie, Diana, Eve, Frank, Grace</span>');
        });
        window.addEventListener('resize', renderGraph);
    