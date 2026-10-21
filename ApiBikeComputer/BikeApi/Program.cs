using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<BikeDb>(opt => opt.UseInMemoryDatabase("BikeList"));
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// GET /api/activities: newest first
app.MapGet("/api/activities", async (BikeDb db) =>  // get endpoint
    await db.Activities.OrderByDescending(a => a.StartTime).ToListAsync());

// GET /api/activities/{id}: 404 as ProblemDetails
app.MapGet("/api/activities/{id}", async (string id, BikeDb db) =>
    await db.Activities.FindAsync(id)
        is Activity activity
            ? Results.Ok(activity)
            : Results.Problem("Activity not found.", statusCode: 404));

// GET /api/me: hard-coded until auth exists
app.MapGet("/api/me", () => new UserProfileDto(
    "b1e1f2a3", "Alex Rider", "alex@example.com", "Portland, OR",
    new DateOnly(2025, 3, 14),
    [new BikeComputerDto("esp32-001", "Bike Computer", "0.1.0", DateTimeOffset.UtcNow)]));

// POST /api/activities: JSON test stand-in for the real multipart upload
// 201 for a new ride, 200 if (deviceId, deviceRideId) already exists
app.MapPost("/api/activities", async (Activity activity, BikeDb db) =>
{
    var existing = await db.Activities.FirstOrDefaultAsync(a =>
        a.DeviceId == activity.DeviceId && a.DeviceRideId == activity.DeviceRideId);
    if (existing is not null) return Results.Ok(existing);

    activity.SyncedAt = DateTimeOffset.UtcNow;
    db.Activities.Add(activity);
    await db.SaveChangesAsync();

    return Results.Created($"/api/activities/{activity.Id}", activity);
});

// DELETE /api/activities/{id}
app.MapDelete("/api/activities/{id}", async (string id, BikeDb db) =>
{
    if (await db.Activities.FindAsync(id) is Activity activity)
    {
        db.Activities.Remove(activity);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    return Results.Problem("Activity not found.", statusCode: 404);
});

app.Run();
