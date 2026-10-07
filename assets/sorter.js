/* =========================================================
   SortLab — step recorder
   Runs each algorithm once and records every comparison,
   swap, overwrite, pivot-mark, and sorted-mark as a step,
   so the visualizer can play forward AND backward through
   the exact same recorded history.
   ========================================================= */

function recordSortSteps(inputArr, algo){
  const a = inputArr.slice();
  const steps = [];

  function compare(i, j){ steps.push({ type:'compare', i, j }); }
  function swap(i, j){
    steps.push({ type:'swap', i, j });
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  function overwrite(i, value){
    steps.push({ type:'overwrite', i, value });
    a[i] = value;
  }
  function markSorted(i){ steps.push({ type:'sorted', i }); }
  function markPivot(i){ steps.push({ type:'pivot', i }); }
  function markGap(value){ steps.push({ type:'gap', value }); }

  if (algo === 'bubble'){
    const n = a.length;
    for (let i=0;i<n-1;i++){
      for (let j=0;j<n-1-i;j++){
        compare(j, j+1);
        if (a[j] > a[j+1]) swap(j, j+1);
      }
      markSorted(n-1-i);
    }
    markSorted(0);
  }

  else if (algo === 'selection'){
    const n = a.length;
    for (let i=0;i<n-1;i++){
      let minIdx = i;
      markPivot(minIdx);
      for (let j=i+1;j<n;j++){
        compare(minIdx, j);
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== i) swap(i, minIdx);
      markSorted(i);
    }
    markSorted(n-1);
  }

  else if (algo === 'insertion'){
    const n = a.length;
    markSorted(0);
    for (let i=1;i<n;i++){
      let j = i;
      while (j > 0){
        compare(j-1, j);
        if (a[j-1] > a[j]){ swap(j-1, j); j--; }
        else break;
      }
      for (let k=0;k<=i;k++) markSorted(k);
    }
  }

  else if (algo === 'shell'){
    const n = a.length;
    for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)){
      markGap(gap);
      for (let i = gap; i < n; i++){
        let j = i;
        while (j >= gap){
          compare(j - gap, j);
          if (a[j - gap] > a[j]){ swap(j - gap, j); j -= gap; }
          else break;
        }
      }
    }
    for (let i=0;i<n;i++) markSorted(i);
  }

  else if (algo === 'merge'){
    function mergeSort(lo, hi){
      if (hi - lo <= 1) return;
      const mid = Math.floor((lo+hi)/2);
      mergeSort(lo, mid);
      mergeSort(mid, hi);
      const left = a.slice(lo, mid);
      const right = a.slice(mid, hi);
      let i=0, j=0, k=lo;
      while (i < left.length && j < right.length){
        compare(lo+i, mid+j);
        if (left[i] <= right[j]) overwrite(k++, left[i++]);
        else overwrite(k++, right[j++]);
      }
      while (i < left.length) overwrite(k++, left[i++]);
      while (j < right.length) overwrite(k++, right[j++]);
    }
    mergeSort(0, a.length);
    for (let i=0;i<a.length;i++) markSorted(i);
  }

  else if (algo === 'quick'){
    function partition(lo, hi){
      const pivotVal = a[hi];
      markPivot(hi);
      let i = lo - 1;
      for (let j=lo;j<hi;j++){
        compare(j, hi);
        if (a[j] < pivotVal){ i++; if (i!==j) swap(i, j); }
      }
      if (i+1 !== hi) swap(i+1, hi);
      return i+1;
    }
    function quickSort(lo, hi){
      if (lo >= hi){ if (lo === hi) markSorted(lo); return; }
      const p = partition(lo, hi);
      markSorted(p);
      quickSort(lo, p-1);
      quickSort(p+1, hi);
    }
    quickSort(0, a.length-1);
  }

  else if (algo === 'heap'){
    const n = a.length;
    function heapify(size, root){
      let largest = root, l = 2*root+1, r = 2*root+2;
      if (l < size){ compare(l, largest); if (a[l] > a[largest]) largest = l; }
      if (r < size){ compare(r, largest); if (a[r] > a[largest]) largest = r; }
      if (largest !== root){ swap(root, largest); heapify(size, largest); }
    }
    for (let i = Math.floor(n/2)-1; i>=0; i--) heapify(n, i);
    for (let end = n-1; end>0; end--){
      swap(0, end);
      markSorted(end);
      heapify(end, 0);
    }
    markSorted(0);
  }

  else if (algo === 'counting'){
    const n = a.length, mn = Math.min(...a), mx = Math.max(...a);
    const cnt = new Array(mx - mn + 1).fill(0);
    for (let i=0;i<n;i++){ markPivot(i); cnt[a[i]-mn]++; }
    let k = 0;
    for (let v=0; v<cnt.length; v++) while (cnt[v]-- > 0){ overwrite(k, v+mn); markSorted(k++); }
  }

  else if (algo === 'radix'){
    const n = a.length, mx = Math.max(...a);
    for (let exp=1; Math.floor(mx/exp) > 0; exp*=10){
      const buckets = Array.from({length:10}, () => []);
      for (let i=0;i<n;i++){ markPivot(i); buckets[Math.floor(a[i]/exp)%10].push(a[i]); }
      let k = 0;
      buckets.forEach(b => b.forEach(v => overwrite(k++, v)));
    }
    for (let i=0;i<n;i++) markSorted(i);
  }

  else if (algo === 'bucket'){
    const n = a.length, mn = Math.min(...a), mx = Math.max(...a);
    const bc = Math.max(2, Math.round(Math.sqrt(n))), size = (mx - mn + 1) / bc;
    const buckets = Array.from({length:bc}, () => []);
    for (let i=0;i<n;i++){ markPivot(i); buckets[Math.min(bc-1, Math.floor((a[i]-mn)/size))].push(a[i]); }
    buckets.forEach(b => b.sort((x,y) => x-y));
    let k = 0;
    buckets.forEach(b => b.forEach(v => { overwrite(k, v); markSorted(k++); }));
  }

  else if (algo === 'comb'){
    const n = a.length;
    let gap = n, swapped = true;
    while (gap > 1 || swapped){
      gap = Math.max(1, Math.floor(gap/1.3)); markGap(gap); swapped = false;
      for (let i=0; i+gap<n; i++){
        compare(i, i+gap);
        if (a[i] > a[i+gap]){ swap(i, i+gap); swapped = true; }
      }
    }
    for (let i=0;i<n;i++) markSorted(i);
  }

  else if (algo === 'cocktail'){
    let lo = 0, hi = a.length-1, sw = true;
    while (sw && lo < hi){
      sw = false;
      for (let i=lo;i<hi;i++){ compare(i, i+1); if (a[i] > a[i+1]){ swap(i, i+1); sw = true; } }
      markSorted(hi--);
      for (let i=hi;i>lo;i--){ compare(i-1, i); if (a[i-1] > a[i]){ swap(i-1, i); sw = true; } }
      markSorted(lo++);
    }
    for (let i=0;i<a.length;i++) markSorted(i);
  }

  else if (algo === 'gnome'){
    let i = 0;
    while (i < a.length){
      if (i === 0){ i++; continue; }
      compare(i-1, i);
      if (a[i-1] <= a[i]) i++; else { swap(i-1, i); i--; }
    }
    for (let k=0;k<a.length;k++) markSorted(k);
  }

  else if (algo === 'cycle'){
    const n = a.length;
    const rank = (cs, item) => { let p = cs; for (let i=cs+1;i<n;i++){ compare(i, cs); if (a[i] < item) p++; } return p; };
    for (let cs=0; cs<n-1; cs++){
      let item = a[cs];
      markPivot(cs);
      let pos = rank(cs, item);
      if (pos === cs){ markSorted(cs); continue; }
      while (item === a[pos]) pos++;
      let t = a[pos]; overwrite(pos, item); item = t;
      while (pos !== cs){
        pos = rank(cs, item);
        while (item === a[pos]) pos++;
        t = a[pos]; overwrite(pos, item); item = t;
      }
      markSorted(cs);
    }
    for (let i=0;i<n;i++) markSorted(i);
  }

  else if (algo === 'tim'){
    const n = a.length, RUN = 4;
    for (let s=0; s<n; s+=RUN){
      const e = Math.min(s+RUN, n);
      for (let i=s+1;i<e;i++){
        let j = i;
        while (j > s){ compare(j-1, j); if (a[j-1] > a[j]){ swap(j-1, j); j--; } else break; }
      }
    }
    for (let sz=RUN; sz<n; sz*=2){
      for (let lo=0; lo<n; lo+=2*sz){
        const mid = lo+sz, hi = Math.min(lo+2*sz, n);
        if (mid >= hi) continue;
        const L = a.slice(lo, mid), R = a.slice(mid, hi);
        let i=0, j=0, k=lo;
        while (i<L.length && j<R.length){
          compare(lo+i, mid+j);
          if (L[i] <= R[j]) overwrite(k++, L[i++]); else overwrite(k++, R[j++]);
        }
        while (i<L.length) overwrite(k++, L[i++]);
        while (j<R.length) overwrite(k++, R[j++]);
      }
    }
    for (let i=0;i<n;i++) markSorted(i);
  }

  else if (algo === 'tree'){
    const orig = a.slice();
    const mk = i => ({ v: orig[i], i, l: null, r: null });
    let root = mk(0);
    const ins = (node, i) => {
      compare(i, node.i);
      const c = orig[i] < node.v ? 'l' : 'r';
      if (node[c]) ins(node[c], i); else node[c] = mk(i);
    };
    for (let i=1;i<orig.length;i++) ins(root, i);
    let k = 0;
    const walk = nd => { if (!nd) return; walk(nd.l); overwrite(k, nd.v); markSorted(k++); walk(nd.r); };
    walk(root);
  }

  else if (algo === 'bitonic'){
    const gp = m => { let k = 1; while (k < m) k <<= 1; return k >> 1; };
    const cx = (i, j, up) => { compare(i, j); if (up ? a[i] > a[j] : a[i] < a[j]) swap(i, j); };
    const bmerge = (lo, n, up) => {
      if (n <= 1) return;
      const m = gp(n);
      for (let i=lo; i<lo+n-m; i++) cx(i, i+m, up);
      bmerge(lo, m, up); bmerge(lo+m, n-m, up);
    };
    const bsort = (lo, n, up) => {
      if (n <= 1) return;
      const m = Math.floor(n/2);
      bsort(lo, m, !up); bsort(lo+m, n-m, up);
      bmerge(lo, n, up);
    };
    bsort(0, a.length, true);
    for (let i=0;i<a.length;i++) markSorted(i);
  }

  else if (algo === 'pigeonhole'){
    const n = a.length, mn = Math.min(...a), mx = Math.max(...a);
    const holes = Array.from({length: mx-mn+1}, () => []);
    for (let i=0;i<n;i++){ markPivot(i); holes[a[i]-mn].push(a[i]); }
    let k = 0;
    holes.forEach(h => h.forEach(v => { overwrite(k, v); markSorted(k++); }));
  }

  else if (algo === 'stooge'){
    const st = (l, h) => {
      if (l >= h) return;
      compare(l, h);
      if (a[l] > a[h]) swap(l, h);
      if (h - l + 1 > 2){
        const t = Math.floor((h - l + 1) / 3);
        st(l, h-t); st(l+t, h); st(l, h-t);
      }
    };
    st(0, a.length-1);
    for (let i=0;i<a.length;i++) markSorted(i);
  }

  else if (algo === 'oddeven'){
    const n = a.length;
    let done = false;
    while (!done){
      done = true;
      for (let p=1; p>=0; p--)
        for (let i=p; i+1<n; i+=2){
          compare(i, i+1);
          if (a[i] > a[i+1]){ swap(i, i+1); done = false; }
        }
    }
    for (let i=0;i<n;i++) markSorted(i);
  }

  return steps;
}

