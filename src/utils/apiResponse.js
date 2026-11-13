export async function readApiResponse(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    if (response.status === 404) {
      throw new Error(
        "The chat API route is not available. Restart the backend so it loads the latest messaging routes."
      );
    }

    throw new Error(
      `The server returned an unexpected response (HTTP ${response.status}). Check that the backend is running at the configured API address.`
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`The server returned invalid JSON (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}
