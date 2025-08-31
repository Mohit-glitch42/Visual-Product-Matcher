// No base URL is needed for deployment when using a proxy or rewrite rule.
// The browser will automatically use the current domain.

export async function searchByImageFile(file) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    // Use a relative path for the API endpoint.
    const res = await fetch(`/api/search`, {
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
    // Use a relative path for the API endpoint.
    const res = await fetch(`/api/search`, {
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