function stepLogLine(step){
  switch(step.type){
    case 'compare':   return { kind:'cmp', tag:'CMP',  text:`comparing arr[${step.i}] and arr[${step.j}]` };
    case 'swap':       return { kind:'swp', tag:'SWP',  text:`swapping arr[${step.i}] and arr[${step.j}]` };
    case 'overwrite':  return { kind:'ovw', tag:'SET',  text:`arr[${step.i}] = ${step.value}` };
    case 'sorted':     return { kind:'srt', tag:'DONE', text:`arr[${step.i}] locked in position` };
    case 'pivot':      return { kind:'piv', tag:'REF',  text:`selecting arr[${step.i}] as reference` };
    case 'gap':        return { kind:'gap', tag:'GAP',  text:`gap size set to ${step.value}` };
    default:           return { kind:'',    tag:'',     text:'' };
  }
}

/* =========================================================
   SortLab — merge sort recursion tree
   Builds the full divide/merge recursion tree for Merge Sort
   specifically, so the visualizer can draw it as a diagram
   (divide arrows going down to single elements, merge arrows
   coming back down combining sorted halves) instead of the
   generic single-row array view used by the other algorithms.
   Uses half-open ranges [lo, hi) throughout, matching the
   recordSortSteps merge-sort implementation above.
   ========================================================= */
