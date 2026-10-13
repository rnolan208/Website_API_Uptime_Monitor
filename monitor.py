import requests
import time
from datetime import datetime, timezone


def check_website(url):
    """
    Check availability and response time of a website.
    """

    checked_at = datetime.now(timezone.utc).isoformat()

    try:
        # records start time to help get time request takes
        start_time = time.perf_counter()

        # sends the GET request
        response = requests.get(url, timeout=10, allow_redirects=False)

        end_time = time.perf_counter()

        response_time = round(
            (end_time - start_time) * 1000, 2
        )

        if 200 <= response.status_code < 400:
            status = "ONLINE"
        else:
            status = "ERROR"

        return {
            "url": url,
            "status": status,
            "status_code": response.status_code,
            "response_time": response_time,
            "checked_at": checked_at,
            "error": None
        }

    except requests.exceptions.RequestException as error:
        return {
            "url": url,
            "status": "OFFLINE",
            "status_code": None,
            "response_time": None,
            "checked_at": checked_at,
            "error": str(error)
        }