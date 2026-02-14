using AltairisBackoffice.Core.Interfaces;
using AltairisBackoffice.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using AltairisBackoffice.Core.DTOs;
using Microsoft.EntityFrameworkCore;

namespace AltairisBackoffice.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeRepository _roomTypeRepository;
        private readonly IHotelRepository _hotelRepository;
        private readonly ILogger<RoomTypesController> _logger;

        public RoomTypesController(
            IRoomTypeRepository roomTypeRepository,
            IHotelRepository hotelRepository,
            ILogger<RoomTypesController> logger)
        {
            _roomTypeRepository = roomTypeRepository;
            _hotelRepository = hotelRepository;
            _logger = logger;
        }

        // GET: api/roomtypes
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var roomTypes = await _roomTypeRepository.GetAllAsync();
                return Ok(roomTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo tipos de habitación");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/roomtypes/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var roomType = await _roomTypeRepository.GetByIdAsync(id);
                if (roomType == null)
                    return NotFound(new { message = "Tipo de habitación no encontrado" });

                return Ok(roomType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo tipo de habitación {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // GET: api/roomtypes/hotel/5
        [HttpGet("hotel/{hotelId}")]
        public async Task<IActionResult> GetByHotelId(int hotelId)
        {
            try
            {
                var roomTypes = await _roomTypeRepository.GetByHotelIdAsync(hotelId);
                return Ok(roomTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo tipos de habitación para hotel {HotelId}", hotelId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // POST: api/roomtypes
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRoomTypeDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!await _hotelRepository.ExistsAsync(dto.HotelId))
                    return BadRequest(new { message = "El hotel especificado no existe" });

                var roomType = new RoomType
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    Capacity = dto.Capacity,
                    TotalRooms = dto.TotalRooms,
                    BasePrice = dto.BasePrice,
                    HotelId = dto.HotelId
                };

                var created = await _roomTypeRepository.AddAsync(roomType);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creando tipo de habitación");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // PUT: api/roomtypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomTypeDto dto)
        {
            try
            {
                if (id != dto.Id)
                    return BadRequest(new { message = "El ID no coincide" });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existingRoomType = await _roomTypeRepository.GetByIdAsync(id);
                if (existingRoomType == null)
                    return NotFound(new { message = "Tipo de habitación no encontrado" });

                existingRoomType.Name = dto.Name;
                existingRoomType.Description = dto.Description;
                existingRoomType.Capacity = dto.Capacity;
                existingRoomType.TotalRooms = dto.TotalRooms;
                existingRoomType.BasePrice = dto.BasePrice;
                existingRoomType.HotelId = dto.HotelId;

                await _roomTypeRepository.UpdateAsync(existingRoomType);
                return Ok(new { message = "Tipo de habitación actualizado correctamente", data = existingRoomType });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando tipo de habitación {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        // DELETE: api/roomtypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var roomType = await _roomTypeRepository.GetByIdAsync(id);
                if (roomType == null)
                    return NotFound(new { message = "Tipo de habitación no encontrado" });

                await _roomTypeRepository.DeleteAsync(roomType);
                return Ok(new { message = "Tipo de habitación eliminado correctamente" });
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("FK_Bookings_RoomTypes_RoomTypeId") == true)
            {
                _logger.LogWarning(ex, "Intento de eliminar tipo de habitación con reservas: {Id}", id);
                return BadRequest(new
                {
                    message = "No se puede eliminar el tipo de habitación porque tiene reservas asociadas."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error eliminando tipo de habitación {Id}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }
}