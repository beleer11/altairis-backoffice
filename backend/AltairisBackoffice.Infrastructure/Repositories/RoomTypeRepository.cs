using AltairisBackoffice.Core.Interfaces;
using AltairisBackoffice.Core.Models;
using AltairisBackoffice.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AltairisBackoffice.Infrastructure.Repositories
{
    public class RoomTypeRepository : Repository<RoomType>, IRoomTypeRepository
    {
        public RoomTypeRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<RoomType>> GetByHotelIdAsync(int hotelId)
        {
            return await _context.RoomTypes
                .Where(rt => rt.HotelId == hotelId)
                .Include(rt => rt.Hotel)
                .OrderBy(rt => rt.Name)
                .ToListAsync();
        }
    }
}