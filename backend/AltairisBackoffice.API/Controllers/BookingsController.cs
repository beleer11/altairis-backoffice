using AltairisBackoffice.Core.Interfaces;
using AltairisBackoffice.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using AltairisBackoffice.Core.DTOs;

namespace AltairisBackoffice.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IRoomTypeRepository _roomTypeRepository;
        private readonly ILogger<BookingsController> _logger;

        public BookingsController(
            IBookingRepository bookingRepository,
            IRoomTypeRepository roomTypeRepository,
            ILogger<BookingsController> logger)
        {
            _bookingRepository = bookingRepository;
            _roomTypeRepository = roomTypeRepository;
            _logger = logger;
        }

        // GET: api/bookings
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var bookings = await _bookingRepository.GetPagedAsync(page, pageSize);
                var total = await _bookingRepository.CountAsync();

                return Ok(new
                {
                    data = bookings,
                    total,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reservas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/bookings/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var booking = await _bookingRepository.GetByIdAsync(id);
                if (booking == null)
                    return NotFound(new { message = "Reserva no encontrada" });

                return Ok(booking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reserva {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/bookings/reference/ABC123
        [HttpGet("reference/{reference}")]
        public async Task<IActionResult> GetByReference(string reference)
        {
            try
            {
                var booking = await _bookingRepository.GetByReferenceAsync(reference);
                if (booking == null)
                    return NotFound(new { message = "Reserva no encontrada" });

                return Ok(booking);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reserva por referencia {Reference}", reference);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/bookings/email/test@email.com
        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            try
            {
                var bookings = await _bookingRepository.GetByGuestEmailAsync(email);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reservas por email {Email}", email);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/bookings/date-range?startDate=...&endDate=...
        [HttpGet("date-range")]
        public async Task<IActionResult> GetByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var bookings = await _bookingRepository.GetByDateRangeAsync(startDate, endDate);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo reservas por rango de fechas");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/bookings/occupancy/1?startDate=...&endDate=...
        [HttpGet("occupancy/{hotelId}")]
        public async Task<IActionResult> GetOccupancy(int hotelId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var occupancy = await _bookingRepository.GetDailyOccupancyAsync(hotelId, startDate, endDate);
                return Ok(occupancy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo ocupación para hotel {HotelId}", hotelId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/bookings/revenue?startDate=...&endDate=...
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenue([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var revenue = await _bookingRepository.GetRevenueByDateRangeAsync(startDate, endDate);
                return Ok(new { revenue });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo ingresos");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var roomType = await _roomTypeRepository.GetByIdAsync(dto.RoomTypeId);
                if (roomType == null)
                    return BadRequest(new { message = "El tipo de habitación no existe" });

                var bookingReference = GenerateBookingReference();

                var booking = new Booking
                {
                    BookingReference = bookingReference,
                    GuestName = dto.GuestName,
                    GuestEmail = dto.GuestEmail,
                    GuestPhone = dto.GuestPhone,
                    CheckIn = dto.CheckIn,
                    CheckOut = dto.CheckOut,
                    NumberOfGuests = dto.NumberOfGuests,
                    RoomTypeId = dto.RoomTypeId,
                    Notes = dto.Notes,
                    Status = (BookingStatus)dto.Status,
                    TotalPrice = dto.TotalPrice,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _bookingRepository.AddAsync(booking);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando reserva");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        private string GenerateBookingReference()
        {
            return $"BK-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
        }

        // PUT: api/bookings/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBookingStatusDto dto)
        {
            try
            {
                var booking = await _bookingRepository.GetByIdAsync(id);
                if (booking == null)
                    return NotFound(new { message = "Reserva no encontrada" });

                booking.Status = dto.Status;
                await _bookingRepository.UpdateAsync(booking);

                return Ok(new { message = "Estado actualizado correctamente", status = booking.Status });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando estado de reserva {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // DTO para la actualización de estado
        public class UpdateBookingStatusDto
        {
            public BookingStatus Status { get; set; }
        }

        // DELETE: api/bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var booking = await _bookingRepository.GetByIdAsync(id);
                if (booking == null)
                    return NotFound(new { message = "Reserva no encontrada" });

                await _bookingRepository.DeleteAsync(booking);
                return Ok(new { message = "Reserva eliminada correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando reserva {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}