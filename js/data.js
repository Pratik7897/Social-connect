// ── SHARED DATA — mirrors C++ SocialNetwork exactly ──
const USERS = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace"];
const EDGES = [[0,1,1],[0,2,2],[1,3,1],[2,4,3],[3,5,2],[4,6,1],[5,6,2]];

// Adjacency list (undirected weighted graph)
const adj = Array.from({length: 7}, () => []);
EDGES.forEach(([u,v,w]) => {
    adj[u].push({v, w});
    adj[v].push({v: u, w});
});
