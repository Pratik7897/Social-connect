# Social Connect: Friend Network Platform
## Data Structures and Algorithms - Project Report

---

### 1. Project Title and Objective
**Project Title**: Social Connect - A Friend/People Network Platform
**Objective**: To design and implement a social networking platform that efficiently models and queries interpersonal relationships. The system uses appropriate Data Structures and Algorithms (DSA) to manage user registries, track complex connections, parse indexed profile pages, compute degrees of separation (shortest paths), and determine the most optimal network of friends (minimum spanning tree).

### 2. Introduction
In modern social networks, recognizing and analyzing how individuals connect is crucial. The **Social Connect** platform represents individuals as nodes within various data structures, establishing relationships and measuring connectivity strength. Rather than generic structures, the platform maps theoretical models to real-world social context—handling registration, friend requests, connection degrees, and optimal network clustering. 

### 3. System Architecture and Social Context
The platform is broken down into distinct network modules powered by specialized data structures:
- **Contact Book (Binary Search Tree)**: Manages fast lookups for user names in the registry.
- **Connection Balancer (AVL Tree)**: Maintains a heavily modified friend-list structure, automatically balancing to prevent performance degradation when a user becomes extremely popular.
- **Profile Indexing (B-Tree)**: Handles large volumes of user `profileID` pages, allowing quick disk-level retrieval.
- **LinkedIn Degree Connections (Dijkstra's Algorithm)**: Finds the shortest connection path and closest connection strength between any two individuals in the network.
- **Network Clustering (Prim's Algorithm)**: Builds the minimum viable network to connect all friends with the lowest possible collective link strength.

### 4. Data Structure I: Friend Registry (Binary Search Tree)
The **Contact Book** is implemented as a Binary Search Tree. It allows users to quickly search the registry for friends.

**Implementation Details:**
- **Variables**: `FriendNode`, `root` of `FriendRegistry`
- **Operations**: `registerUser()`, `unfriendUser()`, `findUser()`

```cpp
struct FriendNode {
    string username;
    FriendNode* leftChild;
    FriendNode* rightChild;
};

class FriendRegistry {
private:
    FriendNode* root;
    
public:
    void registerUser(const string& name);
    void unfriendUser(const string& name);
    bool findUser(const string& name);
};
```

#### Function Summary Table
| Function | Social Context | Time Complexity (Avg) |
| :--- | :--- | :--- |
| `registerUser()` | Adds a newly signed-up user to the contact book | O(log N) |
| `findUser()` | Searches the registry to see if a username exists | O(log N) |
| `unfriendUser()` | Removes a specific user from the network | O(log N) |

### 5. Data Structure II: Balanced Connections (AVL Tree)
When managing highly active users, a simple BST might skew. **Connection Balancing** uses an AVL Tree to keep user lookup times strictly logarithmic.

**Implementation Details:**
- **Variables**: `ConnectionNode`
- **Operations**: `connectUser()`, `disconnectUser()`

```cpp
struct ConnectionNode {
    string connectionName;
    int height;
    ConnectionNode* left;
    ConnectionNode* right;
};

class ConnectionBalancer {
private:
    ConnectionNode* root;
public:
    void connectUser(const string& name);
    void disconnectUser(const string& name);
};
```

#### Function Summary Table
| Function | Social Context | Time Complexity |
| :--- | :--- | :--- |
| `connectUser()` | Connects two users while re-balancing the internal friend tree | O(log N) |
| `disconnectUser()` | Removes a mutual connection and re-balances | O(log N) |

### 6. Data Structure III: Profile Indexing (B-Tree)
To manage a massive database of users, the platform groups `profileID`s into chunks, or "pages", using a **B-Tree**. This is ideal for handling paginated profile data efficiently.

**Implementation Details:**
- **Variables**: `ProfileIndexNode` (pages of profiles), `profileID`
- **Operations**: `addProfile()`, `lookupProfile()`

```cpp
struct ProfileIndexNode {
    vector<int> profileIDs;
    vector<ProfileIndexNode*> children;
    bool isLeaf;
};

class ProfilePagination {
private:
    ProfileIndexNode* root;
public:
    void addProfile(int profileID);
    bool lookupProfile(int profileID);
};
```

#### Function Summary Table
| Function | Social Context | Time Complexity |
| :--- | :--- | :--- |
| `addProfile()` | Assigns a new user profile to an indexed page | O(log N) |
| `lookupProfile()` | Quickly fetches user profile data from the indexed pages | O(log N) |

### 7. Data Structure IV: Degree Connections (Dijkstra's Algorithm)
Similar to LinkedIn's "Degrees of Connection", this algorithm parses the connection graph to find the shortest hop and best connection strength between two distant users.

**Implementation Details:**
- **Graph Representation**: Weighted Adjacency List representing `connectionStrength[][]`.
- **Variables**: `connectionStrength[][]`, `shortestHop[]`, `predecessor[]`
- **Operations**: `findClosestPaths()`

```cpp
void findClosestPaths(int sourceIndex) {
    vector<int> shortestHop(totalUsers, INT_MAX);
    vector<int> predecessor(totalUsers, -1);
    // connectionStrength represents edge weight mapping
    
    // Dijkstra's relaxation logic to minimize hops and maximize connection strength...
}
```

#### Function Summary Table
| Function | Social Context | Time Complexity |
| :--- | :--- | :--- |
| `findClosestPaths()` | Discovers who in your network can introduce you to a target user with the fewest overall hops | O((V + E) log V) |

### 8. Data Structure V: Network Clustering (Prim's Algorithm)
To recommend friend groups or form a core community block, the system computes the Minimum Spanning Tree of connections.

**Implementation Details:**
- **Variables**: `FriendNetworkMST`
- **Operations**: `addLink()`, `buildMinNetwork()`

```cpp
class FriendNetworkMST {
public:
    void addLink(int userA, int userB, int strength);
    void buildMinNetwork();
};
```

#### Function Summary Table
| Function | Social Context | Time Complexity |
| :--- | :--- | :--- |
| `addLink()` | Registers a mutual friendship with a connection strength | O(1) |
| `buildMinNetwork()` | Isolates the most critical friendships that keep the entire userbase connected | O(E log V) |

### 9. Time and Space Complexity Analysis
- **Friend Registry (BST)**: Space O(N), Time O(log N) for balanced, but susceptible to O(N) Worst Case.
- **Connection Balancer (AVL)**: Space O(N), Time strictly O(log N) for all CRUD connections.
- **Profile Indexing (B-Tree)**: Space O(N), Time O(log_m N) optimizing lookup speeds.
- **Degree Connections (Dijkstra)**: Space O(V + E). Operations prioritize using a Min-Heap.
- **Clustering (Prim)**: Space O(V + E) ensuring optimal spanning sub-network.

### 10. Implementation Challenges
- **Dynamic Balancing**: Implementing real-time rotations in the AVL (`connectUser`) without interrupting real-time API lookups.
- **B-Tree Chunking**: Ensuring `ProfileIndexNode` splits happened gracefully without corrupting sibling pointers in memory.
- **Graph Indexing**: Safely mapping string usernames (e.g. "Alice") to numerical indices so that the adjacency matrix / list could process `connectionStrength[][]` predictably.

### 11. Testing, Edge Cases, and Validation
The algorithms were tested against core network edge-cases:
1. **Unconnected User**: `findClosestPaths()` tested against isolated users (no friends). Resulted in "NOT connected" rather than crashing or looping.
2. **Same User Routing**: Target pathing algorithm tested against `source == destination`. Process stops early optimally.
3. **Ghost References**: `unfriendUser()` operations tested to ensure `registerUser()` wouldn't crash when querying a deleted friend.

### 12. Future Scope
- Implement automated friend-recommendations based on the `buildMinNetwork()` results.
- Implement caching in the `lookupProfile()` flow to minimize constant B-Tree traversal for frequent views.
- Scale `connectionStrength[][]` dynamically using user activity scores instead of static inputs.

### 13. Conclusion
The **Social Connect** platform achieves its networking objectives by meticulously pairing theoretical data structures with real-world social networking logic. From tracking connections via graphs and optimizing lookups via balanced trees to mapping out degrees of separation using shortest-path methodologies, the architecture ensures swift, unhindered performance for every user online.
