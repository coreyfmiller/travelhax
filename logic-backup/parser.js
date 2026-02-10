// --- 1. SAMPLES & CONSTANTS ---
const SUPABASE_URL = 'https://webrdhxlvbhlhuxtkubg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AQwbfzRICymzPeefOGuCEA_N1WRUtTF';

const sampleEmails = {
    flight: `Subject: Flight Confirmation - AC123 Toronto to Vancouver

Dear John Smith,

Your flight is confirmed!

Confirmation Code: ABC123
Ticket Number: 0142345678901

Flight Details:
Date: March 15, 2026
Flight: AC123
Airline: Air Canada
Departure: 17:00 (5:00 PM) - Toronto Pearson (YYZ)
Arrival: 19:15 (7:15 PM) - Vancouver International (YVR)
Seat: 12A (Window)
Class: Economy

Passengers:
John Smith

Cost:
Total: $450.00 CAD`,

    hotel: `Subject: Hotel Reservation - Marriott Downtown

Hi John,

Thanks for booking with Marriott!

Confirmation Number: 99887766

Hotel: Marriott Downtown Toronto
Check-in: March 14, 2026 (3:00 PM)
Check-out: March 17, 2026 (11:00 AM)
Guests: 2 Adults
Room Type: King Suite with City View

Address:
525 Bay Street, Toronto, ON M5G 2L2

Payment Summary:
Total: $850.00 CAD
Status: Paid in full`,

    rental: `Subject: Car Rental Confirmation - Enterprise

Your car is reserved.

Confirmation Number: E12345678

Pickup:
Location: Toronto Pearson Airport (YYZ)
Date: March 15, 2026
Time: 6:30 PM

Return Details:
Location: Same as pickup
Date: March 17, 2026
Time: 5:00 PM

Vehicle: Compact SUV or Similar
Rate: $89.99 per day`,

    dinner: `Subject: Reservation Confirmed for Dinner at The Keg

Dear John Smith,

Your table is reserved!

Restaurant: The Keg Steakhouse
Date: Saturday, March 16, 2026
Time: 7:30 PM
Guests: 4 People

Confirmation Number: 88221199

Address:
515 Jarvis Street
Toronto, ON

Important Notes:
- Business Casual dress code
- Your special request: "Quiet booth please" has been noted.`,

    lunch: `Subject: Lunch Reservation - Momofuku Noodle Bar

Hi John,

Restaurant: Momofuku Noodle Bar
Date: Sunday, March 17, 2026
Time: 12:30 PM
Party Size: 2

Confirmation Code: RESY-554433

Location:
190 University Ave
Toronto, ON`
};

// --- 2. GLOBAL EXPORTS (Fixes ReferenceError) ---
window.currentUser = null;
window.supabaseClient = null;

window.loadSample = function (type) {
    const input = document.getElementById('emailInput');
    if (input) {
        input.value = sampleEmails[type];
    }
};

window.openAuthModal = function () {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('hidden');
};

window.closeAuthModal = function () {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('hidden');
};

window.toggleAuthMode = function () {
    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleBtn = document.getElementById('authModeToggle');

    // Check current state from button text or a global
    window.isSignUpMode = !window.isSignUpMode;

    if (window.isSignUpMode) {
        title.textContent = "Create Account";
        subtitle.textContent = "Start organizing your travel plans today";
        submitBtn.textContent = "Sign Up";
        toggleBtn.textContent = "Already have an account? Sign in";
    } else {
        title.textContent = "Welcome Back";
        subtitle.textContent = "Sign in to manage your travel plans";
        submitBtn.textContent = "Sign In";
        toggleBtn.textContent = "Don't have an account? Sign up";
    }
};

window.handleSignOut = async function () {
    if (window.supabaseClient) {
        await window.supabaseClient.auth.signOut();
        window.location.reload();
    }
};

// --- 3. CORE LOGIC ---

