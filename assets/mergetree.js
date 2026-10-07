/* =========================================================
   SortLab — Merge Sort recursion-tree engine
   Builds the divide/merge recursion tree for Merge Sort
   (low/high/mid split down to single elements, then merged
   back up), produces a flat step list for the existing
   Play/Next/Previous controls to drive, and renders the tree
   as boxes connected by arrows — split arrows going down,
   merge arrows going back up through the same edges.
   This is used ONLY for the Merge Sort algorithm; every other
   algorithm keeps the normal single-row array view.
   ========================================================= */

(function(){
  "use strict";

  // ---- 1. build the recursion tree + the full step list (steps only
  //         depend on VALUES for compare/place; the tree SHAPE only
  //         depends on the array length) ----
  function buildMergeTree(arr){
    let idCounter = 0;
    const nodesById = {};
    const steps = [];

    function makeNode(low, high, parentId, depth){
      const id = 'n' + (idCounter++);
      nodesById[id] = {
        id, low, high, parentId, depth,
        mid: null, leftId: null, rightId: null,
        original: arr.slice(low, high + 1),
        merged: null
      };
      return id;
    }

    function divide(low, high, parentId, depth){
      const id = makeNode(low, high, parentId, depth);
      const node = nodesById[id];
      if (low === high){
        node.merged = [arr[low]];
        return id;
      }
      const mid = Math.floor((low + high) / 2);
      node.mid = mid;
      node.leftId = divide(low, mid, id, depth + 1);
      node.rightId = divide(mid + 1, high, id, depth + 1);
      steps.push({ phase:'split', nodeId:id, low, high, mid, leftId:node.leftId, rightId:node.rightId });
      return id;
    }

    const rootId = divide(0, arr.length - 1, null, 0);

    function mergeNode(id){
      const node = nodesById[id];
      if (node.merged) return node.merged; // leaf
      const leftVals = mergeNode(node.leftId);
      const rightVals = mergeNode(node.rightId);
      const result = [];
      let i = 0, j = 0;
      while (i < leftVals.length && j < rightVals.length){
        steps.push({
          phase:'compare', nodeId:id,
          leftIdx:i, rightIdx:j,
          leftVal:leftVals[i], rightVal:rightVals[j]
        });
        if (leftVals[i] <= rightVals[j]){
          result.push(leftVals[i]);
          steps.push({ phase:'place', nodeId:id, pos:result.length - 1, value:leftVals[i], from:'left', srcIdx:i });
          i++;
        } else {
          result.push(rightVals[j]);
          steps.push({ phase:'place', nodeId:id, pos:result.length - 1, value:rightVals[j], from:'right', srcIdx:j });
          j++;
        }
      }
      while (i < leftVals.length){
        result.push(leftVals[i]);
        steps.push({ phase:'place', nodeId:id, pos:result.length - 1, value:leftVals[i], from:'left', srcIdx:i });
        i++;
      }
      while (j < rightVals.length){
        result.push(rightVals[j]);
        steps.push({ phase:'place', nodeId:id, pos:result.length - 1, value:rightVals[j], from:'right', srcIdx:j });
        j++;
      }
      steps.push({ phase:'node-done', nodeId:id });
      node.merged = result;
      return result;
    }
    mergeNode(rootId);

    let maxDepth = 0;
    Object.values(nodesById).forEach(n => { if (n.depth > maxDepth) maxDepth = n.depth; });

    return { nodesById, rootId, steps, leafCount: arr.length, maxDepth };
  }

  // ---- 2. layout: leaves get one evenly-spaced slot each; every
  //         internal node centers over the midpoint of its own range ----
  const SLOT_W = 42;   // px per array position
  const ROW_H = 100;   // px per tree depth level
  const TOP_PAD = 26;
  const NODE_BOX_H = 58; // label + cell row, approx height of a rendered node box

  function centerX(node){ return (node.low + node.high + 1) / 2 * SLOT_W; }
  function rowY(node){ return TOP_PAD + node.depth * ROW_H; }

  // ---- 3. pure render: given the tree + a fully-computed display
  //         state (from the caller's step replay), draw it ----
  // state = {
  //   revealed: Set(nodeId)            — node's box is visible at all
  //   values:   Map(nodeId -> array)   — what to print in each cell right now
  //   settled:  Map(nodeId -> Set(pos))— which cell positions are "final" (green)
  //   nodeDone: Set(nodeId)            — node's merge fully complete
  //   highlight: { compare:[{nodeId,pos}], place:{nodeId,pos} } | null
  // }
  function renderMergeTree(container, tree, state){
    const { nodesById, rootId, leafCount, maxDepth } = tree;
    const width = Math.max(container.clientWidth, (leafCount) * SLOT_W + 40);
    const height = TOP_PAD + (maxDepth + 1) * ROW_H + 30;

    const svgNS = "http://www.w3.org/2000/svg";
    let html = '';

    // --- edges (split-down / merge-up, same lines either way) ---
    const edgeSvgParts = [];
    Object.values(nodesById).forEach(node => {
      if (!state.revealed.has(node.id)) return;
      [node.leftId, node.rightId].forEach(childId => {
        if (!childId || !state.revealed.has(childId)) return;
        const child = nodesById[childId];
        const x1 = centerX(node), y1 = rowY(node) + NODE_BOX_H;
        const x2 = centerX(child), y2 = rowY(child) - 6;
        const midY = (y1 + y2) / 2;
        const done = state.nodeDone.has(node.id);
        edgeSvgParts.push(
          `<path d="M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}"
             fill="none" stroke="${done ? '#34E0A1' : '#3A4568'}"
             stroke-width="${done ? 2.4 : 1.8}" opacity="${done ? 0.9 : 0.75}" />`
        );
      });
    });

    // --- node boxes ---
    Object.values(nodesById).forEach(node => {
      if (!state.revealed.has(node.id)) return;
      const vals = state.values.get(node.id) || node.original;
      const settledSet = state.settled.get(node.id) || new Set();
      const isLeaf = node.low === node.high;
      const nodeDone = state.nodeDone.has(node.id) || isLeaf;
      const cx = centerX(node), cy = rowY(node);
      const rowWidth = vals.length * (SLOT_W - 4);
      const left = cx - rowWidth / 2;

      let cellsHtml = '';
      vals.forEach((v, pos) => {
        const cls = ['mt-cell'];
        if (isLeaf) cls.push('mt-leaf');
        if (settledSet.has(pos) || (isLeaf && nodeDone)) cls.push('mt-settled');
        if (state.highlight && state.highlight.type === 'compare'){
          state.highlight.cells.forEach(hc => { if (hc.nodeId === node.id && hc.pos === pos) cls.push('mt-compare'); });
        }
        if (state.highlight && state.highlight.type === 'place' &&
            state.highlight.nodeId === node.id && state.highlight.pos === pos){
          cls.push('mt-place');
        }
        cellsHtml += `<span class="${cls.join(' ')}" style="left:${pos * (SLOT_W - 4)}px">${v}</span>`;
      });

      const rangeLabel = isLeaf ? `[${node.low}]` : `low=${node.low}, high=${node.high}, mid=${node.mid}`;

      html += `<div class="mt-node ${nodeDone ? 'mt-node-done' : ''}" style="left:${left}px; top:${cy}px; width:${rowWidth}px;">
          <div class="mt-node-label">${rangeLabel}</div>
          <div class="mt-node-row" style="width:${rowWidth}px; height:${SLOT_W - 4}px;">${cellsHtml}</div>
        </div>`;
    });

    container.style.position = 'relative';
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    container.innerHTML =
      `<svg class="mt-edges" width="${width}" height="${height}">${edgeSvgParts.join('')}</svg>` + html;
  }

  window.MergeTreeFX = { buildMergeTree, renderMergeTree, SLOT_W, ROW_H };
})();
