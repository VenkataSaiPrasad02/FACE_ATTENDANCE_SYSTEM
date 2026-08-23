import requests

BASE_URL = "http://localhost:8080"

TOKEN = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJQcmFzYWQiLCJpYXQiOjE3ODc1MDAxODEsImV4cCI6MTc4NzU4NjU4MX0.hWIWNSCgOtJk_iGW4niMsESK6KkfeJPUpgQvZQK5DTI_7vAsZ-0Ku-b67CdrXuaC"

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

page = 0
size = 200

while True:
    response = requests.get(
        f"{BASE_URL}/api/students?page={page}&size={size}",
        headers=headers
    )

    response.raise_for_status()

    data = response.json()
    students = data["content"]

    if not students:
        break

    for student in students:
        number = student["studentNumber"]

        # Delete PERF_TEST_100 and everything after it
        if number.startswith("PERF_TEST_"):
            try:
                test_number = int(number.replace("PERF_TEST_", ""))

                if test_number >= 100:
                    student_id = student["id"]

                    delete_response = requests.delete(
                        f"{BASE_URL}/api/students/{student_id}",
                        headers=headers
                    )

                    print(
                        number,
                        student_id,
                        delete_response.status_code
                    )

            except ValueError:
                pass

    # Stop after the last page
    if page >= data["totalPages"] - 1:
        break

    page += 1