using Microsoft.EntityFrameworkCore;

class BikeDb(DbContextOptions<BikeDb> options) : DbContext(options)
{
    public DbSet<Activity> Activities => Set<Activity>();
}
