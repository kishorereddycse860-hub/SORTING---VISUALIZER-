/* =========================================================
   SortLab — shared data
   Edit PROJECT_INFO below with your actual subject/faculty details.
   ========================================================= */

const PROJECT_INFO = {
  title: "Sorting Algorithm Visualizer",
  problemStatement: "Design and implement a web-based application that visualizes the working of classical sorting algorithms through step-by-step, interactive animation — enabling clearer understanding of comparison and swap behaviour, and making abstract time-complexity differences visually observable.",
  studentName: "Kishore Reddy Gayam(8741)   Pamba Nixan Raj(8718)",
  facultyName: "[Prof.Paritosh Biswas]",
  subject: "Design and Analysis of Algorithms (DAA)",
  institution: "Marwadi University, Dept. of CSE (AI/ML)",
};

const ALGO_LIST = ["bubble", "selection", "insertion", "shell", "merge", "quick", "heap"];

const ALGO_DATA = {
  bubble: {
    name: "Bubble Sort",
    slug: "bubble",
    stable: true, inPlace: true, comparisonBased: true,
    tagline: "Repeatedly swaps adjacent out-of-order elements until nothing is left to swap.",
    description: "Bubble Sort is a simple comparison-based sorting algorithm that repeatedly compares two adjacent elements and swaps them if they are in the wrong order. This process continues until the entire array is sorted.",    howItWorks: [
      "Start at the beginning of the array and compare the first two elements.",
      "If the left element is bigger than the right one, swap them.",
      "Move one step forward and repeat the comparison for the next pair.",
      "After one full pass, the largest element has settled at the end — repeat the whole pass on the remaining unsorted part.",
      "Stop once a full pass happens with no swaps — the array is sorted."
    ],
    pseudocode:
`function bubbleSort(arr):
    n = length(arr)
    for i from 0 to n-1:
        for j from 0 to n-i-2:
            if arr[j] > arr[j+1]:
                swap(arr[j], arr[j+1])
    return arr`,
    complexity: { best: "n", avg: "n²", worst: "n²", space: "1" },
    complexityDerivation: {
      best: {
        label: "Best Case — array already sorted",
        lines: [
          "for (i = 0; i < size - 1; i++)      →  runs n-1 times     →  O(n)",
          "  for (j = 0; ...; j++)              →  with an early swapped-flag exit,",
          "                                        breaks after the first clean pass",
          "  if (arr[j] > arr[j+1])              →  O(1) per comparison",
          "",
          "T(n) = n - 1  (single pass, no more swaps found)"
        ],
        result: "T(n) = O(n)"
      },
      avg: {
        label: "Average Case — random order",
        lines: [
          "for (i = 0; i < size - 1; i++)      →  O(n)",
          "  for (j = 0; j < size-i-1; j++)      →  O(n)",
          "    if (arr[j] > arr[j+1])            →  O(1)",
          "      temp = arr[j]; ...              →  O(1)",
          "",
          "Comparisons ≈ (n-1) + (n-2) + ... + 1 = n(n-1)/2",
          "T(n) = n(n-1)/2  =  (n² - n)/2"
        ],
        result: "T(n) = O(n²)"
      },
      worst: {
        label: "Worst Case — array in reverse order",
        lines: [
          "for (i = 0; i < size - 1; i++)      →  O(n)",
          "  for (j = 0; j < size-i-1; j++)      →  O(n)",
          "    if (arr[j] > arr[j+1])            →  true every single time",
          "      temp = arr[j]; ...              →  swap executes every iteration",
          "",
          "Number of comparisons = (n-1) + (n-2) + ... + 1 = n(n-1)/2",
          "T(n) = n(n-1)/2  =  (n² - n)/2"
        ],
        result: "T(n) = O(n²)"
      }
    }
  },

  selection: {
    name: "Selection Sort",
    slug: "selection",
    stable: false, inPlace: true, comparisonBased: true,
    tagline: "Repeatedly picks the smallest remaining element and places it at the front.",
    description: "Selection Sort splits the array into a sorted part (at the front) and an unsorted part (the rest). On every pass it scans the entire unsorted part to find the minimum element, then swaps it into place at the front of the unsorted region — growing the sorted part by one element each time.",
    howItWorks: [
      "Treat the whole array as unsorted at the start.",
      "Scan the unsorted part to find the smallest element.",
      "Swap that minimum element with the first element of the unsorted part.",
      "That position is now considered sorted — shrink the unsorted part by one.",
      "Repeat until only one element remains, which is automatically in place."
    ],
    pseudocode:
`function selectionSort(arr):
    n = length(arr)
    for i from 0 to n-2:
        minIndex = i
        for j from i+1 to n-1:
            if arr[j] < arr[minIndex]:
                minIndex = j
        swap(arr[i], arr[minIndex])
    return arr`,
    complexity: { best: "n²", avg: "n²", worst: "n²", space: "1" },
    complexityDerivation: {
      best: {
        label: "Best Case — array already sorted",
        lines: [
          "int i, j, minIndex, temp;           →  O(1)",
          "for (i = 0; i < size - 1; i++)      →  O(n)",
          "  minIndex = i;                      →  O(1)",
          "  for (j = i+1; j < size; j++)       →  still scans the FULL remaining part",
          "    if (arr[j] < arr[minIndex])       →  O(1) — no early exit possible",
          "  temp = arr[i]; ...swap...           →  O(1)",
          "",
          "Comparisons = (n-1) + (n-2) + ... + 1 = n(n-1)/2  (unavoidable — the",
          "algorithm must still find the minimum even in a sorted array)"
        ],
        result: "T(n) = O(n²)"
      },
      avg: {
        label: "Average Case — random order",
        lines: [
          "for (i = 0; i < size - 1; i++)      →  O(n)",
          "  for (j = i+1; j < size; j++)       →  O(n)",
          "    if (arr[j] < arr[minIndex])       →  O(1)",
          "  temp = arr[i]; ...swap...           →  O(1), exactly n-1 swaps total",
          "",
          "T(n) = (n-1) + (n-2) + ... + 1 = n(n-1)/2 = (n² - n)/2"
        ],
        result: "T(n) = O(n²)"
      },
      worst: {
        label: "Worst Case — array in reverse order",
        lines: [
          "for (i = 0; i < size - 1; i++)      →  O(n)",
          "  for (j = i+1; j < size; j++)       →  O(n)",
          "    if (arr[j] < arr[minIndex])       →  requires maximum rearrangement",
          "  temp = arr[i]; ...swap...           →  O(1)",
          "",
          "T(n) = (n-1) + (n-2) + ... + 1 = n(n-1)/2 = (n² - n)/2"
        ],
        result: "T(n) = O(n²)"
      }
    }
  },

  insertion: {
    name: "Insertion Sort",
    slug: "insertion",
    stable: true, inPlace: true, comparisonBased: true,
    tagline: "Builds a sorted section one element at a time, like sorting playing cards in hand.",
    description: "Insertion Sort grows a sorted section at the front of the array. For every new element, it slides backwards through the already-sorted section, shifting larger elements one step to the right, until it finds the exact spot where the new element belongs.",
    howItWorks: [
      "Consider the first element as a trivially sorted section of size one.",
      "Pick the next element as the 'key' to insert.",
      "Compare the key with elements to its left in the sorted section.",
      "Shift every larger element one position to the right to make room.",
      "Insert the key into the gap created — repeat for every remaining element."
    ],
    pseudocode:
`function insertionSort(arr):
    for i from 1 to length(arr)-1:
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j = j - 1
        arr[j+1] = key
    return arr`,
    complexity: { best: "n", avg: "n²", worst: "n²", space: "1" },
    complexityDerivation: {
      best: {
        label: "Best Case — array already sorted",
        lines: [
          "int i, j, key;                       →  O(1)",
          "for (i = 1; i < size; i++)           →  O(n)",
          "  key = arr[i]; j = i - 1;             →  O(1)",
          "  while (j>=0 && arr[j] > key)         →  condition is FALSE immediately",
          "                                          for every i  →  loop body never runs",
          "  arr[j+1] = key;                      →  O(1)",
          "",
          "T(n) = (n-1) × O(1)"
        ],
        result: "T(n) = O(n)"
      },
      avg: {
        label: "Average Case — random order",
        lines: [
          "for (i = 1; i < size; i++)           →  O(n)",
          "  while (j>=0 && arr[j] > key)         →  key moves back ~i/2 positions",
          "    arr[j+1] = arr[j]; j = j-1;          →  O(1) per shift",
          "  arr[j+1] = key;                      →  O(1)",
          "",
          "T(n) ≈ 1 + 2 + 3 + ... + (n-1)  =  n(n-1)/2"
        ],
        result: "T(n) = O(n²)"
      },
      worst: {
        label: "Worst Case — array in reverse order",
        lines: [
          "for (i = 1; i < size; i++)           →  O(n)",
          "  while (j>=0 && arr[j] > key)         →  TRUE every time — key must shift",
          "    arr[j+1] = arr[j]; j = j-1;          →  all the way to index 0",
          "  arr[j+1] = key;                      →  O(1)",
          "",
          "Every iteration i needs i shifts:",
          "T(n) = 1 + 2 + 3 + ... + (n-1)  =  n(n-1)/2"
        ],
        result: "T(n) = O(n²)"
      }
    }
  },

  shell: {
    name: "Shell Sort",
    slug: "shell",
    stable: false, inPlace: true, comparisonBased: true,
    tagline: "A gap-based extension of Insertion Sort — compares far-apart elements first, then shrinks the gap down to 1.",
    description: "Shell Sort improves on Insertion Sort by first comparing and swapping elements that are far apart (separated by a 'gap'), moving out-of-place elements a long distance in one move instead of one step at a time. The gap is repeatedly shrunk — here using the n/2, n/4, ..., 1 sequence — until a final gap-1 pass performs an ordinary Insertion Sort on an already 'almost sorted' array, which finishes much faster than plain Insertion Sort would.",
    howItWorks: [
      "Start with a large gap, typically half the array size (gap = n/2).",
      "Using this gap, perform a gapped insertion sort: compare each element with the one 'gap' positions before it, swapping if out of order.",
      "Move to the next element and repeat, so every element eventually gets compared to its gap-distant neighbour.",
      "Shrink the gap (here by halving it: gap = gap/2) and repeat the whole gapped-insertion pass.",
      "Continue shrinking until the gap reaches 1 — this final pass is a regular Insertion Sort, but the array is already nearly sorted, so it finishes quickly."
    ],
    pseudocode:
`function shellSort(arr):
    n = length(arr)
    gap = n / 2
    while gap > 0:
        for i from gap to n-1:
            j = i
            while j >= gap and arr[j-gap] > arr[j]:
                swap(arr[j-gap], arr[j])
                j = j - gap
        gap = gap / 2
    return arr`,
    complexity: { best: "n log n", avg: "n^1.5", worst: "n²", space: "1" },
    complexityDerivation: {
      best: {
        label: "Best Case — array already sorted",
        lines: [
          "int i, j, gap, temp;                 →  O(1)",
          "for (gap = size/2; gap>0; gap/=2)    →  O(log n) gap values",
          "  for (i = gap; i < size; i++)         →  O(n) per gap value",
          "    while (j>=gap && arr[j-gap]>arr[j]) →  condition FALSE immediately",
          "                                          for every i  →  inner body never runs",
          "",
          "T(n) = O(log n) × O(n) = O(n log n)"
        ],
        result: "T(n) = O(n log n)"
      },
      avg: {
        label: "Average Case — random order",
        lines: [
          "for (gap = size/2; gap>0; gap/=2)    →  O(log n) gap values",
          "  for (i = gap; i < size; i++)         →  O(n) per gap value",
          "    while (j>=gap && arr[j-gap]>arr[j]) →  a bounded number of gapped shifts",
          "      swap ...; j = j - gap;              →  O(1) per shift",
          "",
          "For the n/2, n/4, ..., 1 gap sequence this works out empirically to",
          "roughly T(n) ≈ O(n^1.5) — much better than plain Insertion Sort's O(n²)"
        ],
        result: "T(n) ≈ O(n^1.5)"
      },
      worst: {
        label: "Worst Case — array in reverse order",
        lines: [
          "for (gap = size/2; gap>0; gap/=2)    →  O(log n) gap values",
          "  for (i = gap; i < size; i++)         →  O(n) per gap value",
          "    while (j>=gap && arr[j-gap]>arr[j]) →  TRUE often — many gapped shifts",
          "      swap ...; j = j - gap;              →  O(1) per shift",
          "",
          "With the n/2 gap sequence, the worst case still degrades to O(n²)",
          "(a better-chosen gap sequence, e.g. Hibbard's, can lower this bound)"
        ],
        result: "T(n) = O(n²)"
      }
    }
  },

  merge: {
    name: "Merge Sort",
    slug: "merge",
    stable: true, inPlace: false, comparisonBased: true,
    tagline: "Splits the array in half recursively, sorts each half, then merges them back together.",
    description: "Merge Sort is a divide-and-conquer algorithm. It splits the array into halves recursively until each piece has just one element (trivially sorted), then merges pairs of sorted pieces back together in the correct order, all the way back up to one fully sorted array.",
    howItWorks: [
      "If the array has one element or none, it's already sorted — stop.",
      "Otherwise, split the array into a left half and a right half.",
      "Recursively sort the left half using the same process.",
      "Recursively sort the right half using the same process.",
      "Merge the two now-sorted halves together by repeatedly picking the smaller front element from each."
    ],
    pseudocode:
`function mergeSort(arr, lo, hi):
    if hi - lo <= 1: return
    mid = (lo + hi) / 2
    mergeSort(arr, lo, mid)
    mergeSort(arr, mid, hi)
    merge(arr, lo, mid, hi)

function merge(arr, lo, mid, hi):
    left  = arr[lo:mid]
    right = arr[mid:hi]
    i = j = 0; k = lo
    while i < len(left) and j < len(right):
        if left[i] <= right[j]: arr[k++] = left[i++]
        else:                   arr[k++] = right[j++]
    copy remaining left/right into arr`,
    complexity: { best: "n log n", avg: "n log n", worst: "n log n", space: "n" },
    complexityDerivation: {
      best: {
        label: "Best Case — recurrence solved by the Master Method",
        lines: [
          "void mergeLogic(low, high) {           →  O(1)",
          "  if (low < high) {                     →  O(1)",
          "    mid = (low+high)/2;                  →  O(1)",
          "    mergeLogic(low, mid);                 →  T(n/2)",
          "    mergeLogic(mid+1, high);               →  T(n/2)",
          "    merge(low, mid, high); }             →  O(n)",
          "",
          "T(n) = 2T(n/2) + O(n)",
          "Master method:  a=2, b=2, f(n)=O(n)  →  log_b(a) = log₂2 = 1 = p",
          "case 2 of the master theorem  →  T(n) = O(n × log n)"
        ],
        result: "T(n) = O(n log n)"
      },
      avg: {
        label: "Average Case — array elements in random order",
        lines: [
          "Merge Sort always splits the array into two exact halves,",
          "regardless of how the elements are arranged.",
          "",
          "T(n) = 2T(n/2) + O(n)   (identical recurrence to best case)",
          "T(n) = O(n log n)"
        ],
        result: "T(n) = O(n log n)"
      },
      worst: {
        label: "Worst Case — array in reverse order",
        lines: [
          "Even in the worst arrangement, merge() still needs exactly",
          "O(n) work to combine two sorted halves, and the split is",
          "still always exactly in half.",
          "",
          "T(n) = 2T(n/2) + O(n)",
          "T(n) = O(n log n)"
        ],
        result: "T(n) = O(n log n)"
      }
    }
  },

  quick: {
    name: "Quick Sort",
    slug: "quick",
    stable: false, inPlace: true, comparisonBased: true,
    tagline: "Picks a pivot, partitions around it, then recurses on both sides.",
    description: "Quick Sort is another divide-and-conquer algorithm. It picks a 'pivot' element, then rearranges the array so everything smaller than the pivot ends up on its left and everything larger ends up on its right. It then recursively applies the same process to both sides.",
    howItWorks: [
      "Pick a pivot element — this implementation uses the last element of the range.",
      "Walk through the range, moving every element smaller than the pivot to the left side.",
      "Once the scan finishes, swap the pivot into its correct final position.",
      "Recursively apply the same process to the elements left of the pivot.",
      "Recursively apply the same process to the elements right of the pivot."
    ],
    pseudocode:
`function quickSort(arr, lo, hi):
    if lo >= hi: return
    p = partition(arr, lo, hi)
    quickSort(arr, lo, p-1)
    quickSort(arr, p+1, hi)

function partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo - 1
    for j from lo to hi-1:
        if arr[j] < pivot:
            i = i + 1
            swap(arr[i], arr[j])
    swap(arr[i+1], arr[hi])
    return i + 1`,
    complexity: { best: "n log n", avg: "n log n", worst: "n²", space: "log n" },
    complexityDerivation: {
      best: {
        label: "Best Case — pivot always splits the array evenly",
        lines: [
          "int pi = partition(low, high);         →  O(n) to scan and partition",
          "quickLogic(low, pi-1);                  →  T(n/2)",
          "quickLogic(pi+1, high);                 →  T(n/2)",
          "",
          "T(n) = 2T(n/2) + O(n)",
          "Master method:  a=2, b=2, f(n)=O(n)  →  same case as merge sort"
        ],
        result: "T(n) = O(n log n)"
      },
      avg: {
        label: "Average Case — pivot gives a reasonably balanced split",
        lines: [
          "On average, the partition() step still divides the array into",
          "two pieces whose sizes are proportional to n (not always exactly",
          "equal, but balanced enough on average).",
          "",
          "T(n) = 2T(n/2) + O(n)"
        ],
        result: "T(n) = O(n log n)"
      },
      worst: {
        label: "Worst Case — pivot is always the smallest/largest element",
        lines: [
          "int pivot = arr[high];                  →  last element chosen as pivot",
          "if (already sorted array) every partition puts ALL other",
          "elements on ONE side  →  only 1 element is removed per call",
          "",
          "T(n) = T(n-1) + O(n)",
          "T(n) = T(n-1) + (n-1) + T(n-2) + (n-2) + ...",
          "T(n) = (n-1) + (n-2) + ... + 1 = n(n-1)/2"
        ],
        result: "T(n) = O(n²)"
      }
    }
  },

  heap: {
    name: "Heap Sort",
    slug: "heap",
    stable: false, inPlace: true, comparisonBased: true,
    tagline: "Builds a max-heap, then repeatedly extracts the largest element.",
    description: "Heap Sort first rearranges the array into a max-heap — a binary tree structure (stored in the array itself) where every parent is larger than its children, so the largest element sits at the root. It then repeatedly swaps the root with the last unsorted element and re-heapifies the reduced heap.",
    howItWorks: [
      "Build a max-heap from the entire array so the largest value sits at index 0.",
      "Swap the root (largest element) with the last element of the unsorted region.",
      "Shrink the heap by one and 'sift down' the new root to restore the max-heap property.",
      "Repeat the swap-and-sift-down process until the heap has only one element left.",
      "The array is now fully sorted in ascending order."
    ],
    pseudocode:
`function heapSort(arr):
    n = length(arr)
    for i from n/2 - 1 down to 0:
        heapify(arr, n, i)
    for end from n-1 down to 1:
        swap(arr[0], arr[end])
        heapify(arr, end, 0)

function heapify(arr, size, root):
    largest = root
    left = 2*root+1; right = 2*root+2
    if left < size and arr[left] > arr[largest]:  largest = left
    if right < size and arr[right] > arr[largest]: largest = right
    if largest != root:
        swap(arr[root], arr[largest])
        heapify(arr, size, largest)`,
    complexity: { best: "n log n", avg: "n log n", worst: "n log n", space: "1" },
    complexityDerivation: {
      best: {
        label: "Best Case — heap sort's cost doesn't depend on input order",
        lines: [
          "Build-heap phase:",
          "  for (i = size/2 - 1; i >= 0; i--)     →  n/2 calls to heapify()",
          "  heapify(size, i);                      →  amortised cost sums to O(n)",
          "                                             (not n × log n — nodes near",
          "                                             the bottom dominate and are cheap)",
          "",
          "Extraction phase:",
          "  for (end = size-1; end > 0; end--)    →  n-1 iterations",
          "    swap(arr[0], arr[end]);               →  O(1)",
          "    heapify(end, 0);                      →  O(log n) each",
          "",
          "T(n) = O(n)  [build]  +  O(n log n)  [n-1 extractions × O(log n)]"
        ],
        result: "T(n) = O(n log n)"
      },
      avg: {
        label: "Average Case",
        lines: [
          "Same two phases as best case — the heap property is restored by",
          "heapify() in O(log n) regardless of how the values are arranged.",
          "",
          "T(n) = O(n)  +  (n-1) × O(log n)"
        ],
        result: "T(n) = O(n log n)"
      },
      worst: {
        label: "Worst Case",
        lines: [
          "Even for an adversarial input, each heapify() call still only",
          "walks one root-to-leaf path, which has height ⌊log₂ n⌋.",
          "",
          "T(n) = O(n)  [build-heap]  +  (n-1) × O(log n)  [extractions]"
        ],
        result: "T(n) = O(n log n)"
      }
    }
  }
};


