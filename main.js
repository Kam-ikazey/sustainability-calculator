// DOM Elements
const guestsInput = document.getElementById('guests');
const nightsInput = document.getElementById('nights');
const guestsVal = document.getElementById('guests-val');
const nightsVal = document.getElementById('nights-val');
const co2Value = document.getElementById('co2-value');
const gaugeFill = document.querySelector('.gauge-fill');
const gaugeLabel = document.getElementById('gauge-label');
const absorbEquiv = document.getElementById('absorb-equiv');
const treesEquiv = document.getElementById('trees-equiv');
const propertySelect = document.getElementById('property');

const carouselItems = document.querySelectorAll('.carousel-item');

// ── Property Data ──
// Negative = carbon negative (absorbs more than it emits)
const PROPERTIES = {
    'alchemist-manor': {
        name: "Alchemist's Manor",
        location: "Uttarakhand, India",
        icon: "🏔️",
        emissionPerPersonPerNight: -340, // NEGATIVE = carbon negative
    },
    'ocean-sanctuary': {
        name: "Ocean Sanctuary Resort",
        location: "Goa, India",
        icon: "🌊",
        emissionPerPersonPerNight: 85,
    },
    'forest-retreat': {
        name: "Forest Retreat Lodge",
        location: "Himachal Pradesh, India",
        icon: "🌲",
        emissionPerPersonPerNight: -120,
    },
    'desert-oasis': {
        name: "Desert Oasis Villa",
        location: "Rajasthan, India",
        icon: "🏜️",
        emissionPerPersonPerNight: 150,
    },
    'mountain-lodge': {
        name: "Mountain Lodge Estate",
        location: "Uttarakhand, India",
        icon: "🏔️",
        emissionPerPersonPerNight: 45,
    }
};

// State
let currentProperty = PROPERTIES['alchemist-manor'];
let currentGuests = parseInt(guestsInput.value);
let currentNights = parseInt(nightsInput.value);
let currentTotalImpact = 0;

// ── Property Selector ──
propertySelect.addEventListener('change', (e) => {
    currentProperty = PROPERTIES[e.target.value];
    updatePropertyCard();
    updateCalculator();
});

function updatePropertyCard() {
    document.getElementById('property-icon').textContent = currentProperty.icon;
    document.getElementById('property-name').textContent = currentProperty.name;
    document.getElementById('property-location').textContent = currentProperty.location;

    const emVal = currentProperty.emissionPerPersonPerNight;
    const emDisplay = emVal < 0 ? `−${Math.abs(emVal)}` : `${emVal}`;
    document.getElementById('emission-value').textContent = emDisplay;
}

// ── Gauge & Calculator Logic ──
function updateCalculator() {
    guestsVal.textContent = currentGuests;
    nightsVal.textContent = currentNights;

    const emissionRate = currentProperty.emissionPerPersonPerNight;
    const totalImpact = currentGuests * currentNights * emissionRate;
    currentTotalImpact = totalImpact;
    // totalImpact is negative for carbon-negative properties

    const isNegative = totalImpact < 0;
    const absTotal = Math.abs(totalImpact);

    // Animate value display
    const displayPrefix = isNegative ? '−' : '';
    animateValue(co2Value, displayPrefix, absTotal, 500);

    // ── Gauge logic ──
    // Arc length ≈ 126
    const maxOffset = 126;

    if (isNegative) {
        // CARBON NEGATIVE: dial starts FULL (green) and stays full as it goes more negative
        // More guests/nights = MORE absorption = MORE green
        // The gauge is always full green for carbon-negative properties
        // We'll scale: 1 person 1 night = small fill, max = big fill
        const maxAbsorption = 340 * 10 * 30; // theoretical max
        const percentage = Math.min(absTotal / maxAbsorption, 1);
        // More absorption = more fill
        const fillPercentage = 0.15 + (percentage * 0.85); // minimum 15% fill
        const newOffset = maxOffset - (fillPercentage * maxOffset);
        
        gaugeFill.style.strokeDashoffset = newOffset;
        gaugeFill.style.stroke = '#2e7d32'; // Always green for carbon negative

        gaugeLabel.textContent = 'Carbon Absorbed';
        gaugeLabel.style.color = '#2e7d32';
    } else {
        // CARBON POSITIVE (normal emission property)
        const maxEmissions = 5000;
        const percentage = Math.min(absTotal / maxEmissions, 1);
        const newOffset = maxOffset - (percentage * maxOffset);

        gaugeFill.style.strokeDashoffset = newOffset;

        if (percentage > 0.7) {
            gaugeFill.style.stroke = '#d32f2f';
        } else if (percentage > 0.4) {
            gaugeFill.style.stroke = '#fbc02d';
        } else {
            gaugeFill.style.stroke = '#ff9800';
        }

        gaugeLabel.textContent = 'Estimated Emissions';
        gaugeLabel.style.color = '';
    }

    // ── Factoids ──
    updateFactoids(totalImpact, isNegative, absTotal);
    
    // ── Narrative Copy ──
    updateNarrative(totalImpact, isNegative, absTotal);
}

