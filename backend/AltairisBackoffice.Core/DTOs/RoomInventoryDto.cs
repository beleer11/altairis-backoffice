using System;

namespace AltairisBackoffice.Core.DTOs
{
    public class RoomInventoryDto
    {
        public int Id { get; set; }
        public int RoomTypeId { get; set; }
        public DateTime Date { get; set; }
        public int AvailableRooms { get; set; }
        public int BookedRooms { get; set; }
        public decimal PricePerNight { get; set; }

        // Información básica del RoomType (opcional, si la necesitas)
        public string? RoomTypeName { get; set; }
        public int? RoomTypeCapacity { get; set; }
    }
}