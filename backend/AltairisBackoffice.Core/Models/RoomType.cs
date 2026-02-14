using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AltairisBackoffice.Core.Models
{
    public class RoomType
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del tipo de habitación es requerido")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Description { get; set; } = string.Empty;

        [Range(1, 10, ErrorMessage = "La capacidad debe ser entre 1 y 10 personas")]
        public int Capacity { get; set; }

        [Range(1, 1000, ErrorMessage = "El número de habitaciones debe ser entre 1 y 1000")]
        public int TotalRooms { get; set; }

        [Range(0, 10000, ErrorMessage = "El precio debe ser entre 0 y 10000")]
        public decimal BasePrice { get; set; }

        // Clave foránea
        public int HotelId { get; set; }

        [JsonIgnore]
        public Hotel Hotel { get; set; } = null!;

        // Relaciones
        public ICollection<RoomInventory> Inventories { get; set; } = new List<RoomInventory>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}