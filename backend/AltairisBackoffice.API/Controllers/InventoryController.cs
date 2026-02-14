using AltairisBackoffice.Core.Interfaces;
using AltairisBackoffice.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace AltairisBackoffice.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryRepository _inventoryRepository;
        private readonly IRoomTypeRepository _roomTypeRepository;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(
            IInventoryRepository inventoryRepository,
            IRoomTypeRepository roomTypeRepository,
            ILogger<InventoryController> logger)
        {
            _inventoryRepository = inventoryRepository;
            _roomTypeRepository = roomTypeRepository;
            _logger = logger;
        }

        // GET: api/inventory/roomtype/5?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("roomtype/{roomTypeId}")]
        public async Task<IActionResult> GetByRoomTypeAndDateRange(
            int roomTypeId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                if (!await _roomTypeRepository.ExistsAsync(roomTypeId))
                    return NotFound(new { message = "Tipo de habitación no encontrado" });

                var utcStartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
                var utcEndDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);

                var inventory = await _inventoryRepository.GetByRoomTypeAndDateRangeAsync(
                    roomTypeId,
                    utcStartDate,
                    utcEndDate);

                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error obteniendo inventario para tipo de habitación {RoomTypeId}", roomTypeId);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpdateAvailability([FromBody] UpdateInventoryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!await _roomTypeRepository.ExistsAsync(request.RoomTypeId))
                    return NotFound(new { message = "Tipo de habitación no encontrado" });

                var utcDate = DateTime.SpecifyKind(request.Date, DateTimeKind.Utc);

                await _inventoryRepository.UpdateAvailabilityAsync(
                    request.RoomTypeId,
                    utcDate,
                    request.AvailableRooms,
                    request.Price);

                return Ok(new { message = "Inventario actualizado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error actualizando inventario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateInventory([FromBody] GenerateInventoryRequest request)
        {
            try
            {
                if (request.StartDate > request.EndDate)
                    return BadRequest(new { message = "La fecha de inicio debe ser anterior a la fecha de fin" });

                if (!await _roomTypeRepository.ExistsAsync(request.RoomTypeId))
                    return NotFound(new { message = "Tipo de habitación no encontrado" });

                var utcStartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
                var utcEndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc);

                await _inventoryRepository.GenerateInventoryForRoomTypeAsync(
                    request.RoomTypeId,
                    utcStartDate,
                    utcEndDate);

                return Ok(new { message = "Inventario generado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generando inventario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
    }

    public class UpdateInventoryRequest
    {
        public int RoomTypeId { get; set; }
        public DateTime Date { get; set; }
        public int AvailableRooms { get; set; }
        public decimal Price { get; set; }
    }

    public class GenerateInventoryRequest
    {
        public int RoomTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}