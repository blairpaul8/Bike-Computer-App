// This is a good example this would represent one table in the DB.
// Each line is a field of the table.
public class Activity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = "";
    public DateTimeOffset StartTime { get; set; }
    public double DistanceMeters { get; set; }
    public int MovingTimeSeconds { get; set; }
    public int ElapsedTimeSeconds { get; set; }
    public double ElevationGainMeters { get; set; }
    public double AverageSpeedMps { get; set; }
    public double MaxSpeedMps { get; set; }
    public DateTimeOffset SyncedAt { get; set; }
    public string DeviceId { get; set; } = "";
    public string DeviceRideId { get; set; } = "";
}
