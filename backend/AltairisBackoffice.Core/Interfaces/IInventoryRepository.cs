using AltairisBackoffice.Core.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AltairisBackoffice.Core.Interfaces
{
    public interface IInventoryRepository : IRepository<RoomInventory>
    {
        Task<IEnumerable<RoomInventory>> GetByRoomTypeAndDateRangeAsync(int roomTypeId, DateTime startDate, DateTime endDate);
        Task UpdateAvailabilityAsync(int roomTypeId, DateTime date, int availableRooms, decimal price);
        Task GenerateInventoryForRoomTypeAsync(int roomTypeId, DateTime startDate, DateTime endDate);
    }
}