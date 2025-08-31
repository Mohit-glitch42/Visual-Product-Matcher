// Use an environment variable for the API URL.
// For local development, it falls back to localhost.
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function searchByImageFile(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE_URL}/api/search`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Search failed");
    }
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error("searchByImageFile error:", err);
    throw err;
  }
}

export async function searchByImageUrl(url) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Search failed");
    }
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error("searchByImageUrl error:", err);
    throw err;
  }
}
