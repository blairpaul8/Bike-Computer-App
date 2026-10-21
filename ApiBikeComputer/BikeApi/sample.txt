# Create (201)
curl -i -X POST http://localhost:5000/api/activities \
  -H "Content-Type: application/json" \
  -d '{"name":"Morning Ride","startTime":"2026-10-10T14:25:00Z","distanceMeters":77120,"movingTimeSeconds":10800,"elapsedTimeSeconds":12840,"elevationGainMeters":1228,"averageSpeedMps":7.14,"maxSpeedMps":12.16,"deviceId":"esp32-001","deviceRideId":"1"}'

# Create (201)
curl -i -X POST http://localhost:5000/api/activities \
  -H "Content-Type: application/json" \
  -d '{"name":"Evening Ride","startTime":"2026-10-12T20:20:00Z","distanceMeters":75000,"movingTimeSeconds":10800,"elapsedTimeSeconds":12840,"elevationGainMeters":1228,"averageSpeedMps":7.14,"maxSpeedMps":12.16,"deviceId":"esp32-001","deviceRideId":"2"}'

# Same request again (200, no duplicate)
curl -i -X POST http://localhost:5000/api/activities \
  -H "Content-Type: application/json" \
  -d '{"name":"Morning Ride","startTime":"2026-10-10T14:25:00Z","distanceMeters":77120,"movingTimeSeconds":10800,"elapsedTimeSeconds":12840,"elevationGainMeters":1228,"averageSpeedMps":7.14,"maxSpeedMps":12.16,"deviceId":"esp32-001","deviceRideId":"1"}'

# List, get one (use an id from the list), profile
curl http://localhost:5000/api/activities
curl http://localhost:5000/api/activities/<id>
curl http://localhost:5000/api/me

# 404 ProblemDetails
curl -i http://localhost:5000/api/activities/nope

# Delete (204)
curl -i -X DELETE http://localhost:5000/api/activities/<id>
# you will need to get the ID from the List endpoint
