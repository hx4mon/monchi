import pandas as pd

excel_file = "church_data_manual.csv"

try:
    df = pd.read_csv(excel_file, encoding='latin1')
    print(f"Successfully read {len(df)} rows from {excel_file}")

    # Check for duplicates in 'SEC REGISTRATION NUMBER'
    duplicates = df[df.duplicated(subset=['SEC REGISTRATION NUMBER'], keep=False)]

    if not duplicates.empty:
        print("\n--- Duplicate SEC REGISTRATION NUMBER entries found in CSV: ---")
        print(duplicates[['CHURCH NAME', 'SEC REGISTRATION NUMBER']])
        print("------------------------------------------------------------")
    else:
        print("\nNo duplicate 'SEC REGISTRATION NUMBER' entries found in CSV.")

except FileNotFoundError:
    print(f"Error: CSV file not found at {excel_file}")
except Exception as e:
    print(f"An error occurred: {e}")
