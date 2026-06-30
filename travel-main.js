// ── Travel Calculator Database ──
const CITIES = [
    { name: "New Delhi, India", lat: 28.6139, lon: 77.2090 },
    { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
    { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946 },
    { name: "London, United Kingdom", lat: 51.5074, lon: -0.1278 },
    { name: "New York, United States", lat: 40.7128, lon: -74.0060 },
    { name: "Dubai, United Arab Emirates", lat: 25.2048, lon: 55.2708 },
    { name: "Singapore", lat: 1.3521, lon: 103.8198 },
    { name: "Paris, France", lat: 48.8566, lon: 2.3522 },
    { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
    { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 },
    { name: "Frankfurt, Germany", lat: 50.1109, lon: 8.6821 },
    { name: "Kolkata, India", lat: 22.5726, lon: 88.3639 },
    { name: "Chennai, India", lat: 13.0827, lon: 80.2707 },
    { name: "Hyderabad, India", lat: 17.3850, lon: 78.4867 }
];

const PROPERTIES = {
    'alchemist-manor': {
        name: "Alchemist's Manor",
        location: "Uttarakhand, India",
        lat: 30.3165,
        lon: 78.0322,
        icon: "🏔️"
    },
    'ocean-sanctuary': {
        name: "Ocean Sanctuary Resort",
        location: "Goa, India",
        lat: 15.2993,
        lon: 74.1240,
        icon: "🌊"
    },
    'forest-retreat': {
        name: "Forest Retreat Lodge",
        location: "Himachal Pradesh, India",
        lat: 32.2396,
        lon: 77.1887,
        icon: "🌲"
    },
    'desert-oasis': {
        name: "Desert Oasis Villa",
        location: "Rajasthan, India",
        lat: 26.9124,
        lon: 75.7873,
        icon: "🏜️"
    },
    'mountain-lodge': {
        name: "Mountain Lodge Estate",
        location: "Uttarakhand, India",
        lat: 30.3165,
        lon: 78.0322,
        icon: "🏔️"
    }
};

// Factors: kg CO2e per km per person
const FACTORS = {
    airShort: 0.245, // < 500km
    airLong: 0.150,  // >= 500km
    car: 0.180,
    train: 0.035
};

// ── State Variables ──
let currentOrigin = { name: "New Delhi, India", lat: 28.6139, lon: 77.2090 };
let currentProperty = PROPERTIES['alchemist-manor'];
let travelMode = 'air'; // air, train, car, mixed
let totalDistance = 0;

// Mixed split values (KMs)
let splitAir = 0;
let splitTrain = 0;
let splitCar = 0;

// DOM Elements
const originInput = document.getElementById('origin-city');
const detectBtn = document.getElementById('detect-loc-btn');
const autocompleteList = document.getElementById('autocomplete-list');
const locationStatus = document.getElementById('location-status');
const propertySelect = document.getElementById('travel-property');
const routePathText = document.getElementById('route-path-text');
const routeDistanceText = document.getElementById('route-distance-text');
const travelCo2Value = document.getElementById('travel-co2-value');
const travelGaugeFill = document.getElementById('travel-gauge-fill');
const travelTreesEquiv = document.getElementById('travel-trees-equiv');
const routeTypeDisplay = document.getElementById('route-type-display');

// Mixed Sliders
const mixedSlidersPanel = document.getElementById('mixed-sliders-panel');
const airSlider = document.getElementById('mixed-air');
const trainSlider = document.getElementById('mixed-train');
const carSlider = document.getElementById('mixed-car');
const airValText = document.getElementById('mixed-air-val');
const trainValText = document.getElementById('mixed-train-val');
const carValText = document.getElementById('mixed-car-val');
const slidersSumStatus = document.getElementById('sliders-sum-status');

// Comparison
const compareDist = document.getElementById('compare-dist');
const compAirCo2 = document.getElementById('compare-air-co2');
const compCarCo2 = document.getElementById('compare-car-co2');
const compTrainCo2 = document.getElementById('compare-train-co2');
const barAir = document.getElementById('bar-air');
const barCar = document.getElementById('bar-car');
const barTrain = document.getElementById('bar-train');
const savingNudgeText = document.getElementById('saving-nudge-text');

// ── Initialization & Geolocation ──
window.addEventListener('load', () => {
    detectLocationViaIP();
    setupEventListeners();
    updateJourneyCalculator();
});

function detectLocationViaIP() {
    locationStatus.textContent = "Detecting location via IP...";
    originInput.placeholder = "Detecting location...";

    fetch('https://ip-api.com/json/')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.lat && data.lon) {
                const detectedCity = data.city ? `${data.city}, ${data.country}` : data.country;
                currentOrigin = {
                    name: detectedCity,
                    lat: data.lat,
                    lon: data.lon
                };
                originInput.value = detectedCity;
                locationStatus.textContent = `Auto-detected: ${detectedCity}`;
                updateJourneyCalculator();
            } else {
                throw new Error("API returned failure");
            }
        })
        .catch(err => {
            console.error("IP Geolocation failed:", err);
            // Default fallback
            currentOrigin = { name: "New Delhi, India", lat: 28.6139, lon: 77.2090 };
            originInput.value = currentOrigin.name;
            locationStatus.textContent = "Auto-detection failed. Defaulted to New Delhi.";
            updateJourneyCalculator();
        });
}

