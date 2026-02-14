using System;
using System.ComponentModel.DataAnnotations;

namespace AltairisBackoffice.Core.DTOs
{
    public class CreateBookingDto
    {
        [Required(ErrorMessage = "El nombre del huésped es requerido")]
        [StringLength(200)]
        public string GuestName { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string? GuestEmail { get; set; }

        [Phone(ErrorMessage = "Formato de teléfono inválido")]
        public string? GuestPhone { get; set; }

        [Required]
        public DateTime CheckIn { get; set; }

        [Required]
        public DateTime CheckOut { get; set; }

        [Range(1, 10, ErrorMessage = "El número de huéspedes debe ser entre 1 y 10")]
        public int NumberOfGuests { get; set; }

        [Required]
        public int RoomTypeId { get; set; }

        public string? Notes { get; set; }

        public int Status { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "El precio total debe ser mayor a 0")]
        public decimal TotalPrice { get; set; }
    }
}