const MASTER_PROMPT = `You are a specialized Travel Confirmation Data Extraction Engine. Your sole purpose is to analyze travel-related emails and extract structured data in JSON format.

CRITICAL: You MUST output ONLY valid JSON. No explanations, no markdown, no code blocks - just pure JSON.

Extract all travel details from the email and output them according to this structure:

{
  "extraction_metadata": {
    "extracted_at": "[ISO 8601 timestamp]",
    "email_subject": "[subject line]",
    "confidence_score": [0.0-1.0],
    "is_travel_related": [true/false],
    "parser_version": "1.0"
  },
  "events": [
    {
      "event_id": "[unique ID]",
      "event_type": "[flight|hotel|rental_car|activity|dining|other]",
      "status": "[confirmed|cancelled|delayed|modified]",
      "provider": {
        "name": "[company name]",
        "support_phone": "[phone]"
      },
      "confirmation": {
        "confirmation_code": "[booking reference]",
        "confidence": [0.0-1.0]
      },
      "timing": {
        "start_datetime": "[ISO 8601 with timezone]",
        "timezone": "[IANA timezone]"
      },
      "location": {
        "name": "[location name]",
        "address": {
          "full_address": "[complete address]"
        }
      },
      "important_notes": ["[array of important details]"],
      "cost": {
          "total": [number],
          "currency": "[USD|CAD|EUR|etc]"
      },
      "flight_details": {
          "airline": "[airline name]",
          "flight_number": "[flight num]",
          "departure_airport": { "code": "[IATA]", "gate": "[gate]" },
          "arrival_airport": { "code": "[IATA]" },
          "seat": "[seat]",
          "class": "[economy|business]"
      },
      "accommodation_details": {
          "check_in": "[datetime]",
          "check_out": "[datetime]",
          "room_type": "[string]",
          "number_of_nights": [int],
          "guest_name": "[string]"
      },
      "rental_details": {
          "vehicle_type": "[string]",
          "pickup_datetime": "[datetime]",
          "dropoff_datetime": "[datetime]",
          "pickup_location": "[string]",
          "dropoff_location": "[string]"
      }
    }
  ]
}

Rules:
- Extract ONLY explicitly stated information
- Use null for missing fields
- Convert all dates to ISO 8601 format (YYYY-MM-DDTHH:MM:SS±HH:MM)
- Assign confidence scores (1.0 = certain, 0.5 = uncertain)
- Detect status from keywords (confirmed, cancelled, delayed)
- Include timezone information when available
- Output ONLY the JSON, nothing else
`;

let selectedFileData = null;

window.handleFileSelect = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File is too large. Please select a PDF under 10MB.');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64Data = e.target.result.split(',')[1];
        selectedFileData = {
            base64: base64Data,
            mimeType: file.type,
            name: file.name
        };

        // Update UI
        document.getElementById('fileInfo').classList.remove('hidden');
        document.getElementById('fileName').textContent = `📄 ${file.name}`;
        document.getElementById('emailInput').placeholder = "PDF linked. You can still add extra notes here if needed...";
    };
    reader.readAsDataURL(file);
};

window.clearFile = function () {
    selectedFileData = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('emailInput').placeholder = "Paste your travel confirmation email here...";
};

window.clearAll = function () {
    document.getElementById('emailInput').value = '';
    if (document.getElementById('jsonOutput')) document.getElementById('jsonOutput').textContent = '';
};