/* =========================================================
   Algorithms 8–20 (added)
   ========================================================= */
ALGO_LIST.push("counting","radix","bucket","comb","cocktail","gnome","cycle","tim","tree","bitonic","pigeonhole","stooge","oddeven");

Object.assign(ALGO_DATA, {
  counting: {
    name: "Counting Sort", slug: "counting", stable: true, inPlace: false, comparisonBased: false,
    tagline: "Counts how many times each value occurs, then rebuilds the array from those counts.",
    description: "Counting Sort never compares two elements. It counts occurrences of every value in a count array, then writes each value back into the output as many times as it was counted. It is very fast when the range of values (k) is small.",
    howItWorks: [
      "Find the minimum and maximum values to size the count array.",
      "Scan the input once and increase the count of each value.",
      "Walk the count array from smallest to largest value.",
      "Write each value back into the array as many times as it was counted."
    ],
    pseudocode:
`function countingSort(arr):
    count = array of zeros (max - min + 1)
    for x in arr:
        count[x - min]++
    k = 0
    for v from 0 to max - min:
        while count[v] > 0:
            arr[k++] = v + min
            count[v]--
    return arr`,
    complexity: { best: "n+k", avg: "n+k", worst: "n+k", space: "n+k" }
  },
  radix: {
    name: "Radix Sort", slug: "radix", stable: true, inPlace: false, comparisonBased: false,
    tagline: "Sorts numbers digit by digit, from the least significant digit to the most.",
    description: "Radix Sort (LSD) groups the numbers into 10 buckets by their ones digit, collects them back in bucket order, then repeats for the tens digit, hundreds digit, and so on. Because each pass is stable, the array is fully sorted after the last digit.",
    howItWorks: [
      "Find the largest number to know how many digits to process.",
      "Distribute every number into buckets 0–9 by the current digit.",
      "Collect the buckets in order 0 to 9 back into the array.",
      "Move to the next digit and repeat until all digits are done."
    ],
    pseudocode:
`function radixSort(arr):
    for exp = 1; max / exp > 0; exp *= 10:
        buckets = 10 empty lists
        for x in arr:
            buckets[(x / exp) % 10].add(x)
        arr = buckets joined in order 0..9
    return arr`,
    complexity: { best: "nk", avg: "nk", worst: "nk", space: "n+k" }
  },
  bucket: {
    name: "Bucket Sort", slug: "bucket", stable: true, inPlace: false, comparisonBased: false,
    tagline: "Spreads values into range-based buckets, sorts each bucket, then joins them.",
    description: "Bucket Sort splits the value range into equal-sized buckets and drops each element into its bucket. Each small bucket is sorted on its own (the visualizer sorts each bucket directly), then the buckets are concatenated in order. It works best when values are spread evenly.",
    howItWorks: [
      "Create about √n empty buckets covering the value range.",
      "Place each element into the bucket its value falls into.",
      "Sort every bucket individually.",
      "Concatenate the buckets from first to last."
    ],
    pseudocode:
`function bucketSort(arr):
    create b empty buckets over [min, max]
    for x in arr:
        bucket[index(x)].add(x)
    for each bucket:
        sort(bucket)
    return all buckets joined in order`,
    complexity: { best: "n+k", avg: "n+k", worst: "n²", space: "n+k" }
  },
  comb: {
    name: "Comb Sort", slug: "comb", stable: false, inPlace: true, comparisonBased: true,
    tagline: "Bubble Sort with a shrinking gap, so far-apart out-of-place values move quickly.",
    description: "Comb Sort improves Bubble Sort by comparing elements that are a gap apart instead of neighbours. The gap starts at the array size and shrinks by a factor of 1.3 each pass, until it reaches 1 and the array is nearly sorted.",
    howItWorks: [
      "Start with gap = array size.",
      "Shrink the gap by dividing by 1.3 (minimum 1).",
      "Compare elements gap apart and swap if out of order.",
      "Repeat until the gap is 1 and a pass makes no swaps."
    ],
    pseudocode:
`function combSort(arr):
    gap = length(arr); swapped = true
    while gap > 1 or swapped:
        gap = max(1, floor(gap / 1.3))
        swapped = false
        for i from 0 to n - gap - 1:
            if arr[i] > arr[i+gap]:
                swap(arr[i], arr[i+gap]); swapped = true
    return arr`,
    complexity: { best: "n log n", avg: "n²", worst: "n²", space: "1" }
  },
  cocktail: {
    name: "Cocktail Shaker Sort", slug: "cocktail", stable: true, inPlace: true, comparisonBased: true,
    tagline: "Bubble Sort in both directions: the largest goes right, then the smallest goes left.",
    description: "Cocktail Shaker Sort is a two-way Bubble Sort. A forward pass pushes the largest unsorted element to the right end, then a backward pass pulls the smallest unsorted element to the left end. Both ends of the array shrink each round.",
    howItWorks: [
      "Do a forward pass, swapping adjacent out-of-order pairs.",
      "The largest element now sits at the right end and is locked.",
      "Do a backward pass, swapping adjacent out-of-order pairs.",
      "The smallest element sits at the left end and is locked; repeat until no swaps."
    ],
    pseudocode:
`function cocktailSort(arr):
    lo = 0; hi = n - 1; swapped = true
    while swapped and lo < hi:
        swapped = false
        for i from lo to hi-1: compare and swap arr[i], arr[i+1]
        hi--
        for i from hi down to lo+1: compare and swap arr[i-1], arr[i]
        lo++
    return arr`,
    complexity: { best: "n", avg: "n²", worst: "n²", space: "1" }
  },
  gnome: {
    name: "Gnome Sort", slug: "gnome", stable: true, inPlace: true, comparisonBased: true,
    tagline: "Steps forward when in order, and steps back while swapping when out of order.",
    description: "Gnome Sort works like a garden gnome sorting flower pots. It looks at the pot next to it: if the two are in order it steps forward, otherwise it swaps them and steps back. It is very simple, with only one loop.",
    howItWorks: [
      "Start at position 0 and move to position 1.",
      "If the previous element is not larger, step forward.",
      "Otherwise swap the two elements and step back one position.",
      "Finish when the gnome walks off the end of the array."
    ],
    pseudocode:
`function gnomeSort(arr):
    i = 0
    while i < length(arr):
        if i == 0 or arr[i-1] <= arr[i]:
            i++
        else:
            swap(arr[i-1], arr[i]); i--
    return arr`,
    complexity: { best: "n", avg: "n²", worst: "n²", space: "1" }
  },
  cycle: {
    name: "Cycle Sort", slug: "cycle", stable: false, inPlace: true, comparisonBased: true,
    tagline: "Puts every element straight into its final position, using the fewest possible writes.",
    description: "Cycle Sort counts how many elements are smaller than an item to find its exact final position, then writes it there and picks up the element it displaced. This continues around a cycle until it returns to the start. It makes the minimum number of memory writes, which matters for flash memory.",
    howItWorks: [
      "Take the item at the cycle start.",
      "Count the smaller elements to its right to find its final position.",
      "Write the item there and pick up the element that was displaced.",
      "Repeat with the displaced element until the cycle returns to the start."
    ],
    pseudocode:
`function cycleSort(arr):
    for start from 0 to n-2:
        item = arr[start]
        pos = start + count of arr[i] < item, i > start
        if pos == start: continue
        skip duplicates; swap item with arr[pos]
        while pos != start:
            pos = start + count of arr[i] < item
            skip duplicates; swap item with arr[pos]
    return arr`,
    complexity: { best: "n²", avg: "n²", worst: "n²", space: "1" }
  },
  tim: {
    name: "Tim Sort", slug: "tim", stable: true, inPlace: false, comparisonBased: true,
    tagline: "Insertion-sorts small runs, then merges the runs like Merge Sort.",
    description: "Tim Sort is the hybrid used by Python and Java. It cuts the array into small runs, sorts each run with Insertion Sort (fast on small data), then merges the runs in doubling sizes. This visualizer uses a run size of 4.",
    howItWorks: [
      "Split the array into runs of 4 elements.",
      "Sort each run using Insertion Sort.",
      "Merge neighbouring runs into runs of 8, then 16, and so on.",
      "Stop when a single run covers the whole array."
    ],
    pseudocode:
`function timSort(arr):
    RUN = 4
    for start from 0 to n step RUN:
        insertionSort(arr, start, min(start+RUN, n))
    for size = RUN; size < n; size *= 2:
        for lo from 0 to n step 2*size:
            merge(arr, lo, lo+size, min(lo+2*size, n))
    return arr`,
    complexity: { best: "n", avg: "n log n", worst: "n log n", space: "n" }
  },
  tree: {
    name: "Tree Sort", slug: "tree", stable: true, inPlace: false, comparisonBased: true,
    tagline: "Inserts every element into a binary search tree, then reads it back in order.",
    description: "Tree Sort builds a Binary Search Tree by inserting the elements one at a time (smaller values go left, others go right). An in-order traversal of the tree then visits the values in sorted order. It is slow if the tree becomes lopsided.",
    howItWorks: [
      "Make the first element the root of the tree.",
      "Insert each next element: go left if smaller, right otherwise.",
      "Do an in-order traversal: left subtree, node, right subtree.",
      "Write the values back into the array in that order."
    ],
    pseudocode:
`function treeSort(arr):
    root = null
    for x in arr:
        root = insert(root, x)
    k = 0
    inorder(root):
        inorder(node.left)
        arr[k++] = node.value
        inorder(node.right)
    return arr`,
    complexity: { best: "n log n", avg: "n log n", worst: "n²", space: "n" }
  },
  bitonic: {
    name: "Bitonic Sort", slug: "bitonic", stable: false, inPlace: true, comparisonBased: true,
    tagline: "Builds bitonic sequences, then merges them with fixed compare-and-swap patterns.",
    description: "Bitonic Sort sorts the two halves in opposite directions to form a bitonic sequence (up then down), then merges it with a fixed pattern of compare-and-swap operations. The pattern does not depend on the data, which makes it popular for parallel hardware. This version works for any array size.",
    howItWorks: [
      "Split the array in half recursively.",
      "Sort the first half ascending and the second half descending.",
      "Compare elements half a block apart and swap them into order.",
      "Recursively merge each half the same way until the block is sorted."
    ],
    pseudocode:
`function bitonicSort(lo, n, up):
    if n > 1:
        m = n / 2
        bitonicSort(lo, m, not up)
        bitonicSort(lo+m, n-m, up)
        bitonicMerge(lo, n, up)

function bitonicMerge(lo, n, up):
    if n > 1:
        m = largest power of 2 less than n
        for i from lo to lo+n-m-1: compareSwap(i, i+m, up)
        bitonicMerge(lo, m, up); bitonicMerge(lo+m, n-m, up)`,
    complexity: { best: "n log²n", avg: "n log²n", worst: "n log²n", space: "log n" }
  },
  pigeonhole: {
    name: "Pigeonhole Sort", slug: "pigeonhole", stable: true, inPlace: false, comparisonBased: false,
    tagline: "Gives every possible value its own hole, drops elements in, then reads the holes in order.",
    description: "Pigeonhole Sort makes one hole for every value between the minimum and maximum. Each element is dropped into the hole for its value, then the holes are emptied in order back into the array. It suits data where the number of values is close to the number of elements.",
    howItWorks: [
      "Find the minimum and maximum to get the number of holes.",
      "Drop each element into the hole matching its value.",
      "Go through the holes from first to last.",
      "Write every element from each hole back into the array."
    ],
    pseudocode:
`function pigeonholeSort(arr):
    holes = (max - min + 1) empty lists
    for x in arr:
        holes[x - min].add(x)
    k = 0
    for each hole in order:
        for x in hole: arr[k++] = x
    return arr`,
    complexity: { best: "n+k", avg: "n+k", worst: "n+k", space: "n+k" }
  },
  stooge: {
    name: "Stooge Sort", slug: "stooge", stable: false, inPlace: true, comparisonBased: true,
    tagline: "A deliberately slow recursive sort: fix the ends, then sort 2/3 of the array three times.",
    description: "Stooge Sort swaps the first and last elements if they are out of order, then recursively sorts the first two-thirds, the last two-thirds, and the first two-thirds again. It is correct but very slow, so the visualizer limits arrays to 16 elements.",
    howItWorks: [
      "If the first element is bigger than the last, swap them.",
      "If the range has 3 or more elements, take t = one third of its length.",
      "Recursively sort the first 2/3, then the last 2/3, then the first 2/3 again.",
      "Stop when a range has 1 or 2 elements."
    ],
    pseudocode:
`function stoogeSort(arr, l, h):
    if l >= h: return
    if arr[l] > arr[h]: swap(arr[l], arr[h])
    if h - l + 1 > 2:
        t = (h - l + 1) / 3
        stoogeSort(arr, l, h - t)
        stoogeSort(arr, l + t, h)
        stoogeSort(arr, l, h - t)`,
    complexity: { best: "n^2.71", avg: "n^2.71", worst: "n^2.71", space: "log n" }
  },
  oddeven: {
    name: "Odd-Even Sort", slug: "oddeven", stable: true, inPlace: true, comparisonBased: true,
    tagline: "Alternates between comparing odd-indexed pairs and even-indexed pairs until sorted.",
    description: "Odd-Even Sort (Brick Sort) is a Bubble Sort variant. Each round has two phases: compare and swap all pairs starting at odd indices, then all pairs starting at even indices. Pairs within a phase do not overlap, so it suits parallel processors.",
    howItWorks: [
      "Odd phase: compare pairs (1,2), (3,4), (5,6)… and swap if out of order.",
      "Even phase: compare pairs (0,1), (2,3), (4,5)… and swap if out of order.",
      "Repeat both phases as one round.",
      "Stop when a full round makes no swaps."
    ],
    pseudocode:
`function oddEvenSort(arr):
    sorted = false
    while not sorted:
        sorted = true
        for i = 1; i < n-1; i += 2: compare and swap arr[i], arr[i+1]
        for i = 0; i < n-1; i += 2: compare and swap arr[i], arr[i+1]
        (set sorted = false if any swap happened)
    return arr`,
    complexity: { best: "n", avg: "n²", worst: "n²", space: "1" }
  }
});
