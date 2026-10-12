import sqlite3

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


def count_results():

    connection = sqlite3.connect("monitor.db")
    cursor = connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM monitoring_results")

    result = cursor.fetchone()
    total = result[0]

    connection.close()

    return total

    