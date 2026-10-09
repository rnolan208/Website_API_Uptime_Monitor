from monitor import check_website

def main():

    websites = [
        "https://www.google.com",
        "https://www.github.com",
        "https://www.python.org"
    ]

    for website in websites:

        print(f"\nChecking: {website}")
        print("-" * 40)

        result = check_website(website)

        print(f"Status: {result['status']}")
        print(f"HTTP Code: {result['status_code']}")
        print(f"Response Time: {result['response_time']} ms")
        print(f"Checked At: {result['checked_at']}")

        response_time = result["response_time"]

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


    print("\nMonitoring Complete!")
    print(f"Total Websites Checked: {len(websites)}")


if __name__ == "__main__":
    main()