function updateNarrative(totalImpact, isNegative, absTotal) {
    const textEl = document.getElementById('stay-narrative-text');
    const treesEl = document.getElementById('narrative-trees');
    const waterEl = document.getElementById('narrative-water');
    const energyEl = document.getElementById('narrative-energy');

    if (!textEl) return;

    const baseline = currentGuests * currentNights * 35; // 35kg/night baseline
    const saved = Math.max(0, baseline - totalImpact);
    
    let waterHarvestFactor = 548;
    if (currentProperty.name.includes("Ocean")) waterHarvestFactor = 380;
    if (currentProperty.name.includes("Desert")) waterHarvestFactor = 150;
    const waterLiters = currentNights * waterHarvestFactor;

    const phoneCharges = Math.round(saved * 120);
    const treesEquivalent = Math.max(1, Math.round(saved / 22));

    if (isNegative) {
        textEl.innerHTML = `Your stay emitted <strong>0 kgs</strong> of CO₂, which is <strong>100% less</strong> than any traditional hotel you could stay at. And going a step further, the green architecture, rainwater harvesting, recycling, and <strong>${currentProperty.name}</strong>'s other stewardship activities further absorbed <strong>${absTotal.toLocaleString()} kg</strong> of carbon from the planet during your stay, making it net carbon negative.`;
    } else {
        const savedPercent = Math.max(0, Math.round((saved / baseline) * 100));
        textEl.innerHTML = `Your stay emitted only <strong>${totalImpact.toLocaleString()} kgs</strong> of CO₂, which is over <strong>${savedPercent}% less</strong> than a traditional hotel. Going a step further, the green architecture, solar power, and conservation activities at <strong>${currentProperty.name}</strong> successfully avoided <strong>${saved.toLocaleString()} kg</strong> of carbon emissions, making it an exceptionally conscious stay.`;
    }

    treesEl.textContent = treesEquivalent.toLocaleString();
    waterEl.textContent = `${waterLiters.toLocaleString()} L`;
    energyEl.textContent = phoneCharges.toLocaleString();
}

function updateFactoids(totalImpact, isNegative, absTotal) {
    const factoid1 = document.getElementById('factoid-1');
    const factoid2 = document.getElementById('factoid-2');

    if (isNegative) {
        // Carbon negative — show absorption stats
        factoid1.querySelector('.factoid-icon').textContent = '🌲';
        absorbEquiv.textContent = `absorbs ${absTotal.toLocaleString()} kg`;

        const treesEquivalent = Math.round(absTotal / 22);
        treesEquiv.textContent = `planting ${treesEquivalent.toLocaleString()} trees`;
    } else {
        // Carbon positive — show emission equivalents
        factoid1.querySelector('.factoid-icon').textContent = '✈️';
        const flights = Math.round(absTotal / 250);
        absorbEquiv.textContent = `${flights} short-haul flight${flights !== 1 ? 's' : ''}`;

        const trees = Math.round(absTotal / 22);
        treesEquiv.textContent = `${trees} tree${trees !== 1 ? 's' : ''} to offset`;
    }
}

