from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware


from monitor import check_website

from database import (
    save_result,
    count_results,
    get_recent_checks,
    count_website_checks,
    count_successful_checks,
    average_response_time
)

from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=[]
)

class WebsiteCheckRequest(BaseModel):
    url: str


MONITORED_WEBSITES = [
    "https://www.google.com",
    "https://www.github.com",
    "https://www.python.org",
    "https://httpbin.org/status/404",
    "https://nonexistent.invalid"
]


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/websites")
def get_websites():
    
    return {"websites": MONITORED_WEBSITES}


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


@app.post("/check")
def run_website_check(request: WebsiteCheckRequest):
    """Validates a monitored URL, then runs a website check and saves the result."""

    if request.url not in MONITORED_WEBSITES:
        raise HTTPException(
            status_code=400,
            detail="Website is not in the monitored list"
        )

    result = check_website(request.url)

    save_result(result)

    return result

    