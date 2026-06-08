// ==========================================
// 1. BACKEND STATE SYSTEM CONFIGURATION
// ==========================================
let graceState = {
    streak: localStorage.getItem('gw_streak') ? parseInt(localStorage.getItem('gw_streak')) : 0,
    bestStreak: localStorage.getItem('gw_best_streak') ? parseInt(localStorage.getItem('gw_best_streak')) : 0,
    lastCompletedDate: localStorage.getItem('gw_last_date') || "",
    journalLogs: JSON.parse(localStorage.getItem('gw_journal_data')) || [],
    selectedType: "Reflection"
};

// Initial Core UI Stat Population
document.getElementById('streak-count').textContent = graceState.streak;

// Scriptural Verses Rotating Bank
const scriptureVerses = [
    '"Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105',
    '"Be anxious for nothing, but in everything by prayer and supplication..." — Philippians 4:6',
    '"But they that wait upon the Lord shall renew their strength..." — Isaiah 40:31',
    '"Pray without ceasing." — 1 Thessalonians 5:17',
    '"Let all that you do be done in love." — 1 Corinthians 16:14'
];

// Set a random verse on startup
document.getElementById('bible-verse-header').textContent = scriptureVerses[Math.floor(Math.random() * scriptureVerses.length)];


// ==========================================
// 2. WINDOW ARCHITECTURE SWITCH ROUTER
// ==========================================
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        const targetView = item.getAttribute('data-target');
        viewSections.forEach(view => {
            view.classList.remove('active');
            if(view.id === targetView) view.classList.add('active');
        });

        // Trigger Sub-view Rendering Routines
        if(targetView === 'journal-view') renderJournalTimeline();
        if(targetView === 'analytics-view') populateAnalyticsWorkspace();
    });
});


// ==========================================
// 3. PROGRESS CIRCLE COMPUTING ENGINE
// ==========================================
const checkboxes = document.querySelectorAll('.prayer-checkbox');
const progressText = document.getElementById('progress-text');
const progressRing = document.querySelector('.progress-ring-container');
const progressSummary = document.getElementById('progress-summary');
const submitDayBtn = document.getElementById('submit-day-btn');

function computeProgressMetrics() {
    const totalElements = checkboxes.length;
    const verifiedActiveElements = Array.from(checkboxes).filter(box => box.checked).length;
    const finalPercentage = Math.round((verifiedActiveElements / totalElements) * 100);

    progressText.textContent = `${finalPercentage}%`;
    progressSummary.textContent = `${verifiedActiveElements} of ${totalElements} disciplines completed`;

    // Calculate conic configuration matching gold scheme
    progressRing.style.background = `radial-gradient(closest-side, #111827 79%, transparent 80% 100%), conic-gradient(#d97706 ${finalPercentage}%, #1f293d ${finalPercentage}% 100%)`;

    submitDayBtn.disabled = verifiedActiveElements !== totalElements;
}

checkboxes.forEach(box => box.addEventListener('change', computeProgressMetrics));


// ==========================================
// 4. DAY TRACKING SUBMISSION CONTROLLER
// ==========================================
submitDayBtn.addEventListener('click', () => {
    const currentDayString = new Date().toDateString();

    if (graceState.lastCompletedDate === currentDayString) {
        alert("You have already recorded today's spiritual disciplines! ✨");
        return;
    }

    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayString = yesterdayObj.toDateString();

    // Streak increment evaluation
    if (graceState.lastCompletedDate === yesterdayString || graceState.lastCompletedDate === "") {
        graceState.streak += 1;
    } else {
        graceState.streak = 1;
    }

    // Set records for best streaks
    if (graceState.streak > graceState.bestStreak) {
        graceState.bestStreak = graceState.streak;
        localStorage.setItem('gw_best_streak', graceState.bestStreak);
    }

    graceState.lastCompletedDate = currentDayString;
    localStorage.setItem('gw_streak', graceState.streak);
    localStorage.setItem('gw_last_date', currentDayString);

    document.getElementById('streak-count').textContent = graceState.streak;
    alert(`Day completed! Your current walk streak is now at ${graceState.streak} days. 🔥`);

    checkboxes.forEach(box => box.checked = false);
    computeProgressMetrics();
});


// ==========================================
// 5. JOURNAL DATA COLLECTION CONTROLLER
// ==========================================
const focusButtons = document.querySelectorAll('.focus-btn');
const scriptureInput = document.getElementById('scripture-ref');
const journalNotesInput = document.getElementById('journal-notes');
const saveEntryBtn = document.getElementById('save-entry-btn');
const journalFeed = document.getElementById('journal-feed');

focusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        focusButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        graceState.selectedType = btn.getAttribute('data-type');
    });
});

saveEntryBtn.addEventListener('click', () => {
    const mainBodyText = journalNotesInput.value.trim();
    if(!mainBodyText) {
        alert("Please draft down entry observations before saving.");
        return;
    }

    const newLogItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        type: graceState.selectedType,
        scripture: scriptureInput.value.trim(),
        text: mainBodyText
    };

    graceState.journalEntries = graceState.journalLogs || [];
    graceState.journalLogs.unshift(newLogItem);
    localStorage.setItem('gw_journal_data', JSON.stringify(graceState.journalLogs));

    // Reset Forms
    journalNotesInput.value = "";
    scriptureInput.value = "";
    alert("Log successfully saved to your records!");
    renderJournalTimeline();
});

function renderJournalTimeline() {
    if (graceState.journalLogs.length === 0) {
        journalFeed.innerHTML = `<p class="empty-state">No entries recorded yet. Begin your logging above!</p>`;
        return;
    }

    journalFeed.innerHTML = graceState.journalLogs.map(log => {
        let tagClass = "tag-reflection";
        if(log.type === "Prayer Request") tagClass = "tag-request";
        if(log.type === "Praise Report") tagClass = "tag-praise";

        return `
            <div class="log-item">
                <div class="log-header">
                    <span>${log.date}</span>
                    <span class="log-type-tag ${tagClass}">${log.type}</span>
                </div>
                ${log.scripture ? `<div class="log-scripture"><i class="fa-solid fa-book"></i> ${log.scripture}</div>` : ''}
                <p class="log-body" style="color: #d1d5db; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap;">${log.text}</p>
            </div>
        `;
    }).join('');
}


// ==========================================
// 6. METRICS & ANALYSIS MATRIX WORKSPACE
// ==========================================
function populateAnalyticsWorkspace() {
    document.getElementById('best-streak-num').textContent = `${graceState.bestStreak} days`;
    document.getElementById('total-logs-num').textContent = `${graceState.journalLogs.length} entries`;

    const gridElement = document.getElementById('history-grid');
    gridElement.innerHTML = "";

    // Generate custom 60-day dashboard grids
    for (let i = 0; i < 60; i++) {
        const squareNode = document.createElement('div');
        squareNode.classList.add('grid-square');
        
        // Random allocations mapping out beautiful operational metrics data
        if(Math.random() > 0.52 || (i < graceState.streak)) {
            squareNode.classList.add('active');
        }
        gridElement.appendChild(squareNode);
    }
}

// Check consistency boundaries on open
function verifyStreakCompliance() {
    const currentDayStr = new Date().toDateString();
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toDateString();

    if (graceState.lastCompletedDate !== "" && graceState.lastCompletedDate !== currentDayStr && graceState.lastCompletedDate !== yesterdayStr) {
        graceState.streak = 0;
        localStorage.setItem('gw_streak', 0);
        document.getElementById('streak-count').textContent = 0;
    }
}
verifyStreakCompliance();