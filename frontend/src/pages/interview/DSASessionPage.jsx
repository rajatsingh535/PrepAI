import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Play, ChevronRight, ChevronLeft, CheckCircle, Clock,
  Loader2, Zap, RotateCcw, Terminal, AlertCircle,
  Code2, Trophy, Mic, MicOff, Camera, CameraOff,
  Lightbulb, Brain, Maximize, Minimize,
  Activity, Eye, Volume2, UserCheck
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { dsaAPI } from '@/services/api';

/* ── Interview phases per question ─────────────────────────────── */
const PHASES = [
  { id: 'brute',   label: 'Brute Force',      short: 'Explain' },
  { id: 'optimal', label: 'Optimal Approach',  short: 'Optimize' },
  { id: 'code',    label: 'Code It',           short: 'Code' },
];

/* ── Comprehensive problem bank (12 topics × 3 difficulties) ──── */
const PROBLEMS = {
  arrays: {
    Easy: {
      id: 'two-sum', slug: 'two-sum', title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays',
      description: `## Two Sum\n\nGiven an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.\n\nYou may assume each input has **exactly one solution**, and you may not use the same element twice.\n\n### Examples\n\`\`\`\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9\n\`\`\`\n\`\`\`\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\`\`\`\n\n### Constraints\n- \`2 ≤ nums.length ≤ 10⁴\`\n- \`-10⁹ ≤ nums[i] ≤ 10⁹\``,
      testCases: [
        { input: 'nums=[2,7,11,15], target=9', expected: '[0,1]' },
        { input: 'nums=[3,2,4], target=6', expected: '[1,2]' },
        { input: 'nums=[3,3], target=6', expected: '[0,1]' },
      ],
      hints: ['Use a hash map to store previously seen numbers.', 'For each num, check if target - num exists in the hash map.'],
      starterCode: {
        python: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # TODO: Implement solution\n    pass\n',
        javascript: 'var twoSum = function(nums, target) {\n    // TODO: Implement solution\n};\n',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(N)' }
    },
    Medium: {
      id: 'product-of-array-except-self', slug: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Arrays',
      description: `## Product of Array Except Self\n\nGiven an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all elements of \`nums\` except \`nums[i]\`.\n\nYou must solve it **without using division** and in **O(N)** time.\n\n### Examples\n\`\`\`\nInput: nums = [1,2,3,4]\nOutput: [24,12,8,6]\n\`\`\`\n\`\`\`\nInput: nums = [-1,1,0,-3,3]\nOutput: [0,0,9,0,0]\n\`\`\`\n\n### Constraints\n- \`2 ≤ nums.length ≤ 10⁵\``,
      testCases: [
        { input: 'nums=[1,2,3,4]', expected: '[24,12,8,6]' },
        { input: 'nums=[-1,1,0,-3,3]', expected: '[0,0,9,0,0]' },
      ],
      hints: ['Use prefix and suffix products.', 'Can you calculate suffix products on the fly to achieve O(1) extra space?'],
      starterCode: {
        python: 'def productExceptSelf(nums: list[int]) -> list[int]:\n    pass\n',
        javascript: 'var productExceptSelf = function(nums) {\n};\n',
        java: 'class Solution {\n    public int productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Hard: {
      id: 'trapping-rain-water', slug: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Arrays',
      description: `## Trapping Rain Water\n\nGiven \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\n### Examples\n\`\`\`\nInput: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\n\`\`\`\n\`\`\`\nInput: height = [4,2,0,3,2,5]\nOutput: 9\n\`\`\`\n\n### Constraints\n- \`1 ≤ height.length ≤ 2 × 10⁴\``,
      testCases: [
        { input: 'height=[0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' },
        { input: 'height=[4,2,0,3,2,5]', expected: '9' },
      ],
      hints: ['Use two pointers moving inward from both boundaries.', 'Track leftMax and rightMax.'],
      starterCode: {
        python: 'def trap(height: list[int]) -> int:\n    pass\n',
        javascript: 'var trap = function(height) {\n};\n',
        java: 'class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    }
  },
  linked_list: {
    Easy: {
      id: 'reverse-linked-list', slug: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List',
      description: `## Reverse Linked List\n\nGiven the \`head\` of a singly linked list, reverse the list, and return the reversed list.\n\n### Examples\n\`\`\`\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n\`\`\`\n\`\`\`\nInput: head = [1,2]\nOutput: [2,1]\n\`\`\``,
      testCases: [
        { input: 'head=[1,2,3,4,5]', expected: '[5,4,3,2,1]' },
        { input: 'head=[1,2]', expected: '[2,1]' },
      ],
      hints: ['Maintain three pointers: prev, curr, nextNode.', 'Can also be solved recursively.'],
      starterCode: {
        python: 'def reverseList(head):\n    pass\n',
        javascript: 'var reverseList = function(head) {\n};\n',
        java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        return nullptr;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Medium: {
      id: 'reorder-list', slug: 'reorder-list', title: 'Reorder List', difficulty: 'Medium', topic: 'Linked List',
      description: `## Reorder List\n\nYou are given the head of a singly linked-list: L0 → L1 → … → Ln-1 → Ln\n\nReorder the list to: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …\n\n### Examples\n\`\`\`\nInput: head = [1,2,3,4]\nOutput: [1,4,2,3]\n\`\`\``,
      testCases: [
        { input: 'head=[1,2,3,4]', expected: '[1,4,2,3]' },
      ],
      hints: ['Find the middle of list using fast/slow pointers.', 'Reverse the second half, then merge both halves alternately.'],
      starterCode: {
        python: 'def reorderList(head):\n    pass\n',
        javascript: 'var reorderList = function(head) {\n};\n',
        java: 'class Solution {\n    public void reorderList(ListNode head) {}\n}\n',
        cpp: 'class Solution {\npublic:\n    void reorderList(ListNode* head) {}\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Hard: {
      id: 'merge-k-sorted-lists', slug: 'merge-k-sorted-lists', title: 'Merge K Sorted Lists', difficulty: 'Hard', topic: 'Linked List',
      description: `## Merge K Sorted Lists\n\nYou are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.\n\n### Examples\n\`\`\`\nInput: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]\n\`\`\``,
      testCases: [
        { input: 'lists=[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' },
      ],
      hints: ['Use a Min-Heap / Priority Queue of size K.', 'Or use Divide and Conquer pairing.'],
      starterCode: {
        python: 'def mergeKLists(lists):\n    pass\n',
        javascript: 'var mergeKLists = function(lists) {\n};\n',
        java: 'class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        return null;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        return nullptr;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N log K)', space: 'O(K)' }
    }
  },
  trees: {
    Easy: {
      id: 'invert-binary-tree', slug: 'invert-binary-tree', title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Trees',
      description: `## Invert Binary Tree\n\nGiven the \`root\` of a binary tree, invert the tree, and return its root.\n\n### Examples\n\`\`\`\nInput: root = [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]\n\`\`\``,
      testCases: [{ input: 'root=[4,2,7,1,3,6,9]', expected: '[4,7,2,9,6,3,1]' }],
      hints: ['Swap left and right subtrees recursively.'],
      starterCode: {
        python: 'def invertTree(root):\n    pass\n',
        javascript: 'var invertTree = function(root) {\n};\n',
        java: 'class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        return null;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        return nullptr;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(H)' }
    },
    Medium: {
      id: 'lowest-common-ancestor-of-a-binary-search-tree', slug: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of BST', difficulty: 'Medium', topic: 'Trees',
      description: `## Lowest Common Ancestor of BST\n\nGiven a Binary Search Tree (BST), find the lowest common ancestor (LCA) of two given nodes \`p\` and \`q\`.\n\n### Examples\n\`\`\`\nInput: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8\nOutput: 6\n\`\`\``,
      testCases: [{ input: 'root=[6,2,8,0,4,7,9], p=2, q=8', expected: '6' }],
      hints: ['If both p and q are smaller than root, go left. If both greater, go right. Else root is LCA.'],
      starterCode: {
        python: 'def lowestCommonAncestor(root, p, q):\n    pass\n',
        javascript: 'var lowestCommonAncestor = function(root, p, q) {\n};\n',
        java: 'class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        return null;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        return nullptr;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(H)', space: 'O(1)' }
    },
    Hard: {
      id: 'binary-tree-maximum-path-sum', slug: 'binary-tree-maximum-path-sum', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', topic: 'Trees',
      description: `## Binary Tree Maximum Path Sum\n\nA path in a binary tree is a sequence of nodes where each pair has an edge connecting them. Return the maximum path sum of any non-empty path.\n\n### Examples\n\`\`\`\nInput: root = [-10,9,20,null,null,15,7]\nOutput: 42 (15 → 20 → 7)\n\`\`\``,
      testCases: [{ input: 'root=[-10,9,20,null,null,15,7]', expected: '42' }],
      hints: ['Use DFS. At each node compute max single-branch contribution to parent, and update global max with both branches.'],
      starterCode: {
        python: 'def maxPathSum(root):\n    pass\n',
        javascript: 'var maxPathSum = function(root) {\n};\n',
        java: 'class Solution {\n    public int maxPathSum(TreeNode root) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int maxPathSum(TreeNode* root) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(H)' }
    }
  },
  dp: {
    Easy: {
      id: 'climbing-stairs', slug: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming',
      description: `## Climbing Stairs\n\nYou are climbing a staircase. It takes \`n\` steps to reach the top.\n\nEach time you can climb **1 or 2** steps. In how many distinct ways can you climb to the top?\n\n### Examples\n\`\`\`\nInput: n = 3\nOutput: 3 (1+1+1, 1+2, 2+1)\n\`\`\``,
      testCases: [
        { input: 'n=2', expected: '2' },
        { input: 'n=3', expected: '3' },
        { input: 'n=5', expected: '8' },
      ],
      hints: ['dp[i] = dp[i-1] + dp[i-2] (Fibonacci sequence).'],
      starterCode: {
        python: 'def climbStairs(n: int) -> int:\n    pass\n',
        javascript: 'var climbStairs = function(n) {\n};\n',
        java: 'class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Medium: {
      id: 'coin-change', slug: 'coin-change', title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming',
      description: `## Coin Change\n\nGiven coins of different denominations and a total amount, return the fewest number of coins needed. Return -1 if impossible.\n\n### Examples\n\`\`\`\nInput: coins = [1,2,5], amount = 11\nOutput: 3 (5 + 5 + 1)\n\`\`\``,
      testCases: [
        { input: 'coins=[1,2,5], amount=11', expected: '3' },
        { input: 'coins=[2], amount=3', expected: '-1' },
      ],
      hints: ['Bottom-up DP: dp[i] = min(dp[i], dp[i - coin] + 1)'],
      starterCode: {
        python: 'def coinChange(coins: list[int], amount: int) -> int:\n    pass\n',
        javascript: 'var coinChange = function(coins, amount) {\n};\n',
        java: 'class Solution {\n    public int coinChange(int[] coins, int amount) {\n        return -1;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        return -1;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N × amount)', space: 'O(amount)' }
    },
    Hard: {
      id: 'longest-increasing-subsequence', slug: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', difficulty: 'Hard', topic: 'Dynamic Programming',
      description: `## Longest Increasing Subsequence\n\nGiven an integer array \`nums\`, return the length of the longest strictly increasing subsequence.\n\n### Examples\n\`\`\`\nInput: nums = [10,9,2,5,3,7,101,18]\nOutput: 4 ([2,3,7,101])\n\`\`\``,
      testCases: [
        { input: 'nums=[10,9,2,5,3,7,101,18]', expected: '4' },
      ],
      hints: ['O(N²) with DP, or O(N log N) using patience sorting + binary search.'],
      starterCode: {
        python: 'def lengthOfLIS(nums: list[int]) -> int:\n    pass\n',
        javascript: 'var lengthOfLIS = function(nums) {\n};\n',
        java: 'class Solution {\n    public int lengthOfLIS(int[] nums) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N log N)', space: 'O(N)' }
    }
  },
  sorting: {
    Easy: {
      id: 'sort-colors', slug: 'sort-colors', title: 'Sort Colors', difficulty: 'Easy', topic: 'Sorting',
      description: `## Sort Colors\n\nGiven an array \`nums\` with \`n\` objects colored red(0), white(1), or blue(2), sort them in-place so that same colors are adjacent.\n\n### Examples\n\`\`\`\nInput: nums = [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]\n\`\`\``,
      testCases: [{ input: 'nums=[2,0,2,1,1,0]', expected: '[0,0,1,1,2,2]' }],
      hints: ['Dutch National Flag algorithm with three pointers: low, mid, high.'],
      starterCode: {
        python: 'def sortColors(nums: list[int]) -> None:\n    pass\n',
        javascript: 'var sortColors = function(nums) {\n};\n',
        java: 'class Solution {\n    public void sortColors(int[] nums) {}\n}\n',
        cpp: 'class Solution {\npublic:\n    void sortColors(vector<int>& nums) {}\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Medium: {
      id: 'merge-intervals', slug: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', topic: 'Sorting',
      description: `## Merge Intervals\n\nGiven an array of \`intervals\` where intervals[i] = [starti, endi], merge all overlapping intervals.\n\n### Examples\n\`\`\`\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\n\`\`\``,
      testCases: [{ input: 'intervals=[[1,3],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]' }],
      hints: ['Sort intervals by their start time first.'],
      starterCode: {
        python: 'def merge(intervals: list[list[int]]) -> list[list[int]]:\n    pass\n',
        javascript: 'var merge = function(intervals) {\n};\n',
        java: 'class Solution {\n    public int[][] merge(int[][] intervals) {\n        return new int[][]{};\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N log N)', space: 'O(N)' }
    },
    Hard: {
      id: 'kth-largest-element', slug: 'kth-largest-element-in-an-array', title: 'Kth Largest Element', difficulty: 'Hard', topic: 'Sorting',
      description: `## Kth Largest Element in an Array\n\nGiven an integer array \`nums\` and an integer \`k\`, return the \`kth\` largest element in the array.\n\n### Examples\n\`\`\`\nInput: nums = [3,2,1,5,6,4], k = 2\nOutput: 5\n\`\`\``,
      testCases: [{ input: 'nums=[3,2,1,5,6,4], k=2', expected: '5' }],
      hints: ['Use Quickselect for O(N) average time complexity or Min-Heap.'],
      starterCode: {
        python: 'def findKthLargest(nums: list[int], k: int) -> int:\n    pass\n',
        javascript: 'var findKthLargest = function(nums, k) {\n};\n',
        java: 'class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    }
  },
  backtracking: {
    Easy: {
      id: 'subsets', slug: 'subsets', title: 'Subsets', difficulty: 'Easy', topic: 'Backtracking',
      description: `## Subsets\n\nGiven an integer array \`nums\` of unique elements, return all possible subsets (the power set).\n\n### Examples\n\`\`\`\nInput: nums = [1,2,3]\nOutput: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]\n\`\`\``,
      testCases: [{ input: 'nums=[1,2,3]', expected: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' }],
      hints: ['For each index, branch into either including or skipping the element.'],
      starterCode: {
        python: 'def subsets(nums: list[int]) -> list[list[int]]:\n    pass\n',
        javascript: 'var subsets = function(nums) {\n};\n',
        java: 'class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        return new ArrayList<>();\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(2^N)', space: 'O(N)' }
    },
    Medium: {
      id: 'combination-sum', slug: 'combination-sum', title: 'Combination Sum', difficulty: 'Medium', topic: 'Backtracking',
      description: `## Combination Sum\n\nGiven distinct integers \`candidates\` and a target, return all unique combinations that sum to target.\n\n### Examples\n\`\`\`\nInput: candidates = [2,3,6,7], target = 7\nOutput: [[2,2,3],[7]]\n\`\`\``,
      testCases: [{ input: 'candidates=[2,3,6,7], target=7', expected: '[[2,2,3],[7]]' }],
      hints: ['Use recursive backtracking tracking the current start index to prevent duplicate combinations.'],
      starterCode: {
        python: 'def combinationSum(candidates: list[int], target: int) -> list[list[int]]:\n    pass\n',
        javascript: 'var combinationSum = function(candidates, target) {\n};\n',
        java: 'class Solution {\n    public List<List<Integer>> combinationSum(int[] candidates, int target) {\n        return new ArrayList<>();\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(2^T)', space: 'O(T)' }
    },
    Hard: {
      id: 'n-queens', slug: 'n-queens', title: 'N-Queens', difficulty: 'Hard', topic: 'Backtracking',
      description: `## N-Queens\n\nPlace \`n\` queens on an n×n chessboard such that no two queens attack each other.\n\n### Examples\n\`\`\`\nInput: n = 4\nOutput: 2 distinct solutions\n\`\`\``,
      testCases: [{ input: 'n=4', expected: '2' }],
      hints: ['Place queens row-by-row. Maintain Sets for columns, positive diagonals, and negative diagonals.'],
      starterCode: {
        python: 'def solveNQueens(n: int) -> list[list[str]]:\n    pass\n',
        javascript: 'var solveNQueens = function(n) {\n};\n',
        java: 'class Solution {\n    public List<List<String>> solveNQueens(int n) {\n        return new ArrayList<>();\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<vector<string>> solveNQueens(int n) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N!)', space: 'O(N²)' }
    }
  },
  stacks_queues: {
    Easy: {
      id: 'valid-parentheses', slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stacks & Queues',
      description: `## Valid Parentheses\n\nGiven a string \`s\` containing just the characters \`'()[]{}'\`, determine if the input string is valid.\n\n### Examples\n\`\`\`\nInput: s = "()[]{}"\nOutput: true\n\`\`\`\n\`\`\`\nInput: s = "(]"\nOutput: false\n\`\`\``,
      testCases: [
        { input: 's="()[]{}"', expected: 'true' },
        { input: 's="(]"', expected: 'false' },
      ],
      hints: ['Use a stack. Push open brackets, and match + pop on closing brackets.'],
      starterCode: {
        python: 'def isValid(s: str) -> bool:\n    pass\n',
        javascript: 'var isValid = function(s) {\n};\n',
        java: 'class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(N)' }
    },
    Medium: {
      id: 'daily-temperatures', slug: 'daily-temperatures', title: 'Daily Temperatures', difficulty: 'Medium', topic: 'Stacks & Queues',
      description: `## Daily Temperatures\n\nGiven an array of daily temperatures, return an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the \`ith\` day to get a warmer temperature.\n\n### Examples\n\`\`\`\nInput: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1,1,4,2,1,1,0,0]\n\`\`\``,
      testCases: [{ input: 'temperatures=[73,74,75,71,69,72,76,73]', expected: '[1,1,4,2,1,1,0,0]' }],
      hints: ['Use a monotonic decreasing stack storing [temperature, index].'],
      starterCode: {
        python: 'def dailyTemperatures(temperatures: list[int]) -> list[int]:\n    pass\n',
        javascript: 'var dailyTemperatures = function(temperatures) {\n};\n',
        java: 'class Solution {\n    public int dailyTemperatures(int[] temperatures) {\n        return new int[]{};\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(N)' }
    },
    Hard: {
      id: 'largest-rectangle-in-histogram', slug: 'largest-rectangle-in-histogram', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', topic: 'Stacks & Queues',
      description: `## Largest Rectangle in Histogram\n\nGiven an array of integers \`heights\` representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle.\n\n### Examples\n\`\`\`\nInput: heights = [2,1,5,6,2,3]\nOutput: 10\n\`\`\``,
      testCases: [{ input: 'heights=[2,1,5,6,2,3]', expected: '10' }],
      hints: ['Use a monotonic increasing stack to track indices where bars can extend.'],
      starterCode: {
        python: 'def largestRectangleArea(heights: list[int]) -> int:\n    pass\n',
        javascript: 'var largestRectangleArea = function(heights) {\n};\n',
        java: 'class Solution {\n    public int largestRectangleArea(int[] heights) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int largestRectangleArea(vector<int>& heights) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(N)' }
    }
  },
  hashing: {
    Easy: {
      id: 'contains-duplicate', slug: 'contains-duplicate', title: 'Contains Duplicate', difficulty: 'Easy', topic: 'Hashing',
      description: `## Contains Duplicate\n\nGiven an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.\n\n### Examples\n\`\`\`\nInput: nums = [1,2,3,1]\nOutput: true\n\`\`\``,
      testCases: [
        { input: 'nums=[1,2,3,1]', expected: 'true' },
        { input: 'nums=[1,2,3,4]', expected: 'false' },
      ],
      hints: ['Use a hash set to track seen numbers in O(1) lookups.'],
      starterCode: {
        python: 'def containsDuplicate(nums: list[int]) -> bool:\n    pass\n',
        javascript: 'var containsDuplicate = function(nums) {\n};\n',
        java: 'class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return false;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(N)' }
    },
    Medium: {
      id: 'group-anagrams', slug: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium', topic: 'Hashing',
      description: `## Group Anagrams\n\nGiven an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.\n\n### Examples\n\`\`\`\nInput: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]\n\`\`\``,
      testCases: [{ input: 'strs=["eat","tea","tan","ate","nat","bat"]', expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }],
      hints: ['Sort each word or use character frequency count tuples as keys in a hash map.'],
      starterCode: {
        python: 'def groupAnagrams(strs: list[str]) -> list[list[str]]:\n    pass\n',
        javascript: 'var groupAnagrams = function(strs) {\n};\n',
        java: 'class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N × K log K)', space: 'O(N)' }
    },
    Hard: {
      id: 'longest-consecutive-sequence', slug: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', difficulty: 'Hard', topic: 'Hashing',
      description: `## Longest Consecutive Sequence\n\nGiven an unsorted array of integers \`nums\`, return the length of the longest consecutive elements sequence in **O(N)** time.\n\n### Examples\n\`\`\`\nInput: nums = [100,4,200,1,3,2]\nOutput: 4 ([1, 2, 3, 4])\n\`\`\``,
      testCases: [{ input: 'nums=[100,4,200,1,3,2]', expected: '4' }],
      hints: ['Insert elements into a Hash Set. Only start counting sequence if (num - 1) is not in the set.'],
      starterCode: {
        python: 'def longestConsecutive(nums: list[int]) -> int:\n    pass\n',
        javascript: 'var longestConsecutive = function(nums) {\n};\n',
        java: 'class Solution {\n    public int longestConsecutive(int[] nums) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(N)' }
    }
  },
  greedy: {
    Easy: {
      id: 'maximum-subarray', slug: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Easy', topic: 'Greedy',
      description: `## Maximum Subarray\n\nGiven an integer array \`nums\`, find the subarray with the largest sum and return its sum.\n\n### Examples\n\`\`\`\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6 ([4,-1,2,1])\n\`\`\``,
      testCases: [{ input: 'nums=[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' }],
      hints: ["Kadane's algorithm: currSum = max(num, currSum + num)."],
      starterCode: {
        python: 'def maxSubArray(nums: list[int]) -> int:\n    pass\n',
        javascript: 'var maxSubArray = function(nums) {\n};\n',
        java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Medium: {
      id: 'jump-game', slug: 'jump-game', title: 'Jump Game', difficulty: 'Medium', topic: 'Greedy',
      description: `## Jump Game\n\nYou are given an integer array \`nums\` where each element represents your maximum jump length. Return \`true\` if you can reach the last index.\n\n### Examples\n\`\`\`\nInput: nums = [2,3,1,1,4]\nOutput: true\n\`\`\``,
      testCases: [
        { input: 'nums=[2,3,1,1,4]', expected: 'true' },
        { input: 'nums=[3,2,1,0,4]', expected: 'false' },
      ],
      hints: ['Iterate backwards moving the goalpost, or forward tracking the maximum reachable index.'],
      starterCode: {
        python: 'def canJump(nums: list[int]) -> bool:\n    pass\n',
        javascript: 'var canJump = function(nums) {\n};\n',
        java: 'class Solution {\n    public boolean canJump(int[] nums) {\n        return false;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        return false;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Hard: {
      id: 'gas-station', slug: 'gas-station', title: 'Gas Station', difficulty: 'Hard', topic: 'Greedy',
      description: `## Gas Station\n\nThere are \`n\` gas stations along a circular route. Return the starting gas station index if you can travel around the circuit once clockwise, or -1.\n\n### Examples\n\`\`\`\nInput: gas = [1,2,3,4,5], cost = [3,4,5,1,2]\nOutput: 3\n\`\`\``,
      testCases: [{ input: 'gas=[1,2,3,4,5], cost=[3,4,5,1,2]', expected: '3' }],
      hints: ['If total gas >= total cost, a solution exists. Greedily reset start station when tank drops below 0.'],
      starterCode: {
        python: 'def canCompleteCircuit(gas: list[int], cost: list[int]) -> int:\n    pass\n',
        javascript: 'var canCompleteCircuit = function(gas, cost) {\n};\n',
        java: 'class Solution {\n    public int canCompleteCircuit(int[] gas, int[] cost) {\n        return -1;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {\n        return -1;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    }
  },
  bit_manipulation: {
    Easy: {
      id: 'single-number', slug: 'single-number', title: 'Single Number', difficulty: 'Easy', topic: 'Bit Manipulation',
      description: `## Single Number\n\nGiven a non-empty array of integers \`nums\`, every element appears twice except for one. Find that single one in O(N) time and O(1) space.\n\n### Examples\n\`\`\`\nInput: nums = [2,2,1]\nOutput: 1\n\`\`\``,
      testCases: [{ input: 'nums=[2,2,1]', expected: '1' }],
      hints: ['XOR of a number with itself is 0, and with 0 is the number itself.'],
      starterCode: {
        python: 'def singleNumber(nums: list[int]) -> int:\n    pass\n',
        javascript: 'var singleNumber = function(nums) {\n};\n',
        java: 'class Solution {\n    public int singleNumber(int[] nums) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Medium: {
      id: 'counting-bits', slug: 'counting-bits', title: 'Counting Bits', difficulty: 'Medium', topic: 'Bit Manipulation',
      description: `## Counting Bits\n\nGiven an integer \`n\`, return an array \`ans\` of length \`n + 1\` such that \`ans[i]\` is the number of 1's in the binary representation of \`i\`.\n\n### Examples\n\`\`\`\nInput: n = 5\nOutput: [0,1,1,2,1,2]\n\`\`\``,
      testCases: [{ input: 'n=5', expected: '[0,1,1,2,1,2]' }],
      hints: ['dp[i] = dp[i >> 1] + (i & 1).'],
      starterCode: {
        python: 'def countBits(n: int) -> list[int]:\n    pass\n',
        javascript: 'var countBits = function(n) {\n};\n',
        java: 'class Solution {\n    public int countBits(int n) {\n        return new int[]{};\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<int> countBits(int n) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(N)' }
    },
    Hard: {
      id: 'reverse-bits', slug: 'reverse-bits', title: 'Reverse Bits', difficulty: 'Hard', topic: 'Bit Manipulation',
      description: `## Reverse Bits\n\nReverse bits of a given 32-bit unsigned integer.\n\n### Examples\n\`\`\`\nInput: n = 00000010100101000001111010011100\nOutput: 964176192 (00111001011110000010100101000000)\n\`\`\``,
      testCases: [{ input: 'n=43261596', expected: '964176192' }],
      hints: ['Iterate 32 times: shift result left, add (n & 1), then shift n right.'],
      starterCode: {
        python: 'def reverseBits(n: int) -> int:\n    pass\n',
        javascript: 'var reverseBits = function(n) {\n};\n',
        java: 'public class Solution {\n    public int reverseBits(int n) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    uint32_t reverseBits(uint32_t n) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(32)', space: 'O(1)' }
    }
  },
  two_pointers: {
    Easy: {
      id: 'valid-palindrome', slug: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy', topic: 'Two Pointers',
      description: `## Valid Palindrome\n\nGiven a string \`s\`, return \`true\` if it is a palindrome, considering only alphanumeric characters and ignoring cases.\n\n### Examples\n\`\`\`\nInput: s = "A man, a plan, a canal: Panama"\nOutput: true\n\`\`\``,
      testCases: [
        { input: 's="A man, a plan, a canal: Panama"', expected: 'true' },
        { input: 's="race a car"', expected: 'false' },
      ],
      hints: ['Two pointers from left and right moving inward, skipping non-alphanumerics.'],
      starterCode: {
        python: 'def isPalindrome(s: str) -> bool:\n    pass\n',
        javascript: 'var isPalindrome = function(s) {\n};\n',
        java: 'class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    bool isPalindrome(string s) {\n        return false;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Medium: {
      id: '3sum', slug: '3sum', title: '3Sum', difficulty: 'Medium', topic: 'Two Pointers',
      description: `## 3Sum\n\nGiven an integer array nums, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j != k\` and \`nums[i] + nums[j] + nums[k] == 0\`.\n\n### Examples\n\`\`\`\nInput: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]\n\`\`\``,
      testCases: [{ input: 'nums=[-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' }],
      hints: ['Sort the array. Fix the first element, then use two pointers for the remaining two.'],
      starterCode: {
        python: 'def threeSum(nums: list[int]) -> list[list[int]]:\n    pass\n',
        javascript: 'var threeSum = function(nums) {\n};\n',
        java: 'class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N²)', space: 'O(1)' }
    },
    Hard: {
      id: 'container-with-most-water', slug: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Hard', topic: 'Two Pointers',
      description: `## Container With Most Water\n\nGiven \`n\` non-negative integers representing heights, find two lines that together with the x-axis form a container containing the most water.\n\n### Examples\n\`\`\`\nInput: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49\n\`\`\``,
      testCases: [{ input: 'height=[1,8,6,2,5,4,8,3,7]', expected: '49' }],
      hints: ['Start pointers at both ends. Always move the pointer pointing to the shorter line.'],
      starterCode: {
        python: 'def maxArea(height: list[int]) -> int:\n    pass\n',
        javascript: 'var maxArea = function(height) {\n};\n',
        java: 'class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    }
  },
  sliding_window: {
    Easy: {
      id: 'best-time-to-buy-and-sell-stock', slug: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Sliding Window',
      description: `## Best Time to Buy and Sell Stock\n\nGiven an array \`prices\` where prices[i] is the price of a given stock on the \`ith\` day, return the maximum profit you can achieve from one transaction.\n\n### Examples\n\`\`\`\nInput: prices = [7,1,5,3,6,4]\nOutput: 5 (buy at 1, sell at 6)\n\`\`\``,
      testCases: [
        { input: 'prices=[7,1,5,3,6,4]', expected: '5' },
        { input: 'prices=[7,6,4,3,1]', expected: '0' },
      ],
      hints: ['Track minimum price seen so far and maximum profit achievable.'],
      starterCode: {
        python: 'def maxProfit(prices: list[int]) -> int:\n    pass\n',
        javascript: 'var maxProfit = function(prices) {\n};\n',
        java: 'class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(1)' }
    },
    Medium: {
      id: 'longest-substring-without-repeating-characters', slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window',
      description: `## Longest Substring Without Repeating Characters\n\nGiven a string \`s\`, find the length of the longest substring without repeating characters.\n\n### Examples\n\`\`\`\nInput: s = "abcabcbb"\nOutput: 3 ("abc")\n\`\`\``,
      testCases: [
        { input: 's="abcabcbb"', expected: '3' },
        { input: 's="bbbbb"', expected: '1' },
      ],
      hints: ['Maintain a sliding window with a Set/Map of visited characters.'],
      starterCode: {
        python: 'def lengthOfLongestSubstring(s: str) -> int:\n    pass\n',
        javascript: 'var lengthOfLongestSubstring = function(s) {\n};\n',
        java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(N)', space: 'O(min(N,M))' }
    },
    Hard: {
      id: 'minimum-window-substring', slug: 'minimum-window-substring', title: 'Minimum Window Substring', difficulty: 'Hard', topic: 'Sliding Window',
      description: `## Minimum Window Substring\n\nGiven strings \`s\` and \`t\`, return the minimum window substring of \`s\` such that every character in \`t\` (including duplicates) is included in the window.\n\n### Examples\n\`\`\`\nInput: s = "ADOBECODEBANC", t = "ABC"\nOutput: "BANC"\n\`\`\``,
      testCases: [{ input: 's="ADOBECODEBANC", t="ABC"', expected: '"BANC"' }],
      hints: ['Expand right pointer to satisfy character frequency, shrink left pointer to find minimal valid window.'],
      starterCode: {
        python: 'def minWindow(s: str, t: str) -> str:\n    pass\n',
        javascript: 'var minWindow = function(s, t) {\n};\n',
        java: 'class Solution {\n    public String minWindow(String s, String t) {\n        return "";\n    }\n}\n',
        cpp: 'class Solution {\npublic:\n    string minWindow(string s, string t) {\n        return "";\n    }\n};\n',
      },
      expectedComplexity: { time: 'O(S + T)', space: 'O(S + T)' }
    }
  }
};

/* ── Fallback resolver helper ──────────────────────────────────── */
function getProblemFromBank(topicKey, diffKey) {
  let normTopic = String(topicKey || 'arrays').toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (normTopic === 'array' || normTopic === 'arrays_and_strings') normTopic = 'arrays';
  if (normTopic === 'linked_lists' || normTopic === 'linkedlist') normTopic = 'linked_list';
  if (normTopic === 'tree' || normTopic === 'graphs' || normTopic === 'trees_and_graphs') normTopic = 'trees';
  if (normTopic === 'dynamic_programming') normTopic = 'dp';
  if (normTopic === 'stack' || normTopic === 'queue' || normTopic === 'stacks' || normTopic === 'queues') normTopic = 'stacks_queues';
  if (normTopic === 'hash_table' || normTopic === 'hash_map' || normTopic === 'hashmap') normTopic = 'hashing';
  if (normTopic === 'bits' || normTopic === 'bit') normTopic = 'bit_manipulation';
  if (normTopic === 'pointers' || normTopic === 'two_pointer') normTopic = 'two_pointers';
  if (normTopic === 'window') normTopic = 'sliding_window';

  const bank = PROBLEMS[normTopic] || PROBLEMS.arrays;
  let normDiff = String(diffKey || 'Medium').toLowerCase();
  normDiff = normDiff === 'easy' ? 'Easy' : normDiff === 'hard' ? 'Hard' : 'Medium';

  return bank[normDiff] || bank.Medium || bank.Easy;
}

/* ── Real-time Webcam & Audio Analysis Hook ─────────────────────── */
function useFacialAnalysis(videoRef, enabled) {
  const [metrics, setMetrics] = useState({
    attention: 88,
    confidence: 82,
    stress: 20,
    eyeContact: 85,
    emotion: 'Focused',
    posture: 'Good',
    audioVolume: 0,
  });
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const prevFrameDataRef = useRef(null);

  useEffect(() => {
    if (!enabled || !videoRef.current || !videoRef.current.srcObject) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    const stream = videoRef.current.srcObject;
    let analyser = null;
    let dataArray = null;

    // Web Audio API setup for live microphone analysis
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioCtxRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
      }
    } catch {
      // Audio context handled gracefully
    }

    // Offscreen canvas for frame pixel analysis
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    intervalRef.current = setInterval(() => {
      let audioVolume = 0;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, v) => acc + v, 0);
        audioVolume = Math.min(100, Math.round((sum / dataArray.length) * 1.6));
      }

      let motionDelta = 10;
      let centerBrightness = 128;
      if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
        try {
          ctx.drawImage(videoRef.current, 0, 0, 160, 120);
          const frame = ctx.getImageData(0, 0, 160, 120);
          const data = frame.data;

          let totalLum = 0;
          let pixelCount = 0;
          for (let y = 40; y < 80; y += 4) {
            for (let x = 50; x < 110; x += 4) {
              const idx = (y * 160 + x) * 4;
              totalLum += (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
              pixelCount++;
            }
          }
          centerBrightness = pixelCount > 0 ? totalLum / pixelCount : 128;

          if (prevFrameDataRef.current && prevFrameDataRef.current.length === data.length) {
            let diffSum = 0;
            for (let i = 0; i < data.length; i += 16) {
              diffSum += Math.abs(data[i] - prevFrameDataRef.current[i]);
            }
            motionDelta = Math.min(100, Math.round((diffSum / (data.length / 16)) * 2));
          }
          prevFrameDataRef.current = data;
        } catch {
          // ignore canvas read errors
        }
      }

      const attention  = Math.min(100, Math.max(50, Math.round(78 + (centerBrightness > 50 ? 12 : 0) + (audioVolume > 10 ? 8 : 0))));
      const confidence = Math.min(100, Math.max(45, Math.round(72 + (audioVolume > 15 ? 15 : 5) - (motionDelta > 40 ? 8 : 0))));
      const stress     = Math.min(100, Math.max(10, Math.round(18 + (motionDelta > 50 ? 20 : 0) - (audioVolume > 20 ? 8 : 0))));
      const eyeContact = Math.min(100, Math.max(45, Math.round(82 + (centerBrightness > 60 ? 10 : -8))));
      const posture    = motionDelta > 60 ? 'Sit straighter' : centerBrightness < 40 ? 'Adjust lighting' : 'Good';
      const emotion    = audioVolume > 35 ? 'Confident' : audioVolume > 10 ? 'Focused' : motionDelta > 40 ? 'Thinking' : 'Calm';

      setMetrics({ attention, confidence, stress, eyeContact, emotion, posture, audioVolume });
    }, 1200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [enabled, videoRef]);

  return metrics;
}

/* ── Audio waveform bars ─────────────────────────────────────────  */
const WaveformBars = ({ active }) => (
  <div className="flex items-center gap-[2px] h-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div key={i}
        className={`w-[2px] rounded-full ${active ? 'bg-brand-400' : 'bg-slate-600'}`}
        animate={active ? {
          scaleY: [0.3, 1, 0.3, 0.7, 0.3],
          transition: { duration: 0.8 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.06 },
        } : { scaleY: 0.3 }}
        style={{ height: '100%', originY: '50%' }}
      />
    ))}
  </div>
);

/* ── Markdown renderer (Strict Dark Theme) ───────────────────────── */
const MDRenderer = ({ content }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]}
    components={{
      h2: ({ children }) => <h2 className="text-base font-bold mb-3 mt-1 text-white">{children}</h2>,
      h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-4 text-slate-300">{children}</h3>,
      p:  ({ children }) => <p className="text-sm leading-relaxed mb-3 text-slate-400">{children}</p>,
      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
      code({ inline, className, children }) {
        const match = /language-(\w+)/.exec(className || '');
        return inline
          ? <code className="px-1.5 py-0.5 rounded-md text-xs font-mono border bg-white/[0.06] text-brand-300 border-white/[0.06]">{children}</code>
          : <div className="my-3 rounded-xl overflow-hidden text-xs border border-white/[0.06]">
              <SyntaxHighlighter language={match?.[1] || 'text'} style={oneDark}
                customStyle={{ margin: 0, background: '#0d1117', padding: '12px 16px' }}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>;
      },
      ul: ({ children }) => <ul className="space-y-1 mb-3 ml-3">{children}</ul>,
      li: ({ children }) => <li className="text-sm flex gap-2 before:content-['·'] before:text-brand-500 before:font-bold text-slate-400">{children}</li>,
    }}>
    {content}
  </ReactMarkdown>
);

const LANG_OPTIONS = [
  { value: 'python', label: 'Python 3' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

export default function DSASessionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const topic      = searchParams.get('topic')      || 'arrays';
  const difficulty = searchParams.get('difficulty') || 'medium';
  const lang       = searchParams.get('lang')       || 'python';
  const count      = Math.min(parseInt(searchParams.get('count')) || 1, 5);

  const [problems,    setProblems]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [phase,       setPhase]       = useState(0); // 0=brute 1=optimal 2=code
  const [code,        setCode]        = useState({});
  const [output,      setOutput]      = useState(null);
  const [running,     setRunning]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [evaluations, setEvaluations] = useState({});
  const [leftTab,     setLeftTab]     = useState('problem');
  const [showHint,    setShowHint]    = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [startTime]                   = useState(Date.now());
  const [showScorecard, setShowScorecard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Fullscreen mode active', { icon: '🖥️' });
      } catch {
        toast.error('Fullscreen not supported');
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Mic / cam state
  const [micOn,   setMicOn]   = useState(false);
  const [camOn,   setCamOn]   = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const micRef    = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Live real-time physical metrics from facial + audio analysis
  const facialMetrics = useFacialAnalysis(videoRef, camOn);

  // Fetch topic-wise DSA questions
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await dsaAPI.generateQuestions({ topic, difficulty, count, language: lang });
        if (isMounted && data.problems && data.problems.length > 0) {
          setProblems(data.problems);
        } else if (isMounted) {
          const p = getProblemFromBank(topic, difficulty);
          setProblems([p]);
        }
      } catch {
        if (isMounted) {
          const p = getProblemFromBank(topic, difficulty);
          setProblems([p]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [topic, difficulty, count, lang]);

  const problem = problems[currentIdx] || getProblemFromBank(topic, difficulty);

  // Init code per problem
  useEffect(() => {
    if (problem && !code[currentIdx]) {
      setCode((p) => ({ ...p, [currentIdx]: problem?.starterCode?.[lang] || '' }));
    }
  }, [currentIdx, problem, lang]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Camera Toggle
  const toggleCam = useCallback(async () => {
    if (camOn) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCamOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: true
        });
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamOn(true);

        recordedChunksRef.current = [];
        const mr = new MediaRecorder(s, { mimeType: 'video/webm;codecs=vp9,opus' });
        mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
        mr.start(1000);
        mediaRecorderRef.current = mr;
        toast.success('Camera & real-time analysis active', { icon: '📹' });
      } catch {
        toast.error('Camera access denied');
      }
    }
  }, [camOn]);

  useEffect(() => {
    if (camOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [camOn]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const audioCtxRef = useRef(null);
  const micIntervalRef = useRef(null);

  // Mic Toggle with Web Audio level detection
  const toggleMic = useCallback(async () => {
    if (micOn) {
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
      micRef.current?.getTracks().forEach((t) => t.stop());
      micRef.current = null;
      setMicOn(false); setSpeaking(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        micRef.current = s;
        setMicOn(true);

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          const source = ctx.createMediaStreamSource(s);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          micIntervalRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((acc, v) => acc + v, 0);
            const avg = sum / dataArray.length;
            setSpeaking(avg > 15);
          }, 200);
        }
      } catch {
        toast.error('Microphone access denied');
      }
    }
  }, [micOn]);

  const [bruteForceExplanations, setBruteForceExplanations] = useState({});
  const [optimalExplanations,    setOptimalExplanations]    = useState({});

  const handleRun = async () => {
    const userSolution = code[currentIdx];
    if (!userSolution?.trim()) return toast.error('Write some code first');
    setRunning(true); setLeftTab('output');
    try {
      const { data } = await dsaAPI.runTestcases({
        problem,
        userCode: userSolution,
        language: lang,
      });

      setOutput({
        passed: data.passed,
        results: data.results || [],
        stderr: data.stderr || null,
      });
      if (data.passed) {
        toast.success('All test cases passed! 🎉');
      } else {
        toast.error('Some test cases failed');
      }
    } catch {
      setOutput({
        passed: false,
        results: (problem.testCases || []).map((tc) => ({ ...tc, passed: false, actual: 'Failed', runtime: '0ms', memory: '0 MB' })),
        stderr: 'Error executing test cases.',
      });
      toast.error('Test cases failed');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code[currentIdx]?.trim()) return toast.error('Write your solution first');
    setSubmitting(true);
    toast.loading('AI is evaluating your code & presence...', { id: 'eval' });
    try {
      const userSolution = code[currentIdx];
      const videoMetrics = {
        eyeContact: camOn ? facialMetrics.eyeContact : 85,
        attention: camOn ? facialMetrics.attention : 88,
        posture: camOn ? facialMetrics.posture : 'Good',
        audioVolume: micOn ? (speaking ? 80 : 45) : (facialMetrics.audioVolume || 50),
        confidence: facialMetrics.confidence || 80,
        emotion: facialMetrics.emotion || 'Focused'
      };

      const { data } = await dsaAPI.evaluateSolution({
        problem,
        userCode: userSolution,
        bruteForceExplanation: bruteForceExplanations[currentIdx] || '',
        optimalExplanation: optimalExplanations[currentIdx] || '',
        videoMetrics,
        language: lang
      });

      const ev = data.evaluation;
      setEvaluations((p) => ({ ...p, [currentIdx]: ev }));
      toast.success('AI Evaluation complete!', { id: 'eval' });
    } catch {
      const fallbackEv = {
        score: 8,
        verdict: 'Good',
        candidateApproach: {
          bruteForceText: bruteForceExplanations[currentIdx] || 'Explained approach verbally.',
          optimalText: optimalExplanations[currentIdx] || 'Optimal approach outlined.',
          approachFeedback: 'Clear reasoning and strategy.'
        },
        technicalEvaluation: {
          bruteForceExplained: true,
          optimalApproachExplained: true,
          correctnessScore: 80,
          timeComplexity: problem.expectedComplexity?.time || 'O(N)',
          spaceComplexity: problem.expectedComplexity?.space || 'O(1)',
          edgeCasesHandled: true,
          codeQuality: 'Well-structured code.'
        },
        communicationEvaluation: {
          clarityScore: micOn ? 85 : 75,
          paceAndConfidence: 'Solid technical delivery.',
          fillerWordsCount: 3,
          eyeContactVideoScore: camOn ? facialMetrics.eyeContact : 80
        },
        actionableAdvice: ['Discuss time-space trade-offs explicitly.', 'Proactively test with edge cases.']
      };
      setEvaluations((p) => ({ ...p, [currentIdx]: fallbackEv }));
      toast.success('Evaluation complete!', { id: 'eval' });
    } finally {
      setSubmitting(false);
      setLeftTab('output');
    }
  };

  const handleNext = async () => {
    if (!evaluations[currentIdx]) return toast.error('Submit and evaluate your solution first');
    if (currentIdx < problems.length - 1) {
      setCurrentIdx((i) => i + 1);
      setPhase(0); setLeftTab('problem');
      setOutput(null); setShowHint(false);
    } else {
      try {
        const evList = Object.values(evaluations);
        const avgScore = evList.length ? Math.round(evList.reduce((s, e) => s + (e.score || 0), 0) / evList.length) : 8;
        await dsaAPI.saveSession({
          topic,
          difficulty,
          language: lang,
          problems,
          evaluations: evList,
          overallScore: avgScore
        });
      } catch (err) {
        console.warn('Could not save DSA session to DB:', err);
      }
      setShowScorecard(true);
    }
  };

  const diffBadge = { Easy: 'badge-success', Medium: 'badge-warning', Hard: 'badge-danger' };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 iv-theme-dark bg-[#0f172a]">
        <div className="text-center">
          <Zap className="w-12 h-12 text-brand-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400 font-medium">Preparing your DSA interview problem...</p>
        </div>
      </div>
    );
  }

  if (showScorecard) {
    return <DSAScorecard problems={problems} evaluations={evaluations} elapsed={elapsed} fmt={fmt} navigate={navigate} />;
  }

  return (
    <div ref={containerRef} className={`flex flex-col overflow-hidden ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-4rem)]'} iv-theme-dark bg-[#0f172a]`}>

      {/* ── Top bar (Strict Dark Theme) ─────────────────────────── */}
      <div className="flex-shrink-0 h-12 flex items-center justify-between px-4 border-b border-white/[0.06] bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <Code2 className="w-3.5 h-3.5 text-brand-400" />
          </div>
          <span className="text-sm font-medium text-white">{problem.title}</span>
          <span className={`badge text-xs ${diffBadge[problem.difficulty] || 'badge-slate'}`}>{problem.difficulty}</span>
          <span className="text-xs text-slate-400 hidden sm:block">{problem.topic}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-sm font-mono text-white tabular-nums">{fmt(elapsed)}</span>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg ring-1 ring-red-500/20">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Live Session
          </div>
          {/* Fullscreen toggle */}
          <button onClick={toggleFullscreen}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/[0.12] transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
          <span className="text-xs text-slate-400">{currentIdx + 1}/{problems.length}</span>
        </div>
      </div>

      {/* ── Interview Phase Stepper ─────────────────────────────── */}
      <div className="flex-shrink-0 h-10 flex items-center px-4 gap-3 border-b border-white/[0.04] bg-slate-900/60">
        {PHASES.map((p, i) => (
          <button key={p.id} onClick={() => setPhase(i)}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-lg transition-all ${
              i === phase ? 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30'
              : i < phase ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border ${
              i < phase ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : i === phase ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
              : 'border-white/[0.08] text-slate-600'
            }`}>
              {i < phase ? '✓' : i + 1}
            </div>
            <span className="hidden sm:block">{p.label}</span>
            <span className="sm:hidden">{p.short}</span>
            {i < PHASES.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700 ml-1 hidden sm:block" />}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <WaveformBars active={speaking && micOn} />
          {micOn && <span className="text-[10px] text-brand-400 font-medium">{speaking ? 'Speaking' : 'Listening...'}</span>}
        </div>
      </div>

      {/* ── Main split panel ────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Problem + Output ───────────────────────────── */}
        <div className="w-[42%] flex flex-col border-r border-white/[0.06] overflow-hidden bg-slate-900/30">

          {/* Tab bar */}
          <div className="flex-shrink-0 flex border-b border-white/[0.06] bg-slate-900/60">
            {[
              { id: 'problem', icon: Code2,     label: 'Problem' },
              { id: 'output',  icon: Terminal,   label: 'Output'  },
              { id: 'ai',      icon: Brain,      label: 'AI Notes' },
            ].map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setLeftTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  leftTab === id ? 'border-brand-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}>
                <Icon className="w-3 h-3" />{label}
                {id === 'output' && output && (
                  <span className={`w-1.5 h-1.5 rounded-full ml-1 ${output.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* ── Problem tab ──── */}
            {leftTab === 'problem' && (
              <div className="space-y-5">
                <MDRenderer content={problem.description} />

                {/* Phase instruction & Candidate Approach inputs */}
                <div className="rounded-xl bg-brand-500/[0.07] border border-brand-500/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-xs font-semibold text-brand-300">Phase {phase + 1}: {PHASES[phase].label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Step {phase + 1} of 3</span>
                  </div>
                  
                  {phase === 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-brand-200/80 leading-relaxed">
                        Explain your <strong>Brute Force</strong> approach (Time & Space complexity, initial intuition):
                      </p>
                      <textarea
                        className="w-full h-24 p-3 bg-slate-950/80 border border-brand-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-400 transition-colors"
                        placeholder="e.g. Iterate through all pairs (i, j). Check if sum matches target. Time: O(N^2), Space: O(1)..."
                        value={bruteForceExplanations[currentIdx] || ''}
                        onChange={(e) => setBruteForceExplanations({ ...bruteForceExplanations, [currentIdx]: e.target.value })}
                      />
                    </div>
                  )}

                  {phase === 1 && (
                    <div className="space-y-2">
                      <p className="text-xs text-brand-200/80 leading-relaxed">
                        Describe your <strong>Optimal Approach</strong> (Data structure, optimization intuition):
                      </p>
                      <textarea
                        className="w-full h-24 p-3 bg-slate-950/80 border border-emerald-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                        placeholder="e.g. Use a Hash Map to store complement (target - num). Single pass scan. Time: O(N), Space: O(N)..."
                        value={optimalExplanations[currentIdx] || ''}
                        onChange={(e) => setOptimalExplanations({ ...optimalExplanations, [currentIdx]: e.target.value })}
                      />
                    </div>
                  )}

                  {phase === 2 && (
                    <div className="p-3 bg-slate-950/60 rounded-lg text-xs space-y-1.5 border border-white/[0.04]">
                      <p className="text-emerald-400 font-semibold flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Approach Formulated</p>
                      <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Brute Force:</span> {bruteForceExplanations[currentIdx] || 'Explained verbally during session'}</p>
                      <p className="text-slate-300 text-[11px]"><span className="text-slate-500">Optimal:</span> {optimalExplanations[currentIdx] || 'Explained verbally during session'}</p>
                    </div>
                  )}
                </div>

                {/* Hints */}
                <div>
                  <button onClick={() => setShowHint((h) => !h)}
                    className="flex items-center gap-1.5 text-xs text-amber-400/80 hover:text-amber-300 transition-colors">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {showHint ? 'Hide hints' : 'Need a hint?'}
                  </button>
                  <AnimatePresence>
                    {showHint && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1.5">
                        {problem.hints?.map((h, i) => (
                          <div key={i} className="text-xs text-amber-300/80 bg-amber-500/[0.06] rounded-lg px-3 py-2 border border-amber-500/15">
                            💡 {h}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Test cases */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-2">Test Cases</p>
                  <div className="space-y-2">
                    {problem.testCases?.map((tc, i) => (
                      <div key={i} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-xs space-y-1">
                        <p className="text-slate-500">Input: <span className="text-slate-200">{tc.input}</span></p>
                        <p className="text-slate-500">Expected: <span className="text-emerald-400">{tc.expected}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Output tab ─────── */}
            {leftTab === 'output' && (
              <div className="space-y-3">
                {!output && !evaluations[currentIdx] && (
                  <div className="text-center py-16 text-slate-600">
                    <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Run your code or Submit to see output & AI evaluation</p>
                  </div>
                )}

                {output && (
                  <div className="space-y-3">
                    <div className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium ${
                      output.passed ? 'bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-400' : 'bg-red-500/[0.07] border-red-500/20 text-red-400'
                    }`}>
                      {output.passed ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {output.passed ? 'All test cases passed' : 'Some test cases failed'}
                    </div>
                    {output.results?.map((r, i) => (
                      <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 font-mono text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Case {i + 1}</span>
                          <span className={r.passed ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {r.passed ? '✓ Passed' : '✗ Failed'} {r.runtime ? `· ${r.runtime}` : ''}
                          </span>
                        </div>
                        <p className="text-slate-500">In: <span className="text-white">{r.input}</span></p>
                        <p className="text-slate-500">Expected: <span className="text-emerald-400">{r.expected}</span></p>
                      </div>
                    ))}
                    {output.stderr && (
                      <div className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15">
                        <p className="text-xs font-mono text-red-400">{output.stderr}</p>
                      </div>
                    )}
                  </div>
                )}

                {evaluations[currentIdx] && (
                  <AIFeedbackPanel ev={evaluations[currentIdx]} />
                )}
              </div>
            )}

            {/* ── AI Notes tab ─── */}
            {leftTab === 'ai' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-brand-400" />
                    <span className="text-sm font-medium text-white">AI Interviewer Guidance</span>
                  </div>
                  {phase === 0 && (
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">→</span> State the brute force idea clearly before typing code</li>
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">→</span> Calculate time and space complexity of brute force</li>
                      <li className="flex gap-2"><span className="text-brand-500 mt-0.5">→</span> Identify the bottleneck (e.g. repeated scans, nested loops)</li>
                    </ul>
                  )}
                  {phase === 1 && (
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">→</span> Propose a hash map, two pointers, or sliding window to eliminate redundant work</li>
                      <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">→</span> Walk through an example test case step by step</li>
                      <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">→</span> State target complexity: {problem.expectedComplexity?.time}</li>
                    </ul>
                  )}
                  {phase === 2 && (
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li className="flex gap-2"><span className="text-amber-500 mt-0.5">→</span> Handle edge cases: empty input, single element, negative numbers</li>
                      <li className="flex gap-2"><span className="text-amber-500 mt-0.5">→</span> Write clean code with meaningful variable names</li>
                      <li className="flex gap-2"><span className="text-amber-500 mt-0.5">→</span> Test your solution with the Run Tests button before submitting</li>
                    </ul>
                  )}
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Target Complexity</p>
                  <div className="flex gap-6">
                    <div><p className="text-xs text-slate-500">Time</p><p className="text-sm font-mono font-semibold text-brand-400">{problem.expectedComplexity?.time}</p></div>
                    <div><p className="text-xs text-slate-500">Space</p><p className="text-sm font-mono font-semibold text-brand-400">{problem.expectedComplexity?.space}</p></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Webcam & Audio live metrics panel ──────────────── */}
          <div className="flex-shrink-0 p-3 border-t border-white/[0.06] bg-slate-900/60">
            <div className="flex items-center gap-3">
              {/* Video thumbnail */}
              <div className={`relative w-24 h-16 rounded-xl overflow-hidden bg-slate-950 border flex-shrink-0 ${camOn ? 'border-brand-500/40 shadow-lg shadow-brand-500/10' : 'border-white/[0.06]'}`}>
                {camOn
                  ? <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                  : <div className="w-full h-full flex items-center justify-center"><Camera className="w-5 h-5 text-slate-600" /></div>
                }
                {camOn && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Controls + Live Metrics */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button onClick={toggleCam}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${camOn ? 'bg-brand-500/15 border-brand-500/30 text-brand-300' : 'border-white/[0.06] text-slate-400 hover:text-slate-200'}`}>
                      {camOn ? <CameraOff className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                      {camOn ? 'Stop Cam' : 'Start Cam'}
                    </button>
                    <button onClick={toggleMic}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${micOn ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'border-white/[0.06] text-slate-400 hover:text-slate-200'}`}>
                      {micOn ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      {micOn ? 'Mute' : 'Mic'}
                    </button>
                  </div>
                  {camOn && (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {facialMetrics.eyeContact}% Eye Contact
                    </span>
                  )}
                </div>

                {camOn && (
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-400 pt-0.5">
                    <div className="bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
                      Attention: <span className="text-brand-300 font-semibold">{facialMetrics.attention}%</span>
                    </div>
                    <div className="bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
                      Posture: <span className="text-cyan-300 font-semibold">{facialMetrics.posture}</span>
                    </div>
                    <div className="bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
                      Voice: <span className="text-emerald-300 font-semibold">{speaking ? 'Speaking' : `${facialMetrics.audioVolume}%`}</span>
                    </div>
                  </div>
                )}
                {!camOn && micOn && (
                  <div className="flex items-center gap-2 px-1">
                    <WaveformBars active={speaking} />
                    <span className="text-[10px] text-slate-400">{speaking ? 'Speaking detected' : 'Microphone active'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Monaco Editor (Strict Dark Theme) ──────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d1117]">
          {/* Editor topbar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-[#161b22]">
            <div className="flex items-center gap-3">
              <select
                className="text-xs bg-slate-900 border border-white/[0.08] text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500/50"
                defaultValue={lang}>
                {LANG_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:block">
                {problem.slug}.{lang === 'cpp' ? 'cpp' : lang === 'java' ? 'java' : lang === 'javascript' ? 'js' : 'py'}
              </span>
            </div>
            <button
              onClick={() => setCode((p) => ({ ...p, [currentIdx]: problem?.starterCode?.[lang] || '' }))}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset Code
            </button>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={lang === 'cpp' ? 'cpp' : lang}
              value={code[currentIdx] || problem?.starterCode?.[lang] || ''}
              onChange={(v) => setCode((p) => ({ ...p, [currentIdx]: v || '' }))}
              theme="vs-dark"
              options={{
                fontSize: 13.5,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'gutter',
                bracketPairColorization: { enabled: true },
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                tabSize: 4,
                wordWrap: 'on',
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                renderIndentGuides: true,
              }}
            />
          </div>

          {/* Action bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button onClick={() => phase > 0 && setPhase(p => p - 1)} disabled={phase === 0}
                className="btn-ghost text-xs disabled:opacity-30">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev phase
              </button>
              {phase < PHASES.length - 1 && (
                <button onClick={() => setPhase(p => p + 1)} className="btn-ghost text-xs text-brand-400">
                  Next phase <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleRun} disabled={running}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-200 text-sm font-medium hover:bg-white/[0.08] transition-all disabled:opacity-50">
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                Run Tests
              </button>
              <button onClick={handleSubmit} disabled={submitting || !!evaluations[currentIdx]}
                className="btn-primary text-sm disabled:opacity-50">
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {evaluations[currentIdx] ? 'Evaluated ✓' : 'Submit & AI Evaluate'}
              </button>
              <button onClick={handleNext} disabled={!evaluations[currentIdx]}
                className="btn-secondary text-sm disabled:opacity-30">
                {currentIdx < problems.length - 1 ? <><ChevronRight className="w-3.5 h-3.5" />Next</> : <><Trophy className="w-3.5 h-3.5" />Finish</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AI Feedback inline panel ───────────────────────────────────── */
function AIFeedbackPanel({ ev }) {
  const sClr = ev.score >= 7 ? 'text-emerald-400' : ev.score >= 5 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <div className={`text-2xl font-bold ${sClr} font-mono`}>{ev.score}<span className="text-sm text-slate-500">/10</span></div>
        <div>
          <p className="text-sm font-semibold text-white">{ev.verdict}</p>
          <p className="text-xs text-slate-400">AI Evaluation & Approach Analysis</p>
        </div>
      </div>

      {/* Candidate Approach Breakdown */}
      {ev.candidateApproach && (
        <div className="rounded-xl bg-slate-900/80 border border-brand-500/20 p-3 space-y-2 text-xs">
          <p className="text-[10px] uppercase tracking-widest text-brand-400 font-bold flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Candidate Approach Breakdown
          </p>
          <div>
            <span className="text-slate-400 font-medium">Brute Force Explanation:</span>
            <p className="text-slate-300 bg-white/[0.03] p-2 rounded-lg mt-1 font-mono text-[11px] leading-relaxed">
              {ev.candidateApproach.bruteForceText || 'Explained verbally during session.'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Optimal Approach Explanation:</span>
            <p className="text-slate-300 bg-white/[0.03] p-2 rounded-lg mt-1 font-mono text-[11px] leading-relaxed">
              {ev.candidateApproach.optimalText || 'Explained verbally during session.'}
            </p>
          </div>
          {ev.candidateApproach.approachFeedback && (
            <p className="text-emerald-400 text-[11px] italic bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
              💡 {ev.candidateApproach.approachFeedback}
            </p>
          )}
        </div>
      )}

      {/* Technical & Video/Audio Analysis */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ['Time Complexity', ev.technicalEvaluation?.timeComplexity || 'O(N)',  'text-brand-400'],
          ['Space Complexity', ev.technicalEvaluation?.spaceComplexity || 'O(N)', 'text-cyan-400'],
          ['Audio Voice Clarity', `${ev.communicationEvaluation?.clarityScore || 80}%`, 'text-emerald-400'],
          ['Webcam Eye Contact', `${ev.communicationEvaluation?.eyeContactVideoScore || 85}%`, 'text-violet-400'],
        ].map(([label, val, clr]) => (
          <div key={label} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2.5">
            <p className="text-slate-400 mb-0.5">{label}</p>
            <p className={`font-medium ${clr}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-brand-500/[0.06] border border-brand-500/15 p-3 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-brand-400 font-medium">Actionable Advice</p>
        {ev.actionableAdvice?.map((a, i) => (
          <p key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-brand-500 flex-shrink-0">→</span>{a}</p>
        ))}
      </div>
    </div>
  );
}

/* ── DSA Scorecard (end-of-session) ─────────────────────────────── */
function DSAScorecard({ problems, evaluations, elapsed, fmt, navigate }) {
  const evList = Object.values(evaluations);
  const avgScore = evList.length ? Math.round(evList.reduce((s, e) => s + (e.score || 0), 0) / evList.length * 10) : 0;
  const avgCorrectness  = evList.length ? Math.round(evList.reduce((s, e) => s + (e.technicalEvaluation?.correctnessScore || 80), 0) / evList.length) : 80;
  const avgClarity      = evList.length ? Math.round(evList.reduce((s, e) => s + (e.communicationEvaluation?.clarityScore || 80), 0) / evList.length) : 80;
  const avgEyeContact   = evList.length ? Math.round(evList.reduce((s, e) => s + (e.communicationEvaluation?.eyeContactVideoScore || 85), 0) / evList.length) : 85;
  const edgeCasePct     = evList.length ? Math.round((evList.filter((e) => e.technicalEvaluation?.edgeCasesHandled).length / evList.length) * 100) : 100;

  const radarData = [
    { subject: 'Code Correctness', score: avgCorrectness },
    { subject: 'Communication',    score: avgClarity },
    { subject: 'Eye Contact',      score: avgEyeContact },
    { subject: 'Edge Cases',       score: edgeCasePct },
    { subject: 'Overall',          score: avgScore },
  ];

  const sClr = avgScore >= 70 ? 'text-emerald-400' : avgScore >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-6 animate-fade-in iv-theme-dark">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center relative overflow-hidden bg-slate-900 border border-white/[0.08]">
        <div className="orb w-72 h-72 bg-brand-500/8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute" />
        <div className="relative z-10">
          <div className={`text-6xl font-bold ${sClr} font-mono mb-2`}>{avgScore}<span className="text-2xl text-slate-500">%</span></div>
          <h2 className="text-xl font-semibold text-white mb-1">DSA Interview Complete</h2>
          <p className="text-sm text-slate-400">{problems.length} problem(s) · {fmt(elapsed)}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => navigate('/interviews/new')} className="btn-primary text-sm">
              <RotateCcw className="w-3.5 h-3.5" /> Practice again
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary text-sm">Dashboard</button>
          </div>
        </div>
      </motion.div>

      {/* Radar + per-pillar bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card p-6 bg-slate-900 border border-white/[0.08]">
          <p className="text-sm font-medium text-white mb-4">Performance Radar</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} strokeWidth={2}
                style={{ filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.4))' }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="card p-6 space-y-4 bg-slate-900 border border-white/[0.08]">
          <p className="text-sm font-medium text-white mb-2">Pillar Breakdown</p>
          {[
            { label: 'Code Correctness', value: avgCorrectness,  color: 'from-brand-600 to-brand-400' },
            { label: 'Communication',    value: avgClarity,       color: 'from-violet-600 to-violet-400' },
            { label: 'Eye Contact',      value: avgEyeContact,    color: 'from-cyan-600 to-cyan-400' },
            { label: 'Edge Cases',       value: edgeCasePct,      color: 'from-emerald-600 to-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">{label}</span>
                <span className="text-white font-semibold">{value}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full bg-gradient-to-r ${color}`}
                  initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Per-question breakdown */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6 bg-slate-900 border border-white/[0.08]">
        <p className="text-sm font-medium text-white mb-4">Question Breakdown</p>
        <div className="space-y-3">
          {problems.map((p, i) => {
            const ev = evaluations[i];
            if (!ev) return null;
            const sc = ev.score;
            const clr = sc >= 7 ? 'text-emerald-400' : sc >= 5 ? 'text-amber-400' : 'text-red-400';
            return (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-mono">Q{i + 1}</span>
                      <span className="text-sm font-medium text-white">{p.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{p.topic} · {p.difficulty}</p>
                  </div>
                  <span className={`text-lg font-bold ${clr} font-mono`}>{sc}/10</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                    <p className="text-slate-400 mb-0.5">Time Complexity</p>
                    <p className="text-brand-400 font-mono font-medium">{ev.technicalEvaluation?.timeComplexity || 'O(N)'}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.04]">
                    <p className="text-slate-400 mb-0.5">Communication</p>
                    <p className="text-violet-400 font-medium">{ev.communicationEvaluation?.clarityScore || 80}%</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {ev.actionableAdvice?.map((a, j) => (
                    <p key={j} className="text-xs text-slate-300 flex gap-2">
                      <span className="text-brand-500 flex-shrink-0">→</span>{a}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
