
    const TODAY = new Date().toDateString();

    // ── NAVIGATION ──
    function showPage(id, btn) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById('page-' + id).classList.add('active');
      btn.classList.add('active');
      if (id === 'water') renderWater();
      if (id === 'habits') renderHabits();
      if (id === 'buckle') renderQuotes();
    }

    // ── WATER ──
    function getWeekDays() {
      var days = [], d = new Date();
      d.setDate(d.getDate() - 6);
      for (var i = 0; i < 7; i++) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return days;
    }

    var waterData = JSON.parse(localStorage.getItem('water_v1') || '{}');
    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var weekDays = getWeekDays();
    var selectedDay = TODAY;

    function saveWater() { localStorage.setItem('water_v1', JSON.stringify(waterData)); }

    function getGlasses(dateStr) {
      if (!waterData[dateStr]) waterData[dateStr] = [false, false, false, false, false, false, false, false];
      return waterData[dateStr];
    }
//to show which water tab is active (which date) and clear previous data
    function renderWater() {
      weekDays = getWeekDays();
      var tabs = document.getElementById('week-tabs');
      tabs.innerHTML = '';
      weekDays.forEach(function (d) {
        var ds = d.toDateString();
        var tab = document.createElement('div');
        tab.className = 'week-tab' + (ds === selectedDay ? ' active' : '');
        var isToday = ds === TODAY;
        tab.textContent = (isToday ? 'Today' : dayNames[d.getDay()] + ' ' + d.getDate());
        tab.onclick = function () {
          selectedDay = ds;
          renderWater();
        };
        tabs.appendChild(tab);
      });
      renderGlasses();
      renderWeekBars();
    }

    function glassSVG(filled, interactive) {
      var waterColor = filled ? '#81E4DA' : '#F0F9F8';
      var strokeColor = filled ? '#4CC9BF' : '#C8E8E5';
      var waveY = filled ? 32 : 70;
      return '<svg class="glass-svg" width="54" height="80" viewBox="0 0 54 80" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M8 6 L6 74 Q6 78 10 78 L44 78 Q48 78 48 74 L46 6 Z" fill="' + waterColor + '" stroke="' + strokeColor + '" stroke-width="2"/>' +
        (filled ? '<path d="M6 36 Q14 30 22 36 Q30 42 38 36 Q44 31 48 36 L48 74 Q48 78 44 78 L10 78 Q6 78 6 74 Z" fill="#81E4DA" opacity="0.5"/>' : '') +
        '<path d="M8 6 L6 74 Q6 78 10 78 L44 78 Q48 78 48 74 L46 6 Z" fill="none" stroke="' + strokeColor + '" stroke-width="2"/>' +
        '<line x1="12" y1="16" x2="42" y2="16" stroke="' + strokeColor + '" stroke-width="1" opacity="0.4"/>' +
        '</svg>';
    }
//if the water is filled or not and if it is today or not (disables interaction)
    function renderGlasses() {
      var grid = document.getElementById('glasses-grid');
      grid.innerHTML = '';
      var glasses = getGlasses(selectedDay);
      var isPast = selectedDay !== TODAY;
      var count = glasses.filter(Boolean).length;

      glasses.forEach(function (filled, i) {
        var wrap = document.createElement('div');
        wrap.className = 'glass-wrap' + (filled ? ' done' : '') + (isPast ? ' past-day' : '');
        wrap.innerHTML = glassSVG(filled, !isPast);
        var label = document.createElement('div');
        //to give label for "you are done with drinking water today"
        label.className = 'glass-label';
        label.textContent = filled ? 'Done!' : 'Glass ' + (i + 1);
        wrap.appendChild(label);
//ensures only today's glasses are clikcable
        if (!isPast) {
          wrap.onclick = function () {
            var g = getGlasses(selectedDay);
            g[i] = !g[i];
            saveWater();
            wrap.classList.toggle('pop');
            renderGlasses();
            renderWeekBars();
          };
        }
        grid.appendChild(wrap);
      });

      document.getElementById('water-count').innerHTML = count + ' <span>/ 8 glasses</span>';
      var msgs = ['Click a glass to log your water! 💧', 'Great start! Keep going 🌊', 'Halfway there! 🎉', 'Almost full! 💪', 'You\'re fully hydrated today! 🌟'];
      var mi = count === 8 ? 4 : count >= 6 ? 3 : count >= 4 ? 2 : count >= 2 ? 1 : 0;
      document.getElementById('water-msg').textContent = msgs[mi];
    }

    function renderWeekBars() {
      var bars = document.getElementById('week-bars');
      bars.innerHTML = '';
      weekDays.forEach(function (d) {
        var ds = d.toDateString();
        var g = getGlasses(ds);
        var count = g.filter(Boolean).length;
        var pct = Math.round((count / 8) * 100);
        var col = document.createElement('div');
        col.className = 'week-bar-col' + (ds === TODAY ? ' today' : '');
        col.innerHTML = '<div class="week-bar-track"><div class="week-bar-fill" style="height:' + pct + '%"></div></div>' +
          '<div class="week-bar-day">' + dayNames[d.getDay()] + '</div>';
        bars.appendChild(col);
      });
    }


    // ── HABITS ──
    var habits = JSON.parse(localStorage.getItem('habits_v2') || '[]');
    habits.forEach(function (h) { if (h.lastChecked !== TODAY) h.done = false; });
    saveHabits();

    function saveHabits() { localStorage.setItem('habits_v2', JSON.stringify(habits)); }

    function openModal() { document.getElementById('modal-bg').classList.add('open'); document.getElementById('m-name').focus(); }
    function closeModal() { document.getElementById('modal-bg').classList.remove('open'); }

    document.getElementById('modal-bg').onclick = function (e) { if (e.target === this) closeModal(); };
