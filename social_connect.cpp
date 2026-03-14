/*
 * =====================================================================
 * Project     : Social Connect - Friend Network Analyzer
 * Description : Models a social media friend network using
 *               Graphs (Dijkstra's Algorithm) and Binary Search Tree
 * Language    : C++
 * Units       : Unit 1 to Unit 4 (ADS 2025-26)
 * =====================================================================
 */

#include <iostream>
#include <vector>
#include <queue>
#include <map>
#include <climits>
#include <algorithm>
#include <string>

using namespace std;

typedef pair<int, int> pii; // {distance, node_index}

// =====================================================================
// CLASS: SocialNetwork
// Uses an adjacency list to represent the friend graph.
// Implements Dijkstra's algorithm for shortest path.
// =====================================================================

class SocialNetwork {

private:
    int totalUsers;
    vector<pii> adjacencyList[20];   // adjacencyList[u] = {v, weight}
    map<string, int> nameToIndex;    // maps username -> graph index
    map<int, string> indexToName;    // maps graph index -> username

    // Helper: returns index of a user, or -1 if not found
    int getUserIndex(const string& name) {
        map<string, int>::iterator it = nameToIndex.find(name);
        if (it != nameToIndex.end())
            return it->second;
        return -1;
    }

public:

    // Constructor
    SocialNetwork(int n) {
        totalUsers = n;
    }

    // Register a new user into the network
    void registerUser(const string& name, int idx) {
        nameToIndex[name] = idx;
        indexToName[idx] = name;
    }

    // Add a mutual (undirected) friendship between two users
    void addFriendship(int userA, int userB, int strength) {
        // Lower strength = closer connection (like 1st degree vs 2nd degree)
        adjacencyList[userA].push_back(make_pair(userB, strength));
        adjacencyList[userB].push_back(make_pair(userA, strength));
    }

    // Display all direct friends of a given user
    void displayFriends(const string& username) {
        int idx = getUserIndex(username);
        if (idx == -1) {
            cout << "[ERROR] User \"" << username << "\" does not exist in the network.\n";
            return;
        }
        cout << "\nDirect friends of " << username << " : ";
        if (adjacencyList[idx].empty()) {
            cout << "No friends yet.";
        } else {
            for (int i = 0; i < (int)adjacencyList[idx].size(); i++) {
                cout << indexToName[adjacencyList[idx][i].first];
                if (i < (int)adjacencyList[idx].size() - 1)
                    cout << ", ";
            }
        }
        cout << "\n";
    }

    // Dijkstra's Algorithm: Find shortest connection path between two users
    void findShortestPath(const string& sourceName, const string& destName) {

        int src  = getUserIndex(sourceName);
        int dest = getUserIndex(destName);

        // Edge case: user not in network
        if (src == -1) {
            cout << "[ERROR] Source user \"" << sourceName << "\" not found.\n";
            return;
        }
        if (dest == -1) {
            cout << "[ERROR] Destination user \"" << destName << "\" not found.\n";
            return;
        }

        // Edge case: same source and destination
        if (src == dest) {
            cout << "\n[INFO] \"" << sourceName << "\" is the same as the destination. No path needed.\n";
            return;
        }

        // Initialize distance array with infinity
        vector<int> dist(totalUsers, INT_MAX);
        vector<int> parent(totalUsers, -1);

        // Min-heap priority queue: {distance, node}
        priority_queue<pii, vector<pii>, greater<pii>> minHeap;

        dist[src] = 0;
        minHeap.push(make_pair(0, src));

        // Relaxation loop
        while (!minHeap.empty()) {
            int currentDist = minHeap.top().first;
            int u           = minHeap.top().second;
            minHeap.pop();

            // Skip if already processed with a shorter distance
            if (currentDist > dist[u])
                continue;

            for (int i = 0; i < (int)adjacencyList[u].size(); i++) {
                int v      = adjacencyList[u][i].first;
                int weight = adjacencyList[u][i].second;

                if (dist[u] != INT_MAX && dist[u] + weight < dist[v]) {
                    dist[v]   = dist[u] + weight;
                    parent[v] = u;
                    minHeap.push(make_pair(dist[v], v));
                }
            }
        }

        // Edge case: no path between users
        if (dist[dest] == INT_MAX) {
            cout << "\n[RESULT] \"" << sourceName << "\" and \""
                 << destName << "\" are NOT connected in this network.\n";
            return;
        }

        // Reconstruct path by tracing parent[] backwards
        vector<string> path;
        for (int node = dest; node != -1; node = parent[node])
            path.push_back(indexToName[node]);
        reverse(path.begin(), path.end());

        // Print result
        cout << "\n------------------------------------------\n";
        cout << "Connection: " << sourceName << "  -->  " << destName << "\n";
        cout << "Path      : ";
        for (int i = 0; i < (int)path.size(); i++) {
            cout << path[i];
            if (i < (int)path.size() - 1) cout << " -> ";
        }
        cout << "\n";
        cout << "Degrees of separation : " << (int)path.size() - 1 << "\n";
        cout << "Connection score      : " << dist[dest] << "\n";
        cout << "------------------------------------------\n";
    }
};


