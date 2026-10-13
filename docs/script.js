const totalWebsitesElement = document.getElementById("total-websites");

console.log(totalWebsitesElement);


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

    fetch("http://127.0.0.1:8000/stats")
        .then(response => response.json())
        .then(data => {
            console.log(data);

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

    fetch(apiUrl)
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

runAllChecksButton.addEventListener("click", function () {
    console.log("Run All Checks button clicked!");

    monitoredWebsites.forEach(website => {

        fetch("http://127.0.0.1:8000/check", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url: website
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("New monitoring result:", data);

                const websiteId = websiteIds[website];

                loadWebsiteStatus(
                    website,
                    websiteId + "-status",
                    websiteId + "-response-time"
                );

                loadTotalChecks();
            })
            .catch(error => {
                console.error("Error running website check:", error);
            });
    });
});