function buildMergeTree(inputArr){
  const a = inputArr.slice();
  let nextId = 0;

  function build(lo, hi){
    const node = {
      id: nextId++,
      lo, hi,
      values: a.slice(lo, hi),   // slice as it looks at divide time (still unsorted)
      mid: null,
      left: null,
      right: null,
      mergedValues: null,       // slice once this node's merge has completed
      comparisons: []           // one entry per comparison made while merging this node
    };

    if (hi - lo <= 1){
      node.mergedValues = node.values.slice();
      return node;
    }

    const mid = Math.floor((lo + hi) / 2);
    node.mid = mid;
    node.left = build(lo, mid);
    node.right = build(mid, hi);

    const left = node.left.mergedValues;
    const right = node.right.mergedValues;
    const merged = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length){
      const pick = left[i] <= right[j] ? 'L' : 'R';
      node.comparisons.push({ a:left[i], b:right[j], pick });
      merged.push(pick === 'L' ? left[i++] : right[j++]);
    }
    while (i < left.length) merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);
    node.mergedValues = merged;
    return node;
  }

  return build(0, a.length);
}

/* =========================================================
   SortLab — quick sort recursion tree
   Builds the full partition recursion tree for Quick Sort,
   using the "first element as pivot, start/end scan inward,
   swap-and-continue, final pivot swap" scheme (matches the
   user's worked example exactly). Uses INCLUSIVE ranges
   [lo, hi] throughout (unlike the merge tree's half-open
   ranges), since that matches this partition style.
   ========================================================= */
