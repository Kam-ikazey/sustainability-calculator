// ── Verify Certificate Logic ──

window.addEventListener('load', () => {
    // 1. Parse Query Parameters
    const params = new URLSearchParams(window.location.search);
    const guestName = params.get('name') || "Valued Traveler";
    const offsetAmount = parseInt(params.get('amount')) || 150;
    const verificationId = params.get('id') || generateMockHash(guestName, offsetAmount);

    // 2. Perform Fractional Calculations
    const parentCapacity = 2000; // 2.0 Tonnes = 2,000 kg
    const sharePercentage = Math.min(100, (offsetAmount / parentCapacity) * 100);

    // 3. Bind Dynamic Text Elements
    document.getElementById('guest-name').textContent = guestName;
    document.getElementById('offset-weight').textContent = `${offsetAmount.toLocaleString()} kg`;
    document.getElementById('allocation-weight').textContent = `${offsetAmount.toLocaleString()} kg`;
    document.getElementById('share-pct').textContent = `${sharePercentage.toFixed(2)}%`;
    document.getElementById('verification-id').textContent = verificationId;

    // Set progress bar width
    const shareBar = document.getElementById('share-bar');
    if (shareBar) {
        // Subtle timeout to trigger CSS transition animation
        setTimeout(() => {
            shareBar.style.width = `${sharePercentage}%`;
        }, 100);
    }

    // 4. Set Current Verification Date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const todayStr = new Date().toLocaleDateString('en-US', options);
    document.getElementById('cert-timestamp').textContent = `Verified on ${todayStr}`;

    // 5. Update Registry Link with Serial parameters
    const unSerial = document.getElementById('un-serial').textContent;
    const unLink = document.getElementById('un-registry-link');
    if (unLink) {
        unLink.href = `https://cdm.unfccc.int/Registry/PublicRegistry/index.html?serial=${encodeURIComponent(unSerial)}`;
    }

    // 6. Action Button Handlers
    setupActionButtons();
});

// Helper to generate a mock SHA-256 style hash for verification visual
function generateMockHash(name, amount) {
    const salt = new Date().toDateString();
    const str = `${name}-${amount}-${salt}-mld-homes-stewardship`;
    
    // Simple fast hashing for browser prototype
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `c3ab${hex}d13b482e90f${hex.slice(2, 6)}b2e9`;
}

function setupActionButtons() {
    const btnPrint = document.getElementById('btn-print');
    const btnCopy = document.getElementById('btn-copy');

    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    if (btnCopy) {
        btnCopy.addEventListener('click', () => {
            const currentUrl = window.location.href;
            navigator.clipboard.writeText(currentUrl)
                .then(() => {
                    const originalText = btnCopy.innerHTML;
                    btnCopy.innerHTML = "<span>✓</span> Copied Link!";
                    btnCopy.style.background = "#e8f5e9";
                    btnCopy.style.color = "#2e7d32";
                    btnCopy.style.borderColor = "#c8e6c9";

                    setTimeout(() => {
                        btnCopy.innerHTML = originalText;
                        btnCopy.style.background = "";
                        btnCopy.style.color = "";
                        btnCopy.style.borderColor = "";
                    }, 2000);
                })
                .catch(err => {
                    console.error("Clipboard write failed: ", err);
                    alert("Could not copy URL to clipboard. Please copy manually from the browser address bar.");
                });
        });
    }
}
