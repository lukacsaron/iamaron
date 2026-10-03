// island.js — behaviour for the floating nav in island.css.
// The nav is plain links in the HTML of every page. This file adds the
// preview panels (built on first use, so nothing loads for visitors who
// never touch the nav), sizes the pill so it can morph, collapses it while
// scrolling down, and draws reading progress on article pages.

(function () {
    // Everything the panels say lives here. Change a count once, here.
    var DATA = {
        built: {
            label: "Things I've built",
            count: 39,
            span: '2012–2026',
            blurb: 'Public tools, client sites, festival toys',
            previews: [
                { name: 'VasútTérkép', img: 'previews/vasutterkep' },
                { name: 'OviKréta', img: 'previews/ovikreta' },
                { name: 'Snake', img: 'previews/snake' }
            ]
        },
        wrote: {
            label: 'Things I wrote',
            mine: [
                {
                    title: 'Az AI angolul fogalmaz – akkor is, ha magyarul promptolod',
                    lang: 'hu',
                    meta: 'New · 2026 · HU · 5 min',
                    href: 'ai-magyarul.html',
                    cover: '—'
                },
                {
                    title: 'We went to the coldest festival in the world',
                    meta: 'PHENOM · 2019 · EN / HU · 7 min',
                    href: 'barents-spektakel.html',
                    img: 'previews/barents'
                },
                {
                    title: '10+1 UX tipp a konverziód növeléséhez karácsony előtt',
                    lang: 'hu',
                    meta: 'Minner · 2024 · HU · 4 min',
                    href: 'minner-ux-tippek.html',
                    img: 'photos/minner/ux-tipp-minner-konverzio'
                }
            ],
            pressCount: 13,
            outlets: ['RTL', 'Forbes', 'Magyar Narancs', 'HVG']
        }
    };

    var nav = document.querySelector('.island');
    if (!nav) return;
    var shell = nav.querySelector('.island-shell');
    var bar = nav.querySelector('.island-bar');
    var home = bar.querySelector('.island-home');
    var avatar = bar.querySelector('.island-avatar');
    var triggers = Array.prototype.slice.call(bar.querySelectorAll('a[data-panel]'));
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    var ARROW = '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

    var panels = {};
    var openName = null;
    var collapsed = false;
    var intentTimer = null;
    var closeTimer = null;

    // ---------- Panels ----------

    function picture(base, w, h) {
        return '<picture><source srcset="' + base + '.avif" type="image/avif">' +
            '<img src="' + base + '.webp" alt="" width="' + w + '" height="' + h + '" loading="lazy" decoding="async"></picture>';
    }

    function builtPanel(d) {
        return '<div class="island-kicker">' + d.label + '</div>' +
            '<div class="island-built">' +
                '<div class="island-fan" aria-hidden="true">' +
                    d.previews.map(function (p) {
                        return '<a href="things.html" tabindex="-1">' + picture(p.img, 128, 80) + '<span>' + p.name + '</span></a>';
                    }).join('') +
                '</div>' +
                '<div class="island-tally"><strong>' + d.count + '</strong><span>things,<br>' + d.span + '</span></div>' +
            '</div>' +
            '<a class="island-more" href="things.html"><span>' + d.blurb + '</span>' + ARROW + '</a>';
    }

    function wrotePanel(d) {
        return '<div class="island-kicker">' + d.label + '</div>' +
            '<div class="island-reads">' +
                d.mine.map(function (m) {
                    var thumb = m.cover
                        ? '<span class="island-read-cover" aria-hidden="true">' + m.cover + '</span>'
                        : picture(m.img, 64, 44);
                    return '<a class="island-read" href="' + m.href + '">' + thumb +
                        '<span><strong' + (m.lang ? ' lang="' + m.lang + '"' : '') + '>' + m.title + '</strong>' +
                        '<small>' + m.meta + '</small></span></a>';
                }).join('') +
            '</div>' +
            '<div class="island-press"><span>' + d.pressCount + ' pieces written about me, in</span>' +
                d.outlets.map(function (o) { return '<em>' + o + '</em>'; }).join('') +
                '<span>and more</span></div>' +
            '<a class="island-more" href="writing.html"><span>All writing and press</span>' + ARROW + '</a>';
    }

    function buildPanels() {
        if (Object.keys(panels).length) return;
        triggers.forEach(function (t) {
            var name = t.getAttribute('data-panel');
            var d = DATA[name];
            if (!d) return;
            var p = document.createElement('section');
            p.className = 'island-panel';
            p.id = 'island-panel-' + name;
            p.setAttribute('aria-label', d.label);
            p.innerHTML = name === 'built' ? builtPanel(d) : wrotePanel(d);
            t.setAttribute('aria-controls', p.id);
            t.setAttribute('aria-expanded', 'false');
            t.after(p);
            panels[name] = p;
            p.addEventListener('pointerenter', cancelClose);
        });
    }

    // ---------- Sizing ----------

    function layout() {
        var barW = bar.offsetWidth;
        var barH = bar.offsetHeight;
        var w = barW, h = barH, shift = 0;

        if (openName && panels[openName]) {
            var pw = Math.min(440, window.innerWidth - 24);
            nav.style.setProperty('--island-panel-w', pw + 'px');
            w = Math.max(barW, pw);
            h = barH + panels[openName].offsetHeight;
        } else if (collapsed) {
            w = barH;
            var centre = home.offsetLeft + avatar.offsetLeft + avatar.offsetWidth / 2;
            shift = barW / 2 - centre;
        }

        nav.style.setProperty('--island-w', w + 'px');
        nav.style.setProperty('--island-h', h + 'px');
        nav.style.setProperty('--island-shift', shift + 'px');
    }

    // ---------- Open / close ----------

    function setOpen(name) {
        if (name === openName) return;
        openName = name;
        if (name) collapsed = false;
        nav.classList.toggle('is-open', !!name);
        nav.classList.toggle('is-collapsed', collapsed);
        Object.keys(panels).forEach(function (k) {
            panels[k].classList.toggle('is-active', k === name);
        });
        triggers.forEach(function (t) {
            t.setAttribute('aria-expanded', String(t.getAttribute('data-panel') === name));
        });
        layout();
    }

    function cancelClose() {
        clearTimeout(closeTimer);
    }

    function scheduleClose(delay) {
        clearTimeout(intentTimer);
        clearTimeout(closeTimer);
        closeTimer = setTimeout(function () { setOpen(null); }, delay);
    }

    function enablePanels() {
        return finePointer.matches;
    }

    triggers.forEach(function (t) {
        var name = t.getAttribute('data-panel');

        t.addEventListener('pointerenter', function () {
            if (!enablePanels()) return;
            buildPanels();
            cancelClose();
            clearTimeout(intentTimer);
            // Already open: switch at once. Closed: wait out a passing cursor.
            if (openName) setOpen(name);
            else intentTimer = setTimeout(function () { setOpen(name); }, 120);
        });

        // Keyboard focus opens straight away; a tap's focus does not.
        t.addEventListener('focus', function () {
            if (!t.matches(':focus-visible')) return;
            buildPanels();
            cancelClose();
            setOpen(name);
        });
    });

    // Hovering an item without a panel puts the open one away
    Array.prototype.forEach.call(bar.querySelectorAll('.island-bar > a:not([data-panel])'), function (a) {
        a.addEventListener('pointerenter', function () {
            if (openName) scheduleClose(120);
            else clearTimeout(intentTimer);
        });
        a.addEventListener('focus', function () {
            if (openName) setOpen(null);
        });
    });

    nav.addEventListener('pointerenter', function () {
        cancelClose();
        if (collapsed) setCollapsed(false);
    });

    nav.addEventListener('pointerleave', function () {
        clearTimeout(intentTimer);
        if (openName) scheduleClose(200);
    });

    nav.addEventListener('focusout', function (e) {
        if (!nav.contains(e.relatedTarget)) setOpen(null);
    });

    nav.addEventListener('focusin', function () {
        if (collapsed) setCollapsed(false);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !openName) return;
        var trigger = bar.querySelector('a[data-panel="' + openName + '"]');
        setOpen(null);
        if (trigger && nav.contains(document.activeElement)) trigger.focus({ preventScroll: true });
    });

    document.addEventListener('pointerdown', function (e) {
        if (openName && !nav.contains(e.target)) setOpen(null);
    });

    // ---------- Glide highlight ----------

    var glide = document.createElement('span');
    glide.className = 'island-glide';
    glide.setAttribute('aria-hidden', 'true');
    bar.prepend(glide);

    Array.prototype.forEach.call(bar.querySelectorAll('.island-bar > a'), function (a) {
        a.addEventListener('pointerenter', function (e) {
            if (e.pointerType !== 'mouse' || collapsed) return;
            glide.style.setProperty('--glide-x', a.offsetLeft + 'px');
            glide.style.setProperty('--glide-w', a.offsetWidth + 'px');
            glide.classList.add('is-on');
        });
    });

    bar.addEventListener('pointerleave', function () {
        glide.classList.remove('is-on');
    });

    // ---------- Scroll collapse ----------

    function setCollapsed(value) {
        if (value === collapsed) return;
        collapsed = value;
        nav.classList.toggle('is-collapsed', value);
        if (value) glide.classList.remove('is-on');
        layout();
    }

    var lastY = window.scrollY;
    var ticking = false;

    function onScroll() {
        var y = window.scrollY;
        var dy = y - lastY;
        ticking = false;
        // Ignore trackpad jitter
        if (Math.abs(dy) < 6) return;
        lastY = y;

        if (dy > 0 && y > 200) {
            if (!openName && !nav.matches(':hover') && !nav.contains(document.activeElement)) {
                setCollapsed(true);
            }
        } else if (dy < 0) {
            setCollapsed(false);
        }
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
        if (ring) requestAnimationFrame(updateRing);
    }, { passive: true });

    // A tap on the collapsed avatar opens the bar instead of leaving the page
    home.addEventListener('click', function (e) {
        if (collapsed) {
            e.preventDefault();
            setCollapsed(false);
        }
    });

    // ---------- Talk: the Calendly modal, where the page has one ----------

    var talk = bar.querySelector('[data-calendly]');
    if (talk) {
        talk.addEventListener('click', function (e) {
            var open = document.getElementById('open-calendly');
            if (!open) return;
            e.preventDefault();
            open.click();
        });
    }

    // ---------- Reading progress ----------

    var ring = null;
    var body = document.querySelector('.article-body');

    if (nav.hasAttribute('data-progress') && body) {
        var R = 19.5;
        var C = 2 * Math.PI * R;
        avatar.insertAdjacentHTML('beforeend',
            '<svg class="island-ring" viewBox="0 0 42 42" aria-hidden="true">' +
                '<defs><linearGradient id="island-ring-gradient" x1="0" y1="0" x2="1" y2="1">' +
                    '<stop offset="0" stop-color="#38A89D"/><stop offset="1" stop-color="#4FC3F7"/>' +
                '</linearGradient></defs>' +
                '<circle class="island-ring-track" cx="21" cy="21" r="' + R + '"/>' +
                '<circle class="island-ring-fill" cx="21" cy="21" r="' + R + '" stroke-dasharray="' + C + '" stroke-dashoffset="' + C + '"/>' +
            '</svg>');
        ring = { fill: avatar.querySelector('.island-ring-fill'), C: C };
    }

    function updateRing() {
        if (!ring) return;
        var rect = body.getBoundingClientRect();
        var read = (window.innerHeight - rect.top) / rect.height;
        var p = Math.max(0, Math.min(1, read));
        ring.fill.style.strokeDashoffset = String(ring.C * (1 - p));
    }

    // ---------- Start ----------

    updateRing();

    // Take over sizing only once the web fonts are in: measured against the
    // fallback font, the pill would visibly widen when Inter arrives. Until
    // then the plain, auto-sized row of links is what shows.
    var started = false;
    function start() {
        if (started) return;
        started = true;
        layout();
        requestAnimationFrame(function () { nav.classList.add('is-ready'); });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    setTimeout(start, 1500);

    window.addEventListener('resize', layout);
    // Anything else that changes the bar's width (a late font, a count) re-sizes the pill
    if (window.ResizeObserver) new ResizeObserver(function () { if (started) layout(); }).observe(bar);
    finePointer.addEventListener && finePointer.addEventListener('change', function () { setOpen(null); });
})();