//taking inputs of habits
    function saveHabit() {
      var name = document.getElementById('m-name').value.trim();
      if (!name) return;
      habits.push({
        name: name,
        days: parseInt(document.getElementById('m-days').value),
        cat: document.getElementById('m-cat').value,
        done: false, streak: 0, lastChecked: null
      });
      saveHabits();
      closeModal();
      document.getElementById('m-name').value = '';
      renderHabits();
    }

    var catLabels = { health: '🏃 Health', mind: '🧠 Mind', social: '💬 Social', creative: '🎨 Creative', other: '✨ Other' };
//shows all the ahbits rendered from user. 
    function renderHabits() {
      var list = document.getElementById('habits-list');
      list.innerHTML = habits.length ? '' : '<div style="text-align:center;padding:3rem;color:var(--muted);font-size:14px">No habits yet — add one to begin 🌱</div>';

      habits.forEach(function (h, i) {
        var card = document.createElement('div');
        card.className = 'habit-card' + (h.done ? ' done' : '');
        //streak if you did it multiple days in the week.
        var streakTxt = h.streak > 1 ? h.streak + ' day streak 🔥' : h.streak === 1 ? 'Started today ✨' : 'Not started';
        card.innerHTML = '<div class="hcheck">' + (h.done ? '✓' : '') + '</div>' +
          '<div class="habit-info">' +
          '<div class="habit-name">' + h.name + '</div>' +
          '<div class="habit-meta">' + catLabels[h.cat] + ' · ' + h.days + 'x/week · ' + streakTxt + '</div>' +
          '</div>' +
          '<button class="hdel">✕</button>';

        card.querySelector('.hcheck').onclick = function () { toggleHabit(i); };
        card.querySelector('.habit-name').onclick = function () { toggleHabit(i); };
        card.querySelector('.hdel').onclick = function (e) { e.stopPropagation(); habits.splice(i, 1); saveHabits(); renderHabits(); };
        list.appendChild(card);
      });

      updateProgress();
    }

    function toggleHabit(i) {
      var h = habits[i];
      h.done = !h.done;
      if (h.done) {
        if (h.lastChecked !== TODAY) { h.streak = (h.streak || 0) + 1; h.lastChecked = TODAY; }
      } else {
        h.streak = Math.max(0, (h.streak || 1) - 1);
      }
      saveHabits();
      renderHabits();
    }

    function updateProgress() {
      var total = habits.length, done = habits.filter(function (h) { return h.done; }).length;
      var pct = total ? Math.round(done / total * 100) : 0;
      document.getElementById('prog-ring').style.strokeDashoffset = 163.4 - (163.4 * pct / 100);
      document.getElementById('prog-pct').textContent = pct + '%';
      document.getElementById('prog-bar').style.width = pct + '%';
      var titles = ['Start checking off!', 'Good momentum! 💪', 'Halfway there! 🔥', 'Almost done! ⭐', 'Crushed it today! 🎉'];
      var ti = pct === 100 ? 4 : pct >= 75 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;
      document.getElementById('prog-title').textContent = titles[ti];
      document.getElementById('prog-sub').textContent = done + ' of ' + total + ' habits completed today';
    }

    // ── BUCKLE UP ──
    var quotes = [
      { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", bg: "#81E4DA", fg: "#1a5c57" },
      { text: "Small steps every day lead to big changes over time.", author: "Anonymous", bg: "#E9AFA3", fg: "#7a3a2e" },
      { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", bg: "#EA526F", fg: "#fff" },
      { text: "You are braver than you believe, stronger than you seem.", author: "A.A. Milne", bg: "#F7E5E0", fg: "#7a3a2e" },
      { text: "The secret of getting ahead is getting started.", author: "Mark Twain", bg: "#D0F5F1", fg: "#1a5c57" },
      { text: "Act as if what you do makes a difference. It does.", author: "William James", bg: "#FDE8EC", fg: "#8a2036" },
      { text: "It always seems impossible until it's done.", author: "Nelson Mandela", bg: "#E9AFA3", fg: "#7a3a2e" },
      { text: "You only fail when you stop trying.", author: "Anonymous", bg: "#81E4DA", fg: "#1a5c57" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", bg: "#FDE8EC", fg: "#8a2036" },
      { text: "Your only limit is your mind.", author: "Anonymous", bg: "#D0F5F1", fg: "#1a5c57" },
      { text: "Push yourself because no one else is going to do it for you.", author: "Anonymous", bg: "#F7E5E0", fg: "#7a3a2e" },
      { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous", bg: "#EA526F", fg: "#fff" },
    ];

    function renderQuotes() {
      var cont = document.getElementById('quotes-container');
      cont.innerHTML = '';
      quotes.forEach(function (q) {
        var card = document.createElement('div');
        card.className = 'quote-card';
        card.style.background = q.bg;
        card.style.color = q.fg;
        card.innerHTML = '<div class="quote-text">' + q.text + '</div><div class="quote-author">— ' + q.author + '</div>';
        cont.appendChild(card);
      });
    }

    // ── INIT ──
    renderWater();
// ── ABOUT PAGE ──
// Paste this at the bottom of your index.js
 
function toggleReadMore(id, btn) {
  var full = document.getElementById('full-' + id);
  var isOpen = full.classList.contains('open');
  full.classList.toggle('open');
  btn.textContent = isOpen ? 'Read more ↓' : 'Read less ↑';
}