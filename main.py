from monitor import check_website

from database import save_result, count_results, count_website_checks, count_successful_checks, average_response_time, get_recent_checks


def main():

    # websites to check 
    websites = [
        "https://www.google.com",
        "https://www.github.com",
        "https://www.python.org",
        "https://httpbin.org/status/404",
        "https://nonexistent.invalid"
    ]

    # empty counters
    online_count = 0
    error_count = 0
    offline_count = 0

    for website in websites:

        print(f"\nChecking: {website}")
        print("-" * 40)

        result = check_website(website)

        # save via SQLite Database
        save_result(result)

        response_time = result["response_time"]

        # display the response time in ms if one exists, otherwise display N/A
        if response_time is None:
            display_time = "N/A"
        else:
            display_time = f"{response_time} ms"

        print(f"Status: {result['status']}")
        print(f"HTTP Code: {result['status_code']}")
        print(f"Response Time: {display_time}")
        print(f"Checked At: {result['checked_at']}")

        if result["status"] == "ONLINE":
            online_count += 1
        elif result["status"] == "ERROR":
            error_count += 1
        elif result["status"] == "OFFLINE":
            offline_count += 1


        if result["error"]:
            print(f"Error: {result['error']}")

        if response_time is None:
            performance = "UNAVAILABLE"
        elif response_time < 200:
            performance = "FAST"
        elif 200 <= response_time <= 500:
            performance = "MODERATE"
        else:
            performance = "SLOW"

        print(f"Performance: {performance}")


    # Percent of Websites Returning as online, defense against divide by 0 error
    if len(websites) > 0:
        percentage_online_count = (online_count / len(websites)) * 100
    else:
        percentage_online_count = 0


    print("\nMonitoring Complete!")
    print(f"Total Websites Checked: {len(websites)}")
    print(f"Websites Online: {online_count}")
    print(f"Websites With Errors: {error_count}")
    print(f"Websites Offline: {offline_count}")
    print(f"Online Percentage: {percentage_online_count:.2f}%")
    print(f"Total Historical Checks: {count_results()}")


    print("\nHistorical Website Statistics")
    print("-" * 40)
    

    for website in websites:
        total_checks = count_website_checks(website)
        successful_checks = count_successful_checks(website)
        average_time = average_response_time(website)

        if total_checks > 0:
            website_uptime = (successful_checks / total_checks) * 100
        else:
            website_uptime = 0

        if average_time is None:
            display_time = "N/A"
        else:
            display_time = f"{average_time:.2f} ms"

        print(f"\nWebsite: {website}")
        print(f"Total Checks: {total_checks}")
        print(f"Successful Checks: {successful_checks}")
        print(f"Website Observed Uptime: {website_uptime:.2f}%")
        print(f"Average Response Time: {display_time}")



    print("\nRecent Invalid Domain Checks")
    print("-" * 40)

    recent_checks = get_recent_checks("https://nonexistent.invalid")

    for check in recent_checks:
        status = check[1]
        response_time = check[2]
        checked_at = check[3]

        if response_time is None:
            display_time = "N/A"
        else:
            display_time = f"{response_time:.2f} ms"

        print(f"{status} | {display_time} | {checked_at}")


if __name__ == "__main__":
    main()