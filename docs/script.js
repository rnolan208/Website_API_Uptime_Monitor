/*
 * Website & API Uptime Monitor - Dashboard
 *
 * Handles communication between the frontend and FastAPI backend.
 *
 * Features:
 * - Load monitored websites and dashboard statistics
 * - Display website statuses and response times
 * - Run monitoring checks for all websites
 * - Display individual statistics and recent check history
 * - Refresh expanded panels after new checks
 */

const totalWebsitesElement = document.getElementById("total-websites");

const websiteCards = document.querySelectorAll(".website-card")

const onlineWebsitesElement = document.getElementById("online-websites");

function updateOnlineCount() {

    const cardsArray = Array.from(websiteCards);

    const onlineCards = cardsArray.filter(card => {
        const onlineStatus = card.querySelector(".status-badge").textContent;

        return onlineStatus === "ONLINE";

    });

    onlineWebsitesElement.textContent = onlineCards.length;

}

const totalChecksElement = document.getElementById("total-checks");


// Fetch the total number of monitoring checks saved within the SQLite database.
function loadTotalChecks() {

    return fetch("http://127.0.0.1:8000/stats")
        .then(response => response.json())
        .then(data => {
            totalChecksElement.textContent = data.total_checks;
        })
        .catch(error => {
            console.error("Error fetching statistics:", error);
        });

}

loadTotalChecks();


fetch("http://127.0.0.1:8000/websites")
    .then(response => response.json())
    .then(data => {
        console.log("Monitored websites:", data.websites);

        totalWebsitesElement.textContent = data.websites.length
    })
    .catch(error => {
        console.error("Error fetching websites:", error);
    });


// Retrieve a website's latest saved check and update its status, response time and timestamp.
function loadWebsiteStatus(url, statusElementId, responseTimeElementId) {

    const statusElement = document.getElementById(statusElementId);
    const responseTimeElement = document.getElementById(responseTimeElementId);


    // Derive the timestamp element ID from the status element ID.
    // Example: "google-status" becomes "google-last-checked".
    const lastCheckedElementId = statusElementId.replace("-status", "-last-checked");

    const lastCheckedElement = document.getElementById(lastCheckedElementId);

    const apiUrl = "http://127.0.0.1:8000/checks?url=" + encodeURIComponent(url);

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {

            if (data.checks.length > 0) {

                const latestCheck = data.checks[0];

                statusElement.textContent = latestCheck.status;

                // Remove any previous status colours
                statusElement.classList.remove("online", "error", "offline");

                if (latestCheck.status === "ONLINE") {
                    statusElement.classList.add("online");
                } else if (latestCheck.status === "ERROR") {
                    statusElement.classList.add("error");
                } else if (latestCheck.status === "OFFLINE") {
                    statusElement.classList.add("offline");
                }

                if (latestCheck.response_time !== null) {
                    responseTimeElement.textContent = latestCheck.response_time.toFixed(2) + " ms";
                } else {
                    responseTimeElement.textContent = "Unavailable";
                }

                const checkedDate = new Date(latestCheck.checked_at);

                lastCheckedElement.textContent =
                    "Last checked: " + checkedDate.toLocaleString("en-IE");

                updateOnlineCount();
            }

        })
        .catch(error => {
            console.error("Error fetching website checks:", error);
        });
}

loadWebsiteStatus(
    "https://www.google.com",
    "google-status",
    "google-response-time"
);

loadWebsiteStatus(
    "https://www.github.com",
    "github-status",
    "github-response-time"
);

loadWebsiteStatus(
    "https://www.python.org",
    "python-status",
    "python-response-time"
);

loadWebsiteStatus(
    "https://httpbin.org/status/404",
    "status-404-status",
    "status-404-response-time"
);


loadWebsiteStatus(
    "https://nonexistent.invalid",
    "nonexistent-status",
    "nonexistent-response-time"
);

// Predefined websites monitored by the backend.
// websiteIds maps each URL to the corresponding HTML element ID prefix.
const monitoredWebsites = [
    "https://www.google.com",
    "https://www.github.com",
    "https://www.python.org",
    "https://httpbin.org/status/404",
    "https://nonexistent.invalid"
];

const websiteIds = {
    "https://www.google.com": "google",
    "https://www.github.com": "github",
    "https://www.python.org": "python",
    "https://httpbin.org/status/404": "status-404",
    "https://nonexistent.invalid": "nonexistent"
};


const runAllChecksButton = document.getElementById("run-all-checks");


/*
 * Run All Checks
 *
 * Sends monitoring requests for all predefined websites.
 * Waits for the checks to finish before updating the dashboard.
 * Refreshes statistics and history for expanded website panels.
 */
