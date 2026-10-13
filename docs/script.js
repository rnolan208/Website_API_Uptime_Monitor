const totalWebsitesElement = document.getElementById("total-websites");

console.log(totalWebsitesElement);


const websiteCards = document.querySelectorAll(".website-card")

const totalWebsites = websiteCards.length;

totalWebsitesElement.textContent = totalWebsites;


const onlineWebsitesElement = document.getElementById("online-websites");

const cardsArray = Array.from(websiteCards);

const onlineCards = cardsArray.filter(card => {
    const onlineStatus =card.querySelector(".status-badge").textContent;

    return onlineStatus === "ONLINE";

});

onlineWebsitesElement.textContent = onlineCards.length;