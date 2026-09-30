import React from "react";

function seededRandom(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// A lightweight force-directed layout (repulsion + spring + centering).
// Runs synchronously so positions are stable and deterministic across renders.
export function useForceGraph(rawNodes, rawEdges, opts = {}) {
  const width = opts.width || 1000;
  const height = opts.height || 600;
  const iterations = opts.iterations || 320;
  const seed = opts.seed || 7;

  return React.useMemo(() => {
    const rand = seededRandom(seed);
    const nodes = (rawNodes || []).map((n) => ({
      ...n,
      x: width / 2 + (rand() - 0.5) * width * 0.7,
      y: height / 2 + (rand() - 0.5) * height * 0.7,
      vx: 0,
      vy: 0,
    }));
    const idMap = new Map(nodes.map((n, i) => [n.id, i]));
    const edges = (rawEdges || []).map((e) => ({
      source: typeof e.source !== "undefined" ? e.source : e.s,
      target: typeof e.target !== "undefined" ? e.target : e.t,
      type: e.type,
      color: e.color || e.c,
    }));

    const k = Math.sqrt((width * height) / Math.max(nodes.length, 1)) * 0.55;
    const cx = width / 2;
    const cy = height / 2;

    for (let iter = 0; iter < iterations; iter++) {
      const cooling = 1 - iter / iterations;
      // Repulsion between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          let dx = nodes[i].x - nodes[j].x;
          let dy = nodes[i].y - nodes[j].y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const force = (k * k) / dist;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx += fx;
          nodes[i].vy += fy;
          nodes[j].vx -= fx;
          nodes[j].vy -= fy;
        }
      }
      // Spring attraction along edges
      edges.forEach((e) => {
        const si = idMap.get(e.source);
        const ti = idMap.get(e.target);
        if (si == null || ti == null) return;
        let dx = nodes[si].x - nodes[ti].x;
        let dy = nodes[si].y - nodes[ti].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (dist * dist) / k;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[si].vx -= fx;
        nodes[si].vy -= fy;
        nodes[ti].vx += fx;
        nodes[ti].vy += fy;
      });
      // Centering + integrate
      nodes.forEach((n) => {
        n.vx += (cx - n.x) * 0.01;
        n.vy += (cy - n.y) * 0.01;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx * cooling;
        n.y += n.vy * cooling;
      });
    }

    // Normalize positions into the viewBox with padding
    const pad = 40;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    });
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY, 1.4);
    nodes.forEach((n) => {
      n.x = pad + (n.x - minX) * scale;
      n.y = pad + (n.y - minY) * scale;
    });

    return { nodes, edges };
  }, [rawNodes, rawEdges, width, height, iterations, seed]);
}

// Build a gently curved quadratic-bezier path between two points.
export function curvedPath(x1, y1, x2, y2, bend = 0.12) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const nx = -dy;
  const ny = dx;
  const len = Math.sqrt(nx * nx + ny * ny) || 1;
  const cx = mx + (nx / len) * len * bend;
  const cy = my + (ny / len) * len * bend;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}