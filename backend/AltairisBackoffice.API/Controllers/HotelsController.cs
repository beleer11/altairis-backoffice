using AltairisBackoffice.Core.Interfaces;
using AltairisBackoffice.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace AltairisBackoffice.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelRepository _hotelRepository;
        private readonly ILogger<HotelsController> _logger;

        public HotelsController(IHotelRepository hotelRepository, ILogger<HotelsController> logger)
        {
            _hotelRepository = hotelRepository;
            _logger = logger;
        }

        // GET: api/hotels
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {

                var hotels = await _hotelRepository.GetPagedWithRoomTypesAsync(page, pageSize);
                var total = await _hotelRepository.CountAsync();

                return Ok(new
                {
                    data = hotels,
                    total,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo hoteles");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/hotels/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var hotel = await _hotelRepository.GetHotelWithRoomTypesAsync(id);
                if (hotel == null)
                    return NotFound(new { message = "Hotel no encontrado" });

                return Ok(hotel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo hotel {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/hotels/search
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? name,
            [FromQuery] string? city,
            [FromQuery] string? country,
            [FromQuery] int? minRating)
        {
            try
            {
                var hotels = await _hotelRepository.SearchAsync(name, city, country, minRating);
                return Ok(hotels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error buscando hoteles");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // POST: api/hotels
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Hotel hotel)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var created = await _hotelRepository.AddAsync(hotel);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando hotel");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // PUT: api/hotels/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Hotel hotel)
        {
            try
            {
                if (id != hotel.Id)
                    return BadRequest(new { message = "El ID no coincide" });

                var exists = await _hotelRepository.ExistsAsync(id);
                if (!exists)
                    return NotFound(new { message = "Hotel no encontrado" });

                await _hotelRepository.UpdateAsync(hotel);
                return Ok(new { message = "Hotel actualizado correctamente", data = hotel });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando hotel {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // DELETE: api/hotels/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var hotel = await _hotelRepository.GetHotelWithRoomTypesAsync(id);
                if (hotel == null)
                    return NotFound(new { message = "Hotel no encontrado" });

                await _hotelRepository.DeleteAsync(hotel);
                return Ok(new { message = "Hotel eliminado correctamente" });
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("FK_Bookings_RoomTypes_RoomTypeId") == true)
            {
                _logger.LogWarning(ex, "Intento de eliminar hotel con reservas: {Id}", id);
                return BadRequest(new
                {
                    message = "No se puede eliminar el hotel porque tiene reservas asociadas. Elimine primero las reservas."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando hotel {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}