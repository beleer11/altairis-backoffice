using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AltairisBackoffice.Core.Models
{
    public class RoomInventory
    {
        public int Id { get; set; }

        public int RoomTypeId { get; set; }

        [JsonIgnore]
        public RoomType RoomType { get; set; } = null!;

        public DateTime Date { get; set; }

        [Range(0, 1000, ErrorMessage = "Las habitaciones disponibles deben ser entre 0 y 1000")]
        public int AvailableRooms { get; set; }

        [Range(0, 1000, ErrorMessage = "Las habitaciones reservadas deben ser entre 0 y 1000")]
        public int BookedRooms { get; set; }

        [Range(0, 10000, ErrorMessage = "El precio debe ser entre 0 y 10000")]
        public decimal PricePerNight { get; set; }
    }
}