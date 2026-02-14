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
    public class BookingRepository : Repository<Booking>, IBookingRepository
    {
        public BookingRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Booking>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Bookings
                .Include(b => b.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .Where(b => b.CheckIn >= startDate && b.CheckOut <= endDate)
                .OrderBy(b => b.CheckIn)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetByRoomTypeIdAsync(int roomTypeId)
        {
            return await _context.Bookings
                .Include(b => b.RoomType)
                .Where(b => b.RoomTypeId == roomTypeId)
                .OrderByDescending(b => b.CheckIn)
                .ToListAsync();
        }

        public async Task<Booking?> GetByReferenceAsync(string reference)
        {
            return await _context.Bookings
                .Include(b => b.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .FirstOrDefaultAsync(b => b.BookingReference == reference);
        }

        public async Task<IEnumerable<Booking>> GetByGuestEmailAsync(string email)
        {
            return await _context.Bookings
                .Include(b => b.RoomType)
                .ThenInclude(rt => rt.Hotel)
                .Where(b => b.GuestEmail == email)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<Dictionary<DateTime, int>> GetDailyOccupancyAsync(int hotelId, DateTime startDate, DateTime endDate)
        {
            var occupancy = new Dictionary<DateTime, int>();

            var bookings = await _context.Bookings
                .Include(b => b.RoomType)
                .Where(b => b.RoomType.HotelId == hotelId
                    && b.CheckIn <= endDate
                    && b.CheckOut >= startDate
                    && b.Status != BookingStatus.Cancelled
                    && b.Status != BookingStatus.NoShow)
                .ToListAsync();

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var occupied = bookings.Count(b => date >= b.CheckIn && date < b.CheckOut);
                occupancy[date] = occupied;
            }

            return occupancy;
        }

        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Bookings
                .Where(b => b.CreatedAt >= startDate && b.CreatedAt <= endDate
                    && b.Status != BookingStatus.Cancelled)
                .SumAsync(b => b.TotalPrice);
        }
    }
}