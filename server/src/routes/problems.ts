import express from 'express';
import { authMiddleware } from '../middleware/auth';

import { specialistProblems } from '../services/specialist-problems';

const router = express.Router();

// Sample problems database
export const problems = [
  ...specialistProblems,
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'easy',
    category: 'Arrays',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
  
}`,
      python: `def twoSum(nums, target):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[0];
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`
    },
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    category: 'Stack',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false

Constraints:
- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'`,
    starterCode: {
      javascript: `function isValid(s) {
  // Write your solution here
  
}`,
      python: `def isValid(s):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};`
    },
    testCases: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ]
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'medium',
    category: 'Arrays',
    description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

Example 1:
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

Example 2:
Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: Intervals [1,4] and [4,5] are considered overlapping.

Constraints:
- 1 <= intervals.length <= 10^4
- intervals[i].length == 2
- 0 <= starti <= endi <= 10^4`,
    starterCode: {
      javascript: `function merge(intervals) {
  // Write your solution here
  
}`,
      python: `def merge(intervals):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your solution here
        return new int[0][0];
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Write your solution here
        return {};
    }
};`
    },
    testCases: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' }
    ]
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'medium',
    category: 'Design',
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Implement the LRUCache class:
- LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
- int get(int key) Return the value of the key if the key exists, otherwise return -1.
- void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.

The functions get and put must each run in O(1) average time complexity.

Example 1:
Input
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
Output
[null, null, null, 1, null, -1, null, -1, 3, 4]

Constraints:
- 1 <= capacity <= 3000
- 0 <= key <= 10^4
- 0 <= value <= 10^5
- At most 2 * 10^5 calls will be made to get and put.`,
    starterCode: {
      javascript: `class LRUCache {
  constructor(capacity) {
    // Initialize your cache
  }
  
  get(key) {
    // Return value or -1
  }
  
  put(key, value) {
    // Add or update key-value pair
  }
}`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        # Initialize your cache
        pass
    
    def get(self, key: int) -> int:
        # Return value or -1
        pass
    
    def put(self, key: int, value: int) -> None:
        # Add or update key-value pair
        pass`,
      java: `class LRUCache {
    public LRUCache(int capacity) {
        // Initialize your cache
    }
    
    public int get(int key) {
        // Return value or -1
        return -1;
    }
    
    public void put(int key, int value) {
        // Add or update key-value pair
    }
}`,
      cpp: `class LRUCache {
public:
    LRUCache(int capacity) {
        // Initialize your cache
    }
    
    int get(int key) {
        // Return value or -1
        return -1;
    }
    
    void put(int key, int value) {
        // Add or update key-value pair
    }
};`
    },
    testCases: [
      { input: 'LRUCache(2), put(1,1), put(2,2), get(1)', output: '1' },
      { input: 'put(3,3), get(2)', output: '-1' }
    ]
  },
  {
    id: 'react-counter-hook',
    title: 'React Custom Counter Hook',
    difficulty: 'easy',
    category: 'React.js',
    description: `Create a custom React hook called 'useCounter' that manages a numeric state.
    
    The hook should return:
    - count: the current value
    - increment: function to add 1
    - decrement: function to subtract 1
    - reset: function to set it to initial value
    
    The hook should accept an optional 'initialValue' (default is 0).`,
    starterCode: {
      javascript: `import { useState } from 'react';

function useCounter(initialValue = 0) {
  // Write your hook implementation here
  
}`,
      python: `# Not applicable for React`,
      java: `# Not applicable for React`,
      cpp: `# Not applicable for React`
    },
    testCases: []
  },
  {
    id: 'express-logger-middleware',
    title: 'Express Logger Middleware',
    difficulty: 'medium',
    category: 'Node/Express',
    description: `Write a standard Express.js middleware function that logs the HTTP method and the request path to the console.
    
    The format should be: "[METHOD] PATH"
    Example: "[GET] /api/users"
    
    Ensure you call the next middleware in the chain.`,
    starterCode: {
      javascript: `function loggerMiddleware(req, res, next) {
  // Write your middleware here
  
}`,
      python: `# Not applicable`,
      java: `# Not applicable`,
      cpp: `# Not applicable`
    },
    testCases: []
  },
  {
    id: 'mongodb-aggregation-users',
    title: 'MongoDB: Order Totals',
    difficulty: 'medium',
    category: 'MongoDB',
    description: `Write a MongoDB aggregation pipeline to find the total amount spent by each user.
    
    Input collection 'orders' has documents like:
    { "_id": 1, "userId": "A", "amount": 50 }
    
    Output should be documents with:
    { "_id": "userId", "totalSpent": sum_of_amounts }`,
    starterCode: {
      javascript: `const pipeline = [
  // Write your aggregation stages here
  
];`,
      python: `pipeline = [
    # Write your aggregation stages here
]`,
      java: `// Not applicable`,
      cpp: `// Not applicable`
    },
    testCases: []
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'easy',
    category: 'Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

Example 1:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]

Example 2:
Input: head = [1,2]
Output: [2,1]

Constraints:
- The number of nodes in the list is the range [0, 5000].
- -5000 <= Node.val <= 5000`,
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    // Write your solution here
}`,
      python: `
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        pass`,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        return null; 
    }
}`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        return nullptr;
    }
};`
    },
    testCases: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }
    ]
  },
  {
    id: 'validate-bst',
    title: 'Validate Binary Search Tree',
    difficulty: 'medium',
    category: 'Tree',
    description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- Both the left and right subtrees must also be binary search trees.`,
    starterCode: {
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isValidBST(root) {
    // Write your solution here
}`,
      python: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        pass`,
      java: `class Solution {
    public boolean isValidBST(TreeNode root) {
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return false;
    }
};`
    },
    testCases: []
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Example 2:
Input: nums = [1]
Output: 1`,
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Write your solution here
}`,
      python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        return 0;
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        return 0;
    }
};`
    },
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }
    ]
  }
];

// Get all problems
router.get('/', authMiddleware, (req, res) => {
  const { difficulty, category } = req.query;

  let filtered = problems;

  if (difficulty) {
    filtered = filtered.filter(p => p.difficulty === difficulty);
  }

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }

  res.json(filtered.map(p => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category
  })));
});

// Get problem by ID
router.get('/:problemId', authMiddleware, (req, res) => {
  const { problemId } = req.params;
  const problem = problems.find(p => p.id === problemId);

  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  res.json(problem);
});

// Get starter code
router.get('/:problemId/starter/:language', authMiddleware, (req, res) => {
  const { problemId, language } = req.params;
  const problem = problems.find(p => p.id === problemId);

  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }

  const code = problem.starterCode[language as keyof typeof problem.starterCode];

  if (!code) {
    return res.status(404).json({ error: 'Language not supported' });
  }

  res.json({ code });
});

export default router;