function buildQuickTree(inputArr){
  const a = inputArr.slice();
  let nextId = 0;

  function partition(lo, hi){
    const pivot = a[lo];
    let start = lo + 1, end = hi;
    while (true){
      while (start <= end && a[start] <= pivot) start++;
      while (end > lo && a[end] > pivot) end--;
      if (start < end){
        const tmp = a[start]; a[start] = a[end]; a[end] = tmp;
        start++; end--;
      } else {
        break;
      }
    }
    const tmp = a[lo]; a[lo] = a[end]; a[end] = tmp;
    return end; // pivot's final, locked-in index
  }

  function build(lo, hi){
    const node = {
      id: nextId++,
      lo, hi,                    // inclusive range
      values: a.slice(lo, hi + 1), // snapshot as it looks BEFORE this range is partitioned
      pivotValue: null,
      pivotIndex: null,
      left: null,
      right: null
    };

    if (lo >= hi){
      return node; // 0 or 1 element — trivially sorted, no partition needed
    }

    node.pivotValue = a[lo];
    const p = partition(lo, hi);
    node.pivotIndex = p;
    if (p - 1 >= lo) node.left = build(lo, p - 1);
    if (p + 1 <= hi) node.right = build(p + 1, hi);
    return node;
  }

  const root = build(0, a.length - 1);
  return { root, sortedArray: a.slice() }; // `a` is now fully sorted in place
}

/* =========================================================
   SortLab — heap sort "Creation" stage
   Builds the max-heap by INSERTING elements one at a time, in
   original array order, sifting each new node up past its
   parent while it's strictly greater — this is the incremental
   insertion-based construction method (distinct from the
   heapify-from-the-middle method used by the flat step list),
   matching the user's worked example exactly.
   ========================================================= */