function animateValue(obj, prefix, endVal, duration) {
    const startVal = parseInt(obj.textContent.replace(/[^0-9]/g, '')) || 0;
    let startTimestamp = null;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (endVal - startVal) + startVal);
        obj.innerHTML = prefix + current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// ── Event Listeners ──
guestsInput.addEventListener('input', (e) => {
    currentGuests = parseInt(e.target.value);
    updateCalculator();
});

nightsInput.addEventListener('input', (e) => {
    currentNights = parseInt(e.target.value);
    updateCalculator();
});

// ── Carousel Logic ──
let activeIndex = 2;
const totalItems = 5;

function updateCarousel() {
    carouselItems.forEach((item, index) => {
        item.className = 'carousel-item';

        let offset = index - activeIndex;
        if (offset > 2) offset -= totalItems;
        if (offset < -2) offset += totalItems;

        if (offset === 0) {
            item.classList.add('center');
            item.style.zIndex = 20;
            item.style.transform = 'translateX(0) scale(1) rotateY(0deg)';
        } else if (Math.abs(offset) === 1) {
            item.classList.add(offset > 0 ? 'right' : 'left');
            item.style.zIndex = 10;
            const tx = offset > 0 ? '60%' : '-60%';
            const ry = offset > 0 ? '-25deg' : '25deg';
            item.style.transform = `translateX(${tx}) scale(0.8) rotateY(${ry})`;
        } else {
            item.style.zIndex = 5;
            const tx = offset > 0 ? '90%' : '-90%';
            item.style.transform = `translateX(${tx}) scale(0.6) rotateY(0deg)`;
            item.style.opacity = '0';
        }

        if (offset !== 0) {
            item.style.opacity = '0.6';
            item.style.filter = 'blur(1px)';
            item.style.cursor = 'pointer';
        } else {
            item.style.opacity = '1';
            item.style.filter = 'blur(0)';
            item.style.cursor = 'default';
        }

        item.onclick = () => {
            activeIndex = index;
            updateCarousel();
        };
    });
}

// ── Flip Card Logic ──
function toggleFlip(card) {
    // Close any other flipped card
    document.querySelectorAll('.flip-card.flipped').forEach(c => {
        if (c !== card) c.classList.remove('flipped');
    });
    card.classList.toggle('flipped');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.flip-card')) {
        document.querySelectorAll('.flip-card.flipped').forEach(c => {
            c.classList.remove('flipped');
        });
    }
});

// ── Initialize ──
updatePropertyCard();
updateCalculator();
updateCarousel();

// ── Mobile Navigation ──
const navArrow1 = document.getElementById('nav-arrow-1');
const navArrow2 = document.getElementById('nav-arrow-2');
const navArrowBack = document.getElementById('nav-arrow-back');
const slide2 = document.getElementById('slide-2');
const slide3 = document.getElementById('slide-3');
const sidebarEl = document.querySelector('.sidebar');
const appContainer = document.querySelector('.app-container');

function scrollToSlide(slideElement) {
    if (!slideElement || !appContainer) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        const containerRect = appContainer.getBoundingClientRect();
        const slideRect = slideElement.getBoundingClientRect();
        const scrollPosition = appContainer.scrollLeft + (slideRect.left - containerRect.left);
        appContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    } else {
        slideElement.scrollIntoView({ behavior: 'smooth' });
    }
}

if (navArrow1) navArrow1.addEventListener('click', () => scrollToSlide(slide2));
if (navArrow2) navArrow2.addEventListener('click', () => scrollToSlide(slide3));
if (navArrowBack) navArrowBack.addEventListener('click', () => scrollToSlide(sidebarEl));

const reserveBtn = document.getElementById('reserve-btn');
if (reserveBtn) {
    reserveBtn.addEventListener('click', () => {
        const offsetVal = Math.max(10, Math.abs(currentTotalImpact));
        window.location.href = `verify.html?name=Stewardship+Guest&amount=${offsetVal}`;
    });
}
