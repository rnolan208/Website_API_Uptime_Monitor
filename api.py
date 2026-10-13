from fastapi import FastAPI

from database import (
    count_results,
    get_recent_checks,
    count_website_checks,
    count_successful_checks,
    average_response_time
)

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/websites")
def get_websites():

    websites = [
        "https://www.google.com",
        "https://www.github.com",
        "https://www.python.org",
        "https://httpbin.org/status/404",
        "https://nonexistent.invalid"
    ]
    
    return {"websites": websites}


@app.get("/stats")
def get_stats():
    total_checks = count_results()
    return {"total_checks": total_checks}


@app.get("/checks")
def get_checks(url: str):
    recent_checks = get_recent_checks(url)
    formatted_checks = []

    for check in recent_checks:
        formatted_check = {
            "url": check[0],
            "status": check[1],
            "response_time": check[2],
            "checked_at": check[3]
        }

        formatted_checks.append(formatted_check)

    return {"checks": formatted_checks}


@app.get("/website-stats")
def get_website_stats(url: str):

    """Returns the historical monitoring statistics for a specified website."""

    total_checks = count_website_checks(url)
    successful_checks = count_successful_checks(url)
    average_time = average_response_time(url)

    if total_checks > 0:
        uptime = (successful_checks / total_checks) * 100
    else:
        uptime = 0

    return {
        "url": url,
        "total_checks": total_checks,
        "successful_checks": successful_checks,
        "uptime_percentage": uptime,
        "average_response_time": average_time
    }