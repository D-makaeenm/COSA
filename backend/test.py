import jwt

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MjIzNTQ5MywianRpIjoiMmQwMzhkYTMtYzBhZi00NDllLWIyOTktNjBhN2U5NGMwOGVjIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNzQyMjM1NDkzLCJjc3JmIjoiMjdlMzNlZTItZTg5My00NTU2LTgzMzctYmQ4ZTBmODYxZWI3In0.MnvxiCw-ql5ZoXjU0BvMnF-zMs4sspxw7Xehqj7ADRg"

decoded = jwt.decode(token, options={"verify_signature": False})
print(decoded)