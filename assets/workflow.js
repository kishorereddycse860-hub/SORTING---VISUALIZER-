/* =========================================================
   SortLab — "Working" diagrams (workflow.js)
   Hand-worked trace diagrams for the algorithms that do not
   already have their own tree / heap / gap diagram
   (merge, tim, quick, heap and shell keep theirs in visualizer.html).

   Three families:
     1) ARC TRACE   — one row per comparison, arc between the two
                      positions, grouped into passes
                      (bubble, selection, insertion, comb, cocktail,
                       gnome, oddeven, bitonic, stooge, cycle)
     2) DISTRIBUTION — buckets / counts / holes, then collect
                      (counting, pigeonhole, radix, bucket)
     3) TREE        — binary search tree growing, then in-order walk
                      (tree)

   Public API:  SortWorkflow.algos / .meta(algo) / .render(container, algo, arr)
   ========================================================= */

(function(){
  "use strict";

  const MAX_ROWS = 500;   // keeps the page fast for big arrays

  const AMBER  = ['var(--amber)',      'compared, no swap needed'];
  const RED    = ['var(--red-bar)',    'compared and swapped / written'];
  const VIOLET = ['var(--violet-bar)', 'reference item'];
  const GREEN  = ['var(--green)',      'sorted / final'];
  const BLUE   = ['var(--blue)',       'has elements'];

  const META = {
    bubble:    { title:'Bubble Sort · Pass-by-Pass Working',   sub:'— every comparison of each pass; the largest value settles at the end', legend:[AMBER,RED,GREEN] },
    selection: { title:'Selection Sort · Pass-by-Pass Working', sub:'— find the minimum of the unsorted part, then swap it into place', legend:[AMBER,RED,['var(--violet-bar)','current minimum'],GREEN] },
    insertion: { title:'Insertion Sort · Pass-by-Pass Working', sub:'— take the next element and slide it left into the sorted part', legend:[AMBER,RED,GREEN] },
    comb:      { title:'Comb Sort · Gap-by-Gap Passes',         sub:'— compare elements that are "gap" apart; the gap shrinks by 1.3 each round', legend:[AMBER,RED] },
    cocktail:  { title:'Cocktail Shaker Sort · Forward & Backward Passes', sub:'— bubble to the right, then bubble back to the left; both ends lock in', legend:[AMBER,RED,GREEN] },
    gnome:     { title:'Gnome Sort · Step-by-Step Walk',        sub:'— step forward if in order, otherwise swap and step back', legend:[AMBER,RED] },
    oddeven:   { title:'Odd-Even Sort · Phase-by-Phase Working', sub:'— odd pairs, then even pairs, repeated until a round has no swap', legend:[AMBER,RED] },
    bitonic:   { title:'Bitonic Sort · Compare-Exchange Layers', sub:'— each merge compares i with i+m, ascending ↑ or descending ↓', legend:[AMBER,RED] },
    stooge:    { title:'Stooge Sort · Recursive Calls',          sub:'— swap the ends, then sort the first 2/3, last 2/3, first 2/3 again', legend:[AMBER,RED] },
    cycle:     { title:'Cycle Sort · Cycle-by-Cycle Working',    sub:'— count smaller items to find the final position, then rotate the cycle', legend:[RED,VIOLET] },
    counting:  { title:'Counting Sort · Count Array & Rebuild',  sub:'— count how many times each value occurs, then write the values back in order', legend:[BLUE,GREEN] },
    pigeonhole:{ title:'Pigeonhole Sort · Holes & Collect',      sub:'— drop each element into its own hole, then read the holes in order', legend:[BLUE,GREEN] },
    radix:     { title:'Radix Sort · Digit-by-Digit Buckets',    sub:'— distribute by one digit (ones, tens, …), collect buckets 0→9, repeat', legend:[['var(--amber)','current digit'],GREEN] },
    bucket:    { title:'Bucket Sort · Distribute, Sort, Concatenate', sub:'— spread values into range buckets, sort each bucket, join them', legend:[BLUE,GREEN] },
    tree:      { title:'Tree Sort · Binary Search Tree',         sub:'— insert every element into a BST, then read it in-order', legend:[['#FF9552','search path'],['#FF6B6B','newly inserted'],GREEN] }
  };
  const ALGOS = Object.keys(META);

  /* ------------------------------------------------------------------
     1) ARC TRACE builders  →  { groups:[{header,events,done,note?}], sorted }
        event = { from,to,kind:'swap'|'compare'|'newmin',snapshot,label,sorted?,pivot? }
     ------------------------------------------------------------------ */
  const str = a => `[ ${a.join(', ')} ]`;
  const plural = (n, w) => `${n} ${w}${n !== 1 ? 's' : ''}`;

  function buildArc(algo, arr){
    const a = arr.slice(), n = a.length, groups = [];
    const swp = (i, j) => { const t = a[i]; a[i] = a[j]; a[j] = t; };

    if (algo === 'bubble'){
      for (let i = 0; i < n - 1; i++){
        const events = [], sorted = new Set();
        for (let k = n - i; k < n; k++) sorted.add(k);
        for (let j = 0; j < n - 1 - i; j++){
          const before = a.slice(), sw = a[j] > a[j+1];
          if (sw) swp(j, j+1);
          events.push({ from:j, to:j+1, kind: sw ? 'swap' : 'compare', snapshot:before, sorted,
            label: sw ? `swap (${before[j]} > ${before[j+1]})` : 'in order, no swap' });
        }
        const sc = events.filter(e => e.kind === 'swap').length;
        groups.push({ header:`Pass ${i+1} — ${plural(events.length,'comparison')}, ${plural(sc,'swap')}`, events,
          done:`Pass completed — ${a[n-1-i]} settled at position ${n-1-i}. Array now: ${str(a)}` });
      }
    }

    else if (algo === 'selection'){
      for (let i = 0; i < n - 1; i++){
        const events = [], sorted = new Set();
        for (let k = 0; k < i; k++) sorted.add(k);
        let minIdx = i;
        for (let j = i + 1; j < n; j++){
          const before = a.slice(), found = a[j] < a[minIdx];
          events.push({ from:minIdx, to:j, kind: found ? 'newmin' : 'compare', snapshot:before, sorted, pivot:minIdx,
            label: found ? `${a[j]} < ${a[minIdx]} → new minimum at index ${j}` : `${a[j]} ≥ ${a[minIdx]}, minimum unchanged` });
          if (found) minIdx = j;
        }
        if (minIdx !== i){
          const before = a.slice();
          swp(i, minIdx);
          events.push({ from:i, to:minIdx, kind:'swap', snapshot:before, sorted,
            label:`swap arr[${i}] with minimum ${before[minIdx]}` });
        }
        groups.push({ header:`Pass ${i+1} — find the minimum of positions ${i}…${n-1}`, events,
          done:`Pass completed — ${a[i]} placed at position ${i}. Array now: ${str(a)}` });
      }
    }

    else if (algo === 'insertion'){
      for (let i = 1; i < n; i++){
        const events = [], key = a[i];
        let j = i;
        while (j > 0){
          const before = a.slice(), sorted = new Set();
          for (let k = 0; k <= i; k++) if (k !== j && k !== j - 1) sorted.add(k);
          const sw = a[j-1] > a[j];
          events.push({ from:j-1, to:j, kind: sw ? 'swap' : 'compare', snapshot:before, sorted,
            label: sw ? `swap (${a[j-1]} > ${a[j]})` : `${a[j-1]} ≤ ${a[j]}, stop here` });
          if (sw){ swp(j-1, j); j--; } else break;
        }
        groups.push({ header:`Pass ${i} — insert ${key} into the sorted part (positions 0…${i-1})`, events,
          done:`Pass completed — ${key} inserted at position ${j}. Array now: ${str(a)}` });
      }
    }

    else if (algo === 'comb'){
      let gap = n, swapped = true;
      while (gap > 1 || swapped){
        gap = Math.max(1, Math.floor(gap / 1.3));
        swapped = false;
        const events = [];
        for (let i = 0; i + gap < n; i++){
          const before = a.slice(), sw = a[i] > a[i+gap];
          if (sw){ swp(i, i+gap); swapped = true; }
          events.push({ from:i, to:i+gap, kind: sw ? 'swap' : 'compare', snapshot:before,
            label: sw ? `swap (${before[i]} > ${before[i+gap]})` : 'in order, no swap' });
        }
        const sc = events.filter(e => e.kind === 'swap').length;
        groups.push({ header:`Gap = ${gap} — ${plural(events.length,'comparison')}, ${plural(sc,'swap')}`, events,
          done:`Pass completed — array now: ${str(a)}` });
        if (n < 2) break;
      }
    }

    else if (algo === 'cocktail'){
      let lo = 0, hi = n - 1, sw = true, round = 1;
      const locked = new Set();
      while (sw && lo < hi){
        sw = false;
        let events = [];
        for (let i = lo; i < hi; i++){
          const before = a.slice(), s = a[i] > a[i+1];
          if (s){ swp(i, i+1); sw = true; }
          events.push({ from:i, to:i+1, kind: s ? 'swap' : 'compare', snapshot:before, sorted:new Set(locked),
            label: s ? `swap (${before[i]} > ${before[i+1]})` : 'in order, no swap' });
        }
        locked.add(hi);
        groups.push({ header:`Round ${round} · forward pass → (positions ${lo}…${hi})`, events,
          done:`Forward pass completed — ${a[hi]} locked at position ${hi}. Array now: ${str(a)}` });
        hi--;
        events = [];
        for (let i = hi; i > lo; i--){
          const before = a.slice(), s = a[i-1] > a[i];
          if (s){ swp(i-1, i); sw = true; }
          events.push({ from:i-1, to:i, kind: s ? 'swap' : 'compare', snapshot:before, sorted:new Set(locked),
            label: s ? `swap (${before[i-1]} > ${before[i]})` : 'in order, no swap' });
        }
        locked.add(lo);
        groups.push({ header:`Round ${round} · backward pass ← (positions ${hi}…${lo})`, events,
          done:`Backward pass completed — ${a[lo]} locked at position ${lo}. Array now: ${str(a)}` });
        lo++; round++;
      }
    }

    else if (algo === 'gnome'){
      let i = 0, maxI = 0, cur = null;
      while (i < n){
        if (i === 0){ i++; continue; }
        if (i > maxI || !cur){
          maxI = i;
          cur = { header:`Walk reaches index ${i} — carry ${a[i]} to its place`, events:[], done:'' };
          groups.push(cur);
        }
        const before = a.slice(), ok = a[i-1] <= a[i];
        cur.events.push({ from:i-1, to:i, kind: ok ? 'compare' : 'swap', snapshot:before,
          label: ok ? `${a[i-1]} ≤ ${a[i]} → in order, step forward` : `${a[i-1]} > ${a[i]} → swap, step back` });
        if (ok) i++; else { swp(i-1, i); i--; }
        cur.done = `Array now: ${str(a)}`;
      }
    }

    else if (algo === 'oddeven'){
      let done = false, round = 1;
      while (!done){
        done = true;
        for (const p of [1, 0]){
          const events = [];
          for (let i = p; i + 1 < n; i += 2){
            const before = a.slice(), sw = a[i] > a[i+1];
            if (sw){ swp(i, i+1); done = false; }
            events.push({ from:i, to:i+1, kind: sw ? 'swap' : 'compare', snapshot:before,
              label: sw ? `swap (${before[i]} > ${before[i+1]})` : 'in order, no swap' });
          }
          if (!events.length) continue;
          groups.push({ header:`Round ${round} · ${p === 1 ? 'odd' : 'even'} phase — pairs (${p},${p+1}), (${p+2},${p+3}) …`, events,
            done:`Phase completed — array now: ${str(a)}` });
        }
        round++;
      }
    }

    else if (algo === 'bitonic'){
      const gp = m => { let k = 1; while (k < m) k <<= 1; return k >> 1; };
      const bmerge = (lo, len, up) => {
        if (len <= 1) return;
        const m = gp(len), events = [];
        for (let i = lo; i < lo + len - m; i++){
          const before = a.slice(), sw = up ? a[i] > a[i+m] : a[i] < a[i+m];
          if (sw) swp(i, i+m);
          events.push({ from:i, to:i+m, kind: sw ? 'swap' : 'compare', snapshot:before,
            label: sw ? `swap (${up ? '↑' : '↓'} ${before[i]} vs ${before[i+m]})` : `already ${up ? 'ascending ↑' : 'descending ↓'}, no swap` });
        }
        groups.push({ header:`Merge [${lo}…${lo+len-1}] ${up ? 'ascending ↑' : 'descending ↓'} — compare i with i+${m}`, events,
          done:`Compare-exchange layer done — array now: ${str(a)}` });
        bmerge(lo, m, up); bmerge(lo + m, len - m, up);
      };
      const bsort = (lo, len, up) => {
        if (len <= 1) return;
        const m = Math.floor(len / 2);
        bsort(lo, m, !up); bsort(lo + m, len - m, up);
        bmerge(lo, len, up);
      };
      bsort(0, n, true);
    }

    else if (algo === 'stooge'){
      let collapsed = false;
      const st = (l, h, d) => {
        if (l >= h) return;
        const before = a.slice(), sw = a[l] > a[h];
        if (sw) swp(l, h);
        let g = null;
        if (d <= 3){
          g = { header:`${'↳ '.repeat(d)}sort [${l}…${h}] (depth ${d})`,
                events:[{ from:l, to:h, kind: sw ? 'swap' : 'compare', snapshot:before,
                  label: sw ? `swap ends (${before[l]} > ${before[h]})` : 'ends already in order' }], done:'' };
          groups.push(g);
        } else collapsed = true;
        if (h - l + 1 > 2){
          const t = Math.floor((h - l + 1) / 3);
          st(l, h - t, d + 1); st(l + t, h, d + 1); st(l, h - t, d + 1);
        }
        if (g) g.done = `Call finished — array now: ${str(a)}`;
      };
      st(0, n - 1, 0);
      if (collapsed && groups.length) groups[0].note = 'Calls deeper than depth 3 follow exactly the same rule and are collapsed here (they are still included in the "array now" lines).';
    }

    else if (algo === 'cycle'){
      const rank = (cs, item) => { let p = cs; for (let i = cs + 1; i < n; i++) if (a[i] < item) p++; return p; };
      for (let cs = 0; cs < n - 1; cs++){
        let item = a[cs];
        const start = item;
        let pos = rank(cs, item);
        if (pos === cs){
          groups.push({ header:`Cycle at index ${cs} — item ${start}`, events:[],
            done:`${start} is already in its correct position ${cs} (nothing smaller to its right)` });
          continue;
        }
        const events = [];
        let prev = cs;
        const place = () => {
          while (item === a[pos]) pos++;
          const before = a.slice(), t = a[pos];
          a[pos] = item;
          events.push({ from:prev, to:pos, kind:'swap', snapshot:before, pivot:cs,
            label:`${item} belongs at index ${pos} (${pos - cs} smaller to its right) → write it there, pick up ${t}` });
          prev = pos; item = t;
        };
        // first placement
        place();
        while (pos !== cs){
          pos = rank(cs, item);
          place();
        }
        groups.push({ header:`Cycle at index ${cs} — start with item ${start}`, events,
          done:`Cycle completed — array now: ${str(a)}` });
      }
    }

    return { groups, sorted: a.slice() };
  }

  /* ------------------------------------------------------------------
     DOM helpers
     ------------------------------------------------------------------ */
  function el(tag, cls, text){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function block(parent, header){
    const b = el('div', 'heap-stage-block');
    if (header) b.appendChild(el('div', 'heap-stage-header', header));
    parent.appendChild(b);
    return b;
  }
  function miniRow(values, cls){
    const row = el('div', 'tree-mini-array');
    values.forEach(v => row.appendChild(el('span', 'mini-box' + (cls ? ' ' + cls : ''), v)));
    return row;
  }
  function finalBlock(container, sorted, header){
    const b = block(container, header || 'Final result');
    b.appendChild(miniRow(sorted, 'sorted'));
    b.appendChild(el('div', 'shell-pass-done', 'sorted ✓'));
  }

  /* ---------------- ARC TRACE renderer ---------------- */
  function renderArc(container, algo, arr){
    const { groups, sorted } = buildArc(algo, arr);
    const jobs = [];
    let uid = 0;
    const COLORS = { swap:'#FF6B6B', compare:'#E2662D', newmin:'#A78BFA' };

    function drawRow(parent, ev){
      const wrap = el('div', 'shell-gap-canvas');
      const row = el('div', 'tree-mini-array');
      const boxes = {};
      ev.snapshot.forEach((v, i) => {
        const b = el('span', 'mini-box', v);
        if (ev.sorted && ev.sorted.has(i)) b.classList.add('sorted');
        if (ev.pivot === i) b.classList.add('pivot');
        if (i === ev.from || i === ev.to){
          b.classList.remove('sorted', 'pivot');
          b.classList.add(ev.kind === 'swap' ? 'swap' : (ev.kind === 'newmin' && i === ev.to ? 'pivot' : 'compare'));
        }
        row.appendChild(b);
        boxes[i] = b;
      });
      wrap.appendChild(row);
      wrap.appendChild(el('span', 'shell-event-label ' + (ev.kind === 'swap' ? 'is-swap' : 'is-nowap'), ev.label));
      parent.appendChild(wrap);

      const id = 'wfArrow' + (uid++);
      jobs.push(() => {
        const wr = wrap.getBoundingClientRect();
        const rA = boxes[ev.from].getBoundingClientRect();
        const rB = boxes[ev.to].getBoundingClientRect();
        const x1 = rA.left - wr.left + rA.width / 2;
        const x2 = rB.left - wr.left + rB.width / 2;
        const color = COLORS[ev.kind] || COLORS.compare;
        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'shell-gap-svg');
        svg.setAttribute('width', wr.width);
        svg.setAttribute('height', 30);
        const defs = document.createElementNS(NS, 'defs');
        defs.innerHTML = `<marker id="${id}" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="${color}"/></marker>`;
        svg.appendChild(defs);
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', `M ${x1} 4 Q ${(x1 + x2) / 2} 24 ${x2} 4`);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '1.8');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', `url(#${id})`);
        svg.appendChild(path);
        wrap.insertBefore(svg, row);
      });
    }

    let rows = 0, truncated = false, hiddenGroups = 0, hiddenRows = 0;
    groups.forEach(g => {
      if (truncated || (rows > 0 && rows + g.events.length > MAX_ROWS)){
        truncated = true; hiddenGroups++; hiddenRows += g.events.length; return;
      }
      rows += g.events.length;
      const b = block(container, g.header);
      if (g.note) b.appendChild(el('div', 'wf-note', g.note));
      if (!g.events.length) b.appendChild(el('div', 'wf-note', 'no comparisons needed'));
      g.events.forEach(ev => drawRow(b, ev));
      b.appendChild(el('div', 'shell-pass-done', g.done));
    });
    if (truncated){
      const b = block(container, null);
      b.appendChild(el('div', 'wf-note',
        `… ${plural(hiddenGroups, 'more pass')} (${plural(hiddenRows, 'row')}) not drawn, to keep the page fast. ` +
        `Use an array of about 12 elements or fewer to see the complete working. The final sorted array is shown below.`));
    }
    finalBlock(container, sorted);
    requestAnimationFrame(() => jobs.forEach(j => j()));
  }

  /* ------------------------------------------------------------------
     2) DISTRIBUTION builders + renderers
     ------------------------------------------------------------------ */
  function buildCounting(arr){
    const mn = Math.min(...arr), mx = Math.max(...arr);
    const cnt = new Array(mx - mn + 1).fill(0);
    arr.forEach(v => cnt[v - mn]++);
    const sorted = [];
    cnt.forEach((c, i) => { for (let k = 0; k < c; k++) sorted.push(i + mn); });
    return { mn, mx, cnt, sorted };
  }
  function buildPigeonhole(arr){
    const mn = Math.min(...arr), mx = Math.max(...arr);
    const holes = Array.from({ length: mx - mn + 1 }, () => []);
    arr.forEach(v => holes[v - mn].push(v));
    const sorted = [];
    holes.forEach(h => h.forEach(v => sorted.push(v)));
    return { mn, mx, holes, sorted };
  }
  function buildRadix(arr){
    const mx = Math.max(...arr);
    let cur = arr.slice();
    const passes = [];
    for (let exp = 1; Math.floor(mx / exp) > 0; exp *= 10){
      const buckets = Array.from({ length: 10 }, () => []);
      cur.forEach(v => buckets[Math.floor(v / exp) % 10].push(v));
      const next = [];
      buckets.forEach(b => b.forEach(v => next.push(v)));
      passes.push({ exp, before: cur.slice(), buckets, after: next.slice() });
      cur = next;
    }
    return { passes, sorted: cur };
  }
  function buildBucket(arr){
    const n = arr.length, mn = Math.min(...arr), mx = Math.max(...arr);
    const bc = Math.max(2, Math.round(Math.sqrt(n))), size = (mx - mn + 1) / bc;
    const buckets = Array.from({ length: bc }, () => []);
    arr.forEach(v => buckets[Math.min(bc - 1, Math.floor((v - mn) / size))].push(v));
    const sortedBuckets = buckets.map(b => b.slice().sort((x, y) => x - y));
    const ranges = buckets.map((_, i) => {
      const lo = Math.ceil(mn + i * size);
      const hi = i === bc - 1 ? mx : Math.ceil(mn + (i + 1) * size) - 1;
      return [lo, hi];
    });
    const sorted = [];
    sortedBuckets.forEach(b => b.forEach(v => sorted.push(v)));
    return { bc, size, mn, mx, buckets, sortedBuckets, ranges, sorted };
  }

  function cellGrid(parent, labels, contents){
    const grid = el('div', 'wf-grid');
    labels.forEach((lab, i) => {
      const has = contents[i] !== '' && contents[i] !== 0;
      const c = el('div', 'wf-cell' + (has ? ' has' : ''));
      c.appendChild(el('div', 'v', lab));
      c.appendChild(el('div', 'c', contents[i] === '' ? '·' : contents[i]));
      grid.appendChild(c);
    });
    parent.appendChild(grid);
  }

  function renderCounting(container, arr){
    const d = buildCounting(arr);
    let b = block(container, 'Step 1 — Input array');
    b.appendChild(miniRow(arr));
    b = block(container, `Step 2 — Count array (index = value, from ${d.mn} to ${d.mx}; cell = how many times it occurs)`);
    const labels = d.cnt.map((_, i) => i + d.mn);
    cellGrid(b, labels, d.cnt);
    const used = d.cnt.map((c, i) => c ? `${i + d.mn} ×${c}` : null).filter(Boolean);
    b.appendChild(el('div', 'wf-note', `Values found: ${used.join(', ')}`));
    b = block(container, 'Step 3 — Rebuild: write each value as many times as it was counted');
    b.appendChild(miniRow(d.sorted, 'sorted'));
    b.appendChild(el('div', 'shell-pass-done', 'sorted ✓'));
  }

  function renderPigeonhole(container, arr){
    const d = buildPigeonhole(arr);
    let b = block(container, 'Step 1 — Input array');
    b.appendChild(miniRow(arr));
    b = block(container, `Step 2 — Holes (one hole per value, from ${d.mn} to ${d.mx}); each element goes into its own hole`);
    const labels = d.holes.map((_, i) => i + d.mn);
    cellGrid(b, labels, d.holes.map(h => h.length ? h.map(() => '●').join('') + (h.length > 1 ? ` ×${h.length}` : '') : ''));
    b.appendChild(el('div', 'wf-note', 'Empty holes are skipped when collecting.'));
    b = block(container, 'Step 3 — Collect: read the holes from left to right');
    b.appendChild(miniRow(d.sorted, 'sorted'));
    b.appendChild(el('div', 'shell-pass-done', 'sorted ✓'));
  }

  function digitBox(v, exp){
    const box = el('span', 'mini-box');
    const s = String(v), pos = s.length - Math.round(Math.log10(exp)) - 1;
    if (pos < 0){
      box.textContent = v;
      const z = el('span', 'wf-digit', '0');
      box.textContent = '';
      box.appendChild(z);
      box.appendChild(document.createTextNode(s));
    } else {
      box.appendChild(document.createTextNode(s.slice(0, pos)));
      box.appendChild(el('span', 'wf-digit', s[pos]));
      box.appendChild(document.createTextNode(s.slice(pos + 1)));
    }
    return box;
  }

  function renderRadix(container, arr){
    const d = buildRadix(arr);
    const names = ['ones', 'tens', 'hundreds', 'thousands'];
    let b = block(container, 'Input array');
    b.appendChild(miniRow(arr));
    d.passes.forEach((p, k) => {
      const nm = names[k] || `10^${k}`;
      b = block(container, `Pass ${k + 1} — distribute by the ${nm} digit, then collect buckets 0 → 9`);
      const grid = el('div', 'wf-buckets');
      p.buckets.forEach((bk, digit) => {
        const col = el('div', 'wf-bucket');
        col.appendChild(el('div', 'wf-bucket-title', `bucket ${digit}`));
        const items = el('div', 'items');
        bk.forEach(v => items.appendChild(digitBox(v, p.exp)));
        col.appendChild(items);
        grid.appendChild(col);
      });
      b.appendChild(grid);
      b.appendChild(el('div', 'wf-note', `Collected in order (stable): ${str(p.after)}`));
    });
    finalBlock(container, d.sorted);
  }

  function renderBucket(container, arr){
    const d = buildBucket(arr);
    let b = block(container, 'Input array');
    b.appendChild(miniRow(arr));
    b = block(container, `Step 1 — Distribute into ${d.bc} buckets (each covers about ${d.size.toFixed(1)} values)`);
    const g1 = el('div', 'wf-buckets');
    d.buckets.forEach((bk, i) => {
      const col = el('div', 'wf-bucket');
      col.appendChild(el('div', 'wf-bucket-title', `bucket ${i} · ${d.ranges[i][0]}–${d.ranges[i][1]}`));
      const items = el('div', 'items');
      bk.forEach(v => items.appendChild(el('span', 'mini-box', v)));
      col.appendChild(items);
      g1.appendChild(col);
    });
    b.appendChild(g1);
    b = block(container, 'Step 2 — Sort each bucket on its own');
    const g2 = el('div', 'wf-buckets');
    d.sortedBuckets.forEach((bk, i) => {
      const col = el('div', 'wf-bucket');
      col.appendChild(el('div', 'wf-bucket-title', `bucket ${i} (sorted)`));
      const items = el('div', 'items');
      bk.forEach(v => items.appendChild(el('span', 'mini-box compare', v)));
      col.appendChild(items);
      g2.appendChild(col);
    });
    b.appendChild(g2);
    finalBlock(container, d.sorted, 'Step 3 — Concatenate the buckets in order');
  }

  /* ------------------------------------------------------------------
     3) TREE SORT (binary search tree)
     ------------------------------------------------------------------ */
  function buildBST(orig, count){
    const mk = i => ({ v: orig[i], i, l: null, r: null });
    const root = mk(0);
    let path = [], last = root;
    for (let i = 1; i < count; i++){
      const node = mk(i);
      let cur = root;
      path = [];
      for (;;){
        path.push(cur);
        const c = orig[i] < cur.v ? 'l' : 'r';
        if (cur[c]) cur = cur[c]; else { cur[c] = node; break; }
      }
      last = node;
    }
    return { root, path, last };
  }
  function inorder(root){
    const out = [];
    (function w(nd){ if (!nd) return; w(nd.l); out.push(nd.v); w(nd.r); })(root);
    return out;
  }

  function drawBST(parent, root, pathSet, newNode){
    const pos = new Map();
    let idx = 0, maxD = 0;
    (function walk(nd, d){
      if (!nd) return;
      walk(nd.l, d + 1);
      pos.set(nd, { x: idx++, y: d });
      maxD = Math.max(maxD, d);
      walk(nd.r, d + 1);
    })(root, 0);
    const XS = 42, YS = 56, R = 16, PAD = 26;
    const W = idx * XS + PAD * 2, H = (maxD + 1) * YS + PAD;
    const px = n => PAD + pos.get(n).x * XS, py = n => PAD + pos.get(n).y * YS;
    let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">`;
    pos.forEach((_, nd) => {
      [nd.l, nd.r].forEach(ch => {
        if (!ch) return;
        const hot = pathSet && pathSet.has(nd) && (pathSet.has(ch) || ch === newNode);
        svg += `<line x1="${px(nd)}" y1="${py(nd)}" x2="${px(ch)}" y2="${py(ch)}" stroke="${hot ? '#FF9552' : '#3A4568'}" stroke-width="${hot ? 2.2 : 1.6}"/>`;
      });
    });
    pos.forEach((_, nd) => {
      let fill = '#16213D', stroke = '#5B8CFF';
      if (pathSet && pathSet.has(nd)){ fill = '#3A2416'; stroke = '#FF9552'; }
      if (nd === newNode){ fill = '#FF6B6B'; stroke = '#FF6B6B'; }
      svg += `<circle cx="${px(nd)}" cy="${py(nd)}" r="${R}" fill="${fill}" stroke="${stroke}" stroke-width="1.8"/>` +
             `<text x="${px(nd)}" y="${py(nd) + 4}" text-anchor="middle" font-size="11" font-weight="600" fill="#EAF0FF" font-family="IBM Plex Mono, monospace">${nd.v}</text>`;
    });
    svg += '</svg>';
    const wrap = el('div', 'wf-tree');
    wrap.innerHTML = svg;
    parent.appendChild(wrap);
  }

  function renderTree(container, arr){
    const n = arr.length, SHOW = Math.min(n, 8);
    let b = block(container, 'Insertion order (left to right)');
    b.appendChild(miniRow(arr));
    for (let k = 1; k <= SHOW; k++){
      const t = buildBST(arr, k);
      b = block(container, k === 1 ? `Insert ${arr[0]} — it becomes the root`
        : `Insert ${arr[k-1]} — compare along the path, go left if smaller, right otherwise`);
      drawBST(b, t.root, new Set(t.path), t.last);
      if (k > 1) b.appendChild(el('div', 'wf-note', `Path: ${t.path.map(nd => nd.v).join(' → ')} → new node ${arr[k-1]}`));
    }
    if (n > SHOW){
      b = block(container, null);
      b.appendChild(el('div', 'wf-note', `Insertions ${SHOW + 1}…${n} follow the same rule — the finished tree is shown next.`));
    }
    const full = buildBST(arr, n);
    b = block(container, `Complete tree after all ${n} insertions`);
    drawBST(b, full.root, null, null);
    finalBlock(container, inorder(full.root), 'In-order traversal (left → root → right) gives the sorted array');
  }

  /* ------------------------------------------------------------------
     public API
     ------------------------------------------------------------------ */
  const ARC = ['bubble','selection','insertion','comb','cocktail','gnome','oddeven','bitonic','stooge','cycle'];

  window.SortWorkflow = {
    algos: ALGOS,
    meta: algo => META[algo] || null,
    render(container, algo, arr){
      container.innerHTML = '';
      if (!META[algo] || !arr || !arr.length) return;
      if (ARC.indexOf(algo) !== -1) return renderArc(container, algo, arr);
      if (algo === 'counting')   return renderCounting(container, arr);
      if (algo === 'pigeonhole') return renderPigeonhole(container, arr);
      if (algo === 'radix')      return renderRadix(container, arr);
      if (algo === 'bucket')     return renderBucket(container, arr);
      if (algo === 'tree')       return renderTree(container, arr);
    },
    _build: { arc: buildArc, counting: buildCounting, pigeonhole: buildPigeonhole, radix: buildRadix, bucket: buildBucket,
              bst: (arr) => inorder(buildBST(arr, arr.length).root) }
  };
})();
