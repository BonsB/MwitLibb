from flask import Flask, jsonify, request
from flask_cors import CORS
import serial
import serial.tools.list_ports
import threading

app = Flask(__name__)
CORS(app)

# Detect available serial ports
ports = serial.tools.list_ports.comports()
available_ports = [port.device for port in ports]

if not available_ports:
    print("❌ No available serial ports detected.")
    exit()

ESP32_PORT = available_ports[0]
BAUD_RATE = 115200

try:
    ser = serial.Serial(ESP32_PORT, BAUD_RATE, timeout=1)
    print(f"✅ Connected to {ESP32_PORT}")
except serial.SerialException as e:
    print(f"❌ Failed to connect: {e}")
    exit()

seat_status = {}
reserved_seats = set()  # Track reserved seats

def read_serial():
    global seat_status
    while True:
        try:
            data = ser.readline().decode().strip()
            if data:
                print(f"📩 Raw Data from ESP32: '{data}'")
                if "Seat" in data:
                    try:
                        seat_id, status = data.split(":")
                        seat_status[seat_id.strip()] = int(status.strip())
                        print(f"✅ Updated seat_status: {seat_status}")
                    except ValueError:
                        print(f"❌ Invalid format: {data}")
        except Exception as e:
            print(f"❌ Error: {e}")

# Start Serial Reading in a Thread
threading.Thread(target=read_serial, daemon=True).start()

@app.route('/status')
def get_status():
    updated_status = seat_status.copy()
    for seat in reserved_seats:
        updated_status[seat] = 1  # Reserved seats are always yellow
    return jsonify(updated_status)

@app.route('/book', methods=['POST'])
def book_seats():
    global reserved_seats
    data = request.json
    if 'seats' in data:
        reserved_seats.update(data['seats'])
        
        # ส่งสถานะไปยัง Arduino เฉพาะเมื่อจอง "block1"
        if 'block1' in reserved_seats:  # เช็คว่ามีการจอง block1
            ser.write(b'1')  # ส่งค่า 1 ไปยัง Arduino เพื่อให้ไฟสีเหลืองติด
        else:
            ser.write(b'0')  # ส่งค่า 0 หากไม่มีการจอง

        print(f"✅ Reserved seats updated: {reserved_seats}")
        return jsonify({"message": "Seats reserved successfully"}), 200
    return jsonify({"error": "Invalid request"}), 400


if __name__ == '__main__':
    print("🚀 Starting Flask Server on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)

