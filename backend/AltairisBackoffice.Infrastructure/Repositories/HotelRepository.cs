using AltairisBackoffice.Core.Interfaces;
using AltairisBackoffice.Core.Models;
using AltairisBackoffice.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AltairisBackoffice.Infrastructure.Repositories
{
    public class HotelRepository : Repository<Hotel>, IHotelRepository
    {
        public HotelRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Hotel>> SearchAsync(string? name, string? city, string? country, int? minRating)
        {
            var query = _context.Hotels.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(h => h.Name.Contains(name));

            if (!string.IsNullOrWhiteSpace(city))
                query = query.Where(h => h.City != null && h.City.Contains(city));

            if (!string.IsNullOrWhiteSpace(country))
                query = query.Where(h => h.Country != null && h.Country.Contains(country));

            if (minRating.HasValue)
                query = query.Where(h => h.StarRating >= minRating.Value);

            return await query.OrderBy(h => h.Name).ToListAsync();
        }

        public async Task<Hotel?> GetHotelWithRoomTypesAsync(int id)
        {
            return await _context.Hotels
                .Include(h => h.RoomTypes)
                .FirstOrDefaultAsync(h => h.Id == id);
        }

        public async Task<IEnumerable<Hotel>> GetPagedWithRoomTypesAsync(int page, int pageSize)
        {
            return await _context.Hotels
                .Include(h => h.RoomTypes)
                .OrderBy(h => h.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}