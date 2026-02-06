// src/lib/api.ts

// 🔒 TARGETING PORT 8000 BASED ON YOUR LOGS
const API_URL = "http://127.0.0.1:8000/api";

export async function uploadPayrollFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        console.log(`🚀 Uploading to: ${API_URL}/audit/scan`);

        const res = await fetch(`${API_URL}/audit/scan`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Server Error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        console.log("✅ DATA RECEIVED:", data);
        return data;

    } catch (error) {
        console.error("❌ UPLOAD FAILED:", error);
        throw new Error("SYSTEM OFFLINE: Unable to reach Sovereign Brain.");
    }
}

// Placeholder for Live Feed if we need it later
export async function fetchLiveFeed() {
    return [];
}
