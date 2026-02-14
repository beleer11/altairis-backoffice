using System.ComponentModel.DataAnnotations;

namespace AltairisBackoffice.Core.DTOs
{
    public class UpdateRoomTypeDto
    {
        [Required]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string? Description { get; set; }

        [Range(1, 10, ErrorMessage = "La capacidad debe ser entre 1 y 10 personas")]
        public int Capacity { get; set; }

        [Range(1, 1000, ErrorMessage = "El número de habitaciones debe ser entre 1 y 1000")]
        public int TotalRooms { get; set; }

        [Range(0, 10000, ErrorMessage = "El precio debe ser entre 0 y 10000")]
        public decimal BasePrice { get; set; }

        [Required]
        public int HotelId { get; set; }
    }
}