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


function loadWebsiteStatus(url, statusElementId, responseTimeElementId) {

    const statusElement = document.getElementById(statusElementId);
    const responseTimeElement = document.getElementById(responseTimeElementId);

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
-
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

        });

        // Update all summary values together
        updateOnlineCount();
        totalChecksElement.textContent = stats.total_checks;


    } catch (error) {

        console.error("Error running all checks:", error);

    } finally {

        // Only restore the button when everything is finished
        runAllChecksButton.disabled = false;
        runAllChecksButton.textContent = "Run All Checks";

    }

});