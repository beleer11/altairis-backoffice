using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AltairisBackoffice.Core.Models
{
    public class Booking
    {
        public int Id { get; set; }

        public string BookingReference { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

        public int RoomTypeId { get; set; }
        [JsonIgnore]
        public RoomType RoomType { get; set; } = null!;

        [Required(ErrorMessage = "La fecha de check-in es requerida")]
        public DateTime CheckIn { get; set; }

        [Required(ErrorMessage = "La fecha de check-out es requerida")]
        [DateGreaterThan("CheckIn", ErrorMessage = "La fecha de check-out debe ser posterior al check-in")]
        public DateTime CheckOut { get; set; }

        [Required(ErrorMessage = "El nombre del huésped es requerido")]
        [StringLength(200, ErrorMessage = "El nombre no puede exceder los 200 caracteres")]
        public string GuestName { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string GuestEmail { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Formato de teléfono inválido")]
        public string GuestPhone { get; set; } = string.Empty;

        [Range(1, 10, ErrorMessage = "El número de huéspedes debe ser entre 1 y 10")]
        public int NumberOfGuests { get; set; }

        public decimal TotalPrice { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Confirmed;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [StringLength(1000, ErrorMessage = "Las notas no pueden exceder los 1000 caracteres")]
        public string Notes { get; set; } = string.Empty;
    }

    public enum BookingStatus
    {
        [Display(Name = "Pendiente")]
        Pending = 0,

        [Display(Name = "Confirmada")]
        Confirmed = 1,

        [Display(Name = "Check-in")]
        CheckedIn = 2,

        [Display(Name = "Check-out")]
        CheckedOut = 3,

        [Display(Name = "Cancelada")]
        Cancelled = 4,

        [Display(Name = "No show")]
        NoShow = 5
    }

    // Atributo personalizado para validar fechas
    public class DateGreaterThanAttribute : ValidationAttribute
    {
        private readonly string _comparisonProperty;

        public DateGreaterThanAttribute(string comparisonProperty)
        {
            _comparisonProperty = comparisonProperty;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var currentValue = value as DateTime?;
            var property = validationContext.ObjectType.GetProperty(_comparisonProperty);

            if (property == null)
                return new ValidationResult($"Propiedad {_comparisonProperty} no encontrada");

            var comparisonValue = property.GetValue(validationContext.ObjectInstance) as DateTime?;

            if (currentValue.HasValue && comparisonValue.HasValue && currentValue.Value <= comparisonValue.Value)
            {
                return new ValidationResult(ErrorMessage ?? "La fecha debe ser mayor que la fecha de comparación");
            }

            return ValidationResult.Success;
        }
    }
}