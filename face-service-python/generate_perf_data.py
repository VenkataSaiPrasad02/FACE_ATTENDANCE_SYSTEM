import json
import random
import mysql.connector
from datetime import datetime

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "database": "face_attendance",
    "user": "root",
    "password": "Prasad@123"
}

# Total synthetic students we want
NUMBER_OF_TEST_STUDENTS = 10000

PREFIX = "PERF_TEST_"

connection = mysql.connector.connect(**DB_CONFIG)
cursor = connection.cursor()

try:
    # Check existing synthetic students
    cursor.execute("""
        SELECT COUNT(*)
        FROM students
        WHERE student_number LIKE 'PERF_TEST_%'
    """)

    existing_count = cursor.fetchone()[0]

    print()
    print("=" * 60)
    print("PERFORMANCE TEST DATA GENERATOR")
    print("=" * 60)
    print(f"Existing synthetic students : {existing_count}")
    print(f"Target synthetic students   : {NUMBER_OF_TEST_STUDENTS}")
    print("=" * 60)

    # Already reached target
    if existing_count >= NUMBER_OF_TEST_STUDENTS:

        print(
            f"Already have {existing_count} PERF_TEST students."
        )
        print(
            f"Target is {NUMBER_OF_TEST_STUDENTS}."
        )
        print("Nothing to add.")

    else:

        now = datetime.now()

        # Add only missing students
        for i in range(
            existing_count + 1,
            NUMBER_OF_TEST_STUDENTS + 1
        ):

            student_number = f"{PREFIX}{i:04d}"
            full_name = f"Performance Test Student {i}"
            email = f"perf_test_{i:04d}@example.com"
            phone = f"900000{i:04d}"

            # 512-dimensional synthetic embedding
            embedding = [
                random.uniform(-1.0, 1.0)
                for _ in range(512)
            ]

            embedding_json = json.dumps(
                embedding,
                separators=(",", ":")
            )

            # Insert student
            cursor.execute("""
                INSERT INTO students (
                    face_registered,
                    created_at,
                    updated_at,
                    batch,
                    phone,
                    academic_year,
                    semester,
                    student_number,
                    course,
                    full_name,
                    email
                )
                VALUES (
                    1,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            """, (
                now,
                now,
                "PERF-TEST",
                phone,
                "2025-2027",
                "2nd Semester",
                student_number,
                "MCA",
                full_name,
                email
            ))

            student_id = cursor.lastrowid

            # Insert face embedding
            cursor.execute("""
                INSERT INTO face_data (
                    created_at,
                    updated_at,
                    student_id,
                    model_version,
                    embedding
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            """, (
                now,
                now,
                student_id,
                "insightface-v1",
                embedding_json
            ))

        connection.commit()

        added_count = (
            NUMBER_OF_TEST_STUDENTS - existing_count
        )

        print()
        print("=" * 60)
        print("PERFORMANCE TEST DATA CREATED")
        print("=" * 60)
        print(f"Existing synthetic students : {existing_count}")
        print(f"New synthetic students      : {added_count}")
        print(f"Total synthetic students    : {NUMBER_OF_TEST_STUDENTS}")
        print(f"Real students               : 2")
        print(
            f"Total students              : "
            f"{2 + NUMBER_OF_TEST_STUDENTS}"
        )
        print("=" * 60)

except Exception as e:

    connection.rollback()
    print()
    print("ERROR:", e)

finally:

    cursor.close()
    connection.close()