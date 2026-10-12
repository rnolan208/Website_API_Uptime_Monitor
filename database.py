import sqlite3

# Saves a website monitoring result to the SQLite database
def save_result(result):
    connection = sqlite3.connect("monitor.db")

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS monitoring_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        status TEXT NOT NULL,
        status_code INTEGER,
        response_time REAL,
        checked_at TEXT NOT NULL,
        error TEXT
    );
    """)

    values = (
        result["url"],
        result["status"],
        result["status_code"],
        result["response_time"],
        result["checked_at"],
        result["error"]
    )

    cursor.execute("""
        INSERT INTO monitoring_results (url, status, status_code, response_time, checked_at, error)
        VALUES (?, ?, ?, ?, ?, ?);
    """, values)

    connection.commit()

    print("Monitoring result saved successfully!")


    connection.close()


# Count the total number of monitoring checks which are stored in the database
def count_results():

    connection = sqlite3.connect("monitor.db")
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM monitoring_results")

    result = cursor.fetchone()
    total = result[0]

    connection.close()

    return total


# Counts the total number of historical checks for a specific website
def count_website_checks(url):

    connection = sqlite3.connect("monitor.db")
    cursor = connection.cursor()
    
    cursor.execute(
    "SELECT COUNT(*) FROM monitoring_results WHERE url = ?", (url,))

    result = cursor.fetchone()
    checks = result[0]

    connection.close()
    
    return checks


# Counts the number of "ONLINE" checks for a specific website
def count_successful_checks(url):

    connection = sqlite3.connect("monitor.db")
    cursor = connection.cursor()

    cursor.execute(
    "SELECT COUNT(*) FROM monitoring_results WHERE url = ? AND status = 'ONLINE'", (url,)
    )

    result = cursor.fetchone()
    successful_checks = result[0]
    
    connection.close()
        
    return successful_checks


# Calculates the average recorded response time for a specific website
def average_response_time(url):

    connection = sqlite3.connect("monitor.db")
    cursor = connection.cursor()
    
    cursor.execute(
    "SELECT AVG(response_time) FROM monitoring_results WHERE url = ?;", (url,)
    )

    result = cursor.fetchone()
    average_response = result[0]

    connection.close()

    return average_response


# Gets the five most recent monitoring checks for a specific website
def get_recent_checks(url):

    connection = sqlite3.connect("monitor.db")
    cursor = connection.cursor()

    cursor.execute(
    "SELECT url, status, response_time, checked_at FROM monitoring_results WHERE url = ? ORDER BY checked_at DESC, id DESC LIMIT 5;", 
    (url,)
    )

    records = cursor.fetchall()

    connection.close()

    return records