// =====================================================================
// STRUCT & CLASS: BSTNode and UserBST
// Binary Search Tree for fast O(log n) user search by name.
// =====================================================================

struct BSTNode {
    string username;
    BSTNode* leftChild;
    BSTNode* rightChild;

    BSTNode(const string& name) {
        username    = name;
        leftChild   = NULL;
        rightChild  = NULL;
    }
};

class UserBST {

private:
    BSTNode* root;

    // Recursive insert
    BSTNode* insertNode(BSTNode* node, const string& name) {
        if (node == NULL)
            return new BSTNode(name);
        if (name < node->username)
            node->leftChild  = insertNode(node->leftChild, name);
        else if (name > node->username)
            node->rightChild = insertNode(node->rightChild, name);
        // If name == node->username: duplicate, don't insert again
        return node;
    }

    // Recursive search
    bool searchNode(BSTNode* node, const string& name) {
        if (node == NULL)
            return false;
        if (node->username == name)
            return true;
        if (name < node->username)
            return searchNode(node->leftChild, name);
        return searchNode(node->rightChild, name);
    }

    // Inorder traversal (Left -> Root -> Right) = alphabetical order
    void inorderTraversal(BSTNode* node) {
        if (node == NULL)
            return;
        inorderTraversal(node->leftChild);
        cout << "   >> " << node->username << "\n";
        inorderTraversal(node->rightChild);
    }

    // Free memory recursively
    void destroyTree(BSTNode* node) {
        if (node == NULL) return;
        destroyTree(node->leftChild);
        destroyTree(node->rightChild);
        delete node;
    }

public:

    UserBST() {
        root = NULL;
    }

    ~UserBST() {
        destroyTree(root);
    }

    // Public insert
    void insertUser(const string& name) {
        root = insertNode(root, name);
    }

    // Public search with result display
    void searchUser(const string& name) {
        cout << "\nSearching for \"" << name << "\" ... ";
        if (searchNode(root, name))
            cout << "FOUND in network. [OK]\n";
        else
            cout << "NOT found in network. [NOT FOUND]\n";
    }

    // Public inorder display
    void listAllUsers() {
        cout << "\n========== All Registered Users (A to Z) ==========\n";
        inorderTraversal(root);
        cout << "====================================================\n";
    }
};


// =====================================================================
// MAIN FUNCTION
// =====================================================================

int main() {

    cout << "\n#############################################\n";
    cout << "#   Social Connect - Friend Network Analyzer  #\n";
    cout << "#   Graphs + BST | ADS Project 2025-26        #\n";
    cout << "#############################################\n\n";

    // -----------------------------------------------------------------
    // STEP 1: Build the Social Network (Graph)
    // -----------------------------------------------------------------
    SocialNetwork network(7);

    // Register users with index
    network.registerUser("Alice",   0);
    network.registerUser("Bob",     1);
    network.registerUser("Charlie", 2);
    network.registerUser("Diana",   3);
    network.registerUser("Eve",     4);
    network.registerUser("Frank",   5);
    network.registerUser("Grace",   6);

    // Add friendships (strength = connection closeness, lower = closer)
    network.addFriendship(0, 1, 1); // Alice   <-> Bob
    network.addFriendship(0, 2, 2); // Alice   <-> Charlie
    network.addFriendship(1, 3, 1); // Bob     <-> Diana
    network.addFriendship(2, 4, 3); // Charlie <-> Eve
    network.addFriendship(3, 5, 2); // Diana   <-> Frank
    network.addFriendship(4, 6, 1); // Eve     <-> Grace
    network.addFriendship(5, 6, 2); // Frank   <-> Grace

    // -----------------------------------------------------------------
    // STEP 2: Build the BST for user lookup
    // -----------------------------------------------------------------
    UserBST userTree;
    userTree.insertUser("Alice");
    userTree.insertUser("Bob");
    userTree.insertUser("Charlie");
    userTree.insertUser("Diana");
    userTree.insertUser("Eve");
    userTree.insertUser("Frank");
    userTree.insertUser("Grace");

    // -----------------------------------------------------------------
    // STEP 3: BST Operations - List and Search
    // -----------------------------------------------------------------
    userTree.listAllUsers();

    userTree.searchUser("Diana");      // Should be FOUND
    userTree.searchUser("John");       // Edge case: NOT FOUND
    userTree.searchUser("Alice");      // Should be FOUND

    // -----------------------------------------------------------------
    // STEP 4: Graph Operations - Friends and Paths
    // -----------------------------------------------------------------
    network.displayFriends("Alice");
    network.displayFriends("Bob");
    network.displayFriends("ZUser");   // Edge case: user not in network

    network.findShortestPath("Alice", "Grace");   // Normal path
    network.findShortestPath("Bob",   "Eve");     // Normal path
    network.findShortestPath("Alice", "Bob");     // Direct friends (1 degree)
    network.findShortestPath("Alice", "Alice");   // Edge case: same user
    network.findShortestPath("Alice", "Unknown"); // Edge case: dest not found

    cout << "\n[DONE] All operations completed successfully.\n\n";

    return 0;
}
