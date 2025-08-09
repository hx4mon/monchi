import mysql.connector
from mysql.connector import Error

DB_NAME = 'map_data_db'
DB_USER = 'map_user'
DB_PASSWORD = 'Halfmoon' # Password to match app.py
ROOT_PASSWORD = 'your_root_password' # Replace with your MySQL root password

def create_database_and_user():
    try:
        # Connect as root to manage users and databases
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password=ROOT_PASSWORD
        )
        cursor = conn.cursor()

        # Create database
        try:
            cursor.execute(f"CREATE DATABASE {DB_NAME}")
            print(f"Database '{DB_NAME}' created successfully.")
        except Error as err:
            if err.errno == 1007: # ER_DB_CREATE_EXISTS
                print(f"Database '{DB_NAME}' already exists.")
            else:
                print(f"Failed creating database: {err}")
                return

        # Create user and grant privileges
        try:
            # Drop user if exists to ensure clean setup
            cursor.execute(f"DROP USER IF EXISTS '{DB_USER}'@'localhost'")
            print(f"User '{DB_USER}' dropped if it existed.")

            cursor.execute(f"CREATE USER '{DB_USER}'@'localhost' IDENTIFIED BY '{DB_PASSWORD}'")
            cursor.execute(f"GRANT ALL PRIVILEGES ON {DB_NAME}.* TO '{DB_USER}'@'localhost'")
            cursor.execute("FLUSH PRIVILEGES")
            print(f"User '{DB_USER}' created and granted privileges on '{DB_NAME}'.")
        except Error as err:
            print(f"Failed creating user or granting privileges: {err}")
            return

        cursor.close()
        conn.close()

        # Connect as the new user to create tables and insert data
        conn = mysql.connector.connect(
            host="localhost",
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()

        # Create churches table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS churches (
            id INT AUTO_INCREMENT PRIMARY KEY,
            church_name VARCHAR(255),
            sec_registration_number VARCHAR(255) UNIQUE,
            church_street_purok VARCHAR(255),
            church_barangay VARCHAR(255),
            denomination VARCHAR(255),
            no_of_years_in_existence INT,
            facebook_messenger_account_name_of_church VARCHAR(255),
            church_contact_number VARCHAR(255),
            total_number_of_regular_attendees INT,
            total_number_of_assistant_pastor INT,
            total_number_of_leaders INT,
            tenure_status_of_the_church_building_lot VARCHAR(255),
            latitude DECIMAL(15, 10),
            longitude DECIMAL(15, 10),
            church_status VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_table_query)
        print("Table 'churches' created or already exists.")

        conn.commit()

    except Error as err:
        print(f"Error: {err}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("MySQL connection closed.")

if __name__ == "__main__":
    create_database_and_user()