window.parseEmail = async function () {
    if (!window.currentUser) {
        window.openAuthModal();
        return;
    }

    const emailText = document.getElementById('emailInput').value.trim();
    if (!emailText && !selectedFileData) {
        return alert('Please paste an email or upload a PDF to parse.');
    }

    const loading = document.getElementById('loading');
    const parseBtn = document.getElementById('parseBtn');
    if (loading) loading.classList.remove('hidden');
    if (parseBtn) parseBtn.disabled = true;

    try {
        const payload = {
            prompt: MASTER_PROMPT + "\n\nEmail/Document Content:\n" + (emailText || "Extract data from the attached document.")
        };

        if (selectedFileData) {
            payload.fileData = selectedFileData.base64;
            payload.mimeType = selectedFileData.mimeType;
        }

        const session = await window.supabaseClient.auth.getSession();
        const token = session.data.session?.access_token;

        const response = await fetch('http://localhost:3000/api/parse-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        let jsonText = aiResponse.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const parsedData = JSON.parse(jsonText);
        saveTrip(parsedData);

    } catch (error) {
        console.error('Parsing error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        if (loading) loading.classList.add('hidden');
        if (parseBtn) parseBtn.disabled = false;
    }
};

async function saveTrip(tripData) {
    if (!window.currentUser) return;

    try {
        const session = await window.supabaseClient.auth.getSession();
        const response = await fetch('http://localhost:3000/api/trips', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.data.session?.access_token}`
            },
            body: JSON.stringify({ tripData })
        });

        if (response.ok) {
            loadTrips(); // Refresh
        }
    } catch (e) {
        console.error('Error saving trip:', e);
    }
}

// --- 4. UI LOADING ---

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userEmail = document.getElementById('userEmail');
    const guestOverlay = document.getElementById('guestOverlay');

    if (window.currentUser) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        if (userEmail) userEmail.textContent = window.currentUser.email;
        if (guestOverlay) guestOverlay.classList.add('hidden');
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
        if (guestOverlay) guestOverlay.classList.remove('hidden');
    }
}

async function loadTrips() {
    if (!window.currentUser) return;

    const list = document.getElementById('tripsList');
    if (list) {
        list.innerHTML = '<div class="flex items-center justify-center p-8"><div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>';
    }

    try {
        const session = await window.supabaseClient.auth.getSession();
        const response = await fetch('http://localhost:3000/api/trips', {
            headers: { 'Authorization': `Bearer ${session.data.session?.access_token}` }
        });
        const trips = await response.json();

        const countEl = document.getElementById('tripCount');
        if (countEl) {
            countEl.textContent = `${trips.length} items`;
            countEl.classList.remove('hidden');
        }

        if (trips.length === 0) {
            list.innerHTML = '<p class="text-center text-muted-foreground py-8">No trips found. Try parsing an email sample!</p>';
            return;
        }

        renderTripsList(trips);
    } catch (e) {
        console.error('Error loading trips:', e);
    }
}

function renderTripsList(trips) {
    const list = document.getElementById('tripsList');
    // Simplified render for brevity, we can add full card logic if needed
    // But let's keeping it working first
    trips.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let html = '';
    trips.forEach(trip => {
        const data = trip.parsed_data;
        const type = data.events?.[0]?.event_type || 'event';
        html += `
            <div class="p-4 border border-border rounded-lg mb-4 bg-card">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-xs font-bold uppercase text-primary">${type}</span>
                        <h4 class="font-bold">${trip.trip_name || 'Untitled'}</h4>
                    </div>
                    <button onclick="deleteTrip('${trip.id}')" class="text-muted-foreground hover:text-destructive">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

window.deleteTrip = async function (tripId) {
    if (!confirm('Delete this trip?')) return;
    try {
        const session = await window.supabaseClient.auth.getSession();
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session.data.session?.access_token}` }
        });
        if (response.ok) loadTrips();
    } catch (e) {
        console.error('Delete error:', e);
    }
};

// --- 5. INITIALIZATION ---

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const submitBtn = document.getElementById('authSubmitBtn');

    submitBtn.disabled = true;
    submitBtn.textContent = window.isSignUpMode ? "Signing Up..." : "Signing In...";

    try {
        let result;
        if (window.isSignUpMode) {
            result = await window.supabaseClient.auth.signUp({ email, password });
        } else {
            result = await window.supabaseClient.auth.signInWithPassword({ email, password });
        }

        if (result.error) throw result.error;

        if (window.isSignUpMode && !result.session) {
            alert("Check your email for the confirmation link!");
        }
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = window.isSignUpMode ? "Sign Up" : "Sign In";
    }
}

function initSupabase() {
    // Check possible library names
    const lib = window.supabase || window.supabasejs;

    // If it has createClient AND it's not already a client instance
    if (lib && typeof lib.createClient === 'function' && !lib.auth) {
        window.supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("✅ Supabase client initialized.");

        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            window.currentUser = session?.user || null;
            updateAuthUI();
            if (window.currentUser) {
                loadTrips();
                closeAuthModal();
            }
        });

        // Form listener
        const authForm = document.getElementById('authForm');
        if (authForm) authForm.addEventListener('submit', handleAuth);
    } else if (window.supabaseClient) {
        console.log("✅ Supabase client already exists.");
    } else {
        console.warn("⏳ Waiting for Supabase library to load from CDN...");
        setTimeout(initSupabase, 200);
    }
}

function init() {
    console.log("✈️ parser.js v0.4 initializing...");
    initSupabase();
}

document.addEventListener('DOMContentLoaded', init);