function buildHeapCreationStages(inputArr){
  const heap = [];
  const stages = [];

  for (let k = 0; k < inputArr.length; k++){
    const value = inputArr[k];
    heap.push(value);
    let idx = heap.length - 1;
    const swaps = [];
    while (idx > 0){
      const parentIdx = Math.floor((idx - 1) / 2);
      if (heap[idx] > heap[parentIdx]){
        swaps.push({ childIndex: idx, parentIndex: parentIdx, childVal: heap[idx], parentVal: heap[parentIdx] });
        const tmp = heap[idx]; heap[idx] = heap[parentIdx]; heap[parentIdx] = tmp;
        idx = parentIdx;
      } else {
        break;
      }
    }
    stages.push({
      insertedIndex: k,
      insertedValue: value,
      swaps,
      snapshot: heap.slice()
    });
  }

  return stages;
}

/* =========================================================
   SortLab — heap sort "Extraction" stage (stage 2 of 2)
   Repeatedly removes the root (the max), swaps it with the
   last active element, shrinks the heap by one, then sifts
   the new root down to restore the max-heap property —
   matches the user's worked example exactly (root=30 swaps
   with last=15, 30 locks in at the final index).
   ========================================================= */
function buildHeapExtractionStages(heapAfterCreation){
  const a = heapAfterCreation.slice();
  const n = a.length;
  const stages = [];

  function siftDown(size, root){
    const swaps = [];
    let idx = root;
    while (true){
      let largest = idx;
      const l = 2 * idx + 1, r = 2 * idx + 2;
      if (l < size && a[l] > a[largest]) largest = l;
      if (r < size && a[r] > a[largest]) largest = r;
      if (largest === idx) break;
      swaps.push({ from: idx, to: largest });
      const tmp = a[idx]; a[idx] = a[largest]; a[largest] = tmp;
      idx = largest;
    }
    return swaps;
  }

  for (let activeSize = n; activeSize > 1; activeSize--){
    const beforeSnapshot = a.slice(0, activeSize);
    const rootVal = a[0];
    const lastVal = a[activeSize - 1];
    const tmp = a[0]; a[0] = a[activeSize - 1]; a[activeSize - 1] = tmp;
    const sortedIndex = activeSize - 1;
    const siftSwaps = siftDown(activeSize - 1, 0);
    const afterSnapshot = a.slice(0, activeSize - 1);
    stages.push({
      activeSizeBefore: activeSize,
      beforeSnapshot,
      rootVal,
      lastVal,
      sortedIndex,
      afterSnapshot,
      siftSwaps
    });
  }

  return { stages, sortedArray: a.slice() };
}

/* =========================================================
   SortLab — Tim Sort run/merge tree
   Same node shape as buildMergeTree (half-open [lo, hi)), but
   leaves are RUNS of up to 4 elements sorted by insertion sort,
   and internal nodes merge two neighbouring runs. Split points
   are multiples of the run size, matching the bottom-up merges
   recorded by recordSortSteps('tim').
   ========================================================= */
function buildTimTree(inputArr){
  const RUN = 4;
  const a = inputArr.slice();
  let nextId = 0;

  function build(lo, hi){
    const node = { id: nextId++, lo, hi, values: a.slice(lo, hi), mid: null,
                   left: null, right: null, mergedValues: null, isRun: false };
    if (hi - lo <= RUN){
      node.isRun = true;
      node.mergedValues = node.values.slice().sort((x, y) => x - y);
      return node;
    }
    let sz = RUN;
    while (sz * 2 < hi - lo) sz *= 2;
    const mid = lo + sz;
    node.mid = mid;
    node.left = build(lo, mid);
    node.right = build(mid, hi);
    const L = node.left.mergedValues, R = node.right.mergedValues, m = [];
    let i = 0, j = 0;
    while (i < L.length && j < R.length) m.push(L[i] <= R[j] ? L[i++] : R[j++]);
    while (i < L.length) m.push(L[i++]);
    while (j < R.length) m.push(R[j++]);
    node.mergedValues = m;
    return node;
  }
  return build(0, a.length);
}