runAllChecksButton.addEventListener("click", async function () {

    runAllChecksButton.disabled = true;
    runAllChecksButton.textContent = "Running Checks...";

    try {

        // Run all five checks and wait for every request to finish
        const checkPromises = monitoredWebsites.map(website => {

            return fetch("http://127.0.0.1:8000/check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: website
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Check failed for " + website);
                    }

                    return response.json();
                });

        });

        const results = await Promise.allSettled(checkPromises);

        const statsResponse = await fetch("http://127.0.0.1:8000/stats");

        if (!statsResponse.ok) {
            throw new Error("Failed to retrieve statistics");
        }

        const stats = await statsResponse.json();

        console.log("All website checks finished:", results);

        // All checks are finished. Now update the cards together.
        results.forEach((result, index) => {

            if (result.status !== "fulfilled") {
                console.error("Website check failed:", result.reason);
                return;
            }

            const website = monitoredWebsites[index];
            const websiteId = websiteIds[website];
            const check = result.value;

            const statusElement = document.getElementById(websiteId + "-status");
            const responseTimeElement = document.getElementById(websiteId + "-response-time");

            statusElement.textContent = check.status;

            statusElement.classList.remove("online", "error", "offline");
            statusElement.classList.add(check.status.toLowerCase());

            if (check.response_time !== null) {
                responseTimeElement.textContent = check.response_time.toFixed(2) + " ms";
            } else {
                responseTimeElement.textContent = "Unavailable";
            }

            const lastCheckedElement = document.getElementById(
                websiteId + "-last-checked"
            );

            const checkedDate = new Date(check.checked_at);

            lastCheckedElement.textContent =
                "Last checked: " + checkedDate.toLocaleString("en-IE");

        });

        // Update all summary values together
        updateOnlineCount();
        totalChecksElement.textContent = stats.total_checks;

        // Refresh monitoring details for expanded website cards
        const expandedCards = document.querySelectorAll(
            '.website-card .details-toggle[aria-expanded="true"]'
        );

        const detailPromises = Array.from(expandedCards).flatMap(button => {

            const websiteCard = button.closest(".website-card");

            const websiteId = websiteCard
                .querySelector(".status-badge")
                .id.replace("-status", "");

            const websiteUrl = websiteCard
                .querySelector(".website-info p")
                .textContent.trim();

            return [
                loadWebsiteStats(websiteUrl, websiteId),
                loadRecentChecks(websiteUrl, websiteId)
            ];

        });

        // Waits for all expanded panels to finish refreshing before restoring the button.
        // A failed request will not prevent other panels from updating.
        await Promise.allSettled(detailPromises);


    } catch (error) {

        console.error("Error running all checks:", error);

    } finally {

        // Only restores the button when everything else is finished
        runAllChecksButton.disabled = false;
        runAllChecksButton.textContent = "Run All Checks";

    }

});


/*
 * Load Website Statistics
 *
 * Fetches historical monitoring statistics for one website:
 * - Total checks performed
 * - Number of successful checks
 * - Uptime percentage
 * - Average response time
 *
 * Updates the four statistics displayed in the expanded website panel.
 */
function loadWebsiteStats(url, websiteId) {

    const apiUrl = "http://127.0.0.1:8000/website-stats?url=" + encodeURIComponent(url);

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load website statistics");
            }

            return response.json();
        })
        .then(data => {
            console.log("Website statistics:", data);

            document.getElementById(websiteId + "-total-checks").textContent = data.total_checks;

            document.getElementById(websiteId + "-successful-checks").textContent = data.successful_checks;

            document.getElementById(websiteId + "-uptime").textContent = data.uptime_percentage.toFixed(2) + "%";

            document.getElementById(websiteId + "-average-response").textContent =
                data.average_response_time !== null
                    ? data.average_response_time.toFixed(2) + " ms"
                    : "Unavailable";
        })
        .catch(error => {
            console.error("Error loading website statistics:", error);
        });

}


/*
 * Load Recent Checks
 *
 * Retrieves the five most recent monitoring results for a website.
 * Clears the existing table before adding updated rows.
 *
 * Each row displays:
 * - Date and time of the check
 * - Status with a colour-coded badge
 * - Response time in milliseconds
 */
function loadRecentChecks(url, websiteId) {

    const apiUrl = "http://127.0.0.1:8000/checks?url=" + encodeURIComponent(url);

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load recent checks");
            }

            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById(websiteId + "-recent-checks");

            // Clears any previous results to prevent duplicate rows when refreshing.
            tableBody.innerHTML = "";

            data.checks.forEach(check => {

                const row = document.createElement("tr");

                const checkedDate = new Date(check.checked_at);

                const responseTime = check.response_time !== null
                    ? check.response_time.toFixed(2) + " ms"
                    : "Unavailable";

                // Builds a table row using the existing CSS status-badge classes.
                row.innerHTML = `
                    <td>${checkedDate.toLocaleString("en-IE")}</td>
                    <td>
                        <span class="status-badge ${check.status.toLowerCase()}">
                            ${check.status}
                        </span>
                    </td>
                    <td>${responseTime}</td>
                `;

                tableBody.appendChild(row);

            });
        })
        .catch(error => {
            console.error("Error loading recent checks:", error);
        });

}


/*
 * Expandable Website Details
 *
 * Each View Details button controls its own monitoring panel.
 *
 * When opened:
 * - Show the panel and update the button text
 * - Fetch the latest website statistics
 * - Fetch the five most recent checks
 *
 * When closed:
 * - Hide the panel without making additional API requests
 */
const detailsButtons = document.querySelectorAll(".details-toggle");

detailsButtons.forEach(button => {

    button.addEventListener("click", function () {

        const websiteCard = button.closest(".website-card");

        const detailsPanel = websiteCard.querySelector(".website-details");

        const isExpanded = button.getAttribute("aria-expanded") === "true";

        detailsPanel.hidden = isExpanded;

        button.setAttribute("aria-expanded", String(!isExpanded));

        button.textContent = isExpanded ? "View Details ▼" : "Hide Details ▲";

        // Fetch updated statistics and recent check history when opening the panel.
        if (!isExpanded) {

            const websiteId = websiteCard
                .querySelector(".status-badge")
                .id.replace("-status", "");

            const websiteUrl = websiteCard
                .querySelector(".website-info p")
                .textContent.trim();

            loadWebsiteStats(websiteUrl, websiteId);
            loadRecentChecks(websiteUrl, websiteId);

        }

    });

});