using AltairisBackoffice.Core.Interfaces;
using AltairisBackoffice.Core.Models;
using AltairisBackoffice.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AltairisBackoffice.Infrastructure.Repositories
{
    public class InventoryRepository : Repository<RoomInventory>, IInventoryRepository
    {
        public InventoryRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<RoomInventory>> GetByRoomTypeAndDateRangeAsync(int roomTypeId, DateTime startDate, DateTime endDate)
        {
            return await _context.RoomInventories
                .Include(i => i.RoomType)
                .Where(i => i.RoomTypeId == roomTypeId && i.Date >= startDate && i.Date <= endDate)
                .OrderBy(i => i.Date)
                .ToListAsync();
        }

        public async Task UpdateAvailabilityAsync(int roomTypeId, DateTime date, int availableRooms, decimal price)
        {
            var inventory = await _context.RoomInventories
                .FirstOrDefaultAsync(i => i.RoomTypeId == roomTypeId && i.Date.Date == date.Date);

            if (inventory != null)
            {
                inventory.AvailableRooms = availableRooms;
                inventory.PricePerNight = price;
                await _context.SaveChangesAsync();
            }
        }

        public async Task GenerateInventoryForRoomTypeAsync(int roomTypeId, DateTime startDate, DateTime endDate)
        {
            var roomType = await _context.RoomTypes.FindAsync(roomTypeId);
            if (roomType == null) return;

            var existingDates = await _context.RoomInventories
                .Where(i => i.RoomTypeId == roomTypeId && i.Date >= startDate && i.Date <= endDate)
                .Select(i => i.Date)
                .ToListAsync();

            var newInventories = new List<RoomInventory>();
            var random = new Random();

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (!existingDates.Contains(date))
                {
                    var booked = random.Next(0, roomType.TotalRooms / 2);
                    newInventories.Add(new RoomInventory
                    {
                        RoomTypeId = roomTypeId,
                        Date = date,
                        AvailableRooms = roomType.TotalRooms - booked,
                        BookedRooms = booked,
                        PricePerNight = roomType.BasePrice
                    });
                }
            }

            await _context.RoomInventories.AddRangeAsync(newInventories);
            await _context.SaveChangesAsync();
        }
    }
}