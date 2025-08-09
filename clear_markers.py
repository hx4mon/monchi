import mysql.connector
from mysql.connector import Error

DB_NAME = 'map_data_db'
DB_USER = 'map_user'
DB_PASSWORD = 'Halfmoon' # Password to match app.py

def clear_all_markers():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        # Delete all records from the markers table
        delete_query = "DELETE FROM markers"
        cursor.execute(delete_query)
        conn.commit()
        print("All markers deleted successfully.")

        # Optional: Reset auto-increment counter if you want IDs to start from 1 again
        # cursor.execute("ALTER TABLE markers AUTO_INCREMENT = 1")
        # conn.commit()
        # print("Auto-increment counter reset.")

    except Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    clear_all_markers()
