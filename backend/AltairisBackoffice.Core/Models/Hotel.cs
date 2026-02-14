using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AltairisBackoffice.Core.Models
{
    public class Hotel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del hotel es requerido")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 200 caracteres")]
        public string Name { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "La descripción no puede exceder los 1000 caracteres")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "La dirección es requerida")]
        [StringLength(500, ErrorMessage = "La dirección no puede exceder los 500 caracteres")]
        public string Address { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "La ciudad no puede exceder los 100 caracteres")]
        public string City { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "El país no puede exceder los 100 caracteres")]
        public string Country { get; set; } = string.Empty;

        [Range(1, 5, ErrorMessage = "La calificación debe ser entre 1 y 5 estrellas")]
        public int StarRating { get; set; }

        [Phone(ErrorMessage = "Formato de teléfono inválido")]
        public string Phone { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string Email { get; set; } = string.Empty;

        [Url(ErrorMessage = "Formato de URL inválido")]
        public string Website { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Relación con RoomTypes
        public ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();
    }
}