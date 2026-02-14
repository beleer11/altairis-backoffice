using AltairisBackoffice.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace AltairisBackoffice.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<RoomInventory> RoomInventories { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de Hotel
            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
                entity.Property(e => e.City).HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.Website).HasMaxLength(200);

                entity.HasMany(h => h.RoomTypes)
                    .WithOne(rt => rt.Hotel)
                    .HasForeignKey(rt => rt.HotelId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración de RoomType
            modelBuilder.Entity<RoomType>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.BasePrice).HasPrecision(18, 2);

                entity.HasMany(rt => rt.Inventories)
                    .WithOne(i => i.RoomType)
                    .HasForeignKey(i => i.RoomTypeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(rt => rt.Bookings)
                    .WithOne(b => b.RoomType)
                    .HasForeignKey(b => b.RoomTypeId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración de RoomInventory
            modelBuilder.Entity<RoomInventory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PricePerNight).HasPrecision(18, 2);
                entity.HasIndex(e => new { e.RoomTypeId, e.Date }).IsUnique();
            });

            // Configuración de Booking
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.BookingReference).IsRequired().HasMaxLength(20);
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
                entity.Property(e => e.GuestName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.GuestEmail).HasMaxLength(100);
                entity.Property(e => e.GuestPhone).HasMaxLength(20);

                entity.HasIndex(e => e.BookingReference).IsUnique();
                entity.HasIndex(e => e.CheckIn);
                entity.HasIndex(e => e.CheckOut);
                entity.HasIndex(e => e.GuestEmail);
            });
        }
    }
}