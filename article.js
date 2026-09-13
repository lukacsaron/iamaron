/* article.js — shared by the archived article pages.
   Two jobs: the connected-dots background, and the gallery lightbox. */

(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Connected-dots background ---------- */

    (function particles() {
        var canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var nodes = [];
        var mouse = { x: null, y: null };

        function size() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function build() {
            var count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 260);
            nodes = [];
            for (var i = 0; i < count; i++) {
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.35,
                    vy: (Math.random() - 0.5) * 0.35,
                    r: Math.random() * 1.6 + 0.8
                });
            }
        }

        function frame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < nodes.length; i++) {
                var p = nodes[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                if (mouse.x !== null) {
                    var mdx = p.x - mouse.x;
                    var mdy = p.y - mouse.y;
                    var md = Math.hypot(mdx, mdy);
                    if (md < 110 && md > 0) {
                        p.x += (mdx / md) * 1.4;
                        p.y += (mdy / md) * 1.4;
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(74, 85, 104, 0.35)';
                ctx.fill();
            }

            for (var a = 0; a < nodes.length; a++) {
                for (var b = a + 1; b < nodes.length; b++) {
                    var dx = nodes[a].x - nodes[b].x;
                    var dy = nodes[a].y - nodes[b].y;
                    var d = Math.hypot(dx, dy);
                    if (d < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(74, 85, 104, ' + (0.16 * (1 - d / 150)) + ')';
                        ctx.lineWidth = 1;
                        ctx.moveTo(nodes[a].x, nodes[a].y);
                        ctx.lineTo(nodes[b].x, nodes[b].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(frame);
        }

        size();
        build();
        if (!reduced) frame();

        window.addEventListener('resize', function () { size(); build(); });
        window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('mouseout', function () { mouse.x = null; mouse.y = null; });
    })();

    /* ---------- Gallery lightbox ---------- */

    (function lightbox() {
        var gallery = document.getElementById('gallery');
        var box = document.getElementById('lightbox');
        if (!gallery || !box) return;

        var buttons = Array.prototype.slice.call(gallery.querySelectorAll('button'));
        var img = document.getElementById('lightbox-img');
        var counter = document.getElementById('lightbox-counter');
        var full = document.getElementById('lightbox-full');
        var closeBtn = box.querySelector('.lightbox-close');
        var prevBtn = box.querySelector('.lightbox-prev');
        var nextBtn = box.querySelector('.lightbox-next');
        var index = 0;
        var lastFocus = null;

        function show(i) {
            index = (i + buttons.length) % buttons.length;
            var btn = buttons[index];
            var thumb = btn.querySelector('img');
            // Show the display-size file first; it is usually already cached.
            img.src = thumb.getAttribute('src');
            img.alt = thumb.getAttribute('alt') || '';
            full.href = btn.getAttribute('data-full');
            counter.textContent = (index + 1) + ' / ' + buttons.length;
        }

        function open(i) {
            lastFocus = document.activeElement;
            show(i);
            box.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        }

        function close() {
            box.classList.remove('is-open');
            document.body.style.overflow = '';
            if (lastFocus) lastFocus.focus();
        }

        buttons.forEach(function (btn, i) {
            btn.addEventListener('click', function () { open(i); });
        });

        closeBtn.addEventListener('click', close);
        prevBtn.addEventListener('click', function () { show(index - 1); });
        nextBtn.addEventListener('click', function () { show(index + 1); });

        box.addEventListener('click', function (e) {
            if (e.target === box) close();
        });

        document.addEventListener('keydown', function (e) {
            if (!box.classList.contains('is-open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') show(index - 1);
            if (e.key === 'ArrowRight') show(index + 1);
        });
    })();
})();
