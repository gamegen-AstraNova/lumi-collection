(function () {
  'use strict';

  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let codeIndex = 0;

  document.addEventListener('keydown', (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    codeIndex = key === code[codeIndex] ? codeIndex + 1 : key === code[0] ? 1 : 0;
    if (codeIndex !== code.length) return;
    codeIndex = 0;
    localStorage.setItem('lumi-coins', '9999');
    window.location.reload();
  });

  const modes = ['wander', 'chase', 'avoid', 'curious', 'observe', 'buddy'];
  let room;
  const state = new WeakMap();

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const position = (node) => ({ x: parseFloat(node.style.left) || 50, y: parseFloat(node.style.top) || 50 });
  const move = (node, x, y) => {
    node.style.left = `${clamp(x, 10, 90)}%`;
    node.style.top = `${clamp(y, 28, 72)}%`;
    node.style.transition = 'left 1.1s ease-out, top 1.1s ease-out, transform .2s';
  };
  const nearest = (node, nodes) => {
    const current = position(node);
    return nodes.reduce((best, other) => {
      if (other === node) return best;
      const target = position(other);
      const distance = Math.hypot(current.x - target.x, current.y - target.y);
      return !best || distance < best.distance ? { node: other, distance } : best;
    }, null)?.node;
  };

  function act() {
    if (!room) return;
    const nodes = [...room.querySelectorAll('.cat')];
    if (!nodes.length) return;
    nodes.forEach((node) => {
      const data = state.get(node) || { mode: modes[Math.floor(Math.random() * modes.length)], pause: 0 };
      if (data.pause > 0 || Math.random() < 0.5) {
        data.pause = Math.max(0, data.pause - 1);
        state.set(node, data);
        return;
      }
      if (Math.random() < 0.28) data.mode = modes[Math.floor(Math.random() * modes.length)];
      const current = position(node);
      const target = nearest(node, nodes);
      let next = { x: current.x, y: current.y };
      if (target && ['chase', 'curious', 'buddy', 'avoid'].includes(data.mode)) {
        const other = position(target);
        const factor = data.mode === 'avoid' ? -1 : data.mode === 'curious' ? 0.16 : 0.26;
        next = { x: current.x + (other.x - current.x) * factor, y: current.y + (other.y - current.y) * factor };
      } else if (data.mode !== 'observe') {
        next = { x: current.x + (Math.random() - 0.5) * 13, y: current.y + (Math.random() - 0.5) * 10 };
      }
      move(node, next.x, next.y);
      state.set(node, data);
    });
  }

  function start() {
    room = document.querySelector('.room');
    if (!room) return setTimeout(start, 300);
    const style = document.createElement('style');
    style.textContent = '.cat.bump{animation:character-bump .26s ease-out!important}@keyframes character-bump{50%{transform:translate(-50%,-50%) scale(1.12) rotate(3deg)}}';
    document.head.appendChild(style);
    setInterval(act, 3200);
  }

  start();
}());