function setupEventListeners() {
    // Property Selection
    propertySelect.addEventListener('change', (e) => {
        currentProperty = PROPERTIES[e.target.value];
        updateJourneyCalculator();
    });

    // Detect Button Click
    detectBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            locationStatus.textContent = "Requesting browser location...";
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    currentOrigin = {
                        name: `Detected Position (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
                        lat: lat,
                        lon: lon
                    };
                    originInput.value = currentOrigin.name;
                    locationStatus.textContent = "Location detected successfully.";
                    updateJourneyCalculator();
                },
                (err) => {
                    console.warn("Browser Geolocation failed, trying IP...", err);
                    detectLocationViaIP();
                }
            );
        } else {
            detectLocationViaIP();
        }
    });

    // Autocomplete Search
    originInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        autocompleteList.innerHTML = '';
        if (query.length === 0) {
            autocompleteList.style.display = 'none';
            return;
        }

        const matches = CITIES.filter(c => c.name.toLowerCase().includes(query));
        if (matches.length > 0) {
            autocompleteList.style.display = 'block';
            matches.forEach(match => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = match.name;
                item.addEventListener('click', () => {
                    currentOrigin = match;
                    originInput.value = match.name;
                    autocompleteList.innerHTML = '';
                    autocompleteList.style.display = 'none';
                    locationStatus.textContent = `Selected: ${match.name}`;
                    updateJourneyCalculator();
                });
                autocompleteList.appendChild(item);
            });
        } else {
            autocompleteList.style.display = 'none';
        }
    });

    // Close autocomplete on external click
    document.addEventListener('click', (e) => {
        if (e.target !== originInput) {
            autocompleteList.style.display = 'none';
        }
    });

    // Travel Mode Selection
    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const selectedModeCard = e.currentTarget;
            document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
            selectedModeCard.classList.add('active');
            travelMode = selectedModeCard.dataset.mode;
            
            if (travelMode === 'mixed') {
                mixedSlidersPanel.classList.add('show');
            } else {
                mixedSlidersPanel.classList.remove('show');
            }

            updateJourneyCalculator();
        });
    });

    // Sliders input events
    airSlider.addEventListener('input', handleSliderInput);
    trainSlider.addEventListener('input', handleSliderInput);
    carSlider.addEventListener('input', handleSliderInput);
}

// ── Slider Sum Control Logic ──
function handleSliderInput(e) {
    let air = parseInt(airSlider.value);
    let train = parseInt(trainSlider.value);
    let car = parseInt(carSlider.value);
    const sum = air + train + car;

    // Constrain sum to total distance
    if (sum !== totalDistance && totalDistance > 0) {
        const activeSlider = e.target;
        const activeVal = parseInt(activeSlider.value);
        
        // Target remaining distance to divide between the other two sliders
        const remaining = totalDistance - activeVal;
        
        if (remaining < 0) {
            activeSlider.value = totalDistance;
            airSlider.value = activeSlider.id === 'mixed-air' ? totalDistance : 0;
            trainSlider.value = activeSlider.id === 'mixed-train' ? totalDistance : 0;
            carSlider.value = activeSlider.id === 'mixed-car' ? totalDistance : 0;
        } else {
            // Divide remaining proportionally or 50/50
            const otherSliders = [airSlider, trainSlider, carSlider].filter(s => s !== activeSlider);
            const otherVal1 = parseInt(otherSliders[0].value);
            const otherVal2 = parseInt(otherSliders[1].value);
            const otherSum = otherVal1 + otherVal2;

            if (otherSum > 0) {
                otherSliders[0].value = Math.round((otherVal1 / otherSum) * remaining);
                otherSliders[1].value = remaining - parseInt(otherSliders[0].value);
            } else {
                otherSliders[0].value = Math.round(remaining / 2);
                otherSliders[1].value = remaining - parseInt(otherSliders[0].value);
            }
        }
    }

    splitAir = parseInt(airSlider.value);
    splitTrain = parseInt(trainSlider.value);
    splitCar = parseInt(carSlider.value);

    updateEmissions();
}

// ── Calculations ──
function updateJourneyCalculator() {
    // 1. Calculate distance
    totalDistance = getHaversineDistance(
        currentOrigin.lat, currentOrigin.lon,
        currentProperty.lat, currentProperty.lon
    );

    // If coordinates are exact same, set default min distance
    if (totalDistance < 10) totalDistance = 15; 

    // Update textual outputs
    const originLabel = currentOrigin.name.split(',')[0];
    routePathText.textContent = `${originLabel} ➔ ${currentProperty.name}`;
    routeDistanceText.textContent = `${totalDistance.toLocaleString()} km away`;

    // Update SVG route map
    updateRouteMap();

    // 2. Set mode split distributions
    if (travelMode === 'air') {
        splitAir = totalDistance;
        splitTrain = 0;
        splitCar = 0;
    } else if (travelMode === 'train') {
        splitAir = 0;
        splitTrain = Math.round(totalDistance * 1.05); // slightly longer due to tracks
        splitCar = 0;
    } else if (travelMode === 'car') {
        splitAir = 0;
        splitTrain = 0;
        splitCar = Math.round(totalDistance * 1.15); // slightly longer due to roads
    } else if (travelMode === 'mixed') {
        // Init mixed sliders if they are zero
        if (splitAir + splitTrain + splitCar === 0) {
            splitAir = Math.round(totalDistance * 0.7);
            splitTrain = Math.round(totalDistance * 0.2);
            splitCar = totalDistance - splitAir - splitTrain;
        } else {
            // Scale existing splits to fit new total distance
            const currentSum = splitAir + splitTrain + splitCar;
            if (currentSum > 0) {
                splitAir = Math.round((splitAir / currentSum) * totalDistance);
                splitTrain = Math.round((splitTrain / currentSum) * totalDistance);
                splitCar = totalDistance - splitAir - splitTrain;
            }
        }
    }

    // Configure mixed slider max bounds
    airSlider.max = totalDistance;
    trainSlider.max = Math.round(totalDistance * 1.05);
    carSlider.max = Math.round(totalDistance * 1.15);

    // Update sliders UI
    airSlider.value = splitAir;
    trainSlider.value = splitTrain;
    carSlider.value = splitCar;

    updateEmissions();
}

function updateEmissions() {
    // Sliders UI Text updates
    airValText.textContent = splitAir.toLocaleString();
    trainValText.textContent = splitTrain.toLocaleString();
    carValText.textContent = splitCar.toLocaleString();
    
    const sum = splitAir + splitTrain + splitCar;
    slidersSumStatus.textContent = `Total: ${sum.toLocaleString()} km / Target: ${totalDistance.toLocaleString()} km`;

    // 1. Calculate CO2
    const airFactor = splitAir < 500 ? FACTORS.airShort : FACTORS.airLong;
    const airEmissions = splitAir * airFactor;
    const carEmissions = splitCar * FACTORS.car;
    const trainEmissions = splitTrain * FACTORS.train;
    const totalEmissions = Math.round(airEmissions + carEmissions + trainEmissions);

    // Animate large emission counter
    animateValue(travelCo2Value, '', totalEmissions, 500);

    // 2. Update Gauge
    const maxScale = 1500; // max gauge bounds
    const percentage = Math.min(totalEmissions / maxScale, 1);
    const maxOffset = 126;
    const newOffset = maxOffset - (percentage * maxOffset);
    travelGaugeFill.style.strokeDashoffset = newOffset;

    // Color transition based on footprint
    if (totalEmissions > 600) {
        travelGaugeFill.style.stroke = '#d32f2f'; // High Red
    } else if (totalEmissions > 150) {
        travelGaugeFill.style.stroke = '#fb8c00'; // Med Orange
    } else {
        travelGaugeFill.style.stroke = '#2e7d32'; // Eco Green
    }

    // 3. Update Sidebar Factoids
    const treesRequired = Math.max(1, Math.round(totalEmissions / 22)); // 1 tree absorbs ~22kg CO2/year
    travelTreesEquiv.textContent = `${treesRequired.toLocaleString()} tree${treesRequired !== 1 ? 's' : ''}`;

    // 4. Update Comparisons Panel
    compareDist.textContent = `${totalDistance.toLocaleString()} km`;
    
    const altAirCO2 = Math.round(totalDistance * (totalDistance < 500 ? FACTORS.airShort : FACTORS.airLong));
    const altCarCO2 = Math.round(totalDistance * FACTORS.car);
    const altTrainCO2 = Math.round(totalDistance * FACTORS.train);

    compAirCo2.textContent = `${altAirCO2.toLocaleString()} kg`;
    compCarCo2.textContent = `${altCarCO2.toLocaleString()} kg`;
    compTrainCo2.textContent = `${altTrainCO2.toLocaleString()} kg`;

    const maxAltVal = Math.max(altAirCO2, altCarCO2, altTrainCO2, 1);
    barAir.style.width = `${(altAirCO2 / maxAltVal) * 100}%`;
    barCar.style.width = `${(altCarCO2 / maxAltVal) * 100}%`;
    barTrain.style.width = `${(altTrainCO2 / maxAltVal) * 100}%`;

    // Nudge Text
    const savingsPercent = Math.round(((altAirCO2 - altTrainCO2) / altAirCO2) * 100);
    savingNudgeText.innerHTML = `Switching to rail transit saves <strong>${savingsPercent}%</strong> of emissions (${(altAirCO2 - altTrainCO2).toLocaleString()} kg CO₂e) compared to flying!`;
}

// ── SVG Animated Route Map Controller ──
function updateRouteMap() {
    const mapOriginLabel = document.getElementById('map-origin-label');
    const mapDestLabel = document.getElementById('map-dest-label');
    const pathLine = document.getElementById('route-path-line');
    const transitAvatar = document.getElementById('transit-avatar');
    const transitEmoji = document.getElementById('transit-emoji');

    // 1. Set emoji representing mode
    if (travelMode === 'air') {
        transitEmoji.textContent = "✈️";
        routeTypeDisplay.textContent = "Direct Flight";
    } else if (travelMode === 'train') {
        transitEmoji.textContent = "🚄";
        routeTypeDisplay.textContent = "Scenic Rail";
    } else if (travelMode === 'car') {
        transitEmoji.textContent = "🚗";
        routeTypeDisplay.textContent = "Road Route";
    } else {
        transitEmoji.textContent = "🔀";
        routeTypeDisplay.textContent = "Mixed Transit";
    }

    // 2. Set Labels
    mapOriginLabel.textContent = currentOrigin.name.split(',')[0];
    mapDestLabel.textContent = currentProperty.name;

    // 3. Project coordinates dynamically inside our 800x350 box
    const xMin = Math.min(currentOrigin.lon, currentProperty.lon);
    const xMax = Math.max(currentOrigin.lon, currentProperty.lon);
    const yMin = Math.min(currentOrigin.lat, currentProperty.lat);
    const yMax = Math.max(currentOrigin.lat, currentProperty.lat);

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    // Map function
    const mapX = (lon) => {
        const padding = 100;
        return padding + ((lon - xMin) / xRange) * (800 - 2 * padding);
    };

    const mapY = (lat) => {
        const padding = 60;
        // SVG y goes down, lat goes up
        return 350 - (padding + ((lat - yMin) / yRange) * (350 - 2 * padding));
    };

    let x1 = mapX(currentOrigin.lon);
    let y1 = mapY(currentOrigin.lat);
    let x2 = mapX(currentProperty.lon);
    let y2 = mapY(currentProperty.lat);

    // If destination is to the left, flip positions so origin is left
    // to keep the visual flow consistent left-to-right
    if (x1 > x2) {
        const tempX = x1; x1 = x2; x2 = tempX;
        const tempY = y1; y1 = y2; y2 = tempY;
    }

    // Position origin marker
    const originMarker = mapOriginLabel.parentElement;
    originMarker.setAttribute('transform', `translate(${x1}, ${y1})`);

    // Position destination marker
    const destMarker = mapDestLabel.parentElement;
    destMarker.setAttribute('transform', `translate(${x2}, ${y2})`);

    // Calculate curve control point (creates a nice arc above the path)
    const midX = (x1 + x2) / 2;
    const curveHeight = Math.abs(x2 - x1) * 0.2; // height relative to distance
    const ctrlY = Math.min(y1, y2) - curveHeight;

    const pathData = `M ${x1},${y1} Q ${midX},${ctrlY} ${x2},${y2}`;
    pathLine.setAttribute('d', pathData);

    // Update offset path for browser motion path animation
    transitAvatar.style.offsetPath = `path('${pathData}')`;
    
    // Trigger animation reset
    transitAvatar.style.animation = 'none';
    transitAvatar.offsetHeight; /* trigger reflow */
    transitAvatar.style.animation = 'transitTravel 8s ease-in-out infinite';
}

// ── Math Helper: Haversine Formula ──
function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth Radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// ── Value Counter Animation Helper ──
function animateValue(obj, prefix, endVal, duration) {
    const startVal = parseInt(obj.textContent.replace(/[^0-9]/g, '')) || 0;
    if (startVal === endVal) {
        obj.innerHTML = prefix + endVal.toLocaleString();
        return;
    }
    
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

// ── Mobile Navigation Slides Scroll Helper ──
const appContainer = document.querySelector('.app-container');
const navArrow1 = document.getElementById('nav-arrow-1');
const navArrow2 = document.getElementById('nav-arrow-2');
const navArrowBack = document.getElementById('nav-arrow-back');
const sidebarEl = document.querySelector('.sidebar');
const slide2 = document.getElementById('slide-2');
const slide3 = document.getElementById('slide-3');

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
