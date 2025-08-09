import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, DECIMAL
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import IntegrityError

# --- 1. Database Setup ---
# For MySQL: 'mysql+mysqlconnector://user:password@host/dbname'
DATABASE_URL = "mysql+mysqlconnector://map_user:@localhost/church_map"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
Base = declarative_base()

# --- 2. Define Database Model for Churches ---
class Church(Base):
    __tablename__ = 'churches'
    id = Column(Integer, primary_key=True)
    church_name = Column(String(255))
    sec_registration_number = Column(String(255), unique=True)
    church_street_purok = Column(String(255))
    church_barangay = Column(String(255))
    church_town = Column(String(255)) # New column
    denomination = Column(String(255))
    no_of_years_in_existence = Column(Integer)
    facebook_messenger_account_name_of_church = Column(String(255))
    church_contact_number = Column(String(255))
    total_number_of_regular_attendees = Column(Integer)
    total_number_of_church_members = Column(Integer) # New column
    total_number_of_assistant_pastor = Column(Integer)
    total_number_of_leaders = Column(Integer)
    tenure_status_of_the_church_building_lot = Column(String(255))
    latitude = Column(DECIMAL(15, 10))
    longitude = Column(DECIMAL(15, 10))
    church_status = Column(String(255))

    def __repr__(self):
        return f"<Church(id={self.id}, name='{self.church_name}')>"

# --- 3. Create Tables ---
def create_tables():
    Base.metadata.create_all(engine)
    print("Database tables created (or already exist).")

# --- 4. Data Ingestion Function ---
def ingest_data_from_excel(excel_file_path):
    create_tables() # Ensure tables exist
    session = Session()

    try:
        df = pd.read_csv(excel_file_path, encoding='latin1')
        print(f"Successfully read {len(df)} rows from {excel_file_path}")

        # Drop the 'Unnamed: 17' column if it exists
        if 'Unnamed: 17' in df.columns:
            df = df.drop(columns=['Unnamed: 17'])

        # Replace string 'nan' and 'NONE' with actual None
        df = df.replace({'nan': None, 'NONE': None})

        # Convert numeric columns, coercing errors to NaN (which will then be converted to None)
        numeric_cols = [
            'NO. OF YEARS IN EXISTENCE',
            'TOTAL NUMBER OF REGULAR ATTENDEES',
            'TOTAL NUMBER OF CHURCH MEMBERS',
            'TOTAL NUMBER OF ASSISTANT PASTOR',
            'TOTAL NUMBER OF LEADERS',
            'LATITUDE',
            'LONGTITUDE'
        ]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce')

        # Ensure SEC REGISTRATION NUMBER is treated as string and handle missing/empty values
        df['SEC REGISTRATION NUMBER'] = df['SEC REGISTRATION NUMBER'].astype(str).replace({'nan': None, '': None})

        # Drop rows where 'SEC REGISTRATION NUMBER' is None or duplicate
        # Keeping the first occurrence if duplicates exist
        initial_rows = len(df)
        df.dropna(subset=['SEC REGISTRATION NUMBER'], inplace=True)
        df.drop_duplicates(subset=['SEC REGISTRATION NUMBER'], keep='first', inplace=True)
        if len(df) < initial_rows:
            print(f"Dropped {initial_rows - len(df)} rows due to missing or duplicate SEC REGISTRATION NUMBER.")

        # Prepare church data for bulk insert
        churches_to_add = []
        for index, row in df.iterrows():
            church_data = {
                'church_name': row['CHURCH NAME'],
                'sec_registration_number': row['SEC REGISTRATION NUMBER'],
                'church_street_purok': row['CHURCH STREET/PUROK'],
                'church_barangay': row['CHURCH BARANGAY'],
                'church_town': row['CHURCH TOWN'],
                'denomination': row['DENOMINATION'],
                'no_of_years_in_existence': row['NO. OF YEARS IN EXISTENCE'],
                'facebook_messenger_account_name_of_church': row['FACEBOOK/MESSENGER ACCOUNT NAME OF CHURCH'],
                'church_contact_number': row['CHURCH CONTACT NUMBER'],
                'total_number_of_regular_attendees': row['TOTAL NUMBER OF REGULAR ATTENDEES'],
                'total_number_of_church_members': row['TOTAL NUMBER OF CHURCH MEMBERS'],
                'total_number_of_assistant_pastor': row['TOTAL NUMBER OF ASSISTANT PASTOR'],
                'total_number_of_leaders': row['TOTAL NUMBER OF LEADERS'],
                'tenure_status_of_the_church_building_lot': row['TENURE STATUS OF THE CHURCH BUILDING & LOT'],
                'latitude': row['LATITUDE'],
                'longitude': row['LONGTITUDE'],
                'church_status': row['CHURCH STATUS']
            }
            # Replace NaN values (from coerce or original pandas NaN) with None
            for key, value in church_data.items():
                if pd.isna(value):
                    church_data[key] = None
            churches_to_add.append(church_data)

        # Bulk insert churches
        session.bulk_insert_mappings(Church, churches_to_add)
        session.commit()
        print(f"Added {len(churches_to_add)} churches.")

        print("Data ingestion complete!")

    except FileNotFoundError:
        print(f"Error: Excel file not found at {excel_file_path}")
        session.rollback()
    except KeyError as e:
        print(f"Error: Missing expected column in Excel file: {e}")
        session.rollback()
    except IntegrityError as e:
        print(f"Database Integrity Error: {e}. Rolling back transaction.")
        session.rollback()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        session.rollback()
    finally:
        session.close()

# --- Main Execution ---
if __name__ == "__main__":
    # IMPORTANT: Make sure your Excel file is in the same directory as this script,
    # or provide the full path to your Excel file.
    excel_file = "church_data_manual.csv" # Renamed for clarity
    ingest_data_from_excel(excel_file)

    
