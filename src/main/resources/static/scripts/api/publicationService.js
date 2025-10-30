export async function fetchNewsSummary() {
    const response = await fetch('/api/news');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}
export async function fetchActivitiesSummary() {
    const response = await fetch('/api/activities');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}
export async function fetchFeaturedSummary() {
    const response = await fetch('/api/featured');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

