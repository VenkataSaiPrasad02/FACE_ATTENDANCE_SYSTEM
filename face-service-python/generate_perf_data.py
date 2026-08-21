import requests

BASE_URL = "https://faceattendancejava-production.up.railway.app"
TOKEN = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJQcmFzYWQiLCJpYXQiOjE3ODcyNDA2MjcsImV4cCI6MTc4NzMyNzAyN30.QpPf8p7h-YikMdleD_iFS_yycoN_Z7bueyjRaAIUjPrxF9O6yR4K9MXplgP7aAAl"

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

# First get students
response = requests.get(
    f"{BASE_URL}/api/students?page=0&size=200",
    headers=headers
)

response.raise_for_status()

students = response.json()["content"]

for student in students:
    number = student["studentNumber"]

    if number.startswith("PERF_TEST_"):
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