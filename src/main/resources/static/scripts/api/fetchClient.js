export function fetchNewsSummary() {
    return fetch('/api/news/summary')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}
export function fetchActivitiesSummary() {
    return fetch('/api/activities/summary')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

