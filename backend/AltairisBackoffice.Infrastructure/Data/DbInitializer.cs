using AltairisBackoffice.Core.Models;
using System;
using System.Linq;

namespace AltairisBackoffice.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            try
            {
                // Asegurar que la base de datos está creada
                context.Database.EnsureCreated();

                // Buscar si ya hay hoteles
                if (context.Hotels.Any())
                {
                    return; // La base de datos ya tiene datos
                }

                Console.WriteLine("Creando datos de ejemplo...");

                // Crear hoteles de ejemplo
                var hotels = new Hotel[]
                {
                    new Hotel
                    {
                        Name = "Grand Plaza Hotel",
                        Description = "Lujoso hotel en el corazón de Madrid",
                        Address = "Calle Gran Vía, 123",
                        City = "Madrid",
                        Country = "España",
                        StarRating = 5,
                        Phone = "+34 912 345 678",
                        Email = "info@grandplaza.com",
                        Website = "www.grandplaza.com",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Hotel
                    {
                        Name = "Beach Resort & Spa",
                        Description = "Hermoso resort frente al mar",
                        Address = "Paseo Marítimo, 456",
                        City = "Barcelona",
                        Country = "España",
                        StarRating = 4,
                        Phone = "+34 934 567 890",
                        Email = "reservations@beachresort.com",
                        Website = "www.beachresort.com",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Hotel
                    {
                        Name = "Mountain View Inn",
                        Description = "Acogedor hotel de montaña",
                        Address = "Camino de la Sierra, 789",
                        City = "Granada",
                        Country = "España",
                        StarRating = 3,
                        Phone = "+34 958 123 456",
                        Email = "hello@mountainview.com",
                        Website = "www.mountainview.com",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                context.Hotels.AddRange(hotels);
                context.SaveChanges();
                Console.WriteLine($"Creados {hotels.Length} hoteles");

                // Crear tipos de habitación para cada hotel
                var roomTypes = new RoomType[]
                {
                    // Hotel 1 (Grand Plaza)
                    new RoomType
                    {
                        Name = "Habitación Estándar",
                        Description = "Habitación confortable con vistas a la ciudad",
                        Capacity = 2,
                        TotalRooms = 50,
                        BasePrice = 120.00m,
                        HotelId = hotels[0].Id
                    },
                    new RoomType
                    {
                        Name = "Habitación Deluxe",
                        Description = "Espaciosa habitación con balcón",
                        Capacity = 2,
                        TotalRooms = 30,
                        BasePrice = 180.00m,
                        HotelId = hotels[0].Id
                    },
                    new RoomType
                    {
                        Name = "Suite Ejecutiva",
                        Description = "Lujosa suite con sala de estar",
                        Capacity = 4,
                        TotalRooms = 10,
                        BasePrice = 350.00m,
                        HotelId = hotels[0].Id
                    },

                    // Hotel 2 (Beach Resort)
                    new RoomType
                    {
                        Name = "Habitación Vista Mar",
                        Description = "Habitación con impresionantes vistas al mar",
                        Capacity = 2,
                        TotalRooms = 40,
                        BasePrice = 150.00m,
                        HotelId = hotels[1].Id
                    },
                    new RoomType
                    {
                        Name = "Suite Familiar",
                        Description = "Amplia suite para familias",
                        Capacity = 4,
                        TotalRooms = 15,
                        BasePrice = 280.00m,
                        HotelId = hotels[1].Id
                    },

                    // Hotel 3 (Mountain View)
                    new RoomType
                    {
                        Name = "Habitación Doble Estándar",
                        Description = "Acogedora habitación con vistas a la montaña",
                        Capacity = 2,
                        TotalRooms = 25,
                        BasePrice = 90.00m,
                        HotelId = hotels[2].Id
                    },
                    new RoomType
                    {
                        Name = "Cabaña Rústica",
                        Description = "Cabaña privada con chimenea",
                        Capacity = 4,
                        TotalRooms = 8,
                        BasePrice = 200.00m,
                        HotelId = hotels[2].Id
                    }
                };

                context.RoomTypes.AddRange(roomTypes);
                context.SaveChanges();
                Console.WriteLine($"Creados {roomTypes.Length} tipos de habitación");

                // Crear inventario para los próximos 90 días
                var random = new Random();
                var inventories = new System.Collections.Generic.List<RoomInventory>();
                var startDate = DateTime.UtcNow.Date;

                foreach (var rt in roomTypes)
                {
                    for (int i = 0; i < 90; i++)
                    {
                        var date = startDate.AddDays(i);
                        var booked = random.Next(0, rt.TotalRooms);
                        var available = rt.TotalRooms - booked;

                        var weekendMultiplier = (date.DayOfWeek == DayOfWeek.Friday ||
                                                date.DayOfWeek == DayOfWeek.Saturday) ? 1.2m : 1.0m;

                        inventories.Add(new RoomInventory
                        {
                            RoomTypeId = rt.Id,
                            Date = date,
                            AvailableRooms = available,
                            BookedRooms = booked,
                            PricePerNight = rt.BasePrice * weekendMultiplier
                        });
                    }
                }

                context.RoomInventories.AddRange(inventories);
                context.SaveChanges();
                Console.WriteLine($"Creados {inventories.Count} registros de inventario");

                // Crear algunas reservas de ejemplo
                var bookings = new Booking[]
                {
                    new Booking
                    {
                        BookingReference = "ABC12345",
                        RoomTypeId = roomTypes[0].Id,
                        CheckIn = DateTime.UtcNow.AddDays(7),
                        CheckOut = DateTime.UtcNow.AddDays(10),
                        GuestName = "Juan Pérez",
                        GuestEmail = "juan.perez@email.com",
                        GuestPhone = "+34 611 222 333",
                        NumberOfGuests = 2,
                        TotalPrice = 360.00m,
                        Status = BookingStatus.Confirmed,
                        CreatedAt = DateTime.UtcNow,
                        Notes = "Check-in tardío solicitado"
                    },
                    new Booking
                    {
                        BookingReference = "DEF67890",
                        RoomTypeId = roomTypes[2].Id,
                        CheckIn = DateTime.UtcNow.AddDays(14),
                        CheckOut = DateTime.UtcNow.AddDays(17),
                        GuestName = "María García",
                        GuestEmail = "maria.garcia@email.com",
                        GuestPhone = "+34 622 333 444",
                        NumberOfGuests = 3,
                        TotalPrice = 1050.00m,
                        Status = BookingStatus.Confirmed,
                        CreatedAt = DateTime.UtcNow,
                        Notes = "Alérgica al polen"
                    },
                    new Booking
                    {
                        BookingReference = "GHI12345",
                        RoomTypeId = roomTypes[4].Id,
                        CheckIn = DateTime.UtcNow.AddDays(5),
                        CheckOut = DateTime.UtcNow.AddDays(12),
                        GuestName = "Carlos Rodríguez",
                        GuestEmail = "carlos.r@email.com",
                        GuestPhone = "+34 633 444 555",
                        NumberOfGuests = 4,
                        TotalPrice = 1960.00m,
                        Status = BookingStatus.Confirmed,
                        CreatedAt = DateTime.UtcNow,
                        Notes = "Necesitan cuna para bebé"
                    }
                };

                context.Bookings.AddRange(bookings);
                context.SaveChanges();
                Console.WriteLine($"Creadas {bookings.Length} reservas de ejemplo");

                Console.WriteLine("Datos de ejemplo creados exitosamente!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creando datos de ejemplo: {ex.Message}");
                throw;
            }
        }
    }
}