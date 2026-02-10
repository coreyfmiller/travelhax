require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');

const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from current directory
app.use(express.static(__dirname));

// Supabase Auth Helper
const getSupabaseClient = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return supabase; // Fallback to service role if no auth (though we should require it)

    const token = authHeader.replace('Bearer ', '');
    // Create a new client with the user's token so RLS works
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};

// Middleware to require authentication
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    try {
        const token = authHeader.replace('Bearer ', '');
        const client = getSupabaseClient(req);
        const { data, error } = await client.auth.getUser(token);

        if (error || !data.user) throw new Error('Invalid token');

        req.user = data.user;
        req.supabase = client;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized: ' + error.message });
    }
};

// Function to call Gemini API
async function callGemini(prompt, fileData, mimeType) {
    const key = process.env.GEMINI_API_KEY;
    // Using the confirmed working model
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const parts = [{ text: prompt }];

    if (fileData && mimeType) {
        parts.push({
            inline_data: {
                mime_type: mimeType,
                data: fileData
            }
        });
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: parts
            }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
}

// API Routes
app.post('/api/parse-email', authenticateUser, async (req, res) => {
    try {
        let prompt = req.body.prompt;
        const { emailText, fileData, mimeType } = req.body;

        if (!prompt && !fileData) {
            console.log('Request body:', req.body); // Debug what we actually got
            return res.status(400).json({ error: 'Prompt or file data is required' });
        }

        console.log(`Received parse request (${fileData ? 'PDF' : 'Text'})...`);
        const data = await callGemini(prompt, fileData, mimeType);
        console.log('Gemini response received.');

        res.json(data);

    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Helper to format trip names
const formatTripName = (data) => {
    if (!data.events || data.events.length === 0) {
        return data.extraction_metadata?.email_subject || 'Untitled Trip';
    }
    const first = data.events[0];
    const type = first.event_type || 'Event';

    // Format type: rental_car -> Rental Car
    const formattedType = type.split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    if (type === 'flight') {
        return `Flight to ${first.location?.name || 'Unknown'}`;
    } else if (type === 'hotel') {
        return `Stay at ${first.provider?.name || 'Hotel'}`;
    } else {
        return formattedType; // "Dining", "Rental Car"
    }
};

// Save a trip
app.post('/api/trips', authenticateUser, async (req, res) => {
    try {
        const { tripData } = req.body;
        const userSupabase = req.supabase;

        const tripName = formatTripName(tripData);

        // Check for duplicates (scoped to the user because we use their client)
        const { data: existingTrips } = await userSupabase.from('trips').select('parsed_data');

        const isDuplicate = existingTrips?.some(t => {
            const existingEvents = t.parsed_data?.events || [];
            const newEvents = tripData.events || [];

            if (existingEvents.length === 0 && newEvents.length === 0) {
                return t.parsed_data?.extraction_metadata?.email_subject === tripData.extraction_metadata?.email_subject;
            }

            return newEvents.some(ne => {
                const newCode = ne.confirmation?.confirmation_code;
                if (!newCode) return false;
                return existingEvents.some(ee => ee.confirmation?.confirmation_code === newCode);
            });
        });

        if (isDuplicate) {
            console.log('Skipping duplicate trip');
            return res.status(200).json({ success: false, message: 'Trip already exists', duplicate: true });
        }

        const { data, error } = await userSupabase
            .from('trips')
            .insert([{ trip_name: tripName, parsed_data: tripData, user_id: req.user.id }])
            .select();

        if (error) throw error;

        console.log(`Trip saved for user ${req.user.email}:`, data[0].id);
        res.json(data);
    } catch (error) {
        console.error('Save Trip Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get all trips
app.get('/api/trips', authenticateUser, async (req, res) => {
    try {
        const { data, error } = await req.supabase
            .from('trips')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Fetch Trips Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Delete a trip
app.delete('/api/trips/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await req.supabase
            .from('trips')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Delete Trip Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Update a trip (Dynamic Editor)
app.put('/api/trips/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { tripData } = req.body;

        console.log(`[PUT] Updating trip ${id} for user ${req.user.email}...`);

        const newTripName = formatTripName(tripData);

        const { data, error } = await req.supabase
            .from('trips')
            .update({
                parsed_data: tripData,
                trip_name: newTripName
            })
            .eq('id', id)
            .select();

        if (error) throw error;

        res.json({ success: true, data });
    } catch (error) {
        console.error('Update Trip Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Supabase Connected: ' + (supabaseUrl ? 'Yes' : 'No'));
    // console.log('Press Ctrl+C to stop');
});
