export async function fetchNewsSummary() {
    const response = await fetch('/api/news/summary');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}
export async function fetchActivitiesSummary() {
    const response = await fetch('/api/activities/summary');